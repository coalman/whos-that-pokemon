import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/db";

export type Data = ReturnType<typeof sumGuessData>;

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const data = await getGuessData();

  const results = sumGuessData(data);

  res.status(200).json(results);
}

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
