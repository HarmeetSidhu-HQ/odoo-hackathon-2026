import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CalendarDays, 
  Search, 
  Shield, 
  UserCheck, 
  LogOut, 
  User, 
  ChevronDown, 
  Play,
  Square
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import type { Role } from '../../types';

interface NavbarProps {
  currentTab: 'employees' | 'attendance' | 'timeoff';
  onTabChange: (tab: 'employees' | 'attendance' | 'timeoff') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { currentUser, switchRole, logout } = useAuthStore();
  const { filter, setFilter, employees, openProfileModal } = useEmployeeStore();
  const { isCheckedIn, checkInTimestamp, toggleCheckIn } = useAttendanceStore();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Live timer tick for Check-in
  useEffect(() => {
    if (!isCheckedIn || !checkInTimestamp) {
      setElapsedTime('00:00:00');
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(checkInTimestamp).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - startTime);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTimestamp]);

  const handleSystrayAction = () => {
    if (!currentUser) return;
    toggleCheckIn(currentUser.employeeId, currentUser.name, currentUser.loginId);
  };

  const handleRoleToggle = (targetRole: Role) => {
    switchRole(targetRole);
    setIsProfileDropdownOpen(false);
  };

  const handleOpenSelfProfile = () => {
    setIsProfileDropdownOpen(false);
    if (!currentUser) return;
    const selfEmp = employees.find((e) => e.id === currentUser.employeeId || e.loginId === currentUser.loginId);
    if (selfEmp) {
      openProfileModal(selfEmp, 'resume');
    }
  };

  const checkInTimeFormatted = checkInTimestamp
    ? new Date(checkInTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '09:00 AM';

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
            {/* Interactive Check-In/Out Systray Pill */}
            <div className="flex items-center gap-2 p-1 pl-2.5 rounded-lg bg-canvas border border-surface-border shadow-inner">
              {isCheckedIn ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <div className="hidden xl:flex flex-col text-left">
                      <span className="text-[10px] font-mono text-emerald-400 leading-tight">
                        Since {checkInTimeFormatted}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">
                        {elapsedTime}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSystrayAction}
                    title="Check out of work session"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer group"
                  >
                    <Square className="w-3 h-3 text-rose-400 fill-rose-400 group-hover:scale-110 transition-transform" />
                    <span>Check Out &rarr;</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-mono text-slate-400 hidden xl:inline">Checked Out</span>
                  </div>
                  <button
                    onClick={handleSystrayAction}
                    title="Check in to start shift"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer group"
                  >
                    <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Check IN &rarr;</span>
                  </button>
                </>
              )}
            </div>

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

                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Simulate RBAC Clearance
                    </div>

                    <div className="space-y-1 mb-2">
                      <button
                        onClick={() => handleRoleToggle('admin')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          currentUser?.role === 'admin'
                            ? 'bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-surface-elevated'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Admin / HR View</span>
                        </span>
                        {currentUser?.role === 'admin' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleRoleToggle('employee')}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          currentUser?.role === 'employee'
                            ? 'bg-brand-500/10 text-brand-300 font-semibold border border-brand-500/30'
                            : 'text-slate-300 hover:bg-surface-elevated'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                          <span>Employee View</span>
                        </span>
                        {currentUser?.role === 'employee' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        )}
                      </button>
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
