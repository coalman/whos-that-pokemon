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
        <title>Who's that Pokemon?</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Who's that Pokemon?</h1>
        <h2 style={{ visibility: reveal ? "visible" : "hidden" }}>
          {"It's "}
          <span className="capitalize">{pokemonName ?? ""}</span>
          {"!"}
        </h2>
        <h2 style={{ visibility: reveal ? "visible" : "hidden" }}>
          {pokemonName === guess ? "Correct" : "Incorrect"}
        </h2>

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

              setTimeout(() => {
                setReveal(false);
                setGuess("");
                setPokemonIndex(getRandomInteger(props.pokemonList.length));
              }, 3_000);
            }}
          />
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
