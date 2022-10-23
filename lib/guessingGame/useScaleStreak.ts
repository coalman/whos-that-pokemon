import { useMemo } from "react";

/**
 * Scales a streak count to a smaller integer scale.
 *
 * Used for scaling the streak from the number of pokemon to the number of badges.
 */
export default function useScaleStreak(options: {
  stepCount: number;
  streak: number;
  maxStreak: number;
}): number {
  const scale = useMemo(() => {
    const steps = fitStreakScale(options.maxStreak, options.stepCount, 1);
    return cumulativeSteps(steps);
  }, [options.maxStreak, options.stepCount]);

  return useMemo(() => scale(options.streak), [options.streak, scale]);
}

export function fitStreakScale(
  maxValue: number,
  stepCount: number,
  initialStep = 1
): number[] {
  /*
   * Given:
   * - some value 'x'
   * - step(0) = x
   * - step(i) = step(i - 1) + a
   * - sum of all steps = maxValue
   *
   * Solve for 'a'.
   *
   * => step(0) + ... + step(n) = maxValue
   * => x + (x + a) + ... + (x + (n-1)a) = maxValue
   * => nx + ((n-1) * n * 0.5)a = maxValue
   * => a = (maxValue - nx) / ((n-1) * n * 0.5)
   */

  /** (n - 1) * n * 0.5 */
  const aFactor = (stepCount - 1) * 0.5 * stepCount;
  /** nx */
  const xTerm = initialStep * stepCount;

  const a = (maxValue - xTerm) / aFactor;

  const steps = new Array<number>(stepCount).fill(a);
  // step(0) = x
  steps[0] = initialStep;
  // step(i) = step(i - 1) + a
  for (let i = 1; i < steps.length; i++) {
    steps[i] = steps[i] + steps[i - 1];
  }
  return steps;
}

export function cumulativeSteps(steps: readonly number[]) {
  const scale = [...steps];
  for (let i = 1; i < scale.length; i++) {
    scale[i] = Math.round(scale[i] + scale[i - 1]);
  }

  return (streakCount: number) => {
    for (let [i, badgeStreak] of scale.entries()) {
      if (streakCount < badgeStreak) {
        return i;
      }
    }
    return scale.length;
  };
}
