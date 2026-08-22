# Dayflow HRMS — Architecture & System Design Document

## 1. System Overview
Dayflow HRMS is an enterprise-grade, high-density Human Resource Management System built with React 19, TypeScript (Strict Mode), Tailwind CSS, and Zustand. The application is architected around strict Role-Based Access Control (RBAC), client-side state persistence with atomic mutations, and automated enterprise calculations for identity provisioning, attendance tracking, and statutory salary breakdowns.

```
+-----------------------------------------------------------------------------------+
|                               DAYFLOW HRMS APP SHELL                             |
+-----------------------------------------------------------------------------------+
|  +-----------------------------------------------------------------------------+  |
|  | GLOBAL PERSISTED NAVBAR                                                     |  |
|  | - Identity Logo & Org Badge                                                  |  |
|  | - Module Switcher [Employees | Attendance | Time Off]                       |  |
|  | - Interactive Check-In/Out Systray (Active Timer + Red/Green Indicators)    |  |
|  | - Global Search & Role Switcher Simulator [Admin/HR <-> Employee]           |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | ROUTE VIEW CONTAINER                                                        |  |
|  |                                                                             |  |
|  | [Employees Module]         [Attendance Module]        [Time Off Module]     |  |
|  | - Workforce KPI Badges     - Employee Log Ledger      - Balance Cards       |  |
|  | - Multi-Filter Grid        - Admin Daily Ledger       - Dynamic Day Counter |  |
|  | - Status Badges (🟢/🟡/✈️) - Date Navigator (< / >)    - Live Approval Queue |  |
|  | - Provision Member Modal   - Manual Punch Modal       - 1-Click Decisions   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | TABBED PROFILE MODAL (RBAC Enforced)                                        |  |
|  | [Resume] | [Private Info] | [Salary Info - ADMIN ONLY] | [Security & 2FA]    |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Component Hierarchy & Module Breakdown

```
src/
├── main.tsx                         # React 19 concurrent entry root
├── App.tsx                          # App Shell, Auth state gate & View Router
├── index.css                        # Tailwind directives & dark palette tokens
├── types/
│   └── index.ts                     # Strict TypeScript interfaces & models
├── utils/
│   ├── idGenerator.ts               # Enterprise Login ID generator: [CC][FL][YYYY][0001]
│   └── salaryCalculator.ts          # Pure salary math engine & statutory deductions
├── store/
│   ├── authStore.ts                 # Auth session, simulated roles & localStorage
│   ├── employeeStore.ts             # Employee directory, CRUD & field-level RBAC
│   ├── attendanceStore.ts           # Daily punches, systray timer & history ledger
│   └── timeOffStore.ts              # Balance ledger, working-day math & authorization
├── data/
│   └── mockEmployees.ts             # Rich seed dataset with realistic enterprise personas
├── components/
│   ├── layout/
│   │   └── Navbar.tsx               # Persistent top nav, live systray pill & role toggle
│   ├── auth/
│   │   └── ProtectedRoute.tsx       # RBAC clearance wrapper component
│   ├── profile/
│   │   ├── ProfileModal.tsx         # Tabbed profile viewer with RBAC gating
│   │   ├── ProfileResumeTab.tsx     # Role scope, bio, skills & certifications tags
│   │   ├── ProfilePrivateTab.tsx    # Address, contact & banking details (PAN, IFSC, UAN)
│   │   ├── ProfileSecurityTab.tsx   # 2FA status, password reset & node sessions
│   │   └── SalaryCalculator.tsx     # Admin-only interactive live compensation engine
│   ├── attendance/
│   │   └── ManualAttendanceModal.tsx# Retroactive attendance logging & punch adjustments
│   ├── timeoff/
│   │   └── ApplyLeaveModal.tsx      # Dynamic working-day calculation leave application
│   └── common/
│       └── AddEmployeeModal.tsx     # Quick workforce member onboarding modal
└── pages/
    ├── Login.tsx                    # Login ID or Email auth with demo quick-switchers
    ├── SignUp.tsx                   # Provisioning form with live formula preview
    ├── Employees.tsx                # High-density workforce directory grid & filters
    ├── Attendance.tsx               # Split Employee summary log vs. Admin company ledger
    └── TimeOff.tsx                  # Split Employee balance cards vs. Admin approval queue
