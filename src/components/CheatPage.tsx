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
  // Challenge State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('cheat_unlocked') === 'true';
  });
  const [selectedChallenge, setSelectedChallenge] = useState<'passcode' | 'pattern' | 'math'>('passcode');
  const [challengeError, setChallengeError] = useState<string>('');
  const [challengeSuccess, setChallengeSuccess] = useState<boolean>(false);

  // Passcode Challenge State
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);

  // Pattern Challenge State
  const [patternSequence, setPatternSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // Math Challenge State
  const [mathAnswerInput, setMathAnswerInput] = useState<string>('');

  const [logMessages, setLogMessages] = useState<string[]>([
    'SYS_LOG: Security Gateway Active.',
    'FIREWALL_ENFORCED: Solve challenge to authorize developer overrides.',
  ]);
  const [customPointsInput, setCustomPointsInput] = useState<string>('1000000000000');

  const addLog = (msg: string) => {
    setLogMessages((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const handleUnlockSuccess = (methodName: string) => {
    setChallengeSuccess(true);
    setChallengeError('');
    addLog(`SECURITY_OVERRIDE_SUCCESS: ${methodName} solved!`);
    sessionStorage.setItem('cheat_unlocked', 'true');
    setTimeout(() => {
      setIsUnlocked(true);
    }, 1200);
  };

  // Passcode Challenge Handler
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcodeInput.trim().toLowerCase();
    const validCodes = ['1337', 'cheat', 'matrix', '42', '1024', 'clicker', 'heisenberg', 'beethoven', 'sys_log', '2026'];
    if (validCodes.includes(clean) || clean === '73') {
      handleUnlockSuccess('Passcode Cipher');
    } else {
      setChallengeError('ACCESS DENIED: Invalid passcode override. Try again or view hints.');
      addLog('FAIL: Incorrect passcode entered.');
    }
  };

  // Pattern Challenge Handlers
  const startPatternChallenge = () => {
    setChallengeError('');
    setPlayerSequence([]);
    // Generate 4 random numbers from 0 to 3
    const seq = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
    setPatternSequence(seq);
    setIsPlayingSequence(true);
    addLog('PATTERN_INIT: Memory sequence starting...');

    seq.forEach((nodeIdx, step) => {
      setTimeout(() => {
        setActiveNode(nodeIdx);
        setTimeout(() => setActiveNode(null), 400);
      }, (step + 1) * 600);
    });

    setTimeout(() => {
      setIsPlayingSequence(false);
      addLog('PATTERN_READY: Repeat the 4-node sequence.');
    }, (seq.length + 1) * 600);
  };

  const handleNodeClick = (nodeIdx: number) => {
    if (isPlayingSequence || patternSequence.length === 0) return;
    const newPlayerSeq = [...playerSequence, nodeIdx];
    setPlayerSequence(newPlayerSeq);
    setActiveNode(nodeIdx);
    setTimeout(() => setActiveNode(null), 200);

    const currentStep = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentStep] !== patternSequence[currentStep]) {
      setChallengeError('PATTERN MISMATCH: Incorrect sequence order! Try again.');
      addLog('FAIL: Memory pattern sequence failed.');
      setPlayerSequence([]);
      return;
    }

    if (newPlayerSeq.length === patternSequence.length) {
      handleUnlockSuccess('Memory Node Pattern');
    }
  };

  // Math Challenge Handler
  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Problem: 2^8 + (12 * 7) = 256 + 84 = 340
    if (mathAnswerInput.trim() === '340' || mathAnswerInput.trim() === '0x154') {
      handleUnlockSuccess('Quantum Binary Math');
    } else {
      setChallengeError('CALCULATION ERROR: Incorrect answer! Check math or hex value.');
      addLog('FAIL: Incorrect math result.');
    }
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

      {!isUnlocked ? (
        /* ================= SECURITY GATEWAY CHALLENGE ================= */
        <div className="w-full max-w-2xl liquid-glass-dark border border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.3)] relative z-10 flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/70 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse">
                <Icons.ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-red-400 tracking-wider">
                    SECURITY GATEWAY
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-950 text-red-400 border border-red-500/60 font-bold animate-pulse">
                    ENCRYPTED
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Matrix Security Firewall // Solve challenge to unlock Cheat Terminal
                </p>
              </div>
            </div>

            <button
              onClick={onReturnToGame}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Icons.ArrowLeft className="w-4 h-4" />
              <span>EXIT</span>
            </button>
          </div>

          {/* Challenge Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-black/60 border border-slate-800">
            <button
              onClick={() => {
                setSelectedChallenge('passcode');
                setChallengeError('');
              }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedChallenge === 'passcode'
                  ? 'bg-red-950/90 text-red-300 border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icons.KeyRound className="w-3.5 h-3.5" />
              <span>1. PASSCODE CIPHER</span>
            </button>

            <button
              onClick={() => {
                setSelectedChallenge('pattern');
                setChallengeError('');
              }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedChallenge === 'pattern'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icons.Activity className="w-3.5 h-3.5" />
              <span>2. NODE PATTERN</span>
            </button>

            <button
              onClick={() => {
                setSelectedChallenge('math');
                setChallengeError('');
              }}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedChallenge === 'math'
                  ? 'bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icons.Binary className="w-3.5 h-3.5" />
              <span>3. QUANTUM MATH</span>
            </button>
          </div>

          {/* Active Challenge Box */}
          <div className="p-5 rounded-2xl bg-[#060a14] border border-slate-800 flex flex-col gap-4 relative">
            {challengeSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-bounce">
                <Icons.CheckCircle2 className="w-12 h-12 text-emerald-400 animate-pulse" />
                <h2 className="text-xl font-black text-emerald-400 tracking-widest">
                  ACCESS GRANTED!
                </h2>
                <p className="text-xs text-slate-300">
                  Security Override Confirmed. Loading Developer Terminal...
                </p>
              </div>
            ) : (
              <>
                {/* CHALLENGE 1: PASSCODE */}
                {selectedChallenge === 'passcode' && (
                  <form onSubmit={handlePasscodeSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-red-400 flex items-center gap-2">
                        <Icons.Lock className="w-4 h-4" />
                        <span>ENTER MATRIX OVERRIDE KEY</span>
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Type a valid bypass code or answer the hacker passcode riddle.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        placeholder="e.g. 1337 or CHEAT or 1024"
                        className="flex-1 px-4 py-3 rounded-xl bg-black border border-red-500/50 text-sm text-red-300 placeholder-slate-600 font-mono tracking-widest focus:outline-none focus:border-red-400 shadow-inner"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-red-900/80 hover:bg-red-800 border border-red-500 text-red-200 font-black text-xs shrink-0 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      >
                        DECRYPT
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Icons.HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? 'Hide Clues' : 'Need a Hint?'}</span>
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">STATUS: LOCKED</span>
                    </div>

                    {showHint && (
                      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200 space-y-1">
                        <p className="font-bold">HACKER CLUES:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          <li>Classic hacker leet code: <code className="text-cyan-400 bg-black px-1 rounded">1337</code></li>
                          <li>Game keyword: <code className="text-cyan-400 bg-black px-1 rounded">CHEAT</code> or <code className="text-cyan-400 bg-black px-1 rounded">MATRIX</code></li>
                          <li>Answer to life, universe & everything: <code className="text-cyan-400 bg-black px-1 rounded">42</code></li>
                          <li>Number of bytes in a kilobyte: <code className="text-cyan-400 bg-black px-1 rounded">1024</code></li>
                        </ul>
                      </div>
                    )}
                  </form>
                )}

                {/* CHALLENGE 2: PATTERN NODE */}
                {selectedChallenge === 'pattern' && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                        <Icons.Activity className="w-4 h-4" />
                        <span>MEMORY NODE REPEAT CHALLENGE</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Click "Start Sequence", watch the 4 quantum nodes light up, then repeat the exact order!
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto w-full my-2">
                      {['ALPHA', 'BETA', 'GAMMA', 'DELTA'].map((label, idx) => {
                        const colors = [
                          'from-red-500 to-pink-600 border-red-400',
                          'from-cyan-500 to-blue-600 border-cyan-400',
                          'from-amber-500 to-yellow-600 border-amber-400',
                          'from-emerald-500 to-teal-600 border-emerald-400',
                        ];
                        const isActive = activeNode === idx;
                        return (
                          <button
                            key={idx}
                            disabled={isPlayingSequence}
                            onClick={() => handleNodeClick(idx)}
                            className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xs transition-all duration-200 active:scale-95 ${
                              isActive
                                ? `bg-gradient-to-br ${colors[idx]} text-white scale-105 shadow-[0_0_30px_rgba(255,255,255,0.8)]`
                                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                            <span className="text-base">{idx + 1}</span>
                            <span className="text-[10px] tracking-widest">{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        onClick={startPatternChallenge}
                        disabled={isPlayingSequence}
                        className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,243,255,0.2)] disabled:opacity-50"
                      >
                        <Icons.Play className="w-3.5 h-3.5" />
                        <span>{isPlayingSequence ? 'WATCHING SEQUENCE...' : 'START SEQUENCE'}</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-mono">
                        Progress: {playerSequence.length} / {patternSequence.length || 4}
                      </span>
                    </div>
                  </div>
                )}

                {/* CHALLENGE 3: QUANTUM MATH */}
                {selectedChallenge === 'math' && (
                  <form onSubmit={handleMathSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <Icons.Binary className="w-4 h-4" />
                        <span>QUANTUM LOGIC PUZZLE</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Calculate the decimal evaluation of this quantum matrix expression:
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black border border-amber-500/40 text-center font-mono text-amber-300 text-lg font-black tracking-wider shadow-inner">
                      2<sup>8</sup> + (12 × 7) = ?
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mathAnswerInput}
                        onChange={(e) => setMathAnswerInput(e.target.value)}
                        placeholder="Enter total sum..."
                        className="flex-1 px-4 py-3 rounded-xl bg-black border border-amber-500/50 text-sm text-amber-300 placeholder-slate-600 font-mono focus:outline-none focus:border-amber-400 shadow-inner"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500 text-amber-200 font-black text-xs shrink-0 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                      >
                        SUBMIT
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Hint: 2<sup>8</sup> is 256, and 12 × 7 is 84.
                    </div>
                  </form>
                )}

                {/* Error Banner */}
                {challengeError && (
                  <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2 animate-shake">
                    <Icons.AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{challengeError}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Terminal Footer Info */}
          <div className="text-[10px] text-slate-500 font-mono text-center flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>ENCRYPTED PORT 3000 // DEVELOPER CHEAT GATEWAY</span>
          </div>
        </div>
      ) : (
        /* ================= FULL CHEAT TERMINAL (UNLOCKED) ================= */
        <div className="w-full max-w-4xl liquid-glass-dark border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative z-10 flex flex-col gap-6 animate-fadeIn">
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
              <button
                onClick={() => {
                  sessionStorage.removeItem('cheat_unlocked');
                  setIsUnlocked(false);
                  addLog('SECURITY_LOCK: Terminal re-locked.');
                }}
                className="text-red-400 hover:underline"
              >
                [LOCK TERMINAL]
              </button>
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
      )}
    </div>
  );
};
