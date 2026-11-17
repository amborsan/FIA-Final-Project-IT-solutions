const APPROACH_SECONDS = 8;
const FIRST_BURST_SECONDS = 9;
const BURST_CYCLE_SECONDS = 18;
const BURST_COUNT = 3;
const EXPAND_SECONDS = 1.6;
const HOLD_SECONDS = 4;
const RETURN_SECONDS = 3;
const BURST_SECONDS = EXPAND_SECONDS + HOLD_SECONDS + RETURN_SECONDS;
const FINISH_SECONDS = FIRST_BURST_SECONDS + (BURST_COUNT - 1) * BURST_CYCLE_SECONDS + BURST_SECONDS;

// Ease both ends so the wrists and particles never change direction abruptly.
const ease = (progress: number) => (1 - Math.cos(Math.PI * Math.max(0, Math.min(1, progress)))) / 2;

export function getHandsMotion(seconds: number) {
  const time = seconds;
  const approach = ease(seconds / APPROACH_SECONDS);
  // Settle with a wider 24-unit fingertip gap after each return.
  const reach = approach * 28;
  const burstTime = seconds - FIRST_BURST_SECONDS;
  let dissolve = 0;

  if (burstTime >= 0 && burstTime < BURST_CYCLE_SECONDS * BURST_COUNT) {
    const phase = burstTime % BURST_CYCLE_SECONDS;
    if (phase < EXPAND_SECONDS) dissolve = ease(phase / EXPAND_SECONDS);
    else if (phase < EXPAND_SECONDS + HOLD_SECONDS) dissolve = 1;
    else if (phase < BURST_SECONDS) dissolve = 1 - ease((phase - EXPAND_SECONDS - HOLD_SECONDS) / RETURN_SECONDS);
  }

  // A separate 20-second wrist cycle continues after the three particle bursts.
  const movementTime = Math.max(0, seconds - APPROACH_SECONDS);
  const separation = (1 - Math.cos(movementTime * Math.PI * 2 / 20)) * 56;
  const pointerStrength = 1 - ease(seconds / APPROACH_SECONDS);
  return { reach, dissolve, separation, time, pointerStrength, burstsFinished: seconds >= FINISH_SECONDS };
}
