import { useState, useCallback, useEffect } from "react";

function useRandomIndex(initialLength: number) {
  const [state, setState] = useState<
    { currentIndex: number; indexes: number[] } | undefined
  >(undefined);
  const [split, setSplit] = useState(0);

  const nextRandomIndex = useCallback(
    (length: number) => {
      const nextState = state
        ? { ...state }
        : { currentIndex: length, indexes: indexArray(length) };

      nextState.currentIndex += 1;
      if (nextState.currentIndex >= length) {
        nextState.currentIndex = 0;
        nextState.indexes = shuffleSplitArray(nextState.indexes, split);
        setSplit(0);
      }

      setState(nextState);
    },
    [state, split]
  );

  const markSplit = () => {
    if (state) setSplit(state.currentIndex + 1);
  };

  useEffect(() => {
    if (state === undefined) {
      nextRandomIndex(initialLength);
    }
  }, [state, nextRandomIndex, initialLength]);

  return {
    index: state?.indexes[state.currentIndex],
    nextRandomIndex,
    markSplit,
  };
}

export default useRandomIndex;

function shuffleSplitArray(array: number[], splitIndex: number): number[] {
  const firstPartition = array.slice(0, splitIndex);
  const secondPartition = array.slice(splitIndex);

  shuffleArray(firstPartition);
  shuffleArray(secondPartition);

  return firstPartition.concat(secondPartition);
}

/**
 * Shuffle array of numbers inplace. (Uses Durstenfeld/Fisher-Yates algorithm)
 *
 * @param array numbers to shuffle inplace.
 * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
 */
function shuffleArray(array: number[]): number[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function indexArray(length: number): number[] {
  const array = new Array<number>(length);
  for (let i = 0; i < length; i++) {
    array[i] = i;
  }
  return array;
}
