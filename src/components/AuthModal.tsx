import React, { useState } from 'react';
import { AuthManager } from '../services/auth';
import * as Icons from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (username: string) => void;
  activeUsername: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  activeUsername,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleResetAll = async () => {
    await AuthManager.resetAllAccounts();
    onAuthSuccess('');
    setConfirmReset(false);
    setErrorMessage('All accounts and save data on the website have been reset.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      const res = AuthManager.register(usernameInput, passwordInput);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
        return;
      }
      onAuthSuccess(usernameInput.trim());
      onClose();
    } else {
      const res = AuthManager.login(usernameInput, passwordInput);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed');
        return;
      }
      onAuthSuccess(usernameInput.trim());
      onClose();
    }
  };

  const handleGuest = () => {
    const guestName = `Guest_${Math.floor(Math.random() * 8999 + 1000)}`;
    AuthManager.setCurrentUsername(guestName);
    onAuthSuccess(guestName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Glow ambient decoration */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Icons.Shield className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide uppercase">
                {activeUsername ? 'Account Center' : 'User Registration & Sync'}
              </h2>
            </div>
            {activeUsername && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Currently logged-in info badge */}
          {activeUsername && (
            <div className="my-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Icons.UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Logged in as:</p>
                  <p className="text-sm font-bold text-cyan-300 font-mono">{activeUsername}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  AuthManager.logout();
                  onAuthSuccess('');
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Icons.LogOut className="w-3.5 h-3.5" />
                <span>Switch Account</span>
              </button>
            </div>
          )}

          {!activeUsername && (
            <>
              {/* Tab selector Login vs Register */}
              <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <Icons.AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <Icons.User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter username..."
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Icons.Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Enter password..."
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-sm shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all active:scale-[0.98]"
                >
                  {mode === 'login' ? 'LOG IN TO GAME' : 'CREATE ACCOUNT & START'}
                </button>
              </form>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 border-t border-slate-800" />
                <span className="relative px-3 bg-slate-900 text-[10px] text-slate-500 font-mono uppercase">
                  OR QUICK START
                </span>
              </div>

              <button
                type="button"
                onClick={handleGuest}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
              >
                Play as Guest (Temporary Local Save)
              </button>
            </>
          )}

          {/* Reset All Accounts Control */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-[11px] font-mono text-red-400 hover:text-red-300 underline flex items-center gap-1 transition-all"
              >
                <Icons.Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Accounts & Wipe Saved Data</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-center w-full">
                <p className="text-xs text-red-200 font-semibold mb-2">
                  Are you sure? This will delete all local & cloud accounts!
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono transition-all"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
