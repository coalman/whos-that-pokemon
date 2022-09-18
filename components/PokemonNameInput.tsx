export type PokemonNameInputProps = {
  guessEnabled: boolean;
  value: string;
  onChange: (value: string) => void;
  onGuess: (pokemonName: string) => void;
};

const PokemonNameInput = (props: PokemonNameInputProps) => {
  const { onGuess } = props;

  return (
    <input
      className="border"
      type="text"
      readOnly={!props.guessEnabled}
      value={props.value}
      onChange={(event) => {
        props.onChange(event.currentTarget.value);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          if (props.guessEnabled) {
            onGuess(event.currentTarget.value);
          }
        }
      }}
    />
  );
};

export default PokemonNameInput;
