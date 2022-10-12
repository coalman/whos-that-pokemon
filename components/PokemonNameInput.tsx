/**
 * The autocomplete markup is based off of:
 *
 * - <https://alphagov.github.io/accessible-autocomplete/examples/>
 * - <https://a11y-guidelines.orange.com/en/articles/autocomplete-component/>
 */

import clsx from "clsx";
import { useMemo, useRef, useState, useId, useEffect } from "react";

export type PokemonNameInputProps = {
  guessEnabled: boolean;
  pokemonList: readonly string[];
  value: string;
  onChange: (value: string) => void;
  onGuess: (pokemonName: string) => void;
  onNextQuestion: () => void;
};

const PokemonNameInput = (props: PokemonNameInputProps) => {
  const { onGuess, onChange, onNextQuestion } = props;

  const refInput = useRef<HTMLInputElement>(null);

  type InputError = {
    state: "true" | "false" | "spelling";
    message?: string;
  };

  const [error, setError] = useState<InputError>({ state: "false" });

  useEffect(() => {
    // auto focus on mount
    refInput.current?.focus();
  }, []);

  const choices: readonly string[] = useMemo(() => {
    if (props.value.trim() === "") {
      return [];
    }

    return (
      props.pokemonList
        .filter((pokemonName) => pokemonName.includes(props.value))
        // prefer matches near the start of the name
        .sort((a, b) => a.indexOf(props.value) - b.indexOf(props.value))
        // limit the number of results.
        .slice(0, 5)
    );
  }, [props.pokemonList, props.value]);

  const [selectedChoice, setSelectedChoice] = useState<number | undefined>(
    undefined
  );

  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const optionId = (index: number) => `${inputId}-option${index}`;

  function tryGuess(value: string) {
    if (!props.guessEnabled) {
      return;
    }
    // check if it's a valid guess
    // TODO: show some feedback for invalid name or empty string.
    if (!props.pokemonList.includes(value)) {
      return;
    }

    setSelectedChoice(undefined);
    onGuess(value);
  }

  return (
    <div>
      <label htmlFor={inputId} className="block">
        Enter your guess below
      </label>
      <input
        ref={refInput}
        id={inputId}
        className="bg-slate-900 border border-slate-50 py-2 rounded-lg outline-none text-center w-full"
        type="text"
        role="combobox"
        inputMode="text"
        aria-owns={listboxId}
        aria-expanded={choices.length > 0}
        aria-describedby={errorId + " " + descriptionId}
        aria-invalid={error.state}
        aria-autocomplete="list"
        aria-activedescendant={
          selectedChoice !== undefined ? optionId(selectedChoice) : undefined
        }
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        readOnly={!props.guessEnabled}
        value={props.value}
        onInput={(event) => {
          const value = event.currentTarget.value;

          setError((prev) =>
            prev.state !== "false" ? { state: "false" } : prev
          );
          setSelectedChoice(undefined);
          onChange(value);
        }}
        onKeyDown={(event) => {
          let preventDefault = true;
          if (event.key === "Enter") {
            if (!props.guessEnabled) {
              onNextQuestion();
            } else {
              let value = event.currentTarget.value;
              if (selectedChoice !== undefined) {
                value = choices[selectedChoice];
                setError({ state: "false" });
              } else if (value.trim() === "") {
                setError({
                  state: "true",
                  message: "Entering a pokemon name is required.",
                });
              } else if (!props.pokemonList.includes(value)) {
                setError({
                  state: "spelling",
                  message: "Invalid pokemon name entered.",
                });
              }

              tryGuess(value);
            }
          } else if (event.key === "ArrowDown") {
            setSelectedChoice((choice) => {
              if (choices.length === 0) {
                return undefined;
              } else if (choice === undefined) {
                return 0;
              } else {
                return Math.min(choice + 1, choices.length - 1);
              }
            });
          } else if (event.key === "ArrowUp") {
            setSelectedChoice((choice) =>
              choice === undefined || choice === 0 ? undefined : choice - 1
            );
          } else {
            preventDefault = false;
          }

          if (preventDefault) {
            event.preventDefault();
          }
        }}
      />
      <div id={errorId} className="text-red-500">
        {error.message}
      </div>
      <ul role="listbox" id={listboxId}>
        {props.guessEnabled &&
          choices.map((pokemonName, index) => (
            <li
              key={index}
              className={clsx(
                "py-1 capitalize border text-center m-1 sm:m-2 cursor-pointer hover:border-slate-50",
                index === selectedChoice
                  ? "border-slate-50"
                  : "border-transparent"
              )}
              role="option"
              id={optionId(index)}
              aria-setsize={choices.length}
              aria-posinset={index + 1}
              aria-selected={index === selectedChoice}
              tabIndex={-1}
              onClick={() => {
                tryGuess(pokemonName);
                refInput.current?.focus();
              }}
            >
              {pokemonName}
            </li>
          ))}
      </ul>
      <span id={descriptionId} className="hidden">
        When autocomplete results are available use up and down arrows to review
        and enter to select. Touch device users, explore by touch or with swipe
        gestures. Only the top 10 relevant results are available at a time.
      </span>
    </div>
  );
};

export default PokemonNameInput;
