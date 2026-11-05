// Small shared helpers used across the API.

/** Round a number to two decimal places (money in EUR). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Create a readable, unique-looking reference such as SR-20261105-8F3K2A. */
export function createReference(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((byte) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[byte % 32])
    .join("");
  return `${prefix}-${date}-${random}`;
}

/** Remove HTML and trim user input. Used before saving free-text fields. */
export function cleanText(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

/** Return a date N days from now. */
export function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/** Calculate quote/order totals. All values are EUR and rounded to cents. */
export function calculateTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate = 19,
) {
  const subtotal = round2(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );
  const taxAmount = round2((subtotal * taxRate) / 100);
  const total = round2(subtotal + taxAmount);
  return { subtotal, taxAmount, total };
}
