import React from 'react';
import { Key, ShieldCheck, Clock } from 'lucide-react';
import type { Employee } from '../../types';

interface ProfileSecurityTabProps {
  formData: Employee;
}

export const ProfileSecurityTab: React.FC<ProfileSecurityTabProps> = ({ formData }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-4 rounded-xl bg-canvas border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Password & Authentication</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Last reset: {formData.security.lastPasswordChange}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Corporate single sign-on (SSO) and AES-256 state encryption enabled for this identity.
        </p>
        <button
          type="button"
          onClick={() => alert('Password reset link dispatched to corporate email.')}
          className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs text-amber-400 font-mono cursor-pointer"
        >
          Send Password Reset Key
        </button>
      </div>

      <div className="p-4 rounded-xl bg-canvas border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Two-Factor Authentication (2FA)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
            ENFORCED
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Hardware authenticator token / TOTP required for all high-privilege operations.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-canvas border border-surface-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-white">Active Sessions</span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {formData.security.activeSessionsCount} active nodes
          </span>
        </div>
        <div className="text-xs text-slate-400">
          Current node: <code className="text-emerald-400 font-mono">192.168.1.104 (TLS 1.3)</code>
        </div>
      </div>
    </div>
  );
};
