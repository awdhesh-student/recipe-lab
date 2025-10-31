// timeUtils.js

/**
 * Format seconds into mm:ss display string.
 * Example: 125 -> "02:05"
 */
export function formatMMSS(totalSec) {
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Compute the total duration (in seconds) for an array of recipe steps.
 * Each step has durationMinutes (integer > 0).
 */
export function totalSecondsFromSteps(steps = []) {
  return steps.reduce((acc, s) => acc + (s.durationMinutes || 0) * 60, 0);
}

/**
 * Compute the remaining time (in seconds) starting from a given index.
 * For example, if you're at step 1, get remaining seconds for all steps
 * including and after step 1.
 */
export function remainingSecondsFromStepIndex(
  steps = [],
  index = 0,
  currentRemainingSec = 0
) {
  const nextSteps = steps.slice(index + 1);
  const nextSecs = nextSteps.reduce(
    (acc, s) => acc + (s.durationMinutes || 0) * 60,
    0
  );
  return currentRemainingSec + nextSecs;
}
