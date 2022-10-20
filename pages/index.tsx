import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/future/image";
import { useRef, useState } from "react";
import PokemonImageQuestion from "components/PokemonImageQuestion";
import PokemonNameInput from "components/PokemonNameInput";
import useRandomPokemon from "lib/useRandomPokemon";
import clsx from "clsx";
import { BadgeBar } from "components/BadgeBar";
import Link from "next/link";
import logoImage from "public/pokemon-logo-small.png";
import pokemonList from "lib/pokemonNames.json";

const getPokemonImgSrc = (index: number) =>
  `/img/pokemon/other/official-artwork/${index + 1}.webp`;

const Home: NextPage = () => {
  const [guess, setGuess] = useState("");
  const [reveal, setReveal] = useState(false);

  const { pokemonIndex, nextRandomPokemon, streakCount } = useRandomPokemon(
    pokemonList.length
  );

  const pokemonName =
    pokemonIndex !== undefined ? pokemonList[pokemonIndex] : undefined;

  const nextQuestion = () => {
    const streak = pokemonName === guess;
    setReveal(false);
    setGuess("");
    nextRandomPokemon(streak);
  };

  const refDialog = useRef<HTMLDialogElement>(null);
  const refDialogBtn = useRef<HTMLButtonElement>(null);

  let currentStreakCount = streakCount;
  if (reveal && pokemonName === guess) {
    currentStreakCount += 1;
  }

  return (
    <div>
      <Head>
        <title>{"Who's that Pokemon?"}</title>
        <link rel="icon" href="/poke-ball.png" />
        <meta name="description" content="Pokemon guessing game." />
      </Head>

      <main className="flex flex-col items-center gap-1">
        <div
          className={clsx(
            "grid w-full gap-1 justify-center justify-items-center px-2",
            "sm:grid-cols-[repeat(2,_minmax(0,_500px))] sm:grid-rows-[min-content_1fr] sm:gap-4 sm:px-4"
          )}
        >
          <h1 className="pt-1 text-2xl flex justify-center items-center whitespace-nowrap">
            <span>{"Who's that"}</span>
            <Image
              src={logoImage}
              width={100}
              height={37}
              alt="Pokemon (logo)"
            />
            <span>?</span>
          </h1>
          <PokemonImageQuestion
            className="sm:row-start-2"
            imgSrc={
              pokemonIndex !== undefined
                ? getPokemonImgSrc(pokemonIndex)
                : undefined
            }
            revealed={reveal}
          />
          <BadgeBar
            streakCount={currentStreakCount}
            maxStreak={pokemonList.length}
          />
          <div className="w-full sm:row-start-2 [min-height:260px]">
            <PokemonNameInput
              guessEnabled={!reveal}
              pokemonList={pokemonList}
              value={guess}
              onChange={setGuess}
              onGuess={(guess) => {
                setReveal(true);
                setGuess(guess);

                if (
                  guess === pokemonName &&
                  streakCount + 1 === pokemonList.length &&
                  refDialog.current
                ) {
                  refDialog.current.showModal();
                  refDialogBtn.current?.focus();
                }

                postGuess({
                  actualPokemon: pokemonIndex as number,
                  guessedPokemon: pokemonList.indexOf(guess) as number,
                });
              }}
              onNextQuestion={nextQuestion}
            />
            {reveal && (
              <div className="py-2 text-center relative">
                {pokemonName === guess ? "Correct" : "Incorrect"}
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
              ref={refDialogBtn}
              type="button"
              className="border border-slate-500"
              onClick={() => {
                refDialog.current?.close();
              }}
            >
              Reset
            </button>
          </div>
        </dialog>
      </main>

      <footer className="flex justify-center py-4">
        <Link href="/results">
          <a className="border border-slate-500 px-2 py-1">View Results</a>
        </Link>
      </footer>
    </div>
  );
};

export default Home;

async function postGuess(guess: {
  actualPokemon: number;
  guessedPokemon: number;
}) {
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
