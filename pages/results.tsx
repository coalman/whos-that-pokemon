import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { PokemonClient } from "pokenode-ts";
import { useEffect, useMemo, useState } from "react";
import type { Data as Results } from "pages/api/results";

const Results: NextPage<{
  pokemonList: readonly string[];
}> = (props) => {
  const [data, setData] = useState<Results | undefined>(undefined);

  useEffect(() => {
    const abortController = new AbortController();

    (async function fetchData() {
      const response = await fetch("/api/results", {
        headers: { Accept: "application/json" },
        method: "GET",
        signal: abortController.signal,
      });

      const data = await response.json();

      if (!abortController.signal.aborted) {
        setData(data as Results);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  const results = useMemo(() => {
    if (data === undefined) return undefined;

    const resultMap = new Map<
      number,
      { id: number; correct: number; total: number }
    >();

    for (let row of data) {
      let result = resultMap.get(row.actualPokemon);
      if (result === undefined) {
        result = { id: row.actualPokemon, correct: 0, total: 0 };
        resultMap.set(row.actualPokemon, result);
      }

      result.total += row._count;
      if (row.actualPokemon === row.guessedPokemon) {
        result.correct += row._count;
      }
    }

    return [...resultMap.values()].sort(
      (b, a) => a.correct / a.total - b.correct / b.total
    );
  }, [data]);

  return (
    <div className="flex justify-center">
      <Head>
        <title>{"Who's that Pokemon?"}</title>
      </Head>

      <main className="flex flex-col gap-8 w-1/2">
        <div className="text-center pt-8">
          <h1 className="text-2xl">Results</h1>
        </div>
        <ol className="flex flex-col gap-2">
          {results?.map(({ id, correct, total }, rank) => (
            <li key={id} className="inline-flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span>{rank + 1}</span>
                <Image
                  src={getPokemonThumbnailSrc(id + 1)}
                  width={96}
                  height={96}
                />
                <span className="capitalize">{props.pokemonList[id]}</span>
              </div>
              <span>{percentFormatter.format(correct / total)}</span>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
};

export default Results;

export const getStaticProps: GetStaticProps = async () => {
  const pokeApi = new PokemonClient();
  const pokemonList = await pokeApi.listPokemons(0, 151);

  return { props: { pokemonList: pokemonList.results.map((r) => r.name) } };
};

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });

const getPokemonThumbnailSrc = (index: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;
