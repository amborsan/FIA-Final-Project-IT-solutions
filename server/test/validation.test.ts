import test from "node:test";
import assert from "node:assert/strict";
import {
  publicRequestSchema,
  quoteSchema,
  registerSchema,
  ticketSchema,
} from "../src/validation/schemas.ts";

test("registerSchema accepts a valid registration", () => {
  const result = registerSchema.safeParse({
    firstName: "Test",
    lastName: "User",
    email: "TEST@example.com",
    password: "Password123",
    preferredLanguage: "EN",
    acceptTerms: true,
    acceptPrivacy: true,
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, "test@example.com");
});

test("registerSchema rejects a short password", () => {
  const result = registerSchema.safeParse({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "short",
    acceptTerms: true,
    acceptPrivacy: true,
  });
  assert.equal(result.success, false);
});

test("registerSchema requires legal consent", () => {
  const result = registerSchema.safeParse({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "Password123",
    acceptTerms: false,
    acceptPrivacy: true,
  });
  assert.equal(result.success, false);
});

test("publicRequestSchema requires a detailed description", () => {
  const result = publicRequestSchema.safeParse({
    contactName: "Test User",
    contactEmail: "test@example.com",
    title: "Network",
    description: "Too short",
    acceptPrivacy: true,
  });
  assert.equal(result.success, false);
});

test("ticketSchema applies a default priority", () => {
  const result = ticketSchema.safeParse({
    subject: "Printer issue",
    description: "The office printer is not responding since this morning.",
  });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.priority, "MEDIUM");
});

test("quoteSchema rejects an empty item list", () => {
  const result = quoteSchema.safeParse({
    requestId: "00000000-0000-4000-8000-000000000000",
    validUntil: new Date().toISOString(),
    items: [],
  });
  assert.equal(result.success, false);
});
