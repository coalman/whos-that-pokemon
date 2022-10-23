import { Fragment, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PokemonNameInput from "./PokemonNameInput";

const Test = (props: { choices: readonly string[] }) => {
  const [guessEnabled, setGuessEnabled] = useState(true);
  const [guess, setGuess] = useState("");
  const [committedGuess, setCommittedGuess] = useState("");

  return (
    <Fragment>
      <span data-testid="guess">{committedGuess}</span>
      <PokemonNameInput
        guessEnabled={guessEnabled}
        pokemonList={props.choices}
        value={guess}
        onChange={setGuess}
        onGuess={(pokemonName) => {
          setGuessEnabled(false);
          setGuess(pokemonName);
          setCommittedGuess(pokemonName);
        }}
        onNextQuestion={() => {
          setGuessEnabled(true);
          setCommittedGuess("");
          setGuess("");
        }}
      />
    </Fragment>
  );
};

it("should not enter invalid choice", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  await userEvent.type(input, "p4{Enter}");
  expect(input.value).toBe("p4");
  expect(screen.getByTestId("guess").textContent).toBe("");
});

it("should select the first choice (with keyboard)", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  await userEvent.type(input, "2");
  expect(input.value).toBe("2");

  await userEvent.type(input, "{ArrowDown}{Enter}");

  expect(input.value).toBe("p2");
  expect(screen.queryAllByRole("option")).toHaveLength(0);
});

it("should select the first choice (with mouse)", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  await userEvent.type(input, "2");
  expect(input.value).toBe("2");

  const [firstOption] = screen.getAllByRole("option");
  await userEvent.click(firstOption);

  expect(input.value).toBe("p2");
  expect(screen.queryAllByRole("option")).toHaveLength(0);
});

it("should call onNextQuestion on Enter keydown after commit", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  await userEvent.type(input, "p2");
  expect(input.value).toBe("p2");
  expect(screen.getAllByRole("option")).toHaveLength(1);

  await userEvent.type(input, "{Enter}");
  expect(screen.getByTestId("guess").textContent).toBe("p2");
  expect(screen.queryAllByRole("option")).toHaveLength(0);

  // onNextQuestion handler should be called on this {Enter}
  await userEvent.type(input, "{Enter}");
  expect(screen.getByTestId("guess").textContent).toBe("");
});

it("should not show choices for empty string", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  await userEvent.type(input, "p");
  expect(input.value).toBe("p");

  await userEvent.type(input, "{Backspace}");
  expect(input.value).toBe("");
  expect(screen.queryAllByRole("option")).toHaveLength(0);

  expect(screen.queryByText("Enter a pokemon name is required.")).toBe(null);
  await userEvent.type(input, "{Enter}");
  expect(screen.queryByText("Enter a pokemon name is required.")).toBeDefined();
});

describe("option selection", () => {
  async function setup() {
    render(<Test choices={["p1", "p2", "p3"]} />);

    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // get all 3 choices to appear ("p" is a prefix for all 3 of them)
    await userEvent.type(input, "p");
    expect(input.value).toBe("p");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    const getSelectedState = (elements = options) =>
      elements.map((o) => o.getAttribute("aria-selected") === "true");

    return { input, options, getSelectedState };
  }

  it("should deselect on {ArrowUp}", async () => {
    const { input, getSelectedState } = await setup();

    // focus first option
    await userEvent.type(input, "{ArrowDown}");
    expect(getSelectedState()).toStrictEqual([true, false, false]);

    // unfocus first option
    await userEvent.type(input, "{ArrowUp}");
    expect(getSelectedState()).toStrictEqual([false, false, false]);
  });

  it("should deselect on text type", async () => {
    const { input, getSelectedState } = await setup();

    // focus first option
    await userEvent.type(input, "{ArrowDown}");
    expect(getSelectedState()).toStrictEqual([true, false, false]);

    // change the choice list to only list ["p2"]. This should also reset focus.
    await userEvent.type(input, "2");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(getSelectedState(options)).toStrictEqual([false]);
  });

  it("should not go past last option on {ArrowDown}", async () => {
    const { input, getSelectedState } = await setup();

    // focus second to last option
    await userEvent.type(input, "{ArrowDown}{ArrowDown}");
    expect(getSelectedState()).toStrictEqual([false, true, false]);

    // try to go past last option
    await userEvent.type(input, "{ArrowDown}{ArrowDown}");
    expect(getSelectedState()).toStrictEqual([false, false, true]);
  });

  it("should not select an option on {ArrowDown} when there are no options", async () => {
    const { input, getSelectedState } = await setup();

    // change the choice list to have 0 items
    await userEvent.type(input, "4{ArrowDown}{ArrowDown}");
    // change the choice list to have 3 items
    await userEvent.type(input, "{Backspace}");

    expect(getSelectedState()).toStrictEqual([false, false, false]);
  });
});
