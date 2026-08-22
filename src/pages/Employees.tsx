import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  MapPin, 
  Building2, 
  Plane, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import { AddEmployeeModal } from '../components/common/AddEmployeeModal';
import type { Employee } from '../types';

export const Employees: React.FC = () => {
  const { employees, filter, setFilter, resetFilter, openProfileModal } = useEmployeeStore();
  const { currentUser } = useAuthStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Metrics computation
  const stats = useMemo(() => {
    const total = employees.length;
    const present = employees.filter((e) => e.status === 'present').length;
    const absent = employees.filter((e) => e.status === 'absent').length;
    const onLeave = employees.filter((e) => e.status === 'on_leave').length;
    return { total, present, absent, onLeave };
  }, [employees]);

  // Filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search query (name, loginId, jobTitle, department, location)
      const q = filter.searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = emp.name.toLowerCase().includes(q);
        const matchesId = emp.loginId.toLowerCase().includes(q);
        const matchesTitle = emp.jobTitle.toLowerCase().includes(q);
        const matchesDept = emp.department.toLowerCase().includes(q);
        const matchesLoc = emp.location.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesTitle && !matchesDept && !matchesLoc) {
          return false;
        }
      }

      // Department filter
      if (filter.department !== 'all' && emp.department !== filter.department) {
        return false;
      }

      // Status filter
      if (filter.status !== 'all' && emp.status !== filter.status) {
        return false;
      }

      return true;
    });
  }, [employees, filter]);

  const departments = [
    'all',
    'Engineering',
    'Product Design',
    'Human Resources',
    'Infrastructure',
    'Data & AI',
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Top Section & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Workforce Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-mono font-bold">
              {filteredEmployees.length} nodes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time organizational roster, presence indicators & RBAC credential inspection
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold font-mono tracking-wider shadow-lg shadow-brand-600/20 transition-all cursor-pointer self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>PROVISION MEMBER</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Total Headcount</div>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase text-emerald-400">In Office / Active</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">{stats.present}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase text-amber-400">Absent Today</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-0.5">{stats.absent}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[11px] font-mono uppercase text-sky-400">On Approved Leave</div>
            <div className="text-2xl font-bold text-sky-400 font-mono mt-0.5">{stats.onLeave}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Plane className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Control Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Department Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setFilter({ department: dept })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filter.department === dept
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'bg-canvas text-slate-400 hover:text-slate-200 border border-surface-border'
                }`}
              >
                {dept === 'all' ? 'All Divisions' : dept}
              </button>
            ))}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-surface-border self-start md:self-auto">
            <button
              type="button"
              onClick={() => setFilter({ status: 'all' })}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                filter.status === 'all' ? 'bg-surface text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter({ status: 'present' })}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Present</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter({ status: 'absent' })}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter.status === 'absent' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Absent</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter({ status: 'on_leave' })}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                filter.status === 'on_leave' ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plane className="w-3 h-3 text-sky-400" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input if navbar hidden */}
        <div className="flex lg:hidden relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filter.searchQuery}
            onChange={(e) => setFilter({ searchQuery: e.target.value })}
            placeholder="Search by name, ID, department..."
            className="w-full pl-9 pr-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* 3. Employees Card Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-xl border border-surface-border">
          <SlidersHorizontal className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No employees matched your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or reset the active division/status filters.
          </p>
          <button
            type="button"
            onClick={resetFilter}
            className="mt-4 px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-xs text-brand-400 font-mono border border-surface-border cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee: Employee) => {
            const isPresent = employee.status === 'present';
            const isOnLeave = employee.status === 'on_leave';

            return (
              <div
                key={employee.id}
                onClick={() => openProfileModal(employee, 'resume')}
                className="p-5 rounded-xl bg-surface border border-surface-border hover:border-brand-500/40 hover:bg-surface-elevated transition-all cursor-pointer group shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                {/* Top status indicator & role pill */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-13 h-13 rounded-xl object-cover border border-surface-border group-hover:border-brand-500/40 transition-colors shadow-sm"
                    />
                    {/* Status Pill indicator per CONTEXT.md */}
                    {isPresent && (
                      <span
                        title="Present in Office"
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                      </span>
                    )}
                    {employee.status === 'absent' && (
                      <span
                        title="Absent Without Leave"
                        className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-surface"
                      />
                    )}
                    {isOnLeave && (
                      <span
                        title="On Approved Time-Off"
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 border-2 border-surface flex items-center justify-center text-[8px] text-white"
                      >
                        ✈
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-0.5 rounded bg-canvas border border-surface-border font-mono text-[11px] font-bold text-brand-400 group-hover:border-brand-500/30 transition-colors">
                      {employee.loginId}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded ${
                        employee.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-700/30 text-slate-400'
                      }`}
                    >
                      {employee.role}
                    </span>
                  </div>
                </div>

                {/* Identity Information */}
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                    {employee.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {employee.jobTitle}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{employee.department}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{employee.location}</span>
                    </div>
                  </div>

                  {/* Skills preview tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-border">
                    {employee.resume.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-canvas text-[10px] font-mono text-slate-400 border border-surface-border"
                      >
                        {skill}
                      </span>
                    ))}
                    {employee.resume.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded bg-canvas text-[10px] font-mono text-slate-500">
                        +{employee.resume.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProfileModal(employee, 'salary');
                        }}
                        className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-500/20 cursor-pointer"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Salary</span>
                      </button>
                    )}
                  </div>

                  <span className="text-slate-400 group-hover:text-brand-400 flex items-center gap-1 font-mono text-[11px] font-semibold transition-colors">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
