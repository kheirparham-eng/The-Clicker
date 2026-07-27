import React from 'react';
import { formatNumber } from '../utils/gameMath';
import { audio } from '../services/audio';
import * as Icons from 'lucide-react';

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lifetimePoints: number;
  currentRelics: number;
  onPrestigeConfirm: (relicsEarned: number) => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({
  isOpen,
  onClose,
  lifetimePoints,
  currentRelics,
  onPrestigeConfirm,
}) => {
  if (!isOpen) return null;

  // Calculate potential relics to gain: 1 Relic per 1,000,000 lifetime points
  const minRequired = 1000000;
  const canPrestige = lifetimePoints >= minRequired;
  const potentialRelics = canPrestige
    ? Math.floor(Math.sqrt(lifetimePoints / minRequired))
    : 0;

  const currentMultiplier = (1 + currentRelics * 0.10).toFixed(2);
  const newMultiplier = (1 + (currentRelics + potentialRelics) * 0.10).toFixed(2);

  const handleConfirm = () => {
    if (canPrestige && potentialRelics > 0) {
      audio.playPrestigeSound();
      onPrestigeConfirm(potentialRelics);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-fuchsia-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(217,70,239,0.25)] overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Icons.RotateCcw className="w-5 h-5 text-fuchsia-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide uppercase">
                Quantum Ascension (Prestige)
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-4 text-sm text-slate-300 space-y-3">
            <p className="leading-relaxed">
              Initiate a dimensional shift to collapse your current timeline. You will reset
              your current Energy Points, Click Upgrades, and Auto Generators in exchange for
              permanent <strong className="text-fuchsia-400">Quantum Relics</strong>.
            </p>

            {/* Relics stat card */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Current Relics</span>
                <span className="text-base font-bold text-fuchsia-300 flex items-center gap-1 mt-0.5">
                  <Icons.Sparkles className="w-4 h-4 text-fuchsia-400" />
                  {currentRelics} (+{(currentRelics * 10)}% Boost)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-fuchsia-950/40 border border-fuchsia-500/30">
                <span className="text-[10px] text-fuchsia-300 uppercase block">Relics to Earn</span>
                <span className="text-base font-black text-fuchsia-300 flex items-center gap-1 mt-0.5">
                  <Icons.Plus className="w-4 h-4 text-fuchsia-400" />
                  +{potentialRelics} Relics
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Lifetime Energy Accumulated:</span>
                <span className="text-slate-200 font-bold">{formatNumber(lifetimePoints)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>New Permanent Multiplier:</span>
                <span className="text-fuchsia-300 font-bold">{currentMultiplier}x → {newMultiplier}x</span>
              </div>
            </div>

            {!canPrestige && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <Icons.AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Requires at least 1,000,000 Lifetime Energy to Ascend!</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={!canPrestige || potentialRelics <= 0}
              onClick={handleConfirm}
              className={`flex-1 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                canPrestige && potentialRelics > 0
                  ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-500 hover:to-pink-400 text-slate-950 shadow-[0_0_20px_rgba(217,70,239,0.5)] active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Icons.Zap className="w-4 h-4" />
              <span>ASCEND & RESET</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
