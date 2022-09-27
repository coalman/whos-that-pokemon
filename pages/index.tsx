import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { PokemonClient } from "pokenode-ts";
import PokemonImageQuestion from "components/PokemonImageQuestion";
import PokemonNameInput from "components/PokemonNameInput";
import StreakCounter from "components/StreakCounter";
import useRandomIndex from "lib/useRandomIndex";

const getPokemonImgSrc = (index: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index}.png`;

const Home: NextPage<{
  pokemonList: readonly string[];
}> = (props) => {
  const [guess, setGuess] = useState("");
  const [reveal, setReveal] = useState(false);

  const {
    index: pokemonIndex,
    nextRandomIndex: nextPokemon,
    markSplit: markStreakSplit,
  } = useRandomIndex(props.pokemonList.length);

  const [streakCount, setStreak] = useState(0);

  const pokemonName =
    pokemonIndex !== undefined ? props.pokemonList[pokemonIndex] : undefined;

  return (
    <div>
      <Head>
        <title>{"Who's that Pokemon?"}</title>
        <link rel="icon" href="/poke-ball.png" />
      </Head>

      <main className="flex flex-col items-center gap-8">
        <div className="text-center pt-8">
          <h1 className="text-2xl inline-flex items-center">
            <span>{"Who's that"}</span>
            <Image
              src="/pokemon-logo-small.png"
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
              value={streakCount}
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

                if (pokemonName === guess) {
                  setStreak((v) =>
                    v === props.pokemonList.length ? 0 : v + 1
                  );
                } else {
                  setStreak(0);
                  markStreakSplit();
                }

                postGuess({
                  actualPokemon: pokemonIndex as number,
                  guessedPokemon: props.pokemonList.indexOf(guess) as number,
                });

                setTimeout(() => {
                  setReveal(false);
                  setGuess("");
                  nextPokemon(props.pokemonList.length);
                }, 3_000);
              }}
            />
            {reveal && (
              <div className="py-2 text-center">
                {pokemonName === guess ? "Correct" : "Incorrect"}
                {"! It's "}
                <span className="capitalize">{pokemonName ?? ""}</span>
                {"!"}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const pokeApi = new PokemonClient();
  const pokemonList = await pokeApi.listPokemons(0, 151);

  return { props: { pokemonList: pokemonList.results.map((r) => r.name) } };
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
