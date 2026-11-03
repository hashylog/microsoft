import { SmoothScroll } from "@/components/SmoothScroll";
import { ChapterNav } from "@/components/ChapterNav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/scenes/Hero";
import { About } from "@/components/scenes/About";
import { Windows } from "@/components/scenes/Windows";
import { Microsoft365 } from "@/components/scenes/Microsoft365";
import { Surface } from "@/components/scenes/Surface";
import { Xbox } from "@/components/scenes/Xbox";
import { Azure } from "@/components/scenes/Azure";
import { Copilot } from "@/components/scenes/Copilot";
import { Future } from "@/components/scenes/Future";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <main>
        <Hero />
        <About />
        <Windows />
        <Microsoft365 />
        <Surface />
        <Xbox />
        <Azure />
        <Copilot />
        <Future />
      </main>
      <Footer />
      {/* Depois das cenas: os gatilhos de capítulo dependem dos pins já criados. */}
      <ChapterNav />
    </>
  );
}
