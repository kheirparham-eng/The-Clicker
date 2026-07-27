import React, { useState } from 'react';
import { MASTER_COMPOSERS, MasterComposer } from '../data/musicLegends';
import * as Icons from 'lucide-react';

interface MusicianAvatarWidgetProps {
  unlockedComposerIds: string[];
  equippedComposerId?: string;
  onEquipComposer: (composerId: string) => void;
  onOpenShopLegends?: () => void;
  glassMode?: 'dark' | 'light';
}

export const MusicianAvatarWidget: React.FC<MusicianAvatarWidgetProps> = ({
  unlockedComposerIds = [],
  equippedComposerId,
  onEquipComposer,
  onOpenShopLegends,
  glassMode = 'dark',
}) => {
  const [isSwapping, setIsSwapping] = useState(false);

  // Determine active composer object
  const activeComposer = MASTER_COMPOSERS.find(
    (c) => c.id === (equippedComposerId || unlockedComposerIds[unlockedComposerIds.length - 1])
  );

  const unlockedComposersList = MASTER_COMPOSERS.filter((c) =>
    unlockedComposerIds.includes(c.id)
  );

  const handleSelectComposer = (id: string) => {
    setIsSwapping(true);
    onEquipComposer(id);
    setTimeout(() => setIsSwapping(false), 400);
  };

  // Custom vector portrait renderer for each legend
  const renderComposerPortrait = (composerId: string) => {
    switch (composerId) {
      case 'comp_bach':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
            <defs>
              <linearGradient id="bachGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>
            {/* Baroque Wig Silhouette & Lyre */}
            <circle cx="50" cy="50" r="44" fill="url(#bachGold)" opacity="0.15" />
            <path d="M 30,35 C 25,15 75,15 70,35 C 80,45 80,70 70,80 C 65,85 35,85 30,80 C 20,70 20,45 30,35 Z" fill="url(#bachGold)" />
            {/* Lyre Icon overlay */}
            <path d="M 40,42 L 40,65 Q 50,75 60,65 L 60,42 M 46,42 L 46,68 M 54,42 L 54,68 M 36,40 Q 50,30 64,40" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="50" cy="55" r="3" fill="#fef08a" />
          </svg>
        );

      case 'comp_argerich':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]">
            <defs>
              <linearGradient id="argerichPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e879f9" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            {/* Piano Keys & Virtuoso Waves */}
            <circle cx="50" cy="50" r="44" fill="url(#argerichPurple)" opacity="0.2" />
            <rect x="25" y="30" width="50" height="40" rx="6" fill="#18181b" stroke="url(#argerichPurple)" strokeWidth="2" />
            {/* Piano White Keys */}
            <line x1="33" y1="30" x2="33" y2="70" stroke="#e879f9" strokeWidth="1.5" />
            <line x1="41" y1="30" x2="41" y2="70" stroke="#e879f9" strokeWidth="1.5" />
            <line x1="50" y1="30" x2="50" y2="70" stroke="#e879f9" strokeWidth="1.5" />
            <line x1="58" y1="30" x2="58" y2="70" stroke="#e879f9" strokeWidth="1.5" />
            <line x1="66" y1="30" x2="66" y2="70" stroke="#e879f9" strokeWidth="1.5" />
            {/* Black Keys */}
            <rect x="30" y="30" width="5" height="22" fill="#e879f9" />
            <rect x="38" y="30" width="5" height="22" fill="#e879f9" />
            <rect x="55" y="30" width="5" height="22" fill="#e879f9" />
            <rect x="63" y="30" width="5" height="22" fill="#e879f9" />
            {/* Sparkles */}
            <circle cx="20" cy="25" r="2" fill="#f0abfc" className="animate-ping" />
            <circle cx="80" cy="75" r="2.5" fill="#f0abfc" className="animate-ping" />
          </svg>
        );

      case 'comp_beethoven':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
            <defs>
              <linearGradient id="beethovenRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#450a0a" />
              </linearGradient>
            </defs>
            {/* Wild Hair & Symphony Flames */}
            <circle cx="50" cy="50" r="44" fill="url(#beethovenRed)" opacity="0.25" />
            <path d="M 20,40 Q 30,10 50,15 Q 70,10 80,40 Q 90,60 75,80 Q 50,90 25,80 Q 10,60 20,40 Z" fill="url(#beethovenRed)" />
            <text x="50" y="60" textAnchor="middle" fill="#fef2f2" fontSize="22" fontWeight="900" fontFamily="sans-serif">
              ff
            </text>
            <path d="M 30,30 L 40,20 M 70,30 L 60,20" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'comp_chopin':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]">
            <defs>
              <linearGradient id="chopinBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
            {/* Moonlight Nocturne & Laurel */}
            <circle cx="50" cy="50" r="44" fill="url(#chopinBlue)" opacity="0.2" />
            <path d="M 35,25 A 25,25 0 1,0 75,65 A 22,22 0 1,1 35,25 Z" fill="url(#chopinBlue)" />
            <text x="52" y="58" textAnchor="middle" fill="#dbeafe" fontSize="24">
              ♪
            </text>
          </svg>
        );

      case 'comp_cash':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
            <defs>
              <linearGradient id="cashDark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#525252" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </linearGradient>
            </defs>
            {/* Man in Black Silhouette & Acoustic Guitar */}
            <circle cx="50" cy="50" r="44" fill="url(#cashDark)" opacity="0.4" />
            <path d="M 35,25 C 30,10 70,10 65,25 L 68,30 L 32,30 Z" fill="#171717" stroke="#a3a3a3" strokeWidth="1.5" />
            <text x="50" y="65" textAnchor="middle" fill="#f5f5f5" fontSize="22" fontWeight="bold">
              ★
            </text>
          </svg>
        );

      case 'comp_page':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
            <defs>
              <linearGradient id="pageGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Double Neck Guitar Necks */}
            <circle cx="50" cy="50" r="44" fill="url(#pageGold)" opacity="0.25" />
            <rect x="36" y="20" width="8" height="60" rx="3" fill="url(#pageGold)" />
            <rect x="56" y="20" width="8" height="60" rx="3" fill="url(#pageGold)" />
            <line x1="36" y1="35" x2="44" y2="35" stroke="#fff" strokeWidth="1" />
            <line x1="36" y1="50" x2="44" y2="50" stroke="#fff" strokeWidth="1" />
            <line x1="56" y1="35" x2="64" y2="35" stroke="#fff" strokeWidth="1" />
            <line x1="56" y1="50" x2="64" y2="50" stroke="#fff" strokeWidth="1" />
            <text x="50" y="88" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="bold">
              ★ 12/6 ★
            </text>
          </svg>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-amber-400">
            <Icons.Award className="w-8 h-8" />
          </div>
        );
    }
  };

  return (
    <div
      className="relative w-full rounded-3xl p-4 sm:p-5 transition-all duration-300 overflow-hidden liquid-glass-dark border-purple-500/40 text-slate-100 shadow-[0_10px_30px_rgba(168,85,247,0.25)]"
    >
      {/* Background Ambient Reflection Sweep */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/15 via-transparent to-amber-500/15 pointer-events-none" />

      {activeComposer ? (
        <div className="relative z-10 flex flex-col items-center gap-3.5 text-center">
          {/* Header Bar: Status & Quick Switcher */}
          <div className="w-full flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
            <span className="text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-[10px] sm:text-xs">
              <Icons.Sparkles className="w-4 h-4 animate-spin text-amber-300" />
              <span>ACTIVE MAESTRO</span>
            </span>

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PASSIVE BUFF ACTIVE</span>
            </span>
          </div>

          {/* REAL BIG Portrait Image Stage */}
          <div className="relative w-full max-w-[280px] aspect-square rounded-2xl p-1.5 bg-gradient-to-br from-amber-400/30 via-purple-600/40 to-slate-900 border-2 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.3)] overflow-hidden group transition-all duration-500">
            {/* Curved Gloss Reflection Overlay */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none z-20" />

            {/* Real High-Def Portrait or Vector Fallback */}
            <div className="w-full h-full relative z-10 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950">
              {activeComposer.imageUrl ? (
                <img
                  src={activeComposer.imageUrl}
                  alt={activeComposer.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
                    isSwapping ? 'scale-110 opacity-75' : 'scale-100 opacity-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full p-4">
                  {renderComposerPortrait(activeComposer.id)}
                </div>
              )}
            </div>

            {/* Glowing Accent Border & Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent z-20 pointer-events-none" />
            <span className="absolute top-3 right-3 text-[10px] font-black font-mono px-2 py-0.5 rounded-full bg-purple-950/90 text-amber-300 border border-amber-400/60 z-30 shadow-md">
              {activeComposer.era}
            </span>
          </div>

          {/* Composer Details */}
          <div className="w-full space-y-2">
            <h3 className="text-base sm:text-lg font-black font-mono tracking-wide text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {activeComposer.name}
            </h3>

            {/* Multiplier Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-amber-500/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Icons.Zap className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>+{Math.round(activeComposer.multiplierValue * 100)}% GLOBAL MULTIPLIER</span>
            </div>

            <p className="text-xs font-semibold text-slate-200 font-mono bg-black/40 p-2 rounded-xl border border-white/10 leading-relaxed">
              {activeComposer.description}
            </p>

            <p className="text-[11px] font-mono text-amber-300/90 italic opacity-95">
              "{activeComposer.quote}"
            </p>
          </div>

          {/* Quick Maestro Selector Chips (if multiple unlocked) */}
          {unlockedComposersList.length > 1 && (
            <div className="w-full pt-2 border-t border-white/10">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1.5 text-left">
                SWITCH UNLOCKED MAESTRO:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {unlockedComposersList.map((comp) => {
                  const isEquipped = comp.id === activeComposer.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectComposer(comp.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all shrink-0 ${
                        isEquipped
                          ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105'
                          : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-amber-400/50 hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="truncate max-w-[100px]">{comp.name.split(' ').pop()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Locked Placeholder State */
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-slate-900/80 border-2 border-dashed border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
            <Icons.Music className="w-10 h-10 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-xs font-mono uppercase font-bold text-amber-400">
              <Icons.Lock className="w-4 h-4" />
              NO MAESTRO PATRONIZED YET
            </div>
            <h3 className="text-sm font-bold font-mono text-slate-100 mt-1">
              Patronize Master Legends & Characters
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
              Patronize Bach, Beethoven, Barney Stinson, Ted Mosby & Robin Scherbatsky in the Shop for massive global multipliers!
            </p>
          </div>
          {onOpenShopLegends && (
            <button
              onClick={onOpenShopLegends}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95"
            >
              <Icons.Award className="w-4 h-4" />
              <span>OPEN MAESTROS SHOP</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
