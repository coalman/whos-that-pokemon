/**
 * The autocomplete markup is based off of:
 *
 * - <https://alphagov.github.io/accessible-autocomplete/examples/>
 * - <https://a11y-guidelines.orange.com/en/articles/autocomplete-component/>
 */

import clsx from "clsx";
import { Fragment, useMemo, useRef, useState } from "react";

export type PokemonNameInputProps = {
  guessEnabled: boolean;
  pokemonList: readonly string[];
  value: string;
  onChange: (value: string) => void;
  onGuess: (pokemonName: string) => void;
};

const PokemonNameInput = (props: PokemonNameInputProps) => {
  const { onGuess, onChange } = props;

  const refInput = useRef<HTMLInputElement>(null);

  const [showChoices, setShowChoices] = useState(false);

  const choices: readonly string[] = useMemo(() => {
    if (props.value.trim() === "") {
      return [];
    }

    // TODO: better comparison/ranking
    return (
      props.pokemonList
        .filter((pokemonName) => pokemonName.includes(props.value))
        // limit the number of results.
        .slice(0, 10)
    );
  }, [props.pokemonList, props.value]);

  const [selectedChoice, setSelectedChoice] = useState<number | undefined>(
    undefined
  );

  // derived state: reset selectedChoice when choices array changes
  {
    const [prevChoices, setPrevChoices] = useState<typeof choices>(choices);
    if (prevChoices !== choices) {
      setPrevChoices(choices);
      setSelectedChoice(undefined);
    }
  }

  const listboxId = "my-listbox"; // TODO: unique id?
  const descriptionId = "my-description"; // TODO: unique id?
  const optionId = (index: number) => `my-option-${index}`;

  return (
    <Fragment>
      <input
        ref={refInput}
        className="border"
        type="text"
        role="combobox"
        aria-owns={listboxId}
        aria-expanded={choices.length > 0}
        aria-describedby={descriptionId}
        aria-autocomplete="list"
        aria-activedescendant={
          selectedChoice !== undefined ? optionId(selectedChoice) : undefined
        }
        autoComplete="off"
        autoCapitalize="off"
        readOnly={!props.guessEnabled}
        value={props.value}
        onChange={(event) => {
          setShowChoices(true);
          onChange(event.currentTarget.value);
        }}
        onKeyDown={(event) => {
          let preventDefault = true;
          if (event.key === "Enter") {
            if (props.guessEnabled) {
              setShowChoices(false);

              let value = event.currentTarget.value;
              if (selectedChoice !== undefined) {
                value = choices[selectedChoice];
              }
              onGuess(value);
            }
          } else if (event.key === "ArrowDown") {
            setSelectedChoice((choice) =>
              choice !== undefined ? choice + 1 : 0
            );
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
      <ul role="listbox" id={listboxId}>
        {showChoices &&
          choices.map((pokemonName, index) => (
            <li
              key={index}
              className={clsx(index === selectedChoice ? "border" : "")}
              role="option"
              id={optionId(index)}
              aria-setsize={choices.length}
              aria-posinset={index + 1}
              aria-selected={index === selectedChoice}
              tabIndex={-1}
              onClick={() => {
                setShowChoices(false);
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
    </Fragment>
  );
};

export default PokemonNameInput;
