import type { NextPage, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { PokemonClient } from "pokenode-ts";
import { useEffect, useState } from "react";
import type { Data as Results } from "pages/api/results";

const Results: NextPage<{
  pokemonList: readonly string[];
}> = (props) => {
  const [results, setResults] = useState<Results | undefined>(undefined);

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
        setResults(data as Results);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className="flex justify-center">
      <Head>
        <title>{"Who's that Pokemon?"}</title>
      </Head>

      <main className="flex flex-col items-center gap-8 px-8">
        <table
          className="table-fixed w-full [max-width:600px] [min-width:400px]"
          summary="Pokemon ordered by most accurately guessed pokemon."
        >
          <caption className="text-2xl py-8">Results</caption>
          <thead className="border-b border-slate-50">
            <tr>
              <th className="text-right [width:40px]">Rank</th>
              <th>Pokemon</th>
              <th className="text-right [width:70px]">Accuracy</th>
              <th className="text-right [width:70px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {results?.map(({ id, correct, total }, rank) => (
              <tr key={id}>
                <td className="text-right">{rank + 1}.</td>
                <td className="flex items-center">
                  <Image
                    src={getPokemonThumbnailSrc(id + 1)}
                    width={96}
                    height={96}
                    alt={props.pokemonList[id]}
                  />
                  <span className="capitalize pl-2">
                    {props.pokemonList[id]}
                  </span>
                </td>
                <td className="font-mono text-right">
                  {percentFormatter.format(correct / total)}
                </td>
                <td className="font-mono text-right" title={String(total)}>
                  {shortFormatter.format(total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
const shortFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
});

const getPokemonThumbnailSrc = (index: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;
