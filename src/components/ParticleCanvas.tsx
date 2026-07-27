import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'rect' | 'heart' | 'glyph' | 'star';
  glyph?: string;
  rotation?: number;
  rotSpeed?: number;
}

interface ParticleCanvasProps {
  clickTrigger?: { x: number; y: number; isCrit?: boolean; id: number } | null;
  particleStyle?: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ clickTrigger, particleStyle = 'neon_sparks' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ambientRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

      // Re-populate ambient background particles (lightweight)
      ambientRef.current = [];
      const numAmbient = Math.min(15, Math.floor((canvas.width * canvas.height) / 40000));
      for (let i = 0; i < numAmbient; i++) {
        ambientRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.3 - 0.1,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.1,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & render ambient floaters
      ambientRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.fillStyle = `rgba(0, 243, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update & render burst particles
      const activeBurstParticles: Particle[] = [];
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.shape === 'glyph' ? 0.02 : 0.08; // light gravity for code rain
        p.vx *= 0.98; // drag
        p.alpha -= p.decay;
        if (p.rotation !== undefined && p.rotSpeed !== undefined) {
          p.rotation += p.rotSpeed;
        }

        if (p.alpha > 0) {
          ctx.save();
          const colorStr = p.color.replace('ALPHA', p.alpha.toFixed(2));
          ctx.fillStyle = colorStr;

          if (p.shape === 'rect') {
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation || 0);
            ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 1.5);
          } else if (p.shape === 'heart') {
            ctx.font = `${Math.floor(p.size * 3.5)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♥', p.x, p.y);
          } else if (p.shape === 'glyph') {
            ctx.font = `bold ${Math.floor(p.size * 2.8)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.glyph || '1', p.x, p.y);
          } else if (p.shape === 'star') {
            ctx.font = `${Math.floor(p.size * 3.2)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', p.x, p.y);
          } else {
            // circle default
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          activeBurstParticles.push(p);
        }
      });
      particlesRef.current = activeBurstParticles;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle click explosion triggers
  useEffect(() => {
    if (!clickTrigger) return;
    const { x, y, isCrit } = clickTrigger;

    const count = isCrit ? 36 : 20;

    let shape: Particle['shape'] = 'circle';
    let colors: string[] = [];

    if (particleStyle === 'confetti') {
      shape = 'rect';
      colors = [
        'rgba(244, 63, 94, ALPHA)',
        'rgba(59, 130, 246, ALPHA)',
        'rgba(34, 197, 94, ALPHA)',
        'rgba(234, 179, 8, ALPHA)',
        'rgba(168, 85, 247, ALPHA)'
      ];
    } else if (particleStyle === 'music_notes') {
      shape = 'glyph';
      colors = [
        'rgba(192, 132, 252, ALPHA)',
        'rgba(244, 114, 182, ALPHA)',
        'rgba(56, 189, 248, ALPHA)',
        'rgba(250, 204, 21, ALPHA)'
      ];
    } else if (particleStyle === 'hearts') {
      shape = 'heart';
      colors = [
        'rgba(244, 63, 94, ALPHA)',
        'rgba(225, 29, 72, ALPHA)',
        'rgba(251, 113, 133, ALPHA)',
        'rgba(255, 255, 255, ALPHA)'
      ];
    } else if (particleStyle === 'matrix') {
      shape = 'glyph';
      colors = [
        'rgba(34, 197, 94, ALPHA)',
        'rgba(16, 185, 129, ALPHA)',
        'rgba(74, 222, 128, ALPHA)',
        'rgba(220, 252, 231, ALPHA)'
      ];
    } else if (particleStyle === 'stardust') {
      shape = 'star';
      colors = [
        'rgba(234, 179, 8, ALPHA)',
        'rgba(250, 204, 21, ALPHA)',
        'rgba(253, 224, 71, ALPHA)',
        'rgba(255, 255, 255, ALPHA)'
      ];
    } else {
      // neon sparks
      shape = 'circle';
      colors = isCrit
        ? ['rgba(255, 0, 127, ALPHA)', 'rgba(255, 215, 0, ALPHA)', 'rgba(255, 255, 255, ALPHA)']
        : ['rgba(0, 243, 255, ALPHA)', 'rgba(0, 150, 255, ALPHA)', 'rgba(255, 255, 255, ALPHA)'];
    }

    const matrixGlyphs = ['0', '1', 'X', 'Ø', 'Δ', '§', '⚡', '░'];
    const musicGlyphs = ['♪', '♫', '♬', '♩', '♭', '♯'];
    const activeGlyphs = particleStyle === 'music_notes' ? musicGlyphs : matrixGlyphs;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isCrit ? Math.random() * 8 + 3 : Math.random() * 5 + 1.5;
      const colorIndex = Math.floor(Math.random() * colors.length);

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (particleStyle === 'hearts' || particleStyle === 'music_notes' ? 2 : 0), // float up
        size: isCrit ? Math.random() * 5 + 3 : Math.random() * 4 + 2,
        color: colors[colorIndex],
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        shape,
        glyph: activeGlyphs[Math.floor(Math.random() * activeGlyphs.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }, [clickTrigger, particleStyle]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
    />
  );
};
