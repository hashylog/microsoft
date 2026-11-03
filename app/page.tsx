import { SmoothScroll } from "@/components/SmoothScroll";
import { ChapterNav } from "@/components/ChapterNav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/scenes/Hero";
import { About } from "@/components/scenes/About";
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
