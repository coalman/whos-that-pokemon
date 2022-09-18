import { CSSProperties, Fragment } from "react";
import Image from "next/image";
import clsx from "clsx";

export type PokemonImageQuestionProps = {
  className?: string;
  style?: CSSProperties;
  imgSrc: string | undefined;
  revealed: boolean;
};

const PokemonImageQuestion = (props: PokemonImageQuestionProps) => {
  return (
    <div
      className={clsx(
        props.className,
        "relative inline-flex justify-center items-center"
      )}
      style={props.style}
    >
      {props.imgSrc !== undefined && (
        <Fragment>
          <Image
            className={clsx(
              "absolute",
              props.revealed ? "visible" : "invisible"
            )}
            src={props.imgSrc}
            layout="fill"
            objectFit="contain"
            objectPosition="center"
          />
          {!props.revealed && (
            <Silhouette className="absolute" imgSrc={props.imgSrc} />
          )}
        </Fragment>
      )}
    </div>
  );
};

export default PokemonImageQuestion;

const Silhouette = (props: { className?: string; imgSrc: string }) => {
  return (
    <div
      className={clsx(
        props.className,
        "bg-black w-full h-full",
        // NOTE: most mask-* properties need webkit prefixes (chrome/edge atm), so we use tailwind here instead of inline styles.
        "[mask-image:var(--url)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]"
      )}
      style={{ ["--url" as any]: `url(${props.imgSrc})` }}
    />
  );
};
