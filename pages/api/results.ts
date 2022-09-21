import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/db";

export type Data = {
  actualPokemon: number;
  guessedPokemon: number;
  _count: number;
}[];

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const results = await prisma.guess.groupBy({
    by: ["actualPokemon", "guessedPokemon"],
    orderBy: {
      actualPokemon: "asc",
    },
    _count: true,
  });

  res.status(200).json(results);
}
