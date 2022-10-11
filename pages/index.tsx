import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRef, useState } from "react";
import { PokemonClient } from "pokenode-ts";
import PokemonImageQuestion from "components/PokemonImageQuestion";
import PokemonNameInput from "components/PokemonNameInput";
import StreakCounter from "components/StreakCounter";
import useRandomPokemon from "lib/useRandomPokemon";

const getPokemonImgSrc = (index: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index}.png`;

const Home: NextPage<{
  pokemonList: readonly string[];
}> = (props) => {
  const [guess, setGuess] = useState("");
  const [reveal, setReveal] = useState(false);

  const { pokemonIndex, nextRandomPokemon, streakCount } = useRandomPokemon(
    props.pokemonList.length
  );

  const pokemonName =
    pokemonIndex !== undefined ? props.pokemonList[pokemonIndex] : undefined;

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

      <main className="flex flex-col items-center gap-8">
        <div className="text-center pt-8">
          <h1 className="text-2xl inline-flex items-center">
            <span>{"Who's that"}</span>
            <Image
              src="/pokemon-logo-small.png"
              layout="fixed"
              width={100}
              height={37}
              alt="Pokemon logo that says pokemon"
            />
            <span>?</span>
          </h1>
        </div>

        <div className="inline-flex gap-8 flex-col items-center lg:flex-row lg:justify-center lg:items-start">
          <PokemonImageQuestion
            style={{ width: 500, height: 500 }}
            imgSrc={
              pokemonIndex !== undefined
                ? getPokemonImgSrc(pokemonIndex + 1)
                : undefined
            }
            revealed={reveal}
          />
          <div>
            <StreakCounter
              value={currentStreakCount}
              maxValue={props.pokemonList.length}
            />
            <PokemonNameInput
              guessEnabled={!reveal}
              pokemonList={props.pokemonList}
              value={guess}
              onChange={setGuess}
              onGuess={(guess) => {
                setReveal(true);
                setGuess(guess);

                if (
                  guess === pokemonName &&
                  streakCount + 1 === props.pokemonList.length &&
                  refDialog.current
                ) {
                  refDialog.current.showModal();
                  refDialogBtn.current?.focus();
                }

                postGuess({
                  actualPokemon: pokemonIndex as number,
                  guessedPokemon: props.pokemonList.indexOf(guess) as number,
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
            <p>
              You got all {props.pokemonList.length} pokemon correct in a row.
            </p>
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
    </div>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const pokeApi = new PokemonClient();
  const { results } = await pokeApi.listPokemons(0, 151);
  const pokemonList = results.map((r) => r.name);

  return { props: { pokemonList } };
};

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
