import React, { useState } from 'react';
import { SavedGameState } from '../types';
import { MASTER_COMPOSERS } from '../data/musicLegends';
import { COSMETICS } from '../data/cosmetics';
import { formatNumber } from '../utils/gameMath';
import * as Icons from 'lucide-react';

interface CheatPageProps {
  gameState: SavedGameState;
  setGameState: React.Dispatch<React.SetStateAction<SavedGameState>>;
  onReturnToGame: () => void;
}

export const CheatPage: React.FC<CheatPageProps> = ({
  gameState,
  setGameState,
  onReturnToGame,
}) => {
  const [logMessages, setLogMessages] = useState<string[]>([
    'SYS_LOG: Cheat Terminal v2.0 initialized.',
    'SECURITY_OVERRIDE: Access granted to developer commands.',
  ]);
  const [customPointsInput, setCustomPointsInput] = useState<string>('1000000000000');

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleAddEnergy = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      points: prev.points + amount,
      stats: {
        ...prev.stats,
        lifetimePoints: (prev.stats.lifetimePoints || 0) + amount,
      },
    }));
    addLog(`GRANTED: +${formatNumber(amount)} Energy Points.`);
  };

  const handleSetCustomPoints = () => {
    const parsed = parseFloat(customPointsInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setGameState((prev) => ({
        ...prev,
        points: parsed,
      }));
      addLog(`SET_POINTS: Energy set to ${formatNumber(parsed)}.`);
    } else {
      addLog('ERROR: Invalid energy number provided.');
    }
  };

  const handleAddRelics = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      quantumRelics: (prev.quantumRelics || 0) + amount,
    }));
    addLog(`GRANTED: +${amount} Quantum Relics.`);
  };

  const handleUnlockAllLegends = () => {
    const allLegendIds = MASTER_COMPOSERS.map((m) => m.id);
    setGameState((prev) => ({
      ...prev,
      unlockedComposers: Array.from(new Set([...(prev.unlockedComposers || []), ...allLegendIds])),
    }));
    addLog('OVERRIDE: Unlocked ALL Music Legends & Composers!');
  };

  const handleUnlockAllCosmetics = () => {
    const allCosmeticIds = COSMETICS.map((c) => c.id);
    setGameState((prev) => ({
      ...prev,
      unlockedCosmetics: Array.from(new Set([...(prev.unlockedCosmetics || []), ...allCosmeticIds])),
    }));
    addLog('OVERRIDE: Unlocked ALL Skins, Particles & SFX!');
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to completely reset all game progress?')) {
      setGameState((prev) => ({
        ...prev,
        points: 0,
        upgradesPurchased: [],
        autoClickers: {},
        unlockedComposers: ['comp_beethoven'],
        equippedComposer: 'comp_beethoven',
        quantumRelics: 0,
        unlockedCosmetics: ['cyber_crystal', 'neon_sparks', 'synth'],
      }));
      addLog('SYSTEM_RESET: Game state reverted to initial defaults.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-mono p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-x-hidden scanlines">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl liquid-glass-dark border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative z-10 flex flex-col gap-6">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/60 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">
              <Icons.Terminal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-red-400 tracking-wider">
                  SYS_LOG // CHEAT_TERMINAL
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-900/60 text-red-300 border border-red-500/50 font-bold">
                  UNLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Developer Overrides & Matrix Debug Controls // Route: /cheat
              </p>
            </div>
          </div>

          <button
            onClick={onReturnToGame}
            className="px-5 py-2.5 rounded-2xl liquid-button bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] active:scale-95"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            <span>RETURN TO CORE GAME</span>
          </button>
        </div>

        {/* Current Energy Overview */}
        <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">CURRENT ENERGY BANK</span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 flex items-center gap-2 mt-1">
              <Icons.Zap className="w-6 h-6 text-cyan-400 fill-cyan-400" />
              <span>{formatNumber(gameState.points)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">QUANTUM RELICS</span>
              <span className="text-fuchsia-400 font-bold text-base">{gameState.quantumRelics || 0}</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-slate-400 block text-[10px]">LEGENDS UNLOCKED</span>
              <span className="text-emerald-400 font-bold text-base">
                {gameState.unlockedComposers?.length || 1} / {MASTER_COMPOSERS.length}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Cheat Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Grant Energy Shortcuts */}
          <div className="p-4 rounded-2xl bg-[#090e17] border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Icons.Zap className="w-4 h-4" />
              <span>GRANT ENERGY</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => handleAddEnergy(1000000000)}
                className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold active:scale-95 transition-all"
              >
                +1 Billion
              </button>
              <button
                onClick={() => handleAddEnergy(100000000000)}
                className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold active:scale-95 transition-all"
              >
                +100 Billion
              </button>
              <button
                onClick={() => handleAddEnergy(1000000000000)}
                className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold active:scale-95 transition-all"
              >
                +1 Trillion
              </button>
              <button
                onClick={() => handleAddEnergy(1000000000000000)}
                className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold active:scale-95 transition-all"
              >
                +1 Quadrillion
              </button>
            </div>
          </div>

          {/* Relics & Unlocks */}
          <div className="p-4 rounded-2xl bg-[#090e17] border border-slate-800 flex flex-col gap-2">
            <h3 className="text-xs font-bold text-fuchsia-400 flex items-center gap-1.5">
              <Icons.Sparkles className="w-4 h-4" />
              <span>RELICS & UNLOCKS</span>
            </h3>
            <button
              onClick={() => handleAddRelics(1000)}
              className="w-full py-2 rounded-xl bg-fuchsia-950/80 hover:bg-fuchsia-900 border border-fuchsia-500/40 text-fuchsia-300 text-xs font-bold active:scale-95 transition-all"
            >
              +1,000 Quantum Relics
            </button>
            <button
              onClick={handleUnlockAllLegends}
              className="w-full py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold active:scale-95 transition-all"
            >
              Unlock ALL Legends
            </button>
            <button
              onClick={handleUnlockAllCosmetics}
              className="w-full py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold active:scale-95 transition-all"
            >
              Unlock ALL Cosmetics
            </button>
          </div>

          {/* Custom Amount & Danger Zone */}
          <div className="p-4 rounded-2xl bg-[#090e17] border border-slate-800 flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Icons.Sliders className="w-4 h-4" />
              <span>CUSTOM OVERRIDE</span>
            </h3>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={customPointsInput}
                onChange={(e) => setCustomPointsInput(e.target.value)}
                placeholder="Custom Points"
                className="w-full px-3 py-1.5 rounded-xl bg-[#030712] border border-slate-700 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleSetCustomPoints}
                className="px-3 py-1.5 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-bold shrink-0 hover:bg-cyan-900 transition-all"
              >
                Set
              </button>
            </div>
            <button
              onClick={handleResetGame}
              className="w-full mt-auto py-2 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Icons.Trash2 className="w-3.5 h-3.5" />
              <span>RESET ALL PROGRESS</span>
            </button>
          </div>
        </div>

        {/* Live System Console Output */}
        <div className="p-4 rounded-2xl bg-[#02050e] border border-red-500/30 text-xs font-mono flex flex-col gap-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-slate-800">
            <span className="text-red-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE_TERMINAL_FEED
            </span>
            <span>PATH: /cheat</span>
          </div>
          <div className="h-32 overflow-y-auto space-y-1 text-slate-300 text-[11px] pr-2">
            {logMessages.map((log, index) => (
              <p key={index} className={index === 0 ? 'text-red-300 font-bold' : 'text-slate-400'}>
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
