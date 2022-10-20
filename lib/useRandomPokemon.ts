import { useEffect, useState, useCallback } from "react";

export default function useRandomPokemon(initialPokemonCount: number) {
  const [state, setState] = useState<RandomPokemonState>(() =>
    initialRandomPokemonState(initialPokemonCount)
  );

  const nextRandomPokemon = useCallback((streak: boolean) => {
    const random = Math.random();
    setState(nextRandomPokemonState(random, streak));
  }, []);

  useEffect(() => {
    if (state.currentIndex !== undefined) return;

    const random = Math.random();
    setState(startRandomPokemonState(random));
  }, [state.currentIndex]);

  return {
    pokemonIndex:
      state.currentIndex === undefined
        ? undefined
        : state.indexes[state.currentIndex],
    nextRandomPokemon,
    streakCount: state.streakIndexes.length,
  };
}

export type RandomPokemonState = Readonly<{
  /**
   * The current index in the `indexes` array being guessed.
   */
  currentIndex: number | undefined;
  /**
   * Pokemon indexes that should be guessed.
   */
  indexes: readonly number[];
  /**
   * Pokemon indexes that should be guessed after indexes is emptied.
   */
  answeredIndexes: readonly number[];
  /**
   * Pokemon indexes that were answered correctly in the current streak.
   */
  streakIndexes: readonly number[];
}>;

export const initialRandomPokemonState = (
  pokemonCount: number
): RandomPokemonState => ({
  currentIndex: undefined,
  indexes: indexArray(pokemonCount),
  answeredIndexes: [],
  streakIndexes: [],
});

export const startRandomPokemonState =
  (random: number) => (prev: RandomPokemonState) => {
    // NOTE: currentIndex !== undefined only happens in StrictMode. Not sure if it would happen in concurrent mode.
    return prev.currentIndex !== undefined
      ? prev
      : { ...prev, currentIndex: Math.floor(random * prev.indexes.length) };
  };

export const nextRandomPokemonState =
  (random: number, streak: boolean) => (prev: RandomPokemonState) => {
    let indexes = prev.indexes;
    let answeredIndexes = prev.answeredIndexes;
    let streakIndexes = prev.streakIndexes;

    if (prev.currentIndex !== undefined) {
      const nextIndexes = [...indexes];
      const [pokemonIndex] = nextIndexes.splice(prev.currentIndex, 1);
      indexes = nextIndexes;

      if (streak) {
        streakIndexes = [...streakIndexes, pokemonIndex];
      } else {
        answeredIndexes = [...answeredIndexes, pokemonIndex];
      }
    }

    if (!streak) {
      answeredIndexes = [...answeredIndexes].concat(streakIndexes);
      streakIndexes = [];
    }

    if (indexes.length === 0) {
      if (answeredIndexes.length > 0) {
        indexes = answeredIndexes;
        answeredIndexes = [];
      } else {
        indexes = streakIndexes;
        streakIndexes = [];
      }
    }

    const currentIndex = Math.floor(random * indexes.length);

    return {
      currentIndex,
      indexes,
      answeredIndexes,
      streakIndexes,
    };
  };

export function indexArray(length: number): number[] {
  const array = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    array[i] = i;
  }
  return array;
}
