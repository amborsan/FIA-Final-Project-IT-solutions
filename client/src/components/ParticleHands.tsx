import { useEffect, useRef } from "react";

import { creationHandsData } from "./creationHandsData";

export function ParticleHands() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const points = creationHandsData.map(([x, y, shade]) => {
      const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return { x, y, shade, z: shade * 42, seed: noise - Math.floor(noise), side: x < 480 ? 0 : 1 };
    });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let lastPaint = 0;
    let elapsed = 0;
    let color = "rgb(13, 13, 13)";
    const pointer = { x: 0, y: 0 };
    const follow = { x: 0, y: 0 };

    function draw() {
      if (!context || !width || !height) return;
      context.clearRect(0, 0, width, height);
      context.save();
      // A uniform scale keeps fingers and glyphs in proportion on narrow screens.
      const scale = width / 1000 * 1.18;
      context.translate((width - 1000 * scale) / 2, height * 0.62 - 380 * scale);
      context.scale(scale, scale);
      context.fillStyle = color;
      const glyphs = ".,:;=+*xX0#@";
      // Keep characters legible on phones by sampling fewer, larger glyphs.
      const glyphSize = Math.max(4.5, 4500 / width);
      const columnStride = Math.max(1, Math.ceil(glyphSize * 0.6 / 4));
      const rowStride = Math.max(1, Math.round(glyphSize / 4));
      context.font = `500 ${glyphSize}px monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const time = reduced.matches ? 0 : elapsed * 1.8;
      // Keep the fingertips close while leaving room for their faster approach.
      const reach = (1 - Math.cos(time * 0.55)) * 12;
      const cycle = (time % 18) / 18;
      const dissolve = cycle < 0.6 ? 0 : Math.pow(Math.sin((cycle - 0.6) / 0.4 * Math.PI), 4);
      const turn = Math.sin(time * 0.25) * 0.15 + follow.x * 0.12;

      for (const point of points) {
        if ((point.x / 4) % columnStride !== 0 || ((point.y - 200) / 4) % rowStride !== 0) continue;
        const direction = point.side === 0 ? 1 : -1;
        const pivot = point.side === 0 ? 220 : 780;
        const rotation = turn * direction;
        const localX = pivot + (point.x - pivot) * Math.cos(rotation) + point.z * Math.sin(rotation);
        const spread = dissolve * (12 + point.seed * 55);
        const driftX = Math.sin(point.seed * 30 + time * 0.2) * spread;
        const driftY = Math.cos(point.seed * 27 + time * 0.25) * spread;
        const x = localX + direction * (reach - 32);
        const y = point.y;
        const wobble = Math.sin(time * 0.45 + point.x * 0.008) * 5;
        const density = Math.min(1, 0.12 + point.shade * 1.2);
        context.globalAlpha = (0.5 + density * 0.5) * (1 - dissolve * 0.55);
        const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(density * glyphs.length))];
        context.fillText(glyph, x + driftX, y + wobble + driftY + follow.y * point.z * 0.1);
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

    function readColor() { color = getComputedStyle(canvas!).color; draw(); }
    const resize = new ResizeObserver(() => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
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
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-hands" aria-hidden="true" />;
}
