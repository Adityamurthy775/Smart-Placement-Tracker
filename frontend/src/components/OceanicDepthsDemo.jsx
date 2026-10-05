// Standalone demo for ShaderBackground. Reachable at /oceanic-depths.
//
// This is the upstream demo verbatim in shape — a full-viewport relative box
// with the canvas filling it. The hero at "/" uses the same component with the
// same sizing; this page just isolates it from the site chrome.
import { ShaderBackground } from "./ui/oceanic-depths";

export default function OceanicDepthsDemo() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#02141c]">
      <ShaderBackground className="h-full w-full" />
    </div>
  );
}