import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { PokemonClient } from "pokenode-ts";
import PokemonImageQuestion from "components/PokemonImageQuestion";
import PokemonNameInput from "components/PokemonNameInput";

const getPokemonImgSrc = (index: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index}.png`;

const Home: NextPage<{
  pokemonList: readonly string[];
}> = (props) => {
  const [reveal, setReveal] = useState(false);

  const [pokemonIndex, setPokemonIndex] = useState<number | undefined>(
    undefined
  );
  useEffect(() => {
    if (pokemonIndex === undefined) {
      setPokemonIndex(getRandomInteger(props.pokemonList.length));
    }
  }, [pokemonIndex, props.pokemonList.length]);

  const [guess, setGuess] = useState("");

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
          <h1 className="text-2xl">{"Who's that Pokemon?"}</h1>
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
            <PokemonNameInput
              guessEnabled={!reveal}
              pokemonList={props.pokemonList}
              value={guess}
              onChange={setGuess}
              onGuess={(pokemonName) => {
                setReveal(true);
                setGuess(pokemonName);

                {
                  const guessedPokemon = props.pokemonList.indexOf(
                    pokemonName
                  ) as number;

                  postGuess({
                    actualPokemon: pokemonIndex as number,
                    guessedPokemon,
                  });
                }

                setTimeout(() => {
                  setReveal(false);
                  setGuess("");
                  setPokemonIndex(getRandomInteger(props.pokemonList.length));
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

/**
 * Get random integer.
 *
 * @param max: exclusive maximum integer.
 */
function getRandomInteger(max: number): number {
  return Math.floor(Math.random() * max);
}

async function postGuess(guess: {
  actualPokemon: number;
  guessedPokemon: number;
}) {
  const response = await fetch("/api/guess", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(guess),
  });
}
