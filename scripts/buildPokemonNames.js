const path = require("path");
const fs = require("fs/promises");
const { PokemonClient } = require("pokenode-ts");

async function main() {
  const pokeApi = new PokemonClient();
  const { results } = await pokeApi.listPokemons(0, 151);
  const pokemonNames = results.map((r) => r.name);

  const outFile = path.join(__dirname, "../lib/pokemonNames.json");
  await fs.writeFile(outFile, JSON.stringify(pokemonNames, undefined, 2), {
    encoding: "utf-8",
  });
}

main();
