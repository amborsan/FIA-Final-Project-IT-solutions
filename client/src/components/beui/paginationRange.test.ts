import { expect, it } from "vitest";
import { paginationRange } from "./paginationRange";

it("keeps a fixed number of controls, including the current and boundary pages", () => {
  for (const siblings of [0, 1]) {
    for (let total = 1; total <= 50; total++) {
      for (let page = 1; page <= total; page++) {
        const items = paginationRange(page, total, siblings);
        expect(items.length).toBe(Math.min(total, siblings * 2 + 5));
        expect(items).toContain(page);
        expect(items[0]).toBe(1);
        expect(items.at(-1)).toBe(total);
        const numbers = items.filter((item): item is number => typeof item === "number");
        expect(numbers).toEqual([...new Set(numbers)].sort((a, b) => a - b));
        expect(numbers.every(number => number >= 1 && number <= total)).toBe(true);
        items.forEach((item, index) => {
          if (typeof item === "number") return;
          expect(Number(items[index + 1]) - Number(items[index - 1])).toBeGreaterThan(2);
        });
      }
    }
  }
});
