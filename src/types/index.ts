export type Role = 'admin' | 'employee';

export type EmployeeStatus = 'present' | 'absent' | 'on_leave';

export interface SalaryStructure {
  wageType: 'monthly' | 'yearly';
  monthlyWage: number;
  yearlyWage: number;
  basic: number; // 50% of Wage
  hra: number; // 50% of Basic (25% of Wage)
  standardAllowance: number; // 16.67% of Wage
  performanceBonus: number; // 8.33% of Wage
  lta: number; // 8.33% of Wage
  fixedAllowance: number; // Remainder
  pfDeduction: number; // 12% of Basic
  professionalTax: number; // Fixed 200
  grossMonthly: number;
  totalDeductions: number;
  netMonthly: number;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
  uanNumber: string;
  bankName: string;
}

export interface ResumeInfo {
  jobDescription: string;
  biography: string;
  skills: string[];
  certifications: string[];
  experienceYears: number;
}

export interface PrivateInfo {
  dob: string;
  residingAddress: string;
  nationality: string;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Other';
  joiningDate: string;
  bankDetails: BankDetails;
}

export interface SecurityInfo {
  lastPasswordChange: string;
  twoFactorEnabled: boolean;
  activeSessionsCount: number;
}

export interface LeaveBalance {
  paid: number;
  sick: number;
  casual: number;
  usedPaid: number;
  usedSick: number;
  usedCasual: number;
}

export interface Employee {
  id: string;
  loginId: string; // e.g. OIJODO20260001
  name: string;
  email: string;
  phone: string;
  avatar: string;
  companyName: string;
  companyLogo?: string;
  department: string;
  jobTitle: string;
  manager: string;
  location: string;
  status: EmployeeStatus;
  role: Role;
  resume: ResumeInfo;
  privateInfo: PrivateInfo;
  salaryStructure: SalaryStructure;
  security: SecurityInfo;
  leaveBalance: LeaveBalance;
}

export interface User {
  id: string;
  loginId: string;
  name: string;
  email: string;
  role: Role;
  companyName: string;
  avatar: string;
  employeeId: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'on_leave' | 'half_day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeLoginId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  extraHours: number;
  status: AttendanceStatus;
}

export type LeaveType = 'paid' | 'sick' | 'unpaid' | 'casual';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeLoginId: string;
  employeeAvatar: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewComment?: string;
  reviewedAt?: string;
}

export interface SystrayState {
  isCheckedIn: boolean;
  checkInTime: string | null;
  activeTimer: string;
  activeAttendanceId: string | null;
}