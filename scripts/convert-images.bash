#!/usr/bin/env bash

# curl "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.2.4-linux-x86-64.tar.gz" -O
# tar -xvf ./libwebp-1.2.4-linux-x86-x64.tar.gz

# TODO: check for cwebp and download it locally if not available
# TODO: argument parsing (probably using getopt)

DRY_RUN=false
POKEMON_START=1
POKEMON_END=151

CWEBP_BIN=./scripts/libwebp-1.2.4-linux-x86-64/bin/cwebp
REPO_DIR=/home/coalman/code/github/PokeAPI/sprites/
OUT_DIR=./public/img

convert_sprite () {
  local SPRITE_PATH=$1

  local IN_FILE="$REPO_DIR/sprites/$SPRITE_PATH.png"
  local OUT_FILE="$OUT_DIR/$SPRITE_PATH.webp"

  if [ "$DRY_RUN" = true ]; then
    echo 'convert'
    echo "    $IN_FILE"
    echo "    $OUT_FILE"
  else
    $CWEBP_BIN $IN_FILE -o $OUT_FILE
  fi
}

mkdir -p "$OUT_DIR/pokemon/other/official-artwork"
for ((i = $POKEMON_START; i <= $POKEMON_END; i++)); do
  convert_sprite /pokemon/other/official-artwork/$i
done

mkdir -p "$OUT_DIR/pokemon/"
for ((i = $POKEMON_START; i <= $POKEMON_END; i++)); do
  convert_sprite /pokemon/$i
done

mkdir -p "$OUT_DIR/badges/"
for ((i = 1; i <= 8; i++)); do
  convert_sprite /badges/$i
done
