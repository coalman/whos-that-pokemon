import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(200).json({});
  }

  const { actualPokemon, guessedPokemon } = req.body;

  // TODO: validate data from req.body

  const guess = await prisma.guess.create({
    data: { actualPokemon, guessedPokemon },
  });

  res.status(200).json(guess);
}
