import { useMemo } from "react";
import clsx from "clsx";
import Image from "next/future/image";
import { fitStreakScale, cumulativeSteps } from "lib/streakScale";

export type BadgeBarProps = {
  streakCount: number;
  maxStreak: number;
};

const badgeCount = 8;

export const BadgeBar = (props: BadgeBarProps) => {
  const scale = useMemo(() => {
    const steps = fitStreakScale(props.maxStreak, badgeCount, 1);
    return cumulativeSteps(steps);
  }, [props.maxStreak]);

  const badgesVisible = useMemo(
    () => scale(props.streakCount),
    [props.streakCount, scale]
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
      </div>
      {badges}
    </div>
  );
};

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
        width={85}
        height={85}
        alt={`Pokemon badge number ${props.badgeIndex}.`}
        onDragStart={(event) => event.preventDefault()}
      />
    </div>
  );
};

const badgeImgSrc = (badgeIndex: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${
    badgeIndex + 1
  }.png`;
