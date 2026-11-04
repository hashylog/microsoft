/**
 * Registro central de mídia.
 *
 * Cada slot corresponde a um container na página. Hoje todos estão com
 * `source: null` e renderizam um placeholder. Para inserir o asset final,
 * basta preencher `source` — a cena continua passando o progresso do scroll
 * e o <ScrollMedia> decide como exibir:
 *
 *   { kind: "video",  src: "/media/hero.mp4", poster: "/media/hero.jpg" }
 *   { kind: "frames", count: 180, path: (i) => `/media/hero/${String(i).padStart(4, "0")}.webp` }
 *
 * Vídeo com scrub precisa de keyframe em todo frame e sem B-frames; senão cada
 * busca decodifica desde o último keyframe e o scroll trava. CRF 14 mantém a
 * qualidade próxima do original (o arquivo fica ~4–5× maior):
 *
 *   ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 14 -g 1 -bf 0 \
 *     -pix_fmt yuv420p -an -movflags +faststart public/videos/out.mp4
 */

export type MediaSource =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "frames"; count: number; path: (index: number) => string };

export type MediaSpec = {
  title: string;
  description: string;
  /** Quantidade de frames planejada (usada pelo contador do placeholder). */
  frames: number;
  source: MediaSource | null;
};

export const MEDIA = {
  HERO_VIDEO: {
    title: "Abertura",
    description: "Filme de 75 s percorrido inteiro pelo scroll; termina com o logo sobre fundo preto.",
    frames: 1801,
    // Muito detalhe: keyframe a cada 4 frames e CRF 16 (~100 MB, SSIM 0,997);
    // tudo keyframe (-g 1) passaria de 250 MB.
    source: { kind: "video", src: "/videos/hero.mp4" },
  },
} satisfies Record<string, MediaSpec>;

export type MediaSlotId = keyof typeof MEDIA;

export function getMedia(id: MediaSlotId): MediaSpec {
  return MEDIA[id];
}
