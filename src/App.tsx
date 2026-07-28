import { useState, useEffect, useRef, useCallback } from 'react';
import { SavedGameState, ActiveBuff, FloatingText } from './types';
import { AuthManager, defaultInitialState } from './services/auth';
import { computeTotalPPC, computeTotalPPS, formatNumber } from './utils/gameMath';
import { ACHIEVEMENTS } from './data/achievements';
import { audio } from './services/audio';

import { ParticleCanvas } from './components/ParticleCanvas';
import { HeroCore } from './components/HeroCore';
import { Shop } from './components/Shop';
import { AuthModal } from './components/AuthModal';
import { GoldenDrop } from './components/GoldenDrop';
import { OfflineModal } from './components/OfflineModal';
import { PrestigeModal } from './components/PrestigeModal';
import { StatsModal } from './components/StatsModal';
import { MusicianAvatarWidget } from './components/MusicianAvatarWidget';
import { CheatPage } from './components/CheatPage';
import { AdminPage } from './components/AdminPage';

import * as Icons from 'lucide-react';

export default function App() {
  // Client-side router state for /cheat and secret /parham admin page
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    if (path.includes('/parham') || hash.includes('parham') || search.includes('parham')) {
      return '/parham';
    }
    if (path.endsWith('/cheat') || hash === '#/cheat' || hash === '#cheat' || hash.includes('cheat')) {
      return '/cheat';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (path.includes('/parham') || hash.includes('parham') || search.includes('parham')) {
        setCurrentRoute('/parham');
      } else if (path.endsWith('/cheat') || hash === '#/cheat' || hash === '#cheat' || hash.includes('cheat')) {
        setCurrentRoute('/cheat');
      } else {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToCheat = () => {
    setCurrentRoute('/cheat');
    try {
      const basePath = window.location.pathname.replace(/\/cheat\/?$/, '') || '';
      const targetPath = `${basePath.endsWith('/') ? basePath.slice(0, -1) : basePath}/cheat`;
      window.history.pushState({}, '', targetPath);
    } catch {
      window.location.hash = '#/cheat';
    }
  };

  const navigateToHome = () => {
    setCurrentRoute('/');
    try {
      const targetPath = window.location.pathname.replace(/\/(cheat|parham)\/?$/, '') || '/';
      window.history.pushState({}, '', targetPath);
    } catch {
      window.location.hash = '#/';
    }
  };
  // Auth & Username state
  const [activeUsername, setActiveUsername] = useState<string | null>(() => AuthManager.getCurrentUsername());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !AuthManager.getCurrentUsername());

  // Game state
  const [gameState, setGameState] = useState<SavedGameState>(() => {
    const user = AuthManager.getCurrentUsername() || 'Guest';
    return AuthManager.loadGameState(user);
  });

  // Active Buffs / Frenzy Timers
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuff[]>([]);

  // Floating Click Numbers
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Click Trigger for Particle Burst
  const [clickTrigger, setClickTrigger] = useState<{ x: number; y: number; isCrit?: boolean; id: number } | null>(null);

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => audio.getMuted());

  // Save Indicator
  const [saveStatus, setSaveStatus] = useState<string>('Synced');

  // Modals state
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isPrestigeModalOpen, setIsPrestigeModalOpen] = useState(false);

  // Offline earnings modal state
  const [offlineData, setOfflineData] = useState<{ isOpen: boolean; seconds: number; earnings: number }>({
    isOpen: false,
    seconds: 0,
    earnings: 0,
  });

  // Achievement unlock notification toast
  const [achievementToast, setAchievementToast] = useState<string | null>(null);

  // Keep gameStateRef synced for auto-save interval
  const gameStateRef = useRef<SavedGameState>(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Manual save toast state & handler
  const [saveToast, setSaveToast] = useState<boolean>(false);

  const handleManualSave = useCallback(async () => {
    if (gameState.username) {
      setSaveStatus('Saving...');
      const cloudSuccess = await AuthManager.saveGameState(gameState);
      setSaveStatus(cloudSuccess ? 'Cloud Synced' : 'Saved (Local)');
      audio.playBuySound();
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
      setTimeout(() => setSaveStatus('Synced'), 3000);
    }
  }, [gameState]);

  // Master composer unlock & equip handlers
  const handleUnlockComposer = (composerId: string, cost: number) => {
    setGameState((prev) => {
      const existing = prev.unlockedComposers || [];
      if (existing.includes(composerId)) return prev;
      return {
        ...prev,
        points: prev.points - cost,
        unlockedComposers: [...existing, composerId],
        equippedComposer: composerId,
      };
    });
  };

  const handleEquipComposer = (composerId: string) => {
    setGameState((prev) => ({
      ...prev,
      equippedComposer: composerId,
    }));
  };

  // Computed PPC & PPS
  const { ppc, critChance, critMult } = computeTotalPPC(gameState, activeBuffs);
  const pps = computeTotalPPS(gameState, activeBuffs);

  // Load state when active user changes
  useEffect(() => {
    if (activeUsername) {
      const loaded = AuthManager.loadGameState(activeUsername);

      // Offline gains calculation
      const now = Date.now();
      const lastSave = loaded.lastSaveTime || now;
      const elapsedSeconds = Math.max(0, (now - lastSave) / 1000);

      const computedLoadedPPS = computeTotalPPS(loaded, []);
      if (elapsedSeconds > 10 && computedLoadedPPS > 0) {
        // Formula: Elapsed (s) * PPS * 0.5
        const earnings = Math.floor(elapsedSeconds * computedLoadedPPS * 0.5);
        if (earnings > 0) {
          setOfflineData({
            isOpen: true,
            seconds: elapsedSeconds,
            earnings,
          });
        }
      }

      setGameState(loaded);

      // Asynchronously fetch latest save from Google Cloud Firestore database
      AuthManager.loadGameStateFromCloud(activeUsername).then((cloudSave) => {
        if (cloudSave && cloudSave.lastSaveTime && cloudSave.lastSaveTime > (loaded.lastSaveTime || 0)) {
          setGameState(cloudSave);
          setSaveStatus('Cloud Synced');
        }
      }).catch((err) => {
        console.warn('Cloud save sync warning:', err);
      });
    }
  }, [activeUsername]);

  // Main Game Loop (10 ticks/second)
  const lastTickRef = useRef<number>(Date.now());
  useEffect(() => {
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // 1. Add Auto-Points (PPS)
      if (pps > 0) {
        const addedPoints = pps * deltaSeconds;
        setGameState((prev) => {
          const newPoints = prev.points + addedPoints;
          const newLifetime = prev.lifetimePoints + addedPoints;
          return {
            ...prev,
            points: newPoints,
            lifetimePoints: newLifetime,
            stats: {
              ...prev.stats,
              lifetimePoints: newLifetime,
              timePlayedSeconds: (prev.stats.timePlayedSeconds || 0) + deltaSeconds,
            },
          };
        });
      } else {
        setGameState((prev) => ({
          ...prev,
          stats: {
            ...prev.stats,
            timePlayedSeconds: (prev.stats.timePlayedSeconds || 0) + deltaSeconds,
          },
        }));
      }

      // 2. Tick down Active Buffs
      setActiveBuffs((prevBuffs) =>
        prevBuffs
          .map((buff) => ({
            ...buff,
            remainingSeconds: buff.remainingSeconds - deltaSeconds,
          }))
          .filter((buff) => buff.remainingSeconds > 0)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [pps]);

  // Auto-Save interval every 5 seconds (uses gameStateRef to avoid resetting timer on state ticks)
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      const current = gameStateRef.current;
      if (current && current.username) {
        setSaveStatus('Saving...');
        const cloudOk = await AuthManager.saveGameState(current);
        setSaveStatus(cloudOk ? 'Cloud Synced' : 'Saved (Local)');
        setTimeout(() => setSaveStatus('Synced'), 2000);
      }
    }, 5000);

    return () => clearInterval(saveInterval);
  }, []);

  // Check achievements unlock conditions
  useEffect(() => {
    ACHIEVEMENTS.forEach((ach) => {
      if (!gameState.achievementsUnlocked.includes(ach.id)) {
        if (ach.condition(gameState, ppc, pps)) {
          setGameState((prev) => ({
            ...prev,
            achievementsUnlocked: [...prev.achievementsUnlocked, ach.id],
          }));
          audio.playAchievementSound();
          setAchievementToast(ach.title);
          setTimeout(() => setAchievementToast(null), 3500);
        }
      }
    });
  }, [gameState, ppc, pps]);

  // Handle Manual Click on Core Object
  const handleCoreClick = useCallback(
    (clientX: number, clientY: number) => {
      const isCrit = Math.random() < critChance;
      const earned = Math.max(1, Math.floor(isCrit ? ppc * critMult : ppc));

      setGameState((prev) => ({
        ...prev,
        points: prev.points + earned,
        lifetimePoints: prev.lifetimePoints + earned,
        stats: {
          ...prev.stats,
          totalClicks: (prev.stats.totalClicks || 0) + 1,
          totalCriticalClicks: isCrit ? (prev.stats.totalCriticalClicks || 0) + 1 : prev.stats.totalCriticalClicks || 0,
          lifetimePoints: prev.lifetimePoints + earned,
        },
      }));

      // Spawn floating number popup
      const newFloating: FloatingText = {
        id: `${Date.now()}_${Math.random()}`,
        text: String(earned),
        x: clientX + (Math.random() * 30 - 15),
        y: clientY - 20,
        isCrit,
      };

      setFloatingTexts((prev) => [...prev.slice(-15), newFloating]);
      setClickTrigger({ x: clientX, y: clientY, isCrit, id: Date.now() });

      return { earned, isCrit };
    },
    [ppc, critChance, critMult]
  );

  // Shop item buy handler
  const handleBuyItem = (
    itemId: string,
    _category: 'click' | 'auto',
    amount: number,
    cost: number
  ) => {
    setGameState((prev) => {
      const currentOwned = prev.itemsOwned[itemId] || 0;
      const newOwned = currentOwned + amount;
      return {
        ...prev,
        points: prev.points - cost,
        itemsOwned: {
          ...prev.itemsOwned,
          [itemId]: newOwned,
        },
      };
    });
  };

  // Special upgrade buy handler
  const handleBuyUpgrade = (upgradeId: string, cost: number) => {
    setGameState((prev) => ({
      ...prev,
      points: prev.points - cost,
      upgradesPurchased: [...prev.upgradesPurchased, upgradeId],
    }));
  };

  // Cosmetic unlock handler
  const handleUnlockCosmetic = (cosmeticId: string, cost: number) => {
    setGameState((prev) => {
      const existing = prev.cosmeticsUnlocked || ['cyber_crystal', 'neon_sparks', 'cyberpunk', 'synth'];
      if (existing.includes(cosmeticId)) return prev;
      return {
        ...prev,
        points: prev.points - cost,
        cosmeticsUnlocked: [...existing, cosmeticId],
      };
    });
  };

  // Cosmetic equip handler
  const handleEquipCosmetic = (category: 'skin' | 'particle' | 'theme' | 'sfx', cosmeticId: string) => {
    setGameState((prev) => {
      if (category === 'skin') return { ...prev, equippedSkin: cosmeticId };
      if (category === 'particle') return { ...prev, equippedParticle: cosmeticId };
      if (category === 'theme') return { ...prev, equippedTheme: cosmeticId };
      if (category === 'sfx') return { ...prev, equippedSfx: cosmeticId };
      return prev;
    });
  };

  // Golden Anomaly frenzy catch handler
  const handleGoldenCatch = (type: 'frenzy' | 'instant' | 'hyperClick') => {
    setGameState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        goldenDropsClicked: (prev.stats.goldenDropsClicked || 0) + 1,
      },
    }));

    if (type === 'instant') {
      // Award instant 15% of bank (min 1,000)
      const bonus = Math.max(1000, Math.floor(gameState.points * 0.15));
      setGameState((prev) => ({
        ...prev,
        points: prev.points + bonus,
        lifetimePoints: prev.lifetimePoints + bonus,
      }));
    } else if (type === 'frenzy') {
      // 7x Global Production for 20 Seconds
      setActiveBuffs((prev) => [
        ...prev,
        {
          id: `frenzy_${Date.now()}`,
          name: '7x FRENZY OVERDRIVE',
          multiplier: 7,
          buffType: 'global_pts',
          durationSeconds: 20,
          remainingSeconds: 20,
          color: '#ffb700',
        },
      ]);
    } else if (type === 'hyperClick') {
      // 20x Click Power for 15 Seconds
      setActiveBuffs((prev) => [
        ...prev,
        {
          id: `hyper_${Date.now()}`,
          name: '20x HYPER-CLICK',
          multiplier: 20,
          buffType: 'click_pts',
          durationSeconds: 15,
          remainingSeconds: 15,
          color: '#ff007f',
        },
      ]);
    }
  };

  // Claim offline earnings
  const handleClaimOffline = () => {
    setGameState((prev) => ({
      ...prev,
      points: prev.points + offlineData.earnings,
      lifetimePoints: prev.lifetimePoints + offlineData.earnings,
    }));
    setOfflineData({ isOpen: false, seconds: 0, earnings: 0 });
    audio.playBuySound();
  };

  // Confirm Prestige Ascension Reset
  const handlePrestigeConfirm = (relicsEarned: number) => {
    const currentUsername = gameState.username;
    const previousRelics = gameState.quantumRelics;
    const fresh = defaultInitialState(currentUsername);

    const resetState: SavedGameState = {
      ...fresh,
      quantumRelics: previousRelics + relicsEarned,
      stats: {
        ...gameState.stats,
        prestigeCount: (gameState.stats.prestigeCount || 0) + 1,
      },
    };

    setGameState(resetState);
    AuthManager.saveGameState(resetState);
  };

  // Magnet upgrade factor for golden spawn
  const hasMagnet = gameState.upgradesPurchased.includes('spec_golden_magnet');
  const spawnRateMult = hasMagnet ? 1.5 : 1.0;

  const themeClassMap: Record<string, string> = {
    cyberpunk: 'cyber-grid',
    sunset: 'theme-sunset',
    abyss: 'theme-abyss',
    gold: 'theme-gold',
    matrix: 'theme-matrix',
    matrix_theme: 'theme-matrix',
  };
  const activeThemeClass = themeClassMap[gameState.equippedTheme || 'cyberpunk'] || 'cyber-grid';

  if (currentRoute === '/parham') {
    return (
      <AdminPage
        onReturnToGame={navigateToHome}
        currentGameState={gameState}
        setGameState={setGameState}
      />
    );
  }

  if (currentRoute === '/cheat') {
    return (
      <CheatPage
        gameState={gameState}
        setGameState={setGameState}
        onReturnToGame={navigateToHome}
      />
    );
  }

  return (
    <div className={`relative min-h-screen w-full ${activeThemeClass} text-slate-100 flex flex-col font-mono overflow-x-hidden select-none scanlines transition-colors duration-500`}>
      {/* Lightweight Ambient Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/10 blur-2xl" />
      </div>

      {/* Background Interactive Particle Canvas */}
      <ParticleCanvas
        clickTrigger={clickTrigger}
        particleStyle={gameState.equippedParticle || 'neon_sparks'}
      />

      {/* Top Cyber Navigation Bar with Liquid Glass Styling */}
      <header className="relative z-20 w-full liquid-glass-dark border-b border-cyan-500/20 text-slate-100 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <Icons.Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wider flex items-center gap-1.5">
                CYBER CORE <span className="text-cyan-400">// LIQUID-GLASS</span>
              </h1>
              <span className="hidden sm:inline-block text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
                SYS_ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Apple-Style Glassmorphic Incremental Engine & Music Legends
            </p>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-mono bg-[#060911]/80 border-slate-800 text-slate-300 px-3 py-1.5 rounded-2xl border">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>TICKS: 10/s</span>
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>CRIT: {(critChance * 100).toFixed(0)}%</span>
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Icons.Radio className="w-3 h-3 animate-pulse" />
            <span>SYNC: OK</span>
          </div>
        </div>

        {/* User Account Bar & Quick Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              const muted = audio.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 rounded-2xl liquid-button bg-[#0b0f19]/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 transition-all text-xs"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <Icons.VolumeX className="w-4 h-4 text-red-400" /> : <Icons.Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            className="px-3 py-1.5 rounded-2xl liquid-button bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] active:scale-95"
            title="Save Game State"
          >
            <Icons.Save className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="px-3 py-1.5 rounded-2xl liquid-button bg-[#0b0f19]/80 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 hover:text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Icons.Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3 py-1.5 rounded-2xl liquid-button bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,243,255,0.2)]"
          >
            <Icons.User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="max-w-[90px] truncate">{activeUsername || 'Account'}</span>
          </button>
        </div>
      </header>

      {/* Manual Save Success Toast Popup */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.7)] flex items-center gap-3 animate-bounce font-mono text-xs font-bold">
          <Icons.CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>GAME SAVED SUCCESSFULLY!</span>
        </div>
      )}

      {/* Main 3-Column Studio Layout */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: User Profile, Metrics & Core Info (3 cols on lg) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* User Profile Card */}
          <div className="liquid-glass-dark border-cyan-500/20 text-slate-100 p-4 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <Icons.ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-mono tracking-wide">
                    {gameState.username || 'Commander'}
                  </h3>
                  <div className="flex items-center gap-1 text-[9px] opacity-70 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>STATUS: {saveStatus.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {gameState.quantumRelics > 0 && (
                <div className="px-2 py-0.5 rounded-full bg-fuchsia-950/90 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(217,70,239,0.3)]">
                  <Icons.Sparkles className="w-3 h-3 text-fuchsia-400" />
                  <span>{gameState.quantumRelics} RELICS</span>
                </div>
              )}
            </div>

            {/* Currency Bank Display */}
            <div className="mt-3 p-3.5 rounded-2xl bg-[#060911]/80 border-cyan-500/30 border text-center relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-widest opacity-70 mb-1 px-1">
                <span>[ENERGY_BANK]</span>
                <span className="text-cyan-400 font-bold">STATUS: ACTIVE</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300 tracking-tight flex items-center justify-center gap-1.5 drop-shadow-[0_0_15px_rgba(0,243,255,0.6)] py-1">
                <Icons.Zap className="w-6 h-6 fill-cyan-400 stroke-cyan-400 animate-pulse" />
                <span>{formatNumber(gameState.points)}</span>
              </div>
            </div>

            {/* PPC & PPS Metrics */}
            <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-2xl bg-[#060911]/70 border-slate-800/90 border">
                <span className="text-[9px] opacity-70 block uppercase">Manual (PPC)</span>
                <span className="text-xs sm:text-sm font-bold text-cyan-400 mt-0.5 block truncate">
                  +{formatNumber(ppc)}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#060911]/70 border-slate-800/90 border">
                <span className="text-[9px] opacity-70 block uppercase">Auto (PPS)</span>
                <span className="text-xs sm:text-sm font-bold text-cyan-400 mt-0.5 block truncate">
                  +{formatNumber(pps)}/s
                </span>
              </div>
            </div>

            {/* Quick Manual Save Button & Quantum Ascension */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleManualSave}
                className="flex-1 py-2.5 rounded-2xl liquid-button bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)] active:scale-95"
              >
                <Icons.Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>SAVE</span>
              </button>

              <button
                onClick={() => setIsPrestigeModalOpen(true)}
                className="flex-1 py-2.5 rounded-2xl liquid-button bg-gradient-to-r from-fuchsia-950 via-purple-950 to-fuchsia-950 hover:from-fuchsia-900 hover:to-purple-900 border border-fuchsia-500/50 text-fuchsia-200 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(217,70,239,0.25)] active:scale-95"
              >
                <Icons.RotateCcw className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>ASCEND</span>
              </button>
            </div>
          </div>

          {/* Active Musician Avatar Widget (REAL BIG Maestro - Bottom Left) */}
          <MusicianAvatarWidget
            unlockedComposerIds={gameState.unlockedComposers || []}
            equippedComposerId={gameState.equippedComposer}
            onEquipComposer={handleEquipComposer}
          />
        </div>

        {/* CENTER COLUMN: Live Interactive Hero Stage (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between min-h-[420px] sm:min-h-[480px] liquid-glass-dark border-cyan-500/20 text-slate-100 p-4 shadow-2xl relative overflow-hidden transition-all duration-300">
          {/* Header HUD Status Line */}
          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 font-mono">
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              CORE_NODE_ACTIVE
            </span>
            <span>TACTICAL_VIEW</span>
          </div>

          <HeroCore
            onCoreClick={handleCoreClick}
            activeBuffs={activeBuffs}
            floatingTexts={floatingTexts}
            equippedSkin={gameState.equippedSkin || 'cyber_crystal'}
            sfxStyle={gameState.equippedSfx || 'synth'}
          />

          {/* Bottom Telemetry Terminal Feed (Subtle secret trigger) */}
          <div
            onClick={navigateToCheat}
            className="w-full mt-2 p-2 rounded bg-[#060911]/90 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between cursor-pointer select-none hover:text-slate-200 transition-colors"
            title="System Telemetry Feed"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-cyan-500 font-bold">
                [SYS_LOG]
              </span>
              <span className="text-slate-400 truncate">
                {activeBuffs.length > 0
                  ? `Active Buff: ${activeBuffs[0].name} (${activeBuffs[0].remainingSeconds.toFixed(0)}s remaining)`
                  : `Core online. Quantum matrix state synchronized.`}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 shrink-0 ml-2">
              ● ONLINE
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Shop & Upgrades (4 cols on lg) */}
        <div className="lg:col-span-4 h-[550px] sm:h-[600px]">
          <Shop
            gameState={gameState}
            onBuyItem={handleBuyItem}
            onBuyUpgrade={handleBuyUpgrade}
            onUnlockCosmetic={handleUnlockCosmetic}
            onEquipCosmetic={handleEquipCosmetic}
            onUnlockComposer={handleUnlockComposer}
          />
        </div>
      </main>

      {/* Floating Golden Anomaly Drop */}
      <GoldenDrop
        onCatch={handleGoldenCatch}
        spawnRateMultiplier={spawnRateMult}
      />

      {/* Achievement Toast */}
      {achievementToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-cyan-950 border-2 border-cyan-400 text-cyan-100 shadow-[0_0_25px_rgba(0,243,255,0.6)] flex items-center gap-3 animate-slide-up">
          <div className="p-2 rounded-lg bg-cyan-400 text-slate-950">
            <Icons.Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold text-cyan-300">
              ACHIEVEMENT UNLOCKED!
            </p>
            <p className="text-sm font-extrabold">{achievementToast}</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(username) => {
          setActiveUsername(username);
          setGameState(AuthManager.loadGameState(username));
        }}
        activeUsername={activeUsername}
      />

      <OfflineModal
        isOpen={offlineData.isOpen}
        offlineSeconds={offlineData.seconds}
        offlineEarnings={offlineData.earnings}
        onClaim={handleClaimOffline}
      />

      <PrestigeModal
        isOpen={isPrestigeModalOpen}
        onClose={() => setIsPrestigeModalOpen(false)}
        lifetimePoints={gameState.lifetimePoints}
        currentRelics={gameState.quantumRelics}
        onPrestigeConfirm={handlePrestigeConfirm}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        gameState={gameState}
        computedPPC={ppc}
        computedPPS={pps}
      />
    </div>
  );
}
