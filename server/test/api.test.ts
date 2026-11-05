import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import app from "../src/app.ts";

// These tests use the development database. They only read data and create
// short-lived sessions, which are removed at the end.

let server: Server;
let baseUrl = "";

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (typeof address === "object" && address) {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  // Remove the short-lived sessions created by these tests.
  await app.locals.prisma.session.deleteMany({
    where: {
      user: { email: { in: ["admin@fia-it.de", "customer@fia-it.de"] } },
    },
  });
  await app.locals.prisma.$disconnect();
});

function cookieFrom(response: Response): string {
  const cookies = response.headers.getSetCookie();
  return cookies.map((cookie) => cookie.split(";")[0]).join("; ");
}

async function getCsrf() {
  const response = await fetch(`${baseUrl}/api/auth/csrf`);
  const data = (await response.json()) as { csrfToken: string };
  return {
    csrfToken: data.csrfToken,
    cookie: cookieFrom(response),
  };
}

async function login(email: string, password: string) {
  const csrf = await getCsrf();
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf.csrfToken,
      Cookie: csrf.cookie,
    },
    body: JSON.stringify({ email, password }),
  });
  const cookie = `${csrf.cookie}; ${cookieFrom(response)}`;
  return { response, cookie, csrfToken: csrf.csrfToken };
}

test("health endpoint is public", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const data = (await response.json()) as { status: string };
  assert.equal(data.status, "ok");
});

test("mutating requests without a CSRF token are rejected", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@fia-it.de", password: "Admin12345!" }),
  });
  assert.equal(response.status, 403);
});

test("admin can log in and read the admin dashboard", async () => {
  const { response, cookie } = await login("admin@fia-it.de", "Admin12345!");
  assert.equal(response.status, 200);
  const loginData = (await response.json()) as { user: { role: string } };
  assert.equal(loginData.user.role, "ADMIN");
  assert.equal("passwordHash" in loginData.user, false);

  const me = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: cookie },
  });
  assert.equal(me.status, 200);
  const meData = (await me.json()) as { user: { email: string } };
  assert.equal(meData.user.email, "admin@fia-it.de");

  const stats = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Cookie: cookie },
  });
  assert.equal(stats.status, 200);
});

test("customer receives 403 on admin routes", async () => {
  const { response, cookie } = await login(
    "customer@fia-it.de",
    "Customer12345!",
  );
  assert.equal(response.status, 200);

  const stats = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Cookie: cookie },
  });
  assert.equal(stats.status, 403);

  const requests = await fetch(`${baseUrl}/api/requests`, {
    headers: { Cookie: cookie },
  });
  assert.equal(requests.status, 200);
  const data = (await requests.json()) as {
    requests: { contactEmail: string }[];
  };
  assert.ok(Array.isArray(data.requests));
  // Customers only see their own requests.
  assert.ok(
    data.requests.every(
      (request) => request.contactEmail === "customer@fia-it.de",
    ),
  );
});

test("wrong passwords get a generic 401", async () => {
  const { response } = await login("customer@fia-it.de", "WrongPassword1");
  assert.equal(response.status, 401);
  const data = (await response.json()) as { error: string };
  assert.equal(data.error, "Email or password is incorrect.");
});

test("public catalog is available without login", async () => {
  const services = await fetch(`${baseUrl}/api/services`);
  assert.equal(services.status, 200);
  const data = (await services.json()) as { services: unknown[] };
  assert.ok(data.services.length >= 10);

  const products = await fetch(`${baseUrl}/api/products`);
  assert.equal(products.status, 200);
  const productData = (await products.json()) as { products: unknown[] };
  assert.ok(productData.products.length > 0);
});
