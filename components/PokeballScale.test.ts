import { fitPokeballScale } from "./StreakCounter";

describe("fitPokeballScale", () => {
  it("should return increases of 1 for 42", () => {
    const actual = fitPokeballScale(42);
    expect(actual).toStrictEqual([2, 3, 4, 5]);
  });

  it("should return increments of 2 for 60", () => {
    const actual = fitPokeballScale(60);
    expect(actual).toStrictEqual([2, 4, 6, 8]);
  });

  it("should return increments of 5 for 114", () => {
    const actual = fitPokeballScale(114);
    expect(actual).toStrictEqual([2, 7, 12, 17]);
  });
});
