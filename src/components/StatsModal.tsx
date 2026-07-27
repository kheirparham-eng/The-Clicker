import React, { useState } from 'react';
import { SavedGameState } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { formatNumber } from '../utils/gameMath';
import * as Icons from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: SavedGameState;
  computedPPC: number;
  computedPPS: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  computedPPC,
  computedPPS,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');

  if (!isOpen) return null;

  const unlockedCount = gameState.achievementsUnlocked.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = Math.floor(totalSecs % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Icons.BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide uppercase">
              Command Log & Badges
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 my-4 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.BarChart2 className="w-4 h-4" />
            <span>Lifetime Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'achievements'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.Trophy className="w-4 h-4" />
            <span>Achievements ({unlockedCount}/{totalAchievements})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Lifetime Energy</span>
                <span className="text-base font-bold text-cyan-300 mt-1 block">
                  {formatNumber(gameState.lifetimePoints)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Current Energy Bank</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  {formatNumber(gameState.points)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Click Power (PPC)</span>
                <span className="text-base font-bold text-cyan-400 mt-1 block">
                  {formatNumber(computedPPC)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Auto Income (PPS)</span>
                <span className="text-base font-bold text-cyan-400 mt-1 block">
                  {formatNumber(computedPPS)} / sec
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Total Core Clicks</span>
                <span className="text-base font-bold text-slate-200 mt-1 block">
                  {(gameState.stats.totalClicks || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Critical Clicks Landed</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {(gameState.stats.totalCriticalClicks || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Golden Anomalies Caught</span>
                <span className="text-base font-bold text-amber-300 mt-1 block">
                  {(gameState.stats.goldenDropsClicked || 0).toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Time In Session</span>
                <span className="text-base font-bold text-slate-200 mt-1 block">
                  {formatTime(gameState.stats.timePlayedSeconds || 0)}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Achievement Completion:</span>
                  <span className="text-cyan-400 font-bold">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Badges list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = gameState.achievementsUnlocked.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        isUnlocked
                          ? 'bg-cyan-950/30 border-cyan-500/40'
                          : 'bg-slate-950/40 border-slate-900 opacity-50'
                      }`}
                    >
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isUnlocked
                            ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                            : 'bg-slate-900 text-slate-600'
                        }`}
                      >
                        <Icons.Trophy className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-100 truncate">
                            {ach.title}
                          </h4>
                          {isUnlocked && (
                            <Icons.CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {ach.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