```

---

## 3. State Management & Persistence Flow

All state is managed via **Zustand** stores with localStorage hydration:

1. `useAuthStore` (`dayflow-auth-storage`):
   - Current logged-in identity (`User`) and authentication token state.
   - Real-time role switching simulator for toggling between `admin` (Sarah Jenkins) and `employee` (John Doe).
2. `useEmployeeStore` (`dayflow-employees-storage`):
   - Complete workforce roster with rich nested resume, private, salary, and security metadata.
   - Enforces field-level edit restrictions based on active user role.
3. `useAttendanceStore` (`dayflow-attendance-storage`):
   - Global ledger records, daily work hours calculation, and live check-in timestamp.
   - Synchronizes navbar systray pill with attendance ledger rows.
4. `useTimeOffStore` (`dayflow-timeoff-storage`):
   - Time-off applications with reviewer stamps, working-day calculations, and instant approvals.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Feature / Data Entity | Standard Employee | Admin / HR Executive | Enforcement Layer |
| :--- | :---: | :---: | :--- |
| **Workforce Directory Inspection** | Read-Only | Read + Write | UI & Store |
| **Provision New Member** | ❌ Blocked | ✅ Allowed | UI & Store |
| **Self-Service Profile Edit** | Phone, Address, Avatar | All Fields | `useEmployeeStore` |
| **Salary Info Tab** | ❌ Strictly Hidden | ✅ Full Calculator | `ProfileModal` & RBAC Check |
| **Salary Compensation Adjustment** | ❌ Blocked | ✅ Live Recalculation | `updateEmployeeSalary` |
| **Clock-In / Clock-Out** | ✅ Own Session | ✅ Own Session | `Navbar` & `attendanceStore` |
| **Manual Punch Adjustment** | ❌ Blocked | ✅ Company-wide | `ManualAttendanceModal` |
| **Apply for Leave** | ✅ Self | ✅ Self | `ApplyLeaveModal` |
| **Approve / Reject Leave Queue** | ❌ Blocked | ✅ 1-Click Actions | `TimeOff.tsx` |

---

## 5. Automated Algorithms & Math Engines

### A. Enterprise Login ID Formula
$$\text{LoginID} = [\text{CC}][\text{FL}][\text{YYYY}][\text{Serial}]$$
- **Company Code (CC)**: First 2 uppercase letters of company name (e.g., `Odoo India` $\rightarrow$ `OI`).
- **First & Last Name (FL)**: First 2 letters of first name + first 2 letters of last name (e.g., `John Doe` $\rightarrow$ `JODO`).
- **Year (YYYY)**: 4-digit onboarding year (e.g., `2026`).
- **Serial (4 digits)**: Zero-padded serial index (e.g., `0001`).
- *Result*: `OIJODO20260001`.

### B. Statutory Compensation Breakdown
Given a Monthly Base Wage $W$:
- **Basic Salary**: $B = 0.50 \times W$
- **House Rent Allowance (HRA)**: $0.50 \times B = 0.25 \times W$
- **Standard Allowance**: $0.1667 \times W$
- **Performance Bonus**: $0.0833 \times W$
- **Leave Travel Allowance (LTA)**: $0.0833 \times W$
- **Fixed Allowance**: $W - (B + \text{HRA} + \text{Standard} + \text{Bonus} + \text{LTA})$
- **Provident Fund (PF)**: $0.12 \times B$
- **Professional Tax (PT)**: Fixed ₹200 (if $W > 0$)
- **Net Disbursal Take-Home**: $W - (\text{PF} + \text{PT})$
