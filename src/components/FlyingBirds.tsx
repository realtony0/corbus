"use client";

import { useEffect, useRef } from "react";

interface Bird {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  wingPhase: number;
  wingSpeed: number;
  drift: number;
  driftPhase: number;
}

export default function FlyingBirds() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdsRef = useRef<Bird[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const birdCount = 20;
    birdsRef.current = Array.from({ length: birdCount }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 300,
      speed: 0.3 + Math.random() * 1.2,
      size: 6 + Math.random() * 18,
      opacity: 0.15 + Math.random() * 0.45,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.03 + Math.random() * 0.04,
      drift: (Math.random() - 0.5) * 0.3,
      driftPhase: Math.random() * Math.PI * 2,
    }));

    function drawBird(ctx: CanvasRenderingContext2D, bird: Bird) {
      const wingAngle = Math.sin(bird.wingPhase) * 0.6;
      const s = bird.size;

      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.globalAlpha = bird.opacity;

      // Body
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left wing
      ctx.strokeStyle = "white";
      ctx.lineWidth = Math.max(1, s * 0.06);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(-s * 0.08, 0);
      const lWingY = wingAngle * s * 0.5;
      ctx.quadraticCurveTo(-s * 0.4, lWingY - s * 0.15, -s * 0.8, lWingY);
      ctx.quadraticCurveTo(-s * 0.95, lWingY + s * 0.08, -s, lWingY + s * 0.15);
      ctx.stroke();

      // Right wing
      ctx.beginPath();
      ctx.moveTo(s * 0.08, 0);
      ctx.quadraticCurveTo(s * 0.4, lWingY - s * 0.15, s * 0.8, lWingY);
      ctx.quadraticCurveTo(s * 0.95, lWingY + s * 0.08, s, lWingY + s * 0.15);
      ctx.stroke();

      ctx.restore();
    }

    let animId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      birdsRef.current.forEach((bird) => {
        bird.y -= bird.speed;
        bird.driftPhase += 0.008;
        bird.x += bird.drift + Math.sin(bird.driftPhase) * 0.3;
        bird.wingPhase += bird.wingSpeed;

        if (bird.y < -60) {
          bird.y = canvas.height + 60;
          bird.x = Math.random() * canvas.width;
        }
        if (bird.x < -60) bird.x = canvas.width + 60;
        if (bird.x > canvas.width + 60) bird.x = -60;

        drawBird(ctx, bird);
      });

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
