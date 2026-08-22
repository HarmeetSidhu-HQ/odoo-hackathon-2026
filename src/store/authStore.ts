import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';
import { initialEmployees } from '../data/mockEmployees';
import { generateLoginId } from '../utils/idGenerator';

export const MOCK_USERS: Record<Role, User> = {
  admin: {
    id: 'user-admin-01',
    loginId: 'DFSAJE20260001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@dayflow.io',
    role: 'admin',
    companyName: 'Dayflow Technologies',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    employeeId: 'emp-001',
  },
  employee: {
    id: 'user-emp-02',
    loginId: 'OIJODO20260001',
    name: 'John Doe',
    email: 'john.doe@dayflow.io',
    role: 'employee',
    companyName: 'Odoo India',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    employeeId: 'emp-002',
  },
};

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => { success: boolean; message?: string };
  signup: (payload: { companyName: string; name: string; email: string; phone: string; password?: string; role?: Role; avatar?: string; companyLogo?: string }) => { success: boolean; loginId: string; message?: string };
  switchRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: MOCK_USERS.admin,
      isAuthenticated: true,

      login: (identifier: string) => {
        const clean = identifier.trim().toLowerCase();
        // Check if matching Admin
        if (clean === 'dfsaje20260001' || clean === 'sarah.jenkins@dayflow.io' || clean === 'admin') {
          set({ currentUser: MOCK_USERS.admin, isAuthenticated: true });
          return { success: true };
        }
        // Check if matching John Doe
        if (clean === 'oijodo20260001' || clean === 'john.doe@dayflow.io' || clean === 'employee') {
          set({ currentUser: MOCK_USERS.employee, isAuthenticated: true });
          return { success: true };
        }
        // Check existing employees list in mock
        const matched = initialEmployees.find(
          (e) => e.loginId.toLowerCase() === clean || e.email.toLowerCase() === clean
        );
        if (matched) {
          const user: User = {
            id: `user-${matched.id}`,
            loginId: matched.loginId,
            name: matched.name,
            email: matched.email,
            role: matched.role,
            companyName: matched.companyName,
            avatar: matched.avatar,
            employeeId: matched.id,
          };
          set({ currentUser: user, isAuthenticated: true });
          return { success: true };
        }

        // Fallback demo login
        const fallbackUser: User = {
          id: `user-${Date.now()}`,
          loginId: identifier.toUpperCase(),
          name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          email: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@dayflow.io`,
          role: 'employee',
          companyName: 'Dayflow Technologies',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
          employeeId: 'emp-002',
        };
        set({ currentUser: fallbackUser, isAuthenticated: true });
        return { success: true };
      },

      signup: (payload) => {
        const currentYear = new Date().getFullYear();
        const loginId = generateLoginId(payload.companyName, payload.name, currentYear, Math.floor(Math.random() * 8999) + 1000);
        const role = payload.role || 'employee';
        const newUser: User = {
          id: `user-${Date.now()}`,
          loginId,
          name: payload.name,
          email: payload.email,
          role,
          companyName: payload.companyName,
          avatar: payload.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
          employeeId: `emp-${Date.now()}`,
        };
        set({ currentUser: newUser, isAuthenticated: true });
        return { success: true, loginId };
      },

      switchRole: (role: Role) => {
        const targetUser = MOCK_USERS[role];
        set({ currentUser: targetUser, isAuthenticated: true });
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    {
      name: 'dayflow-auth-storage',
    }
  )
);
