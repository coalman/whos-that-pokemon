import {
  indexArray,
  nextRandomPokemonState,
  initialRandomPokemonState,
  startRandomPokemonState,
  type RandomPokemonState,
} from "./useRandomPokemon";

describe("indexArray", () => {
  it("should return empty array for 0 length", () => {
    expect(indexArray(0)).toHaveLength(0);
  });

  it.each([
    [[0], 1],
    [[0, 1, 2], 3],
    [[0, 1, 2, 3, 4, 5], 6],
  ])("should return %s for length=%s", (expected, length) => {
    expect(indexArray(length)).toStrictEqual(expected);
  });
});

describe(initialRandomPokemonState.name, () => {
  it("should be deterministic", () => {
    for (let _i = 0; _i < 5; _i++) {
      const first = initialRandomPokemonState(20);
      const second = initialRandomPokemonState(20);

      expect(first).toStrictEqual(second);
    }
  });
});

describe(startRandomPokemonState.name, () => {
  // NOTE: this case only happens in StrictMode because the start effect runs twice.
  it("should not modify state that has already started (StrictMode check)", () => {
    let firstState = initialRandomPokemonState(5);
    firstState = startRandomPokemonState(0)(firstState);
    let secondState = { ...firstState };
    secondState = startRandomPokemonState(0.99)(secondState);

    expect(firstState).toStrictEqual(secondState);
    // also test that it returns the previous state (to bail out of another react render).
    expect(firstState).toBe(startRandomPokemonState(0.99)(firstState));
  });
});

describe(nextRandomPokemonState.name, () => {
  const init = (length: number, random = 0) => {
    let state = initialRandomPokemonState(length);
    state = startRandomPokemonState(random)(state);
    return state;
  };

  it("should append correct answer to streak array", () => {
    let state = init(5);
    state = nextRandomPokemonState(0.99, true)(state);
    expect(state).toStrictEqual({
      pokemonIndex: 4,
      indexes: [1, 2, 3],
      streakIndexes: [0],
      answeredIndexes: [],
    });
  });

  it("should append incorrect answer to answered array", () => {
    let state = init(5);
    state = nextRandomPokemonState(0.99, false)(state);
    expect(state).toStrictEqual({
      pokemonIndex: 4,
      indexes: [1, 2, 3],
      streakIndexes: [],
      answeredIndexes: [0],
    });
  });

  it("should append streak questions to incorrect questions on wrong answer", () => {
    let state: RandomPokemonState = {
      pokemonIndex: 0,
      indexes: [1, 2],
      answeredIndexes: [3, 4],
      streakIndexes: [5, 6],
    };
    state = nextRandomPokemonState(0.5, false)(state);

    expect(state).toStrictEqual({
      pokemonIndex: 2,
      indexes: [1],
      answeredIndexes: [3, 4, 0, 5, 6],
      streakIndexes: [],
    });
  });

  it("should serve incorrectly answered questions after initial set is finished", () => {
    let state: RandomPokemonState = {
      pokemonIndex: 0,
      indexes: [],
      answeredIndexes: [1, 2, 3],
      streakIndexes: [4, 5],
    };
    state = nextRandomPokemonState(0.99, true)(state);

    expect(state).toStrictEqual({
      pokemonIndex: 3,
      indexes: [1, 2],
      answeredIndexes: [],
      streakIndexes: [4, 5, 0],
    });
  });

  it("should serve streak questions if last question in a set is incorrectly answered", () => {
    let state: RandomPokemonState = {
      pokemonIndex: 0,
      indexes: [],
      answeredIndexes: [1, 2, 3],
      streakIndexes: [4, 5],
    };
    state = nextRandomPokemonState(0.99, false)(state);

    expect(state).toStrictEqual({
      pokemonIndex: 5,
      indexes: [1, 2, 3, 0, 4],
      answeredIndexes: [],
      streakIndexes: [],
    });
  });
});
