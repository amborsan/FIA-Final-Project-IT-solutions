import { describe, expect, it } from "vitest";
import { getHandsMotion } from "./particleHandsMotion";
import { creationHandsData } from "./creationHandsData";

describe("hand choreography", () => {
  it("approaches gradually while leaving space between the fingertips", () => {
    expect(getHandsMotion(0).reach).toBe(0);
    expect(getHandsMotion(4).reach).toBeCloseTo(14);
    for (let seconds = 0; seconds < 180; seconds += 0.1) {
      const { reach } = getHandsMotion(seconds);
      expect(reach).toBeLessThanOrEqual(28);
      expect(16 + 2 * (32 - reach)).toBeGreaterThanOrEqual(24);
    }
  });

  it("spreads a little faster, holds for four seconds, then returns gradually", () => {
    for (const start of [9, 27, 45]) {
      expect(getHandsMotion(start).dissolve).toBe(0);
      expect(getHandsMotion(start + 0.8).dissolve).toBeCloseTo(0.5);
      for (const offset of [1.6, 2, 3, 4, 5]) {
        expect(getHandsMotion(start + offset).dissolve).toBe(1);
      }
      expect(getHandsMotion(start + 7.1).dissolve).toBeCloseTo(0.5);
      expect(getHandsMotion(start + 8.6).dissolve).toBeCloseTo(0);
    }
  });

  it("explodes exactly three times and stays assembled afterwards", () => {
    let bursts = 0;
    let wasDispersing = false;
    for (let seconds = 0; seconds < 240; seconds += 0.25) {
      const dispersing = getHandsMotion(seconds).dissolve > 0;
      if (dispersing && !wasDispersing) bursts++;
      wasDispersing = dispersing;
      if (seconds >= 54) expect(dispersing).toBe(false);
    }
    expect(bursts).toBe(3);
    expect(getHandsMotion(54).burstsFinished).toBe(true);
    expect(getHandsMotion(54).separation).not.toBe(getHandsMotion(58).separation);
  });

  it("continues a smooth twenty-second wrist cycle after dispersal has ended", () => {
    for (const start of [68, 88, 108]) {
      expect(getHandsMotion(start).separation).toBeCloseTo(0);
      expect(getHandsMotion(start + 10).separation).toBeCloseTo(112);
      expect(getHandsMotion(start + 20).separation).toBeCloseTo(0);
      expect(getHandsMotion(start + 10).dissolve).toBe(0);
    }
  });

  it("keeps the final rendered fingertip characters apart, including phone-sized glyphs", () => {
    const { reach, separation, time, pointerStrength } = getHandsMotion(68);
    const turn = Math.sin(time * 0.22) * 0.025;
    const left: number[] = [];
    const right: number[] = [];
    for (const [x, , shade] of creationHandsData) {
      const direction = x < 480 ? 1 : -1;
      const pivot = x < 480 ? 220 : 780;
      const rotation = turn * direction;
      const renderedX = pivot + (x - pivot) * Math.cos(rotation) + shade * 42 * Math.sin(rotation) + direction * (reach - 32 - separation);
      (x < 480 ? left : right).push(renderedX);
    }
    const gap = Math.min(...right) - Math.max(...left);
    // The largest supported phone glyph is 12.5 units tall and ~7.5 wide.
    expect(gap).toBeGreaterThan(20);
    expect(gap).toBeLessThan(28);
    expect(pointerStrength).toBe(0);
  });
});
