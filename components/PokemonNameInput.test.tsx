import { Fragment, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PokemonNameInput from "./PokemonNameInput";

const Test = (props: { choices: readonly string[] }) => {
  const [guessEnabled, setGuessEnabled] = useState(true);
  const [guess, setGuess] = useState("");

  return (
    <Fragment>
      <PokemonNameInput
        guessEnabled={guessEnabled}
        pokemonList={props.choices}
        value={guess}
        onChange={setGuess}
        onGuess={(pokemonName) => {
          setGuessEnabled(false);
          setGuess(pokemonName);
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

  const { [0]: firstOption } = screen.getAllByRole("option");
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
