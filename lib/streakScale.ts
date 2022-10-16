export function fitStreakScale(
  maxValue: number,
  stepCount: number,
  initialStep = 1
): number[] {
  const steps = [initialStep];

  /**
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

  // (n - 1) * n * 0.5
  const aFactor = (stepCount - 1) * 0.5 * stepCount;
  // nx
  const xTerm = steps[0] * stepCount;

  const a = (maxValue - xTerm) / aFactor;

  for (let i = 1; i < stepCount; i++) {
    steps.push(steps[i - 1] + a);
  }

  return steps;
}

export function cumulativeSteps(steps: readonly number[]) {
  const sums: number[] = [];
  for (let i = 0; i < steps.length; i++) {
    sums.push(steps[i] + (sums[i - 1] ?? 0));
  }
  const scale = sums.map(Math.round);

  return (streakCount: number) => {
    for (let [i, badgeStreak] of scale.entries()) {
      if (streakCount < badgeStreak) {
        return i;
      }
    }
    return scale.length;
  };
}
