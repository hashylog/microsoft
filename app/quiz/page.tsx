import type { Metadata, Viewport } from "next";
import { Quiz } from "@/components/quiz/Quiz";
import { Cursor } from "@/components/Cursor";

export const metadata: Metadata = {
  title: "Quiz Microsoft",
  description: "Quanto você sabe sobre a história da Microsoft? Tech Camps 2026.",
};

// Barra do navegador no mobile com a cor do fundo, e conteúdo até as bordas (respeitando o notch via safe-area).
export const viewport: Viewport = {
  themeColor: "#0D1B2E",
  viewportFit: "cover",
};

export default function QuizPage() {
  return (
    <>
      <Quiz />
      <Cursor />
    </>
  );
}
