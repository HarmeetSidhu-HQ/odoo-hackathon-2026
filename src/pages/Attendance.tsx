import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Plane, 
  Play, 
  Square,
  Search,
  SlidersHorizontal,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useAttendanceStore } from '../store/attendanceStore';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { ManualAttendanceModal } from '../components/attendance/ManualAttendanceModal';
import { AnomalyFeed } from '../components/attendance/AnomalyFeed';
import type { AttendanceRecord } from '../types';

export const Attendance: React.FC = () => {
  const { 
    records, 
    isCheckedIn, 
    toggleCheckIn,
    selectedDate,
    setSelectedDate,
    anomalies,
    evaluateAnomalies
  } = useAttendanceStore();

  useEffect(() => {
    evaluateAnomalies();
  }, [evaluateAnomalies]);

  const { currentUser } = useAuthStore();
  const { employees } = useEmployeeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'admin';

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // 1. Employee View: John Doe (or current user) personal logs
  const employeeRecords = useMemo(() => {
    if (!currentUser) return [];
    return records.filter(
      (r) => r.employeeId === currentUser.employeeId || r.employeeLoginId === currentUser.loginId
    );
  }, [records, currentUser]);

  const employeeStats = useMemo(() => {
    const presentCount = employeeRecords.filter((r) => r.status === 'present').length;
    const halfDayCount = employeeRecords.filter((r) => r.status === 'half_day').length;
    const leaveCount = employeeRecords.filter((r) => r.status === 'on_leave').length;
    const totalHours = employeeRecords.reduce((acc, r) => acc + (r.workHours || 0), 0);
    const overtimeHours = employeeRecords.reduce((acc, r) => acc + (r.extraHours || 0), 0);

    return {
      daysPresent: presentCount + (halfDayCount * 0.5),
      leavesCount: leaveCount,
      totalWorkingDays: 22,
      totalHours: Math.round(totalHours * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
    };
  }, [employeeRecords]);

  // 2. Admin View: Ledger filtered by selected date & search
  const adminRecordsForDate = useMemo(() => {
    return records.filter((r) => {
      if (r.date !== selectedDate) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.employeeName.toLowerCase().includes(q);
        const matchesId = r.employeeLoginId.toLowerCase().includes(q);
        if (!matchesName && !matchesId) return false;
      }

      return true;
    });
  }, [records, selectedDate, statusFilter, searchQuery]);

  const adminDateStats = useMemo(() => {
    const onDateRecords = records.filter((r) => r.date === selectedDate);
    const present = onDateRecords.filter((r) => r.status === 'present').length;
    const absent = onDateRecords.filter((r) => r.status === 'absent').length;
    const leave = onDateRecords.filter((r) => r.status === 'on_leave').length;
    return { present, absent, leave, total: employees.length };
  }, [records, selectedDate, employees]);

  const activeAnomalies = useMemo(() => anomalies.filter(a => !a.isResolved), [anomalies]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Ledger</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
              isAdmin ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
            }`}>
              {isAdmin ? 'ADMIN CONSOLE' : 'EMPLOYEE LOG'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin 
              ? 'Organization-wide real-time attendance ledger, manual punch adjustments & audits'
              : 'Personal clock-in log, hours tracking, and monthly presence metrics'}
          </p>
        </div>

        {/* Quick systray punch or Admin manual record */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs text-emerald-400 font-mono font-bold tracking-wider transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>MANUAL LOG PUNCH</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => currentUser && toggleCheckIn(currentUser.employeeId, currentUser.name, currentUser.loginId)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all shadow-md cursor-pointer ${
              isCheckedIn
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-rose-500/10'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/10'
            }`}
          >
            {isCheckedIn ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                <span>CHECK OUT OF SHIFT</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                <span>CHECK IN TO SHIFT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. EMPLOYEE PERSONAL VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[11px] font-mono uppercase text-emerald-400">Days Present</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {employeeStats.daysPresent} <span className="text-xs text-slate-500 font-normal">/ {employeeStats.totalWorkingDays} days</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {Math.round((employeeStats.daysPresent / employeeStats.totalWorkingDays) * 100)}% attendance rate
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[11px] font-mono uppercase text-sky-400">Leaves Count</div>
              <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
                {String(employeeStats.leavesCount).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Approved time off</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[11px] font-mono uppercase text-slate-400">Total Work Hours</div>
              <div className="text-2xl font-bold text-white font-mono mt-1">
                {employeeStats.totalHours} <span className="text-xs text-slate-500 font-normal">hrs</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Standard 8.0 hrs/day</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-surface-border">
              <div className="text-[11px] font-mono uppercase text-brand-400">Extra / Overtime</div>
              <div className="text-2xl font-bold text-brand-400 font-mono mt-1">
                +{employeeStats.overtimeHours} <span className="text-xs text-slate-500 font-normal">hrs</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Statutory compensated
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
            <div className="p-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Personal Attendance Ledger Log
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Synced with Check-in Systray
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-b border-surface-border text-[11px] font-mono uppercase text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check In</th>
                    <th className="py-3 px-4">Check Out</th>
                    <th className="py-3 px-4">Work Hours</th>
                    <th className="py-3 px-4">Extra Hours</th>
                    <th className="py-3 px-4 text-right">Clearance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border font-mono">
                  {employeeRecords.map((record: AttendanceRecord) => (
                    <tr key={record.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{record.date}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {record.checkIn || <span className="text-slate-600">--:--</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {record.checkOut || (
                          <span className="text-emerald-400 animate-pulse">● Active Shift</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white font-bold">{record.workHours} hrs</td>
                      <td className="py-3 px-4 text-brand-400">
                        {record.extraHours > 0 ? `+${record.extraHours} hrs` : '0.0 hrs'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            record.status === 'present'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : record.status === 'half_day'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : record.status === 'on_leave'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {record.status === 'present' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {record.status === 'on_leave' && <Plane className="w-3 h-3" />}
                          <span className="uppercase">{record.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN COMPANY-WIDE VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          <AnomalyFeed />
          
          <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-canvas rounded-lg border border-surface-border p-1">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    title="Previous Day"
                    className="p-1.5 rounded hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 font-mono text-xs font-bold text-white">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    <span>{selectedDate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNextDay}
                    title="Next Day"
                    className="p-1.5 rounded hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                />

                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="px-2.5 py-1.5 bg-surface-elevated hover:bg-surface-hover rounded-lg text-xs font-mono text-slate-300 border border-surface-border cursor-pointer"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['all', 'present', 'absent', 'on_leave'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-canvas text-slate-400 hover:text-slate-200 border border-surface-border'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter company ledger by employee name or Login ID..."
                className="w-full pl-9 pr-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono uppercase text-slate-400">Total Workforce</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">{adminDateStats.total}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono uppercase text-emerald-400">Logged Present</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{adminDateStats.present}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono uppercase text-amber-400">Logged Absent</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{adminDateStats.absent}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
              <div className="text-[10px] font-mono uppercase text-sky-400">On Time-Off</div>
              <div className="text-xl font-bold font-mono text-sky-400 mt-0.5">{adminDateStats.leave}</div>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-surface-border overflow-hidden shadow-sm">
            <div className="p-4 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
              <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Daily Roster Ledger for {selectedDate}
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {adminRecordsForDate.length} records logged
              </span>
            </div>

            {adminRecordsForDate.length === 0 ? (
              <div className="p-12 text-center">
                <SlidersHorizontal className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">No attendance records on this date</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Log a manual punch or navigate to another working date.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-canvas border-b border-surface-border text-[11px] font-mono uppercase text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Login ID</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4">Work Hours</th>
                      <th className="py-3 px-4">Overtime</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border font-mono">
                    {adminRecordsForDate.map((record: AttendanceRecord) => {
                      const isAnomalous = activeAnomalies.some(a => a.attendanceRecordId === record.id);
                      return (
                      <tr key={record.id} className={`transition-colors ${isAnomalous ? 'bg-amber-500/5 border-l-2 border-l-amber-500 hover:bg-amber-500/10' : 'hover:bg-surface-elevated/50'}`}>
                        <td className="py-3 px-4 text-white font-bold font-sans">
                          {record.employeeName}
                        </td>
                        <td className="py-3 px-4 text-brand-400">{record.employeeLoginId}</td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex flex-col gap-1">
                            <span>{record.checkIn || <span className="text-slate-600">--:--</span>}</span>
                            {record.locationStatus && record.locationStatus !== 'UNVERIFIED' && (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-flex items-center w-fit ${
                                record.locationStatus === 'OFFICE_VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                              }`}>
                                {record.locationStatus === 'OFFICE_VERIFIED' ? '📍 HQ Office' : `🌍 ${record.locationZone || 'Remote'}`}
                              </span>
                            )}
                            {record.locationStatus === 'OUT_OF_BOUNDS' && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20 inline-flex w-fit">
                                ⚠️ Out of Bounds
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {record.checkOut || (
                            <span className="text-emerald-400">● In Shift</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-white font-bold">{record.workHours} hrs</td>
                        <td className="py-3 px-4 text-slate-400">
                          {record.extraHours > 0 ? `+${record.extraHours} hrs` : '0.0 hrs'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              record.status === 'present'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : record.status === 'half_day'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : record.status === 'on_leave'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            <span className="uppercase">{record.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
