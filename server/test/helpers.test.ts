import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateTotals,
  createReference,
  daysFromNow,
  round2,
} from "../src/utils/helpers.ts";
import { makeExcerpt, sanitizeRichText } from "../src/utils/sanitize.ts";

test("round2 keeps two decimal places", () => {
  assert.equal(round2(1.005), 1.01);
  assert.equal(round2(19.999), 20);
  assert.equal(round2(0.1 + 0.2), 0.3);
});

test("createReference uses prefix, date and random characters", () => {
  const reference = createReference("SR");
  assert.match(reference, /^SR-\d{8}-[A-Z2-9]{3}$/);
  assert.notEqual(createReference("SR"), createReference("SR"));
});

test("daysFromNow returns a date in the future", () => {
  assert.ok(daysFromNow(3).getTime() > Date.now());
});

test("calculateTotals adds 19 percent VAT", () => {
  const totals = calculateTotals([{ quantity: 2, unitPrice: 100 }], 19);
  assert.deepEqual(totals, { subtotal: 200, taxAmount: 38, total: 238 });
});

test("calculateTotals supports a different tax rate", () => {
  const totals = calculateTotals([{ quantity: 1, unitPrice: 50 }], 7);
  assert.deepEqual(totals, { subtotal: 50, taxAmount: 3.5, total: 53.5 });
});

test("sanitizeRichText removes scripts and event handlers", () => {
  const dirty =
    '<p onclick="alert(1)">Hello <script>alert("x")</script><strong>world</strong></p>';
  const clean = sanitizeRichText(dirty);
  assert.equal(clean.includes("<script"), false);
  assert.equal(clean.includes("onclick"), false);
  assert.equal(clean.includes("<strong>world</strong>"), true);
});

test("sanitizeRichText keeps safe links and adds rel", () => {
  const clean = sanitizeRichText('<a href="https://example.com">Link</a>');
  assert.match(clean, /rel="noopener noreferrer"/);
  assert.match(clean, /href="https:\/\/example.com"/);
});

test("sanitizeRichText strips javascript: links", () => {
  const clean = sanitizeRichText('<a href="javascript:alert(1)">Bad</a>');
  assert.equal(clean.includes("javascript:"), false);
});

test("makeExcerpt strips HTML and shortens text", () => {
  const excerpt = makeExcerpt("<p>Hello <strong>world</strong></p>", 8);
  assert.equal(excerpt, "Hello wo…");
});
