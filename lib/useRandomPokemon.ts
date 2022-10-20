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
    if (state.pokemonIndex !== undefined) return;

    const random = Math.random();
    setState(startRandomPokemonState(random));
  }, [state.pokemonIndex]);

  return {
    pokemonIndex: state.pokemonIndex,
    nextRandomPokemon,
    streakCount: state.streakIndexes.length,
  };
}

export type RandomPokemonState = Readonly<{
  /**
   * The current pokemon index to be guessed.
   */
  pokemonIndex: number | undefined;
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
  pokemonIndex: undefined,
  indexes: indexArray(pokemonCount),
  answeredIndexes: [],
  streakIndexes: [],
});

export const startRandomPokemonState =
  (random: number) =>
  (prev: RandomPokemonState): RandomPokemonState => {
    // NOTE: currentIndex !== undefined happens in StrictMode.
    //     | Not sure if it could happen in concurrent mode.
    if (prev.pokemonIndex !== undefined) return prev;

    const randomIndex = Math.floor(random * prev.indexes.length);
    const indexes = [...prev.indexes];
    const [pokemonIndex] = indexes.splice(randomIndex, 1);
    return { ...prev, indexes, pokemonIndex };
  };

export const nextRandomPokemonState =
  (random: number, streak: boolean) =>
  (prev: RandomPokemonState): RandomPokemonState => {
    let { pokemonIndex, indexes, answeredIndexes, streakIndexes } = prev;

    // add current pokemonIndex to answered questions (or current streak)
    if (pokemonIndex !== undefined) {
      if (streak) {
        streakIndexes = [...streakIndexes, pokemonIndex];
      } else {
        answeredIndexes = [...answeredIndexes, pokemonIndex];
      }
      pokemonIndex = undefined;
    }

    // if the question was answered correctly, reset the streak.
    if (!streak) {
      answeredIndexes = answeredIndexes.concat(streakIndexes);
      streakIndexes = [];
    }

    // ensure we have indexes to draw the next pokemonIndex from
    if (indexes.length === 0) {
      if (answeredIndexes.length > 0) {
        indexes = answeredIndexes;
        answeredIndexes = [];
      } else {
        // this case happens when the user answered all the pokemon correctly in a streak.
        indexes = streakIndexes;
        streakIndexes = [];
      }
    }

    // draw another pokemonIndex
    {
      const randomIndex = Math.floor(random * indexes.length);
      const nextIndexes = [...indexes];
      [pokemonIndex] = nextIndexes.splice(randomIndex, 1);
      indexes = nextIndexes;
    }

    return {
      pokemonIndex,
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
