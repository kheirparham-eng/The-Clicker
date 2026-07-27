import React, { useEffect, useState } from 'react';
import { audio } from '../services/audio';
import * as Icons from 'lucide-react';

interface GoldenDropProps {
  onCatch: (frenzyType: 'frenzy' | 'instant' | 'hyperClick') => void;
  spawnRateMultiplier?: number;
}

export const GoldenDrop: React.FC<GoldenDropProps> = ({
  onCatch,
  spawnRateMultiplier = 1.0,
}) => {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Schedule random spawns every 60-120s (adjusted by magnet upgrade multiplier)
    const intervalTime = (Math.random() * 60000 + 60000) / spawnRateMultiplier;

    const timer = setInterval(() => {
      if (!active) {
        // Spawn drop at random coordinates
        const posX = Math.random() * 70 + 15; // 15% - 85%
        const posY = Math.random() * 60 + 20; // 20% - 80%
        setPosition({ x: posX, y: posY });
        setActive(true);
        audio.playGoldenSpawnSound();

        // Auto disappear after 12 seconds if not clicked
        setTimeout(() => {
          setActive(false);
        }, 12000);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [active, spawnRateMultiplier]);

  if (!active) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive(false);
    audio.playGoldenClickSound();

    // Pick random bonus
    const types: ('frenzy' | 'instant' | 'hyperClick')[] = ['frenzy', 'instant', 'hyperClick'];
    const chosen = types[Math.floor(Math.random() * types.length)];
    onCatch(chosen);
  };

  return (
    <div
      onClick={handleClick}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      className="fixed z-40 cursor-pointer -translate-x-1/2 -translate-y-1/2 animate-[bounce_2s_infinite]"
    >
      <div className="relative group p-3">
        {/* Glow halo ring */}
        <div className="absolute inset-0 bg-amber-400/40 rounded-full blur-xl group-hover:bg-amber-300/60 transition-all animate-ping" />

        {/* Floating Golden Anomaly Core */}
        <div className="relative p-3 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 border-2 border-yellow-100 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.9)] group-hover:scale-125 transition-transform">
          <Icons.Sparkles className="w-8 h-8 animate-spin" />
        </div>

        {/* Tooltip prompt */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-slate-950/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono whitespace-nowrap shadow-lg">
          LUCKY ANOMALY! CLICK!
        </div>
      </div>
    </div>
  );
};
