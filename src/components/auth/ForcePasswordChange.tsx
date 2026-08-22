import React, { useState } from 'react';
import { ShieldAlert, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const ForcePasswordChange: React.FC = () => {
  const { currentUser, changePassword, logout } = useAuthStore();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      changePassword(newPassword);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center border-b border-surface-border bg-amber-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/50" />
          <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Action Required</h2>
          <p className="text-sm text-slate-400">
            Welcome, <span className="text-white font-medium">{currentUser?.name}</span>. You must change your temporary password before accessing the workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
              {confirmPassword.length > 0 && confirmPassword === newPassword && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3" />
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !newPassword || !confirmPassword}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-lg bg-transparent border border-surface-border text-slate-400 hover:text-white hover:bg-surface-elevated text-sm font-semibold transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
