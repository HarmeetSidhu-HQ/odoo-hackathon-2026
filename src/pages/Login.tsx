import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, UserCheck, ArrowRight, Sparkles, Building2, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
  identifier: z.string().min(2, 'Please enter a valid Login ID or Email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginProps {
  onNavigateToSignUp: () => void;
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToSignUp, onLoginSuccess }) => {
  const { login, switchRole } = useAuthStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: 'DFSAJE20260001',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    setTimeout(() => {
      const res = login(data.identifier, data.password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess?.();
      } else {
        setAuthError(res.message || 'Invalid credentials. Please verify your Login ID or Email.');
      }
    }, 350);
  };

  const handleQuickFill = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setValue('identifier', 'DFSAJE20260001');
      setValue('password', 'adminPass2026');
      switchRole('admin');
    } else {
      setValue('identifier', 'OIJODO20260001');
      setValue('password', 'empPass2026');
      switchRole('employee');
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center p-4 sm:p-6 bg-canvas">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-surface-border mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-slate-300 font-medium uppercase">
              Dayflow HRMS v2.4
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Enterprise Access
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sign in using your corporate <span className="font-mono text-xs text-brand-500">Login ID</span> or work email
          </p>
        </div>

        {/* Quick Role Fillers */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => handleQuickFill('admin')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-surface border border-surface-border hover:border-brand-500/50 hover:bg-surface-elevated transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-brand-500 transition-colors">Admin Demo</div>
              <div className="text-[10px] font-mono text-slate-400">DFSAJE20260001</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('employee')}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-surface border border-surface-border hover:border-brand-500/50 hover:bg-surface-elevated transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white group-hover:text-brand-500 transition-colors">Employee Demo</div>
              <div className="text-[10px] font-mono text-slate-400">OIJODO20260001</div>
            </div>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-xl border border-surface-border p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 opacity-80" />

          {authError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Login ID or Work Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. OIJODO20260001 or name@company.com"
                  {...register('identifier')}
                  className={`w-full px-3.5 py-2.5 bg-canvas border ${
                    errors.identifier ? 'border-rose-500 focus:ring-rose-500' : 'border-surface-border focus:border-brand-500'
                  } rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all font-mono`}
                />
                <Building2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-xs text-rose-400 font-mono">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider font-mono">
                  Password
                </label>
                <span className="text-[11px] text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                  Forgot key?
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••••••"
                  {...register('password')}
                  className={`w-full px-3.5 py-2.5 bg-canvas border ${
                    errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-surface-border focus:border-brand-500'
                  } rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all`}
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400 font-mono">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-surface-border bg-canvas text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
                />
                <span>Keep session active</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Zero-trust TLS
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] font-mono text-slate-500">
          Format Formula: <span className="text-slate-400">[CC][FL][YYYY][0001]</span> &bull; 256-bit AES State Persistence
        </div>
      </div>
    </div>
  );
};
