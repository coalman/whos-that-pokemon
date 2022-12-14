import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import prisma from "lib/db";
import Link from "next/link";
import pokemonList from "lib/pokemonNames.json";

const Results: NextPage<{
  results: ReturnType<typeof sumGuessData>;
}> = (props) => {
  return (
    <div className="flex flex-col justify-center">
      <Head>
        <title>{"Who's that Pokemon?"}</title>
        <link rel="icon" href="/img/poke-ball.png" />
        <meta
          name="description"
          content="Global results for the guessing pokemon game."
        />
      </Head>

      <header className="flex py-8 items-end justify-center">
        <h1 className="text-2xl">Results</h1>
        <div className="relative">
          <Link href="/" className="absolute left-4 bottom-0">
            (Back)
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center gap-8 px-8">
        <table
          className="table-fixed w-full [max-width:600px] [min-width:400px]"
          summary="Pokemon ordered by most accurately guessed pokemon."
        >
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
                    unoptimized
                    width={96}
                    height={96}
                    alt={pokemonList[id]}
                  />
                  <span className="capitalize pl-2">{pokemonList[id]}</span>
                </td>
                <td className="font-mono text-right">
                  {percentFormatter.format(total > 0 ? correct / total : 0)}
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

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  const results = await getGuessData().then((data) =>
    sumGuessData(data, 0, 151)
  );

  return { props: { results } };
};

const percentFormatter = new Intl.NumberFormat(undefined, { style: "percent" });
const shortFormatter = new Intl.NumberFormat(undefined, {
  notation: "compact",
});

const getPokemonThumbnailSrc = (index: number) => `/img/pokemon/${index}.webp`;

const getGuessData = () =>
  prisma.guess.groupBy({
    by: ["actualPokemon", "guessedPokemon"],
    orderBy: {
      actualPokemon: "asc",
    },
    _count: true,
  });

export type GuessData = Awaited<ReturnType<typeof getGuessData>>;

export function sumGuessData(
  data: GuessData,
  idStart: number,
  idLength: number
) {
  type ResultType = { id: number; correct: number; total: number };

  const resultMap = new Map<number, ResultType>();
  for (let i = 0; i < idLength; i++) {
    const id = i + idStart;
    resultMap.set(id, { id, correct: 0, total: 0 });
  }

  for (let row of data) {
    let result = resultMap.get(row.actualPokemon);
    if (result === undefined) {
      // unrecognized pokemon, skip it
      continue;
    }

    result.total += row._count;
    if (row.actualPokemon === row.guessedPokemon) {
      result.correct += row._count;
    }
  }

  return [...resultMap.values()].sort((b, a) => {
    const aCorrectPercent = a.total > 0 ? a.correct / a.total : 0;
    const bCorrectPercent = b.total > 0 ? b.correct / b.total : 0;
    const percentDiff = aCorrectPercent - bCorrectPercent;

    if (percentDiff !== 0) {
      return percentDiff;
    }

    // if they both have the same accuracy, order them on the number of responses
    // descending when above 50%, ascending when 50% or below
    return (aCorrectPercent > 0.5 ? 1 : -1) * (a.total - b.total);
  });
}
