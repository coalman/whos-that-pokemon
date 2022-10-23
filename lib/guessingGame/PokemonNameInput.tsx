/**
 * The autocomplete markup is based off of:
 *
 * - <https://alphagov.github.io/accessible-autocomplete/examples/>
 * - <https://a11y-guidelines.orange.com/en/articles/autocomplete-component/>
 */

import clsx from "clsx";
import {
  useMemo,
  useRef,
  useState,
  useId,
  useEffect,
  type AriaAttributes,
} from "react";

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

  const { error, resetError, checkValidName } = usePokemonNameError(
    props.pokemonList
  );

  const {
    index: selectedChoice,
    resetItemIndex,
    nextItem,
    prevItem,
  } = useItemIndex(undefined);

  const inputId = useId();
  const listboxId = `${inputId}-listbox`;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const optionId = (index: number) => `${inputId}-option${index}`;

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

          resetError();
          resetItemIndex();
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
                resetError();
              }

              if (checkValidName(value)) {
                resetItemIndex();
                onGuess(value);
              }
            }
          } else if (event.key === "ArrowDown") {
            nextItem(choices.length);
          } else if (event.key === "ArrowUp") {
            prevItem();
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
                resetItemIndex();
                onGuess(pokemonName);
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

type InputError = {
  state: Extract<AriaAttributes["aria-invalid"], string>;
  message?: string;
};

function usePokemonNameError(pokemonList: readonly string[]) {
  const [error, setError] = useState<InputError>({ state: "false" });

  return {
    error,
    resetError: () =>
      setError((prev) => (prev.state !== "false" ? { state: "false" } : prev)),
    checkValidName: (pokemonName: string): boolean => {
      if (pokemonName.trim() === "") {
        setError({
          state: "true",
          message: "Entering a pokemon name is required.",
        });
        return false;
      } else if (!pokemonList.includes(pokemonName)) {
        setError({
          state: "spelling",
          message: "Invalid pokemon name entered.",
        });
        return false;
      } else {
        return true;
      }
    },
  };
}

function useItemIndex(initialIndex: number | undefined) {
  const [index, setIndex] = useState(initialIndex);

  return {
    index,
    resetItemIndex: () => setIndex(undefined),
    nextItem: (itemsLength: number) =>
      setIndex((index) => {
        if (itemsLength === 0) {
          return undefined;
        } else if (index === undefined) {
          return 0;
        } else {
          return Math.min(index + 1, itemsLength - 1);
        }
      }),
    prevItem: () =>
      setIndex((index) =>
        index === undefined || index === 0 ? undefined : index - 1
      ),
  };
}
