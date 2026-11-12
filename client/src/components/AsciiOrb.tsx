import { useEffect, useRef } from "react";

// Original canvas artwork: sample a lit sphere and print its moving cloud bands as glyphs.
export function AsciiOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: -0.55, y: -0.55 };
    const light = { x: pointer.x, y: pointer.y };
    const glyphs = ".,:;+=xX08@";
    let size = 0;
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let lastDraw = 0;
    let ink = [13, 13, 13];
    let cloud = [135, 159, 200];

    function readColors() {
      if (!canvas || !canvas.parentElement) return;
      const rgb = (value: string) => {
        const channels = (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        return value.startsWith("color(srgb") ? channels.map((channel) => channel * 255) : channels;
      };
      ink = rgb(getComputedStyle(canvas.parentElement).color);
      cloud = rgb(getComputedStyle(canvas).color);
    }

    function draw() {
      if (!context || !size) return;
      context.clearRect(0, 0, size, size);
      const fontSize = size / 46;
      const radius = size * 0.42;
      const center = size / 2;
      const tilt = -0.42;
      context.font = `500 ${fontSize}px monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const lightLength = Math.hypot(light.x, light.y, 0.65);

      for (let py = fontSize; py < size; py += fontSize * 1.12) {
        for (let px = fontSize; px < size; px += fontSize * 0.7) {
          const x = (px - center) / radius;
          const y = (py - center) / radius;
          const distance = x * x + y * y;
          if (distance >= 1) continue;
          const z = Math.sqrt(1 - distance);
          const axisX = x * Math.cos(tilt) - y * Math.sin(tilt);
          const axisY = x * Math.sin(tilt) + y * Math.cos(tilt);
          const latitude = Math.asin(axisY);
          const longitude = Math.atan2(axisX, z) + phaseRef.current;
          const swirl = Math.sin(longitude * 3 + latitude * 6) * 0.8
            + Math.sin(longitude * 7 - latitude * 4) * 0.3;
          const bands = (Math.sin(latitude * 27 + swirl * 2) + 1) / 2;
          const fineClouds = (Math.sin(longitude * 19 + latitude * 31 + swirl) + 1) / 2;
          const sunlight = Math.max(0, (x * light.x + y * light.y + z * 0.65) / lightLength);
          const brightness = Math.min(1, 0.06 + sunlight * (0.28 + bands * 0.5 + fineClouds * 0.18));
          const limb = Math.min(1, z * 5);
          const opacity = (0.18 + brightness * 0.82) * limb;
          const mix = sunlight * 0.8;
          const color = cloud.map((channel, index) => Math.round(channel * (1 - mix) + ink[index] * mix));
          context.fillStyle = `rgba(${color.join(",")},${opacity})`;
          context.fillText(glyphs[Math.min(glyphs.length - 1, Math.floor(brightness * glyphs.length))], px, py);
        }
      }
    }

    function tick(time: number) {
      frame = 0;
      if (time - lastDraw >= 1000 / 24) {
        const delta = previousTime ? Math.min(time - previousTime, 80) : 0;
        phaseRef.current += delta * 0.0001;
        light.x += (pointer.x - light.x) * 0.1;
        light.y += (pointer.y - light.y) * 0.1;
        previousTime = time;
        lastDraw = time;
        draw();
      }
      frame = requestAnimationFrame(tick);
    }

    function updateAnimation() {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      draw();
      if (visible && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(tick);
      }
    }

    const resize = new ResizeObserver(() => {
      size = canvas.getBoundingClientRect().width;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * ratio);
      canvas.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      readColors();
      draw();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateAnimation();
    });
    const theme = new MutationObserver(() => { readColors(); draw(); });
    const moveLight = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointer.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const resetLight = () => { pointer.x = -0.55; pointer.y = -0.55; };
    resize.observe(canvas);
    intersection.observe(canvas);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", updateAnimation);
    reducedMotion.addEventListener("change", updateAnimation);
    canvas.addEventListener("pointermove", moveLight);
    canvas.addEventListener("pointerleave", resetLight);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      theme.disconnect();
      document.removeEventListener("visibilitychange", updateAnimation);
      reducedMotion.removeEventListener("change", updateAnimation);
      canvas.removeEventListener("pointermove", moveLight);
      canvas.removeEventListener("pointerleave", resetLight);
    };
  }, []);

  return (
    <div className="ascii-orb">
      <canvas ref={canvasRef} className="ascii-orb-canvas" aria-hidden="true" />
    </div>
  );
}
