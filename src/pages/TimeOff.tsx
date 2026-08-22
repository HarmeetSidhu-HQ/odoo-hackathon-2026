import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Plane, 
  Search, 
  Calendar,
  Sparkles,
  HeartPulse,
  Coffee
} from 'lucide-react';
import { useTimeOffStore } from '../store/timeOffStore';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { ApplyLeaveModal } from '../components/timeoff/ApplyLeaveModal';
import type { TimeOffRequest, LeaveStatus } from '../types';

export const TimeOff: React.FC = () => {
  const { requests, approveRequest, rejectRequest, filterStatus, setFilterStatus } = useTimeOffStore();
  const { currentUser } = useAuthStore();
  const { employees } = useEmployeeStore();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  // Get current user's employee object to read exact leave balance
  const selfEmployee = useMemo(() => {
    if (!currentUser) return null;
    return employees.find((e) => e.id === currentUser.employeeId || e.loginId === currentUser.loginId);
  }, [employees, currentUser]);

  const leaveBalance = selfEmployee?.leaveBalance || {
    paid: 24,
    sick: 7,
    casual: 5,
    usedPaid: 6,
    usedSick: 2,
    usedCasual: 1,
  };

  // 1. Employee view requests
  const myRequests = useMemo(() => {
    if (!currentUser) return [];
    return requests.filter(
      (r) => r.employeeId === currentUser.employeeId || r.employeeLoginId === currentUser.loginId
    );
  }, [requests, currentUser]);

  // 2. Admin view filtered requests
  const adminRequests = useMemo(() => {
    return requests.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.employeeName.toLowerCase().includes(q);
        const matchesId = r.employeeLoginId.toLowerCase().includes(q);
        const matchesReason = r.reason.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesReason) return false;
      }

      return true;
    });
  }, [requests, filterStatus, searchQuery]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleApprove = (reqId: string) => {
    if (!currentUser) return;
    approveRequest(reqId, currentUser.name, 'Approved by HR Executive.');
  };

  const handleReject = (reqId: string) => {
    if (!currentUser) return;
    rejectRequest(reqId, currentUser.name, 'Declined due to critical delivery coverage.');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Time Off Management</h1>
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                {pendingCount} PENDING APPROVALS
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-mono font-bold">
                BALANCE ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? 'Review pending time-off petitions with single-click clearance & audit trail'
              : 'Annual statutory leave entitlements, dynamic request generator & approval tracker'}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-mono tracking-wider shadow-lg shadow-sky-600/20 transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>APPLY FOR LEAVE</span>
          </button>
        )}
      </div>

      {/* 1. EMPLOYEE VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Statutory Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Paid Time Off
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                  Annual 24d
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-mono text-white">
                  {leaveBalance.paid - leaveBalance.usedPaid}
                </span>
                <span className="text-xs text-slate-400 font-mono">Days Available</span>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Used: {leaveBalance.usedPaid} days</span>
                <span className="text-emerald-400">Total: {leaveBalance.paid} days</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" /> Sick Time Off
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                  Annual 07d
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-mono text-white">
                  {leaveBalance.sick - leaveBalance.usedSick}
                </span>
                <span className="text-xs text-slate-400 font-mono">Days Available</span>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Used: {leaveBalance.usedSick} days</span>
                <span className="text-amber-400">Total: {leaveBalance.sick} days</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-surface-border relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-sky-400 font-semibold flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" /> Casual Leave
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300">
                  Annual 05d
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold font-mono text-white">
                  {leaveBalance.casual - leaveBalance.usedCasual}
                </span>
                <span className="text-xs text-slate-400 font-mono">Days Available</span>
              </div>
              <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Used: {leaveBalance.usedCasual} days</span>
                <span className="text-sky-400">Total: {leaveBalance.casual} days</span>
              </div>
            </div>
          </div>

          {/* Personal Leave History */}
          <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
            <div className="p-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Submitted Leave Applications
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {myRequests.length} applications on record
              </span>
            </div>

            {myRequests.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <Plane className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-xs">No leave applications on record.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {myRequests.map((req: TimeOffRequest) => (
                  <div key={req.id} className="p-4 hover:bg-surface-elevated/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-canvas border border-surface-border text-[11px] font-mono uppercase font-bold text-slate-200">
                          {req.leaveType} Leave
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {req.startDate} → {req.endDate}
                        </span>
                        <span className="text-xs font-mono text-sky-400 font-semibold">
                          ({req.daysCount} {req.daysCount === 1 ? 'day' : 'days'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{req.reason}</p>
                      {req.reviewComment && (
                        <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <span className="text-emerald-400">HR Note ({req.reviewedBy}):</span> {req.reviewComment}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {req.status === 'approved' && <Check className="w-3.5 h-3.5" />}
                        {req.status === 'rejected' && <X className="w-3.5 h-3.5" />}
                        {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        <span>{req.status}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ADMIN APPROVAL QUEUE VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {(['all', 'pending', 'approved', 'rejected'] as ('all' | LeaveStatus)[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-canvas text-slate-400 hover:text-slate-200 border border-surface-border'
                  }`}
                >
                  {st === 'all' ? 'All Queue' : st}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by employee name, login ID, or reason..."
                className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Queue Ledger */}
          <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
            <div className="p-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Live Authorization Queue
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {adminRequests.length} requests in view
              </span>
            </div>

            {adminRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">Queue is clear</h3>
                <p className="text-xs text-slate-400 mt-1">No time off applications matching your current filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {adminRequests.map((req: TimeOffRequest) => {
                  const isPending = req.status === 'pending';

                  return (
                    <div
                      key={req.id}
                      className="p-5 hover:bg-surface-elevated/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={req.employeeAvatar}
                          alt={req.employeeName}
                          className="w-11 h-11 rounded-xl object-cover border border-surface-border flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-white font-sans">
                              {req.employeeName}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-canvas border border-surface-border text-[10px] font-mono text-brand-400 font-bold">
                              {req.employeeLoginId}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-surface-elevated text-[10px] font-mono uppercase font-bold text-slate-300">
                              {req.leaveType} Leave
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-200 font-semibold">{req.startDate}</span>
                            <span>to</span>
                            <span className="text-slate-200 font-semibold">{req.endDate}</span>
                            <span className="text-sky-400 font-bold">({req.daysCount} working days)</span>
                          </div>

                          <p className="text-xs text-slate-300 bg-canvas/60 p-2.5 rounded-lg border border-surface-border/80 mt-1.5 max-w-xl">
                            "{req.reason}"
                          </p>

                          {req.reviewedBy && (
                            <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-1">
                              <span>Decision by {req.reviewedBy} on {new Date(req.reviewedAt || '').toLocaleDateString()}:</span>
                              <span className="text-slate-300 italic">"{req.reviewComment}"</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons per CONTEXT.md */}
                      <div className="flex items-center gap-2.5 self-end lg:self-center">
                        {isPending ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleReject(req.id)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer group"
                            >
                              <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              <span>REJECT</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprove(req.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 group"
                            >
                              <Check className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              <span>APPROVE</span>
                            </button>
                          </>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                              req.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {req.status === 'approved' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            <span>{req.status}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};
