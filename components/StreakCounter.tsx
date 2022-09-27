import Image from "next/image";
import { useMemo } from "react";

const pokeballTypes = ["poke", "great", "ultra", "master"] as const;
type PokeballType = typeof pokeballTypes[number];

const PokeballIcon = (props: { type: PokeballType }) => {
  const item = `${props.type}-ball`;

  return (
    <Image
      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item}.png`}
      layout="fixed"
      width={30}
      height={30}
    />
  );
};

export type StreakCounterProps = {
  value: number;
  maxValue: number;
};

const StreakCounter = (props: StreakCounterProps) => {
  const pokeballScale = useMemo(
    () => fitPokeballScale(props.maxValue),
    [props.maxValue]
  );

  const pokeballs: readonly PokeballType[] = useMemo(
    () => calcPokeballs(pokeballScale, props.value),
    [props.value, pokeballScale]
  );

  return (
    <div>
      <span>
        Streak: {props.value}/{props.maxValue}
      </span>
      <span>
        {pokeballs.map((ballType, index) => (
          <PokeballIcon key={index} type={ballType} />
        ))}
      </span>
    </div>
  );
};

export default StreakCounter;

const maxPokeballs = 3;

/**
 * Given:
 * - step(0) = 2
 * - step(i) = steps(i - 1) + a
 * - 3 * (all steps) = maxValue roughly
 *
 * Solve for 'a'.
 *
 * => Let x = step(0) and allow for 4 steps (step(0)...step(3)).
 * => 3 * (x + (x + a) + (x + 2a) + (x + 3a)) = maxValue
 * => 3x + 3x + 3a + 3x + 6a + 3x + 9a = maxValue
 * => 12x + 18a = maxValue
 * => a = (maxValue - 12x) / 18
 *
 * For more generalized form,
 * 12x => (steps.length * maxPokeballs) * x
 * 18 => (steps.length - 1) * 0.5 * steps.length * maxPokeballs
 */
export function fitPokeballScale(maxValue: number): number[] {
  const steps: number[] = new Array(pokeballTypes.length);

  // Pokeball step is hard coded to always be 2.
  steps[0] = 2;

  const factorA = maxPokeballs * steps.length * (steps.length - 1) * 0.5;
  const a = (maxValue - steps[0] * (maxPokeballs * steps.length)) / factorA;

  for (let i = 1; i < steps.length; i++) {
    steps[i] = steps[i - 1] + a;
  }

  return steps;
}

export function calcPokeballs(
  scale: ReturnType<typeof fitPokeballScale>,
  value: number
): PokeballType[] {
  let stepIndex = 0;
  let ballCount = 0;

  for (stepIndex = 0; stepIndex < scale.length; stepIndex++) {
    const step = scale[stepIndex];

    ballCount = Math.floor(value / step);

    if (ballCount <= maxPokeballs) {
      break;
    } else {
      value -= maxPokeballs * step;
    }
  }

  // show 3 pokeballs of a previous type (if it exists) instead of 0 pokeballs
  if (ballCount === 0 && stepIndex > 0) {
    stepIndex -= 1;
    ballCount = 3;
  }

  const pokeballType = pokeballTypes[stepIndex];
  return new Array<PokeballType>(ballCount).fill(pokeballType);
}
