import React, { useState, useEffect } from 'react';
import { SavedGameState, UserAccount } from '../types';
import { AuthManager } from '../services/auth';
import { MASTER_COMPOSERS } from '../data/musicLegends';
import { COSMETICS } from '../data/cosmetics';
import { formatNumber } from '../utils/gameMath';
import { db } from '../services/firebase';
import { doc, getDocs, setDoc, deleteDoc, collection } from 'firebase/firestore';
import * as Icons from 'lucide-react';

interface AdminPageProps {
  onReturnToGame: () => void;
  currentGameState?: SavedGameState;
  setGameState?: React.Dispatch<React.SetStateAction<SavedGameState>>;
}

export interface PlayerRecord {
  user: UserAccount;
  save: SavedGameState;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onReturnToGame,
  currentGameState,
  setGameState,
}) => {
  // Password Authentication State
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_parham_auth') === 'true';
  });
  const [loginError, setLoginError] = useState<string>('');

  // Admin Player Management State
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<string>('Connecting...');
  const [adminLogs, setAdminLogs] = useState<string[]>([
    'ADMIN_SYS: Parham Control Center initialized.',
    'SECURITY_GATEWAY: Authenticated as Super Administrator.',
  ]);

  // Edit Player Modal State
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRecord | null>(null);
  const [editPoints, setEditPoints] = useState<string>('');
  const [editRelics, setEditRelics] = useState<string>('');
  const [editNewPassword, setEditNewPassword] = useState<string>('');
  const [editMessage, setEditMessage] = useState<string>('');

  // Add New Player Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [addUserError, setAddUserError] = useState<string>('');

  const addLog = (msg: string) => {
    setAdminLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 24)]);
  };

  // Password Authentication Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Param10kh') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_parham_auth', 'true');
      setLoginError('');
      addLog('LOGIN_SUCCESS: Administrator Parham logged in.');
    } else {
      setLoginError('ACCESS DENIED: Invalid password. Please try again.');
      addLog('LOGIN_FAILED: Invalid password attempt.');
    }
  };

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('admin_parham_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Load all players from local and Cloud Firestore
  const loadAllPlayers = async () => {
    setIsLoading(true);
    setCloudStatus('Syncing Firestore saves...');
    try {
      const localUsers = AuthManager.getUsers();
      const recordsMap: Record<string, PlayerRecord> = {};

      // 1. Load local users & local saves
      Object.keys(localUsers).forEach((key) => {
        const u = localUsers[key];
        const save = AuthManager.loadGameState(u.username);
        recordsMap[u.username.toLowerCase()] = {
          user: u,
          save: save,
        };
      });

      // 2. Fetch all Firestore saves
      try {
        const querySnapshot = await getDocs(collection(db, 'saves'));
        setCloudStatus(`Cloud Online (${querySnapshot.size} saves retrieved)`);

        querySnapshot.forEach((docSnap) => {
          const cloudSave = docSnap.data() as SavedGameState;
          if (cloudSave && cloudSave.username) {
            const normKey = cloudSave.username.toLowerCase();
            if (recordsMap[normKey]) {
              // Merge if cloud lastSaveTime is newer
              if ((cloudSave.lastSaveTime || 0) > (recordsMap[normKey].save.lastSaveTime || 0)) {
                recordsMap[normKey].save = cloudSave;
              }
            } else {
              // User exists in cloud but not local list
              recordsMap[normKey] = {
                user: {
                  username: cloudSave.username,
                  passwordHash: 'cloud_synced',
                  createdAt: cloudSave.lastSaveTime || Date.now(),
                  lastSaved: cloudSave.lastSaveTime || Date.now(),
                },
                save: cloudSave,
              };
            }
          }
        });
      } catch (cloudErr) {
        console.warn('Firestore fetch error in Admin:', cloudErr);
        setCloudStatus('Cloud Offline / Unreachable');
      }

      setPlayers(Object.values(recordsMap));
      addLog(`LOAD_COMPLETE: ${Object.keys(recordsMap).length} player record(s) loaded.`);
    } catch (e) {
      console.error('Failed loading players:', e);
      addLog('ERROR: Failed to load players.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllPlayers();
    }
  }, [isAuthenticated]);

  // Handle Edit Player Open
  const handleOpenEditPlayer = (record: PlayerRecord) => {
    setSelectedPlayer(record);
    setEditPoints((record.save.points || 0).toString());
    setEditRelics((record.save.quantumRelics || 0).toString());
    setEditNewPassword('');
    setEditMessage('');
  };

  // Save Player Edits
  const handleSavePlayerEdits = async () => {
    if (!selectedPlayer) return;

    const parsedPoints = parseFloat(editPoints);
    const parsedRelics = parseInt(editRelics, 10);

    if (isNaN(parsedPoints) || parsedPoints < 0) {
      setEditMessage('Invalid energy value.');
      return;
    }
    if (isNaN(parsedRelics) || parsedRelics < 0) {
      setEditMessage('Invalid relics value.');
      return;
    }

    const updatedSave: SavedGameState = {
      ...selectedPlayer.save,
      points: parsedPoints,
      quantumRelics: parsedRelics,
      lastSaveTime: Date.now(),
    };

    // Save locally & to Cloud
    await AuthManager.saveGameState(updatedSave);

    // Update current game state if editing currently logged in user
    if (setGameState && currentGameState && currentGameState.username.toLowerCase() === selectedPlayer.user.username.toLowerCase()) {
      setGameState(updatedSave);
    }

    // Update password if changed
    if (editNewPassword.trim().length >= 4) {
      const users = AuthManager.getUsers();
      const normKey = selectedPlayer.user.username.toLowerCase();
      if (users[normKey]) {
        let hash = 0;
        for (let i = 0; i < editNewPassword.length; i++) {
          hash = (hash << 5) - hash + editNewPassword.charCodeAt(i);
          hash |= 0;
        }
        users[normKey].passwordHash = hash.toString(16);
        localStorage.setItem('cyber_clicker_users_v1', JSON.stringify(users));
        addLog(`PASSWORD_UPDATED: Password changed for player '${selectedPlayer.user.username}'.`);
      }
    }

    addLog(`ADMIN_EDIT: Saved updates for player '${selectedPlayer.user.username}'. Points: ${formatNumber(parsedPoints)}, Relics: ${parsedRelics}.`);
    setEditMessage('Changes saved successfully!');
    setTimeout(() => {
      setSelectedPlayer(null);
      loadAllPlayers();
    }, 800);
  };

  // Unlock all composers & cosmetics for a single player
  const handleUnlockAllForPlayer = async (record: PlayerRecord) => {
    const allComposerIds = MASTER_COMPOSERS.map((c) => c.id);
    const allCosmeticIds = COSMETICS.map((c) => c.id);

    const updatedSave: SavedGameState = {
      ...record.save,
      unlockedComposers: allComposerIds,
      cosmeticsUnlocked: allCosmeticIds,
      lastSaveTime: Date.now(),
    };

    await AuthManager.saveGameState(updatedSave);
    addLog(`ADMIN_UNLOCK: Unlocked all composers & cosmetics for '${record.user.username}'.`);

    if (setGameState && currentGameState && currentGameState.username.toLowerCase() === record.user.username.toLowerCase()) {
      setGameState(updatedSave);
    }

    loadAllPlayers();
  };

  // Delete Player
  const handleDeletePlayer = async (username: string) => {
    if (window.confirm(`Are you sure you want to completely DELETE player '${username}'?`)) {
      try {
        const normKey = username.toLowerCase();
        // Remove from local storage users
        const users = AuthManager.getUsers();
        delete users[normKey];
        localStorage.setItem('cyber_clicker_users_v1', JSON.stringify(users));

        // Remove local save
        localStorage.removeItem(`cyber_clicker_save_v1_${normKey}`);

        // Remove from Firestore
        await deleteDoc(doc(db, 'saves', normKey)).catch(() => {});

        addLog(`PLAYER_DELETED: Removed player '${username}'.`);
        loadAllPlayers();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  // Quick Grant Energy
  const handleQuickGrantEnergy = async (record: PlayerRecord, amount: number) => {
    const updatedSave: SavedGameState = {
      ...record.save,
      points: (record.save.points || 0) + amount,
      lifetimePoints: (record.save.lifetimePoints || 0) + amount,
      lastSaveTime: Date.now(),
    };
    await AuthManager.saveGameState(updatedSave);

    if (setGameState && currentGameState && currentGameState.username.toLowerCase() === record.user.username.toLowerCase()) {
      setGameState(updatedSave);
    }

    addLog(`GRANT_ENERGY: +${formatNumber(amount)} added to '${record.user.username}'.`);
    loadAllPlayers();
  };

  // Global Action: Gift Energy to ALL
  const handleGiftAllEnergy = async (amount: number) => {
    if (window.confirm(`Gift +${formatNumber(amount)} Energy to ALL ${players.length} players?`)) {
      for (const p of players) {
        const updated: SavedGameState = {
          ...p.save,
          points: (p.save.points || 0) + amount,
          lifetimePoints: (p.save.lifetimePoints || 0) + amount,
          lastSaveTime: Date.now(),
        };
        await AuthManager.saveGameState(updated);
      }
      addLog(`GLOBAL_GIFT: Granted +${formatNumber(amount)} Energy to ALL players.`);
      loadAllPlayers();
    }
  };

  // Add new player manually
  const handleCreatePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    if (!newUsername.trim() || !newPassword.trim()) {
      setAddUserError('Username and password are required.');
      return;
    }
    const res = AuthManager.register(newUsername.trim(), newPassword.trim());
    if (res.success) {
      addLog(`CREATE_USER: Admin created new account '${newUsername.trim()}'.`);
      setIsAddUserModalOpen(false);
      setNewUsername('');
      setNewPassword('');
      loadAllPlayers();
    } else {
      setAddUserError(res.error || 'Failed to create user');
    }
  };

  // Filter players
  const filteredPlayers = players.filter((p) =>
    p.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Total summary stats
  const totalEnergy = players.reduce((sum, p) => sum + (p.save.points || 0), 0);
  const totalRelics = players.reduce((sum, p) => sum + (p.save.quantumRelics || 0), 0);

  return (
    <div className="min-h-screen w-full bg-[#02050e] text-slate-100 font-mono p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-x-hidden scanlines select-none">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {!isAuthenticated ? (
        /* ================= ADMIN LOGIN SCREEN ================= */
        <div className="w-full max-w-md liquid-glass-dark border border-red-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.35)] relative z-10 flex flex-col gap-6 animate-fadeIn">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-4 rounded-2xl bg-red-950 border border-red-500/80 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)] animate-pulse">
              <Icons.ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-red-400 tracking-wider">
                PARHAM ADMIN GATEWAY
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Restricted System Access // Route: /parham
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Icons.Lock className="w-4 h-4 text-red-400" />
                <span>ADMINISTRATOR PASSWORD</span>
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-xl bg-black border border-red-500/50 text-sm text-red-300 placeholder-slate-600 font-mono focus:outline-none focus:border-red-400 shadow-inner"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-300 text-xs font-bold flex items-center gap-2">
                <Icons.AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-900 hover:bg-red-800 border border-red-500 text-red-100 font-black text-xs tracking-wider uppercase active:scale-95 transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)]"
            >
              AUTHENTICATE ADMIN
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <button
              type="button"
              onClick={onReturnToGame}
              className="hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Icons.ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Game</span>
            </button>
            <span>STATUS: PROTECTED</span>
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED ADMIN PANEL ================= */
        <div className="w-full max-w-6xl liquid-glass-dark border border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.3)] relative z-10 flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-red-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/70 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                <Icons.Users className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-red-400 tracking-wider">
                    PARHAM PLAYER MANAGER
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-950 text-red-300 border border-red-500/60 font-bold">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Full Database Control & Player Save Editor // Route: /parham
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAllPlayers}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                title="Refresh player list"
              >
                <Icons.RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleLogoutAdmin}
                className="px-4 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                <Icons.LogOut className="w-3.5 h-3.5" />
                <span>Exit Admin</span>
              </button>
            </div>
          </div>

          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#080d1a] border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TOTAL PLAYERS</span>
                <span className="text-2xl font-black text-cyan-300">{players.length}</span>
              </div>
              <Icons.UserCheck className="w-8 h-8 text-cyan-400/60" />
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a] border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">COMBINED ENERGY</span>
                <span className="text-xl font-black text-amber-300">{formatNumber(totalEnergy)}</span>
              </div>
              <Icons.Zap className="w-8 h-8 text-amber-400/60" />
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a] border border-fuchsia-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">QUANTUM RELICS</span>
                <span className="text-xl font-black text-fuchsia-300">{totalRelics}</span>
              </div>
              <Icons.Sparkles className="w-8 h-8 text-fuchsia-400/60" />
            </div>

            <div className="p-4 rounded-2xl bg-[#080d1a] border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">CLOUD STATUS</span>
                <span className="text-xs font-bold text-emerald-400 truncate block mt-1">{cloudStatus}</span>
              </div>
              <Icons.CloudCheck className="w-8 h-8 text-emerald-400/60 shrink-0" />
            </div>
          </div>

          {/* Action Bar & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#050814] border border-slate-800">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px]">
              <Icons.Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player by username..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Quick Global Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Icons.UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Player</span>
              </button>

              <button
                onClick={() => handleGiftAllEnergy(1000000000)}
                className="px-3 py-2 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Icons.Gift className="w-3.5 h-3.5" />
                <span>+1B All Players</span>
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#030611]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#090e1d] text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <th className="p-3">Player Username</th>
                  <th className="p-3">Banked Energy</th>
                  <th className="p-3">Quantum Relics</th>
                  <th className="p-3">Unlocks</th>
                  <th className="p-3">Last Saved</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                      No player records found.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((p) => {
                    const isCurrent =
                      currentGameState &&
                      currentGameState.username.toLowerCase() === p.user.username.toLowerCase();
                    return (
                      <tr key={p.user.username} className="hover:bg-[#080d20] transition-colors">
                        <td className="p-3 font-bold text-slate-200 flex items-center gap-2">
                          <span>{p.user.username}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                              CURRENT
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-amber-300 font-bold">
                          {formatNumber(p.save.points || 0)}
                        </td>
                        <td className="p-3 text-fuchsia-400 font-bold">
                          {p.save.quantumRelics || 0}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          <div>Legends: {p.save.unlockedComposers?.length || 1} / {MASTER_COMPOSERS.length}</div>
                          <div>Skins: {p.save.cosmeticsUnlocked?.length || 0}</div>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {p.save.lastSaveTime ? new Date(p.save.lastSaveTime).toLocaleString() : 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickGrantEnergy(p, 1000000000)}
                              className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-[10px] font-bold active:scale-95 transition-all"
                              title="+1 Billion Energy"
                            >
                              +1B
                            </button>

                            <button
                              onClick={() => handleUnlockAllForPlayer(p)}
                              className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold active:scale-95 transition-all"
                              title="Unlock All Legends & Skins"
                            >
                              Unlock All
                            </button>

                            <button
                              onClick={() => handleOpenEditPlayer(p)}
                              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold active:scale-95 transition-all flex items-center gap-1"
                            >
                              <Icons.Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleDeletePlayer(p.user.username)}
                              className="p-1 rounded bg-red-950 hover:bg-red-900 text-red-400 border border-red-500/40 text-[10px] font-bold active:scale-95 transition-all"
                              title="Delete Player"
                            >
                              <Icons.Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* System Console Output */}
          <div className="p-4 rounded-2xl bg-[#02050e] border border-red-500/30 text-xs font-mono flex flex-col gap-2">
            <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-slate-800">
              <span className="text-red-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                PARHAM_ADMIN_AUDIT_LOG
              </span>
              <span>PATH: /parham</span>
            </div>
            <div className="h-28 overflow-y-auto space-y-1 text-slate-300 text-[11px] pr-2">
              {adminLogs.map((log, index) => (
                <p key={index} className={index === 0 ? 'text-red-300 font-bold' : 'text-slate-400'}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PLAYER MODAL ================= */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#060a17] border border-cyan-500/50 rounded-3xl p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,243,255,0.3)] animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Icons.UserCog className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Edit Player: <span className="text-cyan-300">{selectedPlayer.user.username}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-amber-300">Energy Points (Banked)</label>
                <input
                  type="text"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-slate-700 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-fuchsia-300">Quantum Relics</label>
                <input
                  type="text"
                  value={editRelics}
                  onChange={(e) => setEditRelics(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-slate-700 text-xs text-fuchsia-300 focus:outline-none focus:border-fuchsia-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">New Password (Optional)</label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {editMessage && (
                <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/40">
                  {editMessage}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlayerEdits}
                className="px-5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 text-xs font-bold active:scale-95 transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]"
              >
                Save Player Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD PLAYER MODAL ================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlayerSubmit}
            className="w-full max-w-md bg-[#060a17] border border-emerald-500/50 rounded-3xl p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Icons.UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Create New Player Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. Parham123"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full px-3 py-2 rounded-xl bg-black border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {addUserError && (
                <div className="text-xs font-bold text-red-400 bg-red-950/60 p-2 rounded-lg border border-red-500/40">
                  {addUserError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-400 text-emerald-200 text-xs font-bold active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                Create Player
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
