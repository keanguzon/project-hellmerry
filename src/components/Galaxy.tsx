"use client";

import { useRef, useEffect } from "react";

interface GalaxyProps {
  starSpeed?: number;
  density?: number;
  hueShift?: number;
  speed?: number;
  glowIntensity?: number;
  saturation?: number;
  mouseRepulsion?: boolean;
  repulsionStrength?: number;
  twinkleIntensity?: number;
  rotationSpeed?: number;
  transparent?: boolean;
}

/**
 * Galaxy background component (React Bits).
 *
 * This is a functional placeholder that renders a canvas-based starfield.
 * Replace this file with the full React Bits <Galaxy> component when available.
 */
export default function Galaxy({
  density = 1,
  hueShift = 320,
  speed = 1,
  glowIntensity = 0.8,
  saturation = 1,
  twinkleIntensity = 0.5,
  rotationSpeed = 0.1,
  transparent = false,
}: GalaxyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
    }> = [];

    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor(
        ((canvas.width * canvas.height) / 10000) * density
      );
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 2 + 1,
        twinkleOffset: Math.random() * Math.PI * 2,
      }));
    };

    const hslToString = (h: number, s: number, l: number, a: number) =>
      `hsla(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})`;

    let time = 0;

    const draw = () => {
      time += 0.016 * speed;

      if (!transparent) {
        ctx.fillStyle = "#0a0a0f";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Rotate slightly
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(time * rotationSpeed * 0.01);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      for (const star of stars) {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinkleOffset) *
            twinkleIntensity *
            0.5 +
          0.5;
        const alpha = star.opacity * (0.5 + twinkle * 0.5);

        // Glow
        if (glowIntensity > 0 && star.size > 1) {
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 4
          );
          gradient.addColorStop(
            0,
            hslToString(hueShift, saturation, 0.7, alpha * glowIntensity)
          );
          gradient.addColorStop(1, hslToString(hueShift, saturation, 0.7, 0));
          ctx.fillStyle = gradient;
          ctx.fillRect(
            star.x - star.size * 4,
            star.y - star.size * 4,
            star.size * 8,
            star.size * 8
          );
        }

        // Star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = hslToString(
          hueShift + (Math.random() * 20 - 10),
          saturation * 0.8,
          0.85,
          alpha
        );
        ctx.fill();
      }

      ctx.restore();
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [density, hueShift, speed, glowIntensity, saturation, twinkleIntensity, rotationSpeed, transparent]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
