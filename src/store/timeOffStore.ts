import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TimeOffRequest, LeaveStatus } from '../types';

interface TimeOffState {
  requests: TimeOffRequest[];
  filterStatus: 'all' | LeaveStatus;
  
  // Actions
  addRequest: (req: Omit<TimeOffRequest, 'id' | 'status' | 'appliedAt'>) => TimeOffRequest;
  approveRequest: (id: string, reviewerName: string, comment?: string) => void;
  rejectRequest: (id: string, reviewerName: string, comment?: string) => void;
  setFilterStatus: (status: 'all' | LeaveStatus) => void;
  resetTimeOffStore: () => void;
}

export function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    // Exclude Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.max(1, count);
}

const initialTimeOffRequests: TimeOffRequest[] = [
  {
    id: 'req-001',
    employeeId: 'emp-005',
    employeeName: 'Priya Sharma',
    employeeLoginId: 'DFPRSH20260004',
    employeeAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=256',
    leaveType: 'paid',
    startDate: '2026-08-20',
    endDate: '2026-08-25',
    daysCount: 4,
    reason: 'Attending IEEE Cloud & Distributed Data Architecture Symposium in Singapore.',
    status: 'approved',
    appliedAt: '2026-08-14T10:30:00.000Z',
    reviewedBy: 'Sarah Jenkins',
    reviewComment: 'Approved. Travel reimbursement covered under Learning budget.',
    reviewedAt: '2026-08-15T09:15:00.000Z',
  },
  {
    id: 'req-002',
    employeeId: 'emp-004',
    employeeName: 'Liam Vance',
    employeeLoginId: 'DFLIVA20260003',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    leaveType: 'sick',
    startDate: '2026-08-22',
    endDate: '2026-08-24',
    daysCount: 2,
    reason: 'Acute viral fever and clinical rest prescribed by physician.',
    status: 'pending',
    appliedAt: '2026-08-22T08:00:00.000Z',
  },
  {
    id: 'req-003',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    leaveType: 'paid',
    startDate: '2026-09-01',
    endDate: '2026-09-05',
    daysCount: 5,
    reason: 'Annual family vacation and rest recharge.',
    status: 'pending',
    appliedAt: '2026-08-21T14:20:00.000Z',
  },
  {
    id: 'req-004',
    employeeId: 'emp-003',
    employeeName: 'Maya Chen',
    employeeLoginId: 'DFMYCH20260002',
    employeeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256',
    leaveType: 'casual',
    startDate: '2026-08-28',
    endDate: '2026-08-28',
    daysCount: 1,
    reason: 'Home utility maintenance & municipal registry visit.',
    status: 'pending',
    appliedAt: '2026-08-20T11:00:00.000Z',
  },
  {
    id: 'req-005',
    employeeId: 'emp-002',
    employeeName: 'John Doe',
    employeeLoginId: 'OIJODO20260001',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    leaveType: 'sick',
    startDate: '2026-07-12',
    endDate: '2026-07-13',
    daysCount: 2,
    reason: 'Dental surgery and post-op recovery.',
    status: 'approved',
    appliedAt: '2026-07-10T16:00:00.000Z',
    reviewedBy: 'Sarah Jenkins',
    reviewedAt: '2026-07-11T08:30:00.000Z',
  },
];

export const useTimeOffStore = create<TimeOffState>()(
  persist(
    (set) => ({
      requests: initialTimeOffRequests,
      filterStatus: 'all',

      addRequest: (reqData) => {
        const newReq: TimeOffRequest = {
          id: `req-${Date.now()}`,
          ...reqData,
          status: 'pending',
          appliedAt: new Date().toISOString(),
        };

        set((state) => ({
          requests: [newReq, ...state.requests],
        }));

        return newReq;
      },

      approveRequest: (id, reviewerName, comment) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'approved' as LeaveStatus,
                  reviewedBy: reviewerName,
                  reviewComment: comment || 'Approved by HR Executive.',
                  reviewedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      rejectRequest: (id, reviewerName, comment) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'rejected' as LeaveStatus,
                  reviewedBy: reviewerName,
                  reviewComment: comment || 'Declined due to team coverage requirements.',
                  reviewedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
      },

      setFilterStatus: (status) => set({ filterStatus: status }),

      resetTimeOffStore: () => {
        set({
          requests: initialTimeOffRequests,
          filterStatus: 'all',
        });
      },
    }),
    {
      name: 'dayflow-timeoff-storage',
    }
  )
);
