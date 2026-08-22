import React, { useState } from 'react';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useEmployeeStore } from '../../store/employeeStore';
import type { AttendanceStatus } from '../../types';

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addAttendanceRecord } = useAttendanceStore();
  const { employees } = useEmployeeStore();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkIn, setCheckIn] = useState('09:00 AM');
  const [checkOut, setCheckOut] = useState('06:00 PM');
  const [workHours, setWorkHours] = useState(9.0);
  const [extraHours, setExtraHours] = useState(1.0);
  const [status, setStatus] = useState<AttendanceStatus>('present');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    addAttendanceRecord({
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeLoginId: emp.loginId,
      date,
      checkIn: status === 'absent' ? null : checkIn,
      checkOut: status === 'absent' ? null : checkOut,
      workHours: status === 'absent' ? 0 : Number(workHours),
      extraHours: status === 'absent' ? 0 : Number(extraHours),
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/80 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 z-10 animate-slide-up space-y-5">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Manual Ledger Entry</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Select Employee
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.loginId}) — {emp.department}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Log Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Status Clearance
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="present">Present (In Office)</option>
                <option value="half_day">Half Day (0.5)</option>
                <option value="absent">Absent</option>
                <option value="on_leave">On Approved Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Check In Time
              </label>
              <input
                type="text"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                placeholder="09:00 AM"
                disabled={status === 'absent'}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Check Out Time
              </label>
              <input
                type="text"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                placeholder="06:00 PM"
                disabled={status === 'absent'}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Work Hours
              </label>
              <input
                type="number"
                step="0.1"
                value={workHours}
                onChange={(e) => setWorkHours(Number(e.target.value))}
                disabled={status === 'absent'}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Extra / Overtime (hrs)
              </label>
              <input
                type="number"
                step="0.1"
                value={extraHours}
                onChange={(e) => setExtraHours(Number(e.target.value))}
                disabled={status === 'absent'}
                className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
            </div>
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
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LOG TO LEDGER</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
