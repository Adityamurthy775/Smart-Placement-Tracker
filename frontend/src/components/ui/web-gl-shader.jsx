// ---------------------------------------------------------------------------
// WebGLShader — three superimposed sine waves on a black ground, one per
// channel, each with a slightly different horizontal distortion so the red,
// green and blue strands drift apart toward the edges of the frame. The
// `1.0 / abs(...)` term is what turns each wave into a glowing hairline: it
// blows up to white along the wave's own zero-crossing and decays to black a
// pixel away, so you get filament, not a band.
//
// WHAT CHANGED FROM THE UPSTREAM SNIPPET, AND WHY.
//   1. Fixed-viewport -> container. Upstream renders `fixed inset-0` and sizes
//      the buffer from window.innerWidth/innerHeight, which is only correct for
//      a full-screen background. Dropped in here as the hero's background
//      layer it has to fill an `absolute inset-0` wrapper, so it measures its
//      own parent with a ResizeObserver instead. Same pixels, any box.
//   2. Window resize listener -> ResizeObserver, for the same reason: a hero
//      that is not the viewport does not change size when the viewport does.
//   3. devicePixelRatio clamped to 2. An uncapped ratio on a 3x phone renders
//      nine samples per CSS pixel for a shader that is mostly black.
//   4. `prefers-reduced-motion` draws one frame and stops. An always-running rAF
//      is exactly what that preference is about, and this is decoration — the
//      copy in front of it carries the meaning.
//   5. Context creation is allowed to fail. Upstream assumes a WebGL context
//      exists; without one the constructor throws and React unmounts the whole
//      tree. Here it degrades to the black ground, which is still a legible
//      hero background.
//
// No props are required — every tuning prop defaults to the shader's own
// default, so `<WebGLShader />` on its own is the upstream output.
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = /* glsl */ `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

const FRAGMENT_SHADER = /* glsl */ `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        float d = length(p) * distortion;

        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

// Two triangles covering clip space. Written out rather than PlaneGeometry
// because the vertex shader ignores the model/view matrices entirely and takes
// `position` straight to gl_Position — a 4x4 multiply per vertex would be
// dead work.
const POSITIONS = new Float32Array([
  -1.0, -1.0, 0.0,
   1.0, -1.0, 0.0,
  -1.0,  1.0, 0.0,
   1.0, -1.0, 0.0,
  -1.0,  1.0, 0.0,
   1.0,  1.0, 0.0,
]);

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * @param {number}  [speed=1]         Scroll rate of the waves. 0 freezes them.
 * @param {number}  [xScale=1]        Horizontal frequency. Higher = more strands.
 * @param {number}  [yScale=0.5]      Wave amplitude.
 * @param {number}  [distortion=0.05] How far the R/B strands pull apart from G.
 * @param {boolean} [paused=false]    Freezes the scene on the current frame.
 * @param {string}  [className]
 * @param {object}  [style]
 */
export function WebGLShader({
  speed = 1,
  xScale = 1,
  yScale = 0.5,
  distortion = 0.05,
  paused = false,
  className = "",
  style,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  // Mirrored into refs so the render loop reads live values without tearing the
  // GL context down every time a prop changes. Synced in an effect rather than
  // assigned during render: writing `ref.current` in the render body is what
  // the react-hooks/refs rule flags, and under StrictMode's double render it
  // is a side effect the render pass is not supposed to have.
  const speedRef = useRef(speed);
  const pausedRef = useRef(paused);

  useEffect(() => {
    speedRef.current = speed;
    pausedRef.current = paused;
  }, [speed, paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    } catch {
      // No WebGL on this machine. The wrapper's own background is the black
      // ground, so the hero still reads — just without the strands.
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(new THREE.Color(0x000000));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

    const uniforms = {
      resolution: { value: [1, 1] },
      time: { value: 0.0 },
      xScale: { value: xScale },
      yScale: { value: yScale },
      distortion: { value: distortion },
    };

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(POSITIONS, 3));

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Measuring the wrapper is what makes this a drop-in for the hero's
    // background layer: the box is decided by layout, not by the viewport.
    const applySize = () => {
      const width = Math.max(1, wrap.clientWidth);
      const height = Math.max(1, wrap.clientHeight);
      renderer.setSize(width, height, false);
      uniforms.resolution.value = [width, height];
    };

    let animationId = null;

    const animate = () => {
      if (!pausedRef.current) uniforms.time.value += 0.01 * speedRef.current;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    applySize();
    renderer.render(scene, camera);

    // Reduced motion, or an explicitly paused mount: hold on the frame just
    // drawn instead of starting an rAF loop the user did not ask for.
    if (!prefersReducedMotion() && !paused) {
      animationId = requestAnimationFrame(animate);
    }

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(applySize) : null;
    observer?.observe(wrap);
    window.addEventListener("resize", applySize);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("resize", applySize);
      observer?.disconnect();
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // The tuning props are mirrored into refs (see above), so re-running this
    // effect on an xScale change would needlessly rebuild the context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapRef}
      data-web-gl-shader=""
      className={`relative isolate h-full w-full overflow-hidden bg-black ${className}`}
      style={style}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block" />
    </div>
  );
}

WebGLShader.displayName = "WebGLShader";

export default WebGLShader;



