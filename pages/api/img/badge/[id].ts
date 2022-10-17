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

  {
    const idNum = Number(id);
    if (idNum < 1 || idNum > 8 || isNaN(idNum)) {
      res.status(422).send(`Invalid badge id: ${id}`);
    }
  }

  const data = await fetch(
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${id}.png`
  );

  res
    .status(200)
    .setHeader("Cache-Control", "max-age=31536000, immutable")
    .setHeader("Content-Type", "image/png")
    .send(data.body);
}
