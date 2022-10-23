import { render, screen } from "@testing-library/react";
import BadgeBar, { calcStepIncrement, calcScale, floorScale } from "./BadgeBar";

describe("BadgeBar", () => {
  it("should render badge rank text", () => {
    render(<BadgeBar streakCount={150} maxStreak={151} />);

    screen.getByText(/badge rank is 7 out of 8./i);
    screen.getByText(/150/);
    screen.getByText(/151/);
  });
});

test("pokemon Gen(1) scale", () => {
  const maxValue = 151;
  const stepCount = 8;

  const stepIncrement = calcStepIncrement(maxValue, stepCount, 1);
  const scale = calcScale(stepCount, 1, stepIncrement);

  expect(scale).toMatchInlineSnapshot(`
      [
        1,
        7,
        18,
        35,
        56,
        83,
        114,
        151,
      ]
    `);

  expect(scale[scale.length - 1]).toBe(maxValue);
  expect(floorScale(scale, maxValue)).toBe(stepCount);
});

describe("calcStepIncrement", () => {
  it("should return a=2", () => {
    expect(calcStepIncrement(36, 6, 1)).toBe(2);
  });
});

describe("calcScale", () => {
  it("should return scale", () => {
    const scale = calcScale(6, 1, 2);
    expect(scale).toStrictEqual([1, 4, 9, 16, 25, 36]);
  });
});

describe("floorScale", () => {
  it("should return 0 for starting value", () => {
    expect(floorScale([2, 4, 8], 1)).toBe(0);
  });

  it("should return length-1 for second to last value", () => {
    expect(floorScale([2, 4, 8], 7)).toBe(2);
  });

  it("should return length for last value", () => {
    expect(floorScale([2, 4, 8], 8)).toBe(3);
  });
});
