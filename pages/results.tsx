import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { PokemonClient } from "pokenode-ts";
import type { Data as Results } from "pages/api/results";
import prisma from "lib/db";

const Results: NextPage<{
  pokemonList: readonly string[];
  results: ReturnType<typeof sumGuessData>;
}> = (props) => {
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
            {props.results.map(({ id, correct, total }, rank) => (
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

export const getServerSideProps: GetServerSideProps = async () => {
  const pokeApi = new PokemonClient();

  const [pokemonList, data] = await Promise.all([
    pokeApi.listPokemons(0, 151),
    getGuessData(),
  ]);

  const results = sumGuessData(data);

  return {
    props: {
      results,
      pokemonList: pokemonList.results.map(({ name }) => name),
    },
  };
};

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });
const shortFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
});

const getPokemonThumbnailSrc = (index: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`;

const getGuessData = () =>
  prisma.guess.groupBy({
    by: ["actualPokemon", "guessedPokemon"],
    orderBy: {
      actualPokemon: "asc",
    },
    _count: true,
  });

export type GuessData = Awaited<ReturnType<typeof getGuessData>>;

export function sumGuessData(data: GuessData) {
  const resultMap = new Map<
    number,
    {
      id: number;
      correct: number;
      total: number;
    }
  >();

  for (let row of data) {
    const id = row.actualPokemon;
    let result = resultMap.get(id);
    if (result === undefined) {
      result = { id, correct: 0, total: 0 };
      resultMap.set(id, result);
    }

    result.total += row._count;
    if (row.actualPokemon === row.guessedPokemon) {
      result.correct += row._count;
    }
  }

  return [...resultMap.values()].sort(
    (b, a) => a.correct / a.total - b.correct / b.total
  );
}
