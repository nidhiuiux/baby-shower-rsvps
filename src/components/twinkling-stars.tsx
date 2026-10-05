"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; phase: number; speed: number; color: string };

const COLORS = ["rgba(255, 255, 255, 0.95)", "rgba(232, 196, 192, 0.9)", "rgba(107, 143, 113, 0.55)"];

export function TwinklingStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const surface = canvas;
    const ctx = context;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars: Star[] = [];
    let raf = 0;

    function resize() {
      const parent = surface.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      surface.width = Math.max(1, Math.floor(w * dpr));
      surface.height = Math.max(1, Math.floor(h * dpr));
      surface.style.width = `${w}px`;
      surface.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(28, (w * h) / 18000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
      }));
    }

    function draw(time: number) {
      const w = surface.clientWidth;
      const h = surface.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const star of stars) {
        const twinkle = reduce ? 0.55 : 0.28 + 0.72 * (0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase));
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop(time: number) {
      draw(time);
      if (!reduce) raf = window.requestAnimationFrame(loop);
    }

    resize();
    raf = window.requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="twinkle-canvas" aria-hidden />;
}
