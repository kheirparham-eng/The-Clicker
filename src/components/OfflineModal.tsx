import React from 'react';
import { formatNumber } from '../utils/gameMath';
import * as Icons from 'lucide-react';

interface OfflineModalProps {
  isOpen: boolean;
  offlineSeconds: number;
  offlineEarnings: number;
  onClaim: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  isOpen,
  offlineSeconds,
  offlineEarnings,
  onClaim,
}) => {
  if (!isOpen || offlineEarnings <= 0) return null;

  const hours = Math.floor(offlineSeconds / 3600);
  const minutes = Math.floor((offlineSeconds % 3600) / 60);
  const seconds = Math.floor(offlineSeconds % 60);

  const timeString = `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-center overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-3 animate-bounce">
            <Icons.Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-100 font-mono uppercase tracking-wide">
            Welcome Back, Commander!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your automated mining network worked while you were away.
          </p>

          <div className="w-full my-5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 font-mono">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Time Away:</span>
              <span className="text-slate-200 font-semibold">{timeString}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Efficiency Rate:</span>
              <span className="text-amber-400 font-semibold">50% Idle Protocol</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300">Offline Energy Earned:</span>
              <span className="text-lg font-black text-amber-300 flex items-center gap-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                <Icons.Zap className="w-5 h-5 fill-amber-300" />
                +{formatNumber(offlineEarnings)}
              </span>
            </div>
          </div>

          <button
            onClick={onClaim}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black font-mono text-sm tracking-wide uppercase shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Icons.CheckCircle2 className="w-5 h-5" />
            <span>CLAIM ENERGY EARNINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
