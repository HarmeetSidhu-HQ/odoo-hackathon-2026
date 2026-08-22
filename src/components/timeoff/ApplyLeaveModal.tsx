import React, { useState, useMemo } from 'react';
import { X, Calendar, Sparkles, Send } from 'lucide-react';
import { useTimeOffStore, calculateWorkingDays } from '../../store/timeOffStore';
import { useAuthStore } from '../../store/authStore';
import type { LeaveType } from '../../types';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { addRequest } = useTimeOffStore();
  const { currentUser } = useAuthStore();

  const [leaveType, setLeaveType] = useState<LeaveType>('paid');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  // Live dynamic working day calculation per CONTEXT.md
  const dynamicDaysCount = useMemo(() => {
    return calculateWorkingDays(startDate, endDate);
  }, [startDate, endDate]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    addRequest({
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      employeeLoginId: currentUser.loginId,
      employeeAvatar: currentUser.avatar,
      leaveType,
      startDate,
      endDate,
      daysCount: dynamicDaysCount,
      reason,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/80 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 z-10 animate-slide-up space-y-5">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Apply for Time Off</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Calculation Banner */}
        <div className="p-3.5 rounded-xl bg-canvas border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-xs text-slate-300 font-medium">Computed Duration</div>
              <div className="text-[10px] font-mono text-slate-500">Excludes standard weekends</div>
            </div>
          </div>
          <div className="px-3 py-1 rounded bg-surface-elevated border border-sky-500/30 text-sky-400 font-mono text-sm font-bold tracking-wider">
            {dynamicDaysCount} {dynamicDaysCount === 1 ? 'Working Day' : 'Working Days'}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-medium">
              Time Off Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType('paid')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  leaveType === 'paid'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-canvas border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                Paid Leave
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('sick')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  leaveType === 'sick'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-canvas border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                Sick Leave
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('casual')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  leaveType === 'casual'
                    ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                    : 'bg-canvas border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                Casual Leave
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-medium">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1 font-medium">
              Reason / Business Justification
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for HR and reporting manager approval..."
              className="w-full p-3 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-xs text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-sky-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBMIT APPLICATION</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
