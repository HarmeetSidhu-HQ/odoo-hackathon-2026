import React from 'react';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { isAuthenticated, currentUser } = useAuthStore();

  if (!isAuthenticated || !currentUser) {
    return fallback ? <>{fallback}</> : null;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 font-mono text-xl">
          403
        </div>
        <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
        <p className="text-slate-400 text-sm max-w-md mt-2">
          This view requires elevated <code className="text-rose-400 font-mono text-xs">{requiredRole.toUpperCase()}</code> privileges. Switch your active role using the systray profile menu.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
