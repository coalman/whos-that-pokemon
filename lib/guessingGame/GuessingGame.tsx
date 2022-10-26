import { Fragment, useRef, useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Guess } from "@prisma/client";
import logoImage from "public/img/pokemon-logo-small.png";
import pokemonList from "lib/pokemonNames.json";
import useResetKey from "lib/useResetKey";
import PokemonImageQuestion from "./PokemonImageQuestion";
import PokemonNameInput from "./PokemonNameInput";
import useRandomPokemon from "./useRandomPokemon";
import BadgeBar from "./BadgeBar";

const getPokemonImgSrc = (index: number) =>
  `/img/pokemon/other/official-artwork/${index + 1}.webp`;

export default function GuessingGame() {
  type RevealState = "correct" | "incorrect" | "hidden";
  const [revealState, setRevealState] = useState<RevealState>("hidden");
  const [streakCount, setStreakCount] = useState(0);
  const [inputKey, resetInput] = useResetKey();

  const { pokemonIndex, nextPokemonIndex, nextRandomPokemon } =
    useRandomPokemon(pokemonList.length);

  usePreloadPokemonImages(pokemonIndex, nextPokemonIndex);

  const pokemonName =
    pokemonIndex !== undefined ? pokemonList[pokemonIndex] : undefined;

  const nextQuestion = () => {
    setRevealState("hidden");
    resetInput();
    if (streakCount === pokemonList.length) {
      setStreakCount(0);
    }
    nextRandomPokemon(revealState === "correct");
  };

  const refDialog = useRef<HTMLDialogElement>(null);

  return (
    <Fragment>
      <div
        className={clsx(
          "grid w-full gap-1 justify-center justify-items-center px-2",
          "sm:grid-cols-[repeat(2,_minmax(0,_500px))] sm:grid-rows-[min-content_1fr] sm:gap-4 sm:px-4"
        )}
      >
        <h1 className="pt-1 text-2xl flex justify-center items-center whitespace-nowrap">
          <span>{"Who's that"}</span>
          <Image src={logoImage} width={100} height={37} alt="Pokemon (logo)" />
          <span>?</span>
        </h1>
        <PokemonImageQuestion
          className="sm:row-start-2"
          imgSrc={
            pokemonIndex !== undefined
              ? getPokemonImgSrc(pokemonIndex)
              : undefined
          }
          revealed={revealState !== "hidden"}
        />
        <BadgeBar streakCount={streakCount} maxStreak={pokemonList.length} />
        <div className="w-full sm:row-start-2 [min-height:260px]">
          <PokemonNameInput
            // NOTE: pokemonIndex, nextPokemonIndex, and streakCount can't be used as
            // a key (or any combination of them). If streakCount wasn't incremented
            // eagerly (before nextQuestion() call), then it could be used.
            key={inputKey}
            guessEnabled={revealState === "hidden"}
            pokemonList={pokemonList}
            onGuess={(guess) => {
              const nextRevealState =
                guess === pokemonName ? "correct" : "incorrect";
              setRevealState(nextRevealState);

              const currentStreakCount =
                nextRevealState === "correct" ? streakCount + 1 : 0;
              setStreakCount(currentStreakCount);

              if (
                currentStreakCount === pokemonList.length &&
                refDialog.current
              ) {
                refDialog.current.showModal();
              }

              postGuess({
                actualPokemon: pokemonIndex as number,
                guessedPokemon: pokemonList.indexOf(guess) as number,
              });
            }}
            onNextQuestion={nextQuestion}
          />
          {revealState !== "hidden" && (
            <div className="py-2 text-center relative">
              {revealState === "correct" ? "Correct" : "Incorrect"}
              {"! It's "}
              <span className="capitalize">{pokemonName ?? ""}</span>
              {"! Press "}
              <span className="italic">Enter</span>
              {" to "}
              <button
                type="button"
                className="px-2 rounded-sm border border-slate-600 hover:border-slate-50"
                onClick={nextQuestion}
              >
                Continue!
              </button>
            </div>
          )}
        </div>
      </div>

      <dialog
        ref={refDialog}
        className="bg-slate-900 text-slate-50 border border-slate-500 px-8 py-6"
        onClose={nextQuestion}
        onCancel={nextQuestion}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl">Congratulations!</h2>
          <p>You got all {pokemonList.length} pokemon correct in a row.</p>
          <button
            type="button"
            className="border border-slate-500"
            // focuses the button when the dialog is shown
            // see: <https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/autofocus>
            autoFocus
            onClick={() => {
              refDialog.current?.close();
            }}
          >
            Reset
          </button>
        </div>
      </dialog>
    </Fragment>
  );
}

type GuessData = Pick<Guess, "actualPokemon" | "guessedPokemon">;
async function postGuess(guess: GuessData) {
  const response = await fetch("/api/guess", {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify(guess),
  });

  if (!response.ok) {
    // It's not really important to the user if we saved this data or not,
    // just log this error for developers to debug.
    // TODO: maybe save to external logging if possible
    console.error(
      `Failed to save guess: ${response.status} (${response.statusText})`
    );
  }
}

function usePreloadPokemonImages(
  pokemonIndex: number | undefined,
  nextPokemonIndex: number | undefined
) {
  const refFetchedPokemonIndexes = useRef(new Set<number>());

  useEffect(() => {
    if (pokemonIndex === undefined) return;

    // prevent eager fetching of this pokemon again.
    refFetchedPokemonIndexes.current.add(pokemonIndex);
  }, [pokemonIndex]);

  useEffect(() => {
    if (
      nextPokemonIndex === undefined ||
      refFetchedPokemonIndexes.current.has(nextPokemonIndex)
    ) {
      return;
    }

    document.createElement("img").src = getPokemonImgSrc(nextPokemonIndex);
  }, [nextPokemonIndex]);
}
