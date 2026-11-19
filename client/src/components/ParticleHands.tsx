import { useEffect, useRef, useState } from "react";

import { getHandsMotion } from "./particleHandsMotion";

const glyphs = ".,:;=+*xX0#@";
type HandData = typeof import("./creationHandsData").creationHandsData;

export function ParticleHands() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [handData, setHandData] = useState<HandData>();

  useEffect(() => {
    let mounted = true;
    // The canvas is present immediately. Its decorative data can load afterward.
    void import("./creationHandsData").then(({ creationHandsData }) => {
      if (mounted) setHandData(creationHandsData);
    }).catch(() => {
      // The hero remains usable if the artwork cannot be loaded.
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !handData) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const points = handData.map(([x, y, shade]) => {
      const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const density = Math.min(1, 0.12 + shade * 1.2);
      const left = x < 480;
      return {
        x, y, density, z: shade * 42, seed: noise - Math.floor(noise),
        direction: left ? 1 : -1,
        pivot: left ? 220 : 780,
        glyph: glyphs[Math.min(glyphs.length - 1, Math.floor(density * glyphs.length))],
      };
    });
    let sampledPoints = points;
    let glyphSize = 4.5;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let artworkHeight = 0;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let lastPaint = 0;
    let elapsed = 0;
    let color = "rgb(13, 13, 13)";
    let glyphWeight = "";
    let minOpacity = 0;
    let dissolveFade = 0;
    const pointer = { x: 0, y: 0 };
    const follow = { x: 0, y: 0 };

    function draw() {
      if (!context || !width || !height) return;
      context.clearRect(0, 0, width, height);
      context.save();
      // A uniform scale keeps fingers and glyphs in proportion on narrow screens.
      const scale = width / 1000 * 1.18;
      const offsetX = (width - 1000 * scale) / 2;
      const offsetY = artworkHeight * 0.62 - 380 * scale;
      context.translate(offsetX, offsetY);
      context.scale(scale, scale);
      context.fillStyle = color;
      context.font = `${glyphWeight} ${glyphSize}px monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const { reach, dissolve, separation, time, pointerStrength } = getHandsMotion(reduced.matches ? 0 : elapsed);
      const turn = Math.sin(time * 0.22) * 0.025 + follow.x * 0.035 * pointerStrength;
      const cosTurn = Math.cos(turn);
      const sinTurn = Math.sin(turn);
      const fade = 1 - dissolve * dissolveFade;

      for (const point of sampledPoints) {
        const { direction, pivot } = point;
        const localX = pivot + (point.x - pivot) * cosTurn + point.z * sinTurn * direction;
        const spread = dissolve * (24 + point.seed * 110);
        const driftX = spread ? Math.sin(point.seed * 30 + time * 0.2) * spread : 0;
        const driftY = spread ? Math.cos(point.seed * 27 + time * 0.25) * spread : 0;
        const x = localX + direction * (reach - 32 - separation);
        const y = point.y;
        const wobble = Math.sin(time * 0.35 + point.x * 0.004) * 1.5;
        // Preserve the silhouette even in lighter shading and the dissolve phase.
        const drawX = x + driftX;
        const drawY = y + wobble + driftY + follow.y * point.z * 0.1 * pointerStrength;
        context.globalAlpha = (minOpacity + point.density * (1 - minOpacity)) * fade;
        context.fillText(point.glyph, drawX, drawY);
      }
      context.restore();
    }

    function tick(time: number) {
      frame = 0;
      if (time - lastPaint >= 1000 / 24) {
        elapsed += previousTime ? Math.min(time - previousTime, 80) / 1000 : 0;
        previousTime = time;
        lastPaint = time;
        follow.x += (pointer.x - follow.x) * 0.08;
        follow.y += (pointer.y - follow.y) * 0.08;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function updateAnimation() {
      cancelAnimationFrame(frame);
      previousTime = 0;
      draw();
      if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
    }

    function readColor() {
      const style = getComputedStyle(canvas!);
      // The root token updates before the canvas's inherited computed color.
      // Read it directly so reduced-motion frames repaint in the new theme.
      color = style.getPropertyValue("--hero-particle-color").trim()
        || getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || style.color;
      glyphWeight = style.fontWeight;
      minOpacity = Number(style.getPropertyValue("--hero-particle-min-opacity"));
      dissolveFade = Number(style.getPropertyValue("--hero-particle-dissolve-fade"));
      draw();
    }
    const resize = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      // The sampling grid changes with width, so resolve it once per resize.
      glyphSize = Math.max(4.5, 4500 / width);
      const columnStride = Math.max(1, Math.ceil(glyphSize * 0.6 / 4));
      const rowStride = Math.max(1, Math.round(glyphSize / 4));
      sampledPoints = points.filter(({ x, y }) => (x / 4) % columnStride === 0 && ((y - 200) / 4) % rowStride === 0);
      // The canvas extends below the layout, but the hand's position stays anchored to its artwork box.
      artworkHeight = canvas.parentElement?.clientHeight ?? height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      readColor();
    });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateAnimation(); });
    const theme = new MutationObserver(readColor);
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointer.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    };
    const leave = () => { pointer.x = 0; pointer.y = 0; };
    resize.observe(canvas);
    intersection.observe(canvas);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    reduced.addEventListener("change", updateAnimation);
    document.addEventListener("visibilitychange", updateAnimation);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      reduced.removeEventListener("change", updateAnimation);
      document.removeEventListener("visibilitychange", updateAnimation);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [handData]);

  return <canvas ref={canvasRef} className="hero-particle-hands" aria-hidden="true" />;
}
