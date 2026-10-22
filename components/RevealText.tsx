import { Fragment, type ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** "mask": palavras sobem de dentro de uma máscara. "fade": só a opacidade muda. */
  mode?: "mask" | "fade";
};

/**
 * Divide o texto em palavras para revelações controladas pela timeline.
 * As palavras animáveis recebem a classe `.rw`.
 */
export function RevealText({ text, as: Tag = "span", className, mode = "mask" }: Props) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {mode === "mask" ? (
            <span aria-hidden className="rw-mask">
              <span className="rw">{word}</span>
            </span>
          ) : (
            <span aria-hidden className="rw">
              {word}
            </span>
          )}
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
