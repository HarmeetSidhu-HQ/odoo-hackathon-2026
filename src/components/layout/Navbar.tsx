import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CalendarDays, 
  Search, 
  LogOut, 
  User, 
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { GeoPunchButton } from './GeoPunchButton';

interface NavbarProps {
  currentTab: 'employees' | 'attendance' | 'timeoff';
  onTabChange: (tab: 'employees' | 'attendance' | 'timeoff') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { currentUser, logout } = useAuthStore();
  const { filter, setFilter, employees, openProfileModal } = useEmployeeStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleOpenSelfProfile = () => {
    setIsProfileDropdownOpen(false);
    if (!currentUser) return;
    const selfEmp = employees.find((e) => e.id === currentUser.employeeId || e.loginId === currentUser.loginId);
    if (selfEmp) {
      openProfileModal(selfEmp, 'resume');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* 1. Brand Logo & Title */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center shadow-md shadow-brand-600/20 border border-brand-500/30">
              <span className="font-bold text-white tracking-tighter text-lg font-mono">D</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-tight text-base font-sans">Dayflow</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  HRMS
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {currentUser?.companyName || 'Enterprise OS'}
              </div>
            </div>
          </div>

          {/* 2. Module Switcher Navigation */}
          <nav className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-surface-border">
            <button
              onClick={() => onTabChange('employees')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'employees'
                  ? 'bg-surface text-white shadow-sm border border-surface-border'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden md:inline">Employees</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-slate-400">
                {employees.length}
              </span>
            </button>

            <button
              onClick={() => onTabChange('attendance')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'attendance'
                  ? 'bg-surface text-white shadow-sm border border-surface-border'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Attendance</span>
            </button>

            <button
              onClick={() => onTabChange('timeoff')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'timeoff'
                  ? 'bg-surface text-white shadow-sm border border-surface-border'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface/50'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Time Off</span>
            </button>
          </nav>

          {/* 3. Global Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => setFilter({ searchQuery: e.target.value })}
              placeholder="Search by name, ID, or title..."
              className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 font-mono transition-all"
            />
            {filter.searchQuery && (
              <button
                onClick={() => setFilter({ searchQuery: '' })}
                className="absolute right-2.5 top-2 text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ESC
              </button>
            )}
          </div>

          {/* 4. Systray & User Menu Controls */}
          <div className="flex items-center gap-3">
            {/* Interactive Geo-Fenced Check-In Pill */}
            <GeoPunchButton />

            {/* Profile & Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg bg-surface border border-surface-border hover:border-slate-600 transition-all cursor-pointer"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                  alt={currentUser?.name || 'User'}
                  className="w-7 h-7 rounded-md object-cover border border-surface-border"
                />
                <div className="hidden sm:flex flex-col text-left pr-1">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser?.name?.split(' ')[0]}
                  </span>
                  <span className={`text-[10px] font-mono uppercase font-semibold ${
                    currentUser?.role === 'admin' ? 'text-emerald-400' : 'text-brand-400'
                  }`}>
                    {currentUser?.role === 'admin' ? 'Admin/HR' : 'Employee'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface border border-surface-border shadow-2xl z-50 p-2 text-left animate-slide-up">
                    <div className="p-2.5 mb-1.5 rounded-lg bg-canvas border border-surface-border">
                      <div className="text-xs font-bold text-white">{currentUser?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Login ID:</span>
                        <span className="text-brand-400 font-bold">{currentUser?.loginId}</span>
                      </div>
                    </div>

                    <div className="h-px bg-surface-border my-1" />

                    <button
                      onClick={handleOpenSelfProfile}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-300 hover:bg-surface-elevated transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile & Resume</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
