import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AttendanceRecord, AttendanceAnomaly } from '../types';
import { evaluateAnomalies as computeAnomalies } from '../utils/anomalyDetector';

interface AttendanceState {
  records: AttendanceRecord[];
  isCheckedIn: boolean;
  checkInTimestamp: string | null; // ISO string
  activeTimerFormatted: string; // e.g. "02:45:10"
  selectedDate: string; // YYYY-MM-DD
  anomalies: AttendanceAnomaly[];
  
  // Actions
  toggleCheckIn: (employeeId: string, employeeName: string, employeeLoginId: string, locationData?: { status: AttendanceRecord['locationStatus'], zone?: string }) => void;
  checkInNow: (employeeId: string, employeeName: string, employeeLoginId: string, locationData?: { status: AttendanceRecord['locationStatus'], zone?: string }) => void;
  checkOutNow: (employeeId: string) => void;
  setSelectedDate: (date: string) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  evaluateAnomalies: () => void;
  resolveAnomaly: (id: string, actionType: string) => void;
  resetAttendanceStore: () => void;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const formatTimeString = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'att-001',
    employeeId: 'emp-001',
    employeeName: 'Sarah Jenkins',
    employeeLoginId: 'DFSAJE20260001',
    date: getTodayDateString(),
    checkIn: '08:45 AM',
    checkOut: null,
    workHours: 4.5,
    extraHours: 0,
    status: 'present',
  },
  {
    id: 'att-002',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    date: getTodayDateString(),
    checkIn: '09:05 AM',
    checkOut: null,
    workHours: 4.2,
    extraHours: 0.2,
    status: 'present',
  },
  {
    id: 'att-003',
    employeeId: 'emp-003',
    employeeName: 'Maya Chen',
    employeeLoginId: 'DFMYCH20260002',
    date: getTodayDateString(),
    checkIn: '09:30 AM',
    checkOut: null,
    workHours: 3.8,
    extraHours: 0,
    status: 'present',
  },
  {
    id: 'att-004',
    employeeId: 'emp-004',
    employeeName: 'Liam Vance',
    employeeLoginId: 'DFLIVA20260003',
    date: getTodayDateString(),
    checkIn: null,
    checkOut: null,
    workHours: 0,
    extraHours: 0,
    status: 'absent',
  },
  {
    id: 'att-005',
    employeeId: 'emp-005',
    employeeName: 'Priya Sharma',
    employeeLoginId: 'DFPRSH20260004',
    date: getTodayDateString(),
    checkIn: null,
    checkOut: null,
    workHours: 0,
    extraHours: 0,
    status: 'on_leave',
  },
  {
    id: 'att-006',
    employeeId: 'emp-006',
    employeeName: 'Marcus Aurel',
    employeeLoginId: 'DFMAAU20260005',
    date: getTodayDateString(),
    checkIn: '08:15 AM',
    checkOut: null,
    workHours: 5.0,
    extraHours: 0.5,
    status: 'present',
  },
  // Previous logs for employee John Doe (emp-002)
  {
    id: 'att-007',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    date: '2026-08-21',
    checkIn: '09:00 AM',
    checkOut: '06:15 PM',
    workHours: 8.75,
    extraHours: 0.75,
    status: 'present',
  },
  {
    id: 'att-008',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    date: '2026-08-20',
    checkIn: '08:50 AM',
    checkOut: '05:55 PM',
    workHours: 8.5,
    extraHours: 0.5,
    status: 'present',
  },
  {
    id: 'att-009',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    date: '2026-08-19',
    checkIn: '09:10 AM',
    checkOut: '06:30 PM',
    workHours: 8.8,
    extraHours: 0.8,
    status: 'present',
  },
  {
    id: 'att-010',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    date: '2026-08-18',
    checkIn: '09:00 AM',
    checkOut: '01:00 PM',
    workHours: 4.0,
    extraHours: 0,
    status: 'half_day',
  },
];

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      records: initialAttendanceRecords,
      isCheckedIn: true,
      checkInTimestamp: new Date(Date.now() - 4.2 * 3600 * 1000).toISOString(),
      activeTimerFormatted: '04:12:35',
      selectedDate: getTodayDateString(),
      anomalies: [],

      toggleCheckIn: (employeeId, employeeName, employeeLoginId, locationData) => {
        const { isCheckedIn } = get();
        if (isCheckedIn) {
          get().checkOutNow(employeeId);
        } else {
          get().checkInNow(employeeId, employeeName, employeeLoginId, locationData);
        }
      },

      checkInNow: (employeeId, employeeName, employeeLoginId, locationData) => {
        const now = new Date();
        const today = getTodayDateString();
        const checkInTimeStr = formatTimeString(now);

        const { records } = get();
        const existingIndex = records.findIndex(
          (r) => r.employeeId === employeeId && r.date === today
        );

        let updatedRecords: AttendanceRecord[];
        if (existingIndex !== -1) {
          updatedRecords = [...records];
          updatedRecords[existingIndex] = {
            ...records[existingIndex],
            checkIn: checkInTimeStr,
            checkOut: null,
            status: 'present',
            locationStatus: locationData?.status || 'UNVERIFIED',
            locationZone: locationData?.zone,
          };
        } else {
          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            employeeId,
            employeeName,
            employeeLoginId,
            date: today,
            checkIn: checkInTimeStr,
            checkOut: null,
            workHours: 0.1,
            extraHours: 0,
            status: 'present',
            locationStatus: locationData?.status || 'UNVERIFIED',
            locationZone: locationData?.zone,
          };
          updatedRecords = [newRecord, ...records];
        }

        set({
          isCheckedIn: true,
          checkInTimestamp: now.toISOString(),
          records: updatedRecords,
        });
        
        get().evaluateAnomalies();
      },

      checkOutNow: (employeeId) => {
        const now = new Date();
        const today = getTodayDateString();
        const checkOutTimeStr = formatTimeString(now);

        const { records, checkInTimestamp } = get();
        const existingIndex = records.findIndex(
          (r) => r.employeeId === employeeId && r.date === today
        );

        let computedHours = 8.0;
        if (checkInTimestamp) {
          const diffMs = now.getTime() - new Date(checkInTimestamp).getTime();
          computedHours = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
        }

        const extraHours = Math.max(0, Math.round((computedHours - 8.0) * 10) / 10);

        let updatedRecords: AttendanceRecord[];
        if (existingIndex !== -1) {
          updatedRecords = [...records];
          updatedRecords[existingIndex] = {
            ...records[existingIndex],
            checkOut: checkOutTimeStr,
            workHours: computedHours,
            extraHours,
          };
        } else {
          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            employeeId,
            employeeName: 'Current User',
            employeeLoginId: 'DF00000000',
            date: today,
            checkIn: '09:00 AM',
            checkOut: checkOutTimeStr,
            workHours: computedHours,
            extraHours,
            status: 'present',
          };
          updatedRecords = [newRecord, ...records];
        }

        set({
          isCheckedIn: false,
          checkInTimestamp: null,
          records: updatedRecords,
        });

        get().evaluateAnomalies();
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      addAttendanceRecord: (record) => {
        set((state) => ({ records: [record, ...state.records] }));
      },

      updateAttendanceRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }));
        get().evaluateAnomalies();
      },

      evaluateAnomalies: () => {
        const { records, anomalies } = get();
        const newAnomalies = computeAnomalies(records);
        
        // Merge new anomalies, keeping isResolved state of existing ones
        const mergedAnomalies = newAnomalies.map(newAnom => {
          const existing = anomalies.find(a => a.id === newAnom.id);
          if (existing) return { ...newAnom, isResolved: existing.isResolved };
          return newAnom;
        });

        set({ anomalies: mergedAnomalies });
      },

      resolveAnomaly: (id, _actionType) => {
        set((state) => ({
          anomalies: state.anomalies.map(a => 
            a.id === id ? { ...a, isResolved: true } : a
          )
        }));
      },

      resetAttendanceStore: () => {
        set({
          records: initialAttendanceRecords,
          isCheckedIn: true,
          checkInTimestamp: new Date(Date.now() - 4.2 * 3600 * 1000).toISOString(),
          selectedDate: getTodayDateString(),
        });
      },
    }),
    {
      name: 'dayflow-attendance-storage',
    }
  )
);
