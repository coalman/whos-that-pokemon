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

  try {
    validatePokemonIndex(actualPokemon);
    validatePokemonIndex(guessedPokemon);
  } catch (error: unknown) {
    let message = "";
    if (error instanceof Error) {
      message = error.message;
    } else {
      // Probably should just send "unknown error" and log this.
      message = String(error);
    }

    res.status(500).send(message);
    return;
  }

  const guess = await prisma.guess.create({
    data: { actualPokemon, guessedPokemon },
  });

  res.status(200).json(guess);
}

function validatePokemonIndex(value: unknown) {
  if (typeof value !== "number") {
    throw new Error(
      `Pokemon index must be a number (unexpected type: ${typeof value}).`
    );
  } else if (value < 0) {
    throw new Error(`Pokemon index should be positive (value: ${value}).`);
  } else if (value >= 151) {
    throw new Error(`Pokemon index should be below 151 (value: ${value}).`);
  }
}
