import { useMemo } from "react";
import clsx from "clsx";
import Image from "next/future/image";

export type BadgeBarProps = {
  streakCount: number;
  maxStreak: number;
};

const badgeCount = 8;

const badgeImgSrc = (badgeIndex: number) =>
  `/img/badges/${badgeIndex + 1}.webp`;

const BadgeBar = (props: BadgeBarProps) => {
  const badgeScale = useMemo(() => {
    const initialStep = 1;
    const stepIncrement = calcStepIncrement(
      props.maxStreak,
      badgeCount,
      initialStep
    );
    return calcScale(badgeCount, initialStep, stepIncrement);
  }, [props.maxStreak]);

  const badgesVisible = useMemo(
    () => floorScale(badgeScale, props.streakCount),
    [props.streakCount, badgeScale]
  );

  const badges = [];
  for (let i = 0; i < badgeCount; i++) {
    badges.push(<Badge key={i} badgeIndex={i} visible={badgesVisible > i} />);
  }

  return (
    <div
      className={clsx(
        "bg-slate-50 text-slate-900 rounded-xl inline-flex items-center justify-center gap-1",
        "flex-row py-1 px-2 w-full"
      )}
    >
      <div className="text-center relative">
        <span className="sr-only">Streak is</span>
        <div className="border-b border-slate-900 text-sm">
          {props.streakCount}
        </div>
        <span className="sr-only">out of</span>
        <div className="text-sm">{props.maxStreak}</div>
        <span className="sr-only">
          {`. Badge rank is ${badgesVisible} out of ${badgeCount}.`}
        </span>
      </div>
      {badges}
    </div>
  );
};

export default BadgeBar;

const Badge = (props: { badgeIndex: number; visible: boolean }) => {
  const imgSrc = badgeImgSrc(props.badgeIndex);

  return (
    <div className="relative w-8 h-8 bg-slate-50">
      <div
        className={clsx(
          "absolute bg-slate-900 w-full h-full",
          // NOTE: most mask-* properties need webkit prefixes (chrome/edge atm), so we use tailwind here instead of inline styles.
          "[mask-image:var(--url)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
        )}
        style={{ ["--url" as any]: `url(${imgSrc})` }}
      />
      <Image
        className={clsx(
          "absolute w-full h-full object-contain object-center",
          props.visible
            ? "opacity-100 transition-opacity duration-1000"
            : "opacity-0"
        )}
        src={imgSrc}
        unoptimized
        width={85}
        height={85}
        alt={`Pokemon badge number ${props.badgeIndex}.`}
        onDragStart={(event) => event.preventDefault()}
      />
    </div>
  );
};

export function calcStepIncrement(
  maxValue: number,
  stepCount: number,
  initialStep: number
): number {
  /* Given:
   * - some value 'x'
   * - step(0) = x
   * - step(i) = step(i - 1) + a
   * - sum of all steps = maxValue
   *
   * Solve for 'a' (stepIncrement).
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

  return (maxValue - xTerm) / aFactor;
}

export function calcScale(
  stepCount: number,
  initialStep: number,
  stepIncrement: number
): number[] {
  const scale: number[] = [];
  for (let i = 0; i < stepCount; i++) {
    // step(0) = x
    // step(i) = step(i - 1) + a
    const stepSize = initialStep + stepIncrement * i;
    scale[i] = (scale[i - 1] ?? 0) + stepSize;
  }
  return scale.map(Math.round);
}

export function floorScale(scale: number[], value: number): number {
  for (let [i, scaleBoundary] of scale.entries()) {
    if (value < scaleBoundary) {
      return i;
    }
  }
  return scale.length;
}
