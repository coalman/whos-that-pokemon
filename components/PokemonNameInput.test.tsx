import { Fragment, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
      />
      <button
        onClick={() => {
          setGuessEnabled(true);
          setGuess("");
        }}
      >
        Reset
      </button>
    </Fragment>
  );
};

it("should not enter invalid choice", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  userEvent.type(input, "p4{Enter}");
  await waitFor(() => expect(input.value).toBe("p4"));
  expect(screen.getByTestId("guess").textContent).toBe("");
});

it("should select the first choice (with keyboard)", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  userEvent.type(input, "2");
  await waitFor(() => expect(input.value).toBe("2"));

  userEvent.type(input, "{ArrowDown}{Enter}");

  await waitFor(() => expect(input.value).toBe("p2"));
});

it("should select the first choice (with mouse)", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  userEvent.type(input, "2");
  await waitFor(() => expect(input.value).toBe("2"));

  const [firstOption] = screen.getAllByRole("option");
  userEvent.click(firstOption);

  await waitFor(() => expect(input.value).toBe("p2"));
});

it("should clear auto complete choices on Reset button click", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  userEvent.type(input, "2");
  await waitFor(() => expect(input.value).toBe("2"));

  expect(screen.getAllByRole("option")).toHaveLength(1);
  userEvent.click(screen.getByText("Reset"));
  await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
});

it("should not show choices for empty string", async () => {
  render(<Test choices={["p1", "p2", "p3"]} />);

  const input = screen.getByDisplayValue("") as HTMLInputElement;

  userEvent.type(input, "p");
  await waitFor(() => expect(input.value).toBe("p"));

  userEvent.type(input, "{Backspace}");
  await waitFor(() => expect(input.value).toBe(""));

  expect(screen.queryAllByRole("option")).toHaveLength(0);
});

describe("option selection", () => {
  async function setup() {
    render(<Test choices={["p1", "p2", "p3"]} />);

    const input = screen.getByDisplayValue("") as HTMLInputElement;

    // get all 3 choices to appear ("p" is a prefix for all 3 of them)
    userEvent.type(input, "p");
    await waitFor(() => expect(input.value).toBe("p"));

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);

    const getSelectedState = (elements = options) =>
      elements.map((o) => o.getAttribute("aria-selected") === "true");

    return { input, options, getSelectedState };
  }

  it("should deselect on {ArrowUp}", async () => {
    const { input, getSelectedState } = await setup();

    // focus first option
    userEvent.type(input, "{ArrowDown}");
    await waitFor(() =>
      expect(getSelectedState()).toStrictEqual([true, false, false])
    );

    // unfocus first option
    userEvent.type(input, "{ArrowUp}");
    await waitFor(() =>
      expect(getSelectedState()).toStrictEqual([false, false, false])
    );
  });

  it("should deselect on text type", async () => {
    const { input, getSelectedState } = await setup();

    // focus first option
    userEvent.type(input, "{ArrowDown}");
    await waitFor(() =>
      expect(getSelectedState()).toStrictEqual([true, false, false])
    );

    // change the choice list to only list ["p2"]. This should also reset focus.
    userEvent.type(input, "2");
    await waitFor(() => {
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(getSelectedState(options)).toStrictEqual([false]);
    });
  });

  it("should not go past last option on {ArrowDown}", async () => {
    const { input, getSelectedState } = await setup();

    // focus second to last option
    userEvent.type(input, "{ArrowDown}{ArrowDown}");
    await waitFor(() =>
      expect(getSelectedState()).toStrictEqual([false, true, false])
    );

    // try to go past last option
    userEvent.type(input, "{ArrowDown}{ArrowDown}");
    await waitFor(() =>
      expect(getSelectedState()).toStrictEqual([false, false, true])
    );
  });
});
