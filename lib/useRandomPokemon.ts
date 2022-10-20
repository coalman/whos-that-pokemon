import { useEffect, useState, useCallback } from "react";

export default function useRandomPokemon(initialPokemonCount: number) {
  const [{ pokemonIndex, nextPokemonIndex }, setState] =
    useState<RandomPokemonState>(() =>
      initialRandomPokemonState(initialPokemonCount)
    );

  const nextRandomPokemon = useCallback((streak: boolean) => {
    const random = Math.random();
    setState(nextRandomPokemonState(random, streak));
  }, []);

  useEffect(() => {
    if (pokemonIndex !== undefined) return;

    const randoms: [number, number] = [Math.random(), Math.random()];
    setState(startRandomPokemonState(randoms));
  }, [pokemonIndex]);

  return { pokemonIndex, nextPokemonIndex, nextRandomPokemon };
}

export type RandomPokemonState = Readonly<{
  /**
   * The current pokemon index to be guessed.
   */
  pokemonIndex: number | undefined;
  /**
   * The next pokemon index to be guessed.
   */
  nextPokemonIndex: number | undefined;
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
): RandomPokemonState => {
  const indexes = new Array<number>(pokemonCount);
  for (let i = 0; i < pokemonCount; i++) {
    indexes[i] = i;
  }
  return {
    pokemonIndex: undefined,
    nextPokemonIndex: undefined,
    indexes,
    answeredIndexes: [],
    streakIndexes: [],
  };
};

export const startRandomPokemonState =
  ([random1, random2]: readonly [number, number]) =>
  (prev: RandomPokemonState): RandomPokemonState => {
    // NOTE: currentIndex !== undefined happens in StrictMode.
    //     | Not sure if it could happen in concurrent mode.
    if (prev.pokemonIndex !== undefined) return prev;

    const indexes = [...prev.indexes];
    const [pokemonIndex] = indexes.splice(
      scaleToIndex(random1, indexes.length),
      1
    );
    const [nextPokemonIndex] = indexes.splice(
      scaleToIndex(random2, indexes.length),
      1
    );
    return { ...prev, indexes, pokemonIndex, nextPokemonIndex };
  };

export const nextRandomPokemonState =
  (random: number, streak: boolean) =>
  (prev: RandomPokemonState): RandomPokemonState => {
    let {
      pokemonIndex,
      nextPokemonIndex,
      indexes,
      answeredIndexes,
      streakIndexes,
    } = prev;

    // add current pokemonIndex to answered questions (or current streak)
    if (pokemonIndex !== undefined) {
      if (streak) {
        streakIndexes = [...streakIndexes, pokemonIndex];
      } else {
        answeredIndexes = [...answeredIndexes, pokemonIndex];
      }
      pokemonIndex = nextPokemonIndex;
      nextPokemonIndex = undefined;
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

    // draw another nextPokemonIndex
    {
      const randomIndex = scaleToIndex(random, indexes.length);
      const nextIndexes = [...indexes];
      [nextPokemonIndex] = nextIndexes.splice(randomIndex, 1);
      indexes = nextIndexes;
    }

    return {
      pokemonIndex,
      nextPokemonIndex,
      indexes,
      answeredIndexes,
      streakIndexes,
    };
  };

export const scaleToIndex = (random: number, length: number) =>
  Math.floor(random * length);
