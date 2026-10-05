// Standalone demo for the WebGLShader + LiquidButton pairing. Reachable at
// /shader-demo. The live integration is in HeroSection, which uses the same two
// components over the same shader; this page is the isolated view of them.
//
// No images: neither component takes artwork — the shader draws its own strands
// and the button refracts whatever is behind it, so adding a photo here would
// only sit between the two and hide the effect that is being demonstrated.
import { BsArrowRight } from "react-icons/bs";

import { WebGLShader } from "./ui/web-gl-shader";
import { LiquidButton } from "./ui/liquid-glass-button";

export default function ShaderDemo() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
      {/* Fills the viewport from inside a `relative` box rather than being
          `fixed`, so it scrolls with the page and cannot escape its parent. */}
      <WebGLShader className="absolute inset-0 h-full w-full" />

      <div className="relative z-10 mx-auto w-full max-w-3xl border border-white/15 p-2">
        <main className="relative overflow-hidden border border-white/15 py-10 text-center">
          <h1 className="mb-3 text-center text-7xl font-extrabold tracking-tighter text-white md:text-[clamp(2rem,8vw,7rem)]">
            Design is Everything
          </h1>
          <p className="px-6 text-center text-xs text-white/60 md:text-sm lg:text-lg">
            Unleashing creativity through bold visuals, seamless interfaces, and
            limitless possibilities.
          </p>

          <div className="my-8 flex items-center justify-center gap-1">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <p className="text-xs text-green-500">Available for New Projects</p>
          </div>

          <div className="flex justify-center">
            <LiquidButton className="rounded-full border border-white/30 text-white" size="xl">
              Let's Go
              <BsArrowRight />
            </LiquidButton>
          </div>
        </main>
      </div>
    </div>
  );
}