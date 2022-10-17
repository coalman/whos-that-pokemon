import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id: idParam } = req.query;

  if (typeof idParam !== "string") {
    res.status(404).send("not found");
    return;
  }

  const id = idParam.replace(".png", "");

  const data = await fetch(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  );

  res
    .status(200)
    .setHeader("Cache-Control", "max-age=31536000, immutable")
    .setHeader("Content-Type", "image/png")
    .send(data.body);
}
