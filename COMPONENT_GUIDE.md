# Dayflow HRMS — Component Guide & Design Tokens

This document details the UI design tokens, component interfaces, state bindings, and accessibility patterns across Dayflow HRMS.

---

## 1. Design Tokens & Styling Rules

| Category | Token / Class | Hex / Value | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-canvas` | `#0B0F17` | Main viewport & layout container |
| **Surface Surface** | `bg-surface` | `#111827` | Primary card & panel background |
| **Elevated Surface** | `bg-surface-elevated` | `#161F30` | Modals, table headers, elevated cards |
| **Crisp Border** | `border-surface-border`| `#1F2937` | 1px data boundaries & card borders |
| **Brand Accent** | `bg-brand-600` | `#2563EB` | Primary actions, CTA buttons, active state |
| **Present Status** | `bg-emerald-500` | `#10B981` | In-office status dot, Approved state |
| **Absent Status** | `bg-amber-500` | `#F59E0B` | Absent status dot, Pending approval |
| **Checked-out Status**| `bg-rose-500` | `#F43F5E` | Checked-out systray dot, Reject action |
| **Leave Status** | `bg-sky-500` | `#0EA5E9` | On-leave status dot, Time-off badges |
| **Primary Typography**| `font-sans` | `Outfit` | Headings, button text, body labels |
| **Monospace Data** | `font-mono` | `JetBrains Mono` | Numerical figures, Login IDs, currencies |

---

## 2. Component Catalog

### `Navbar` (`src/components/layout/Navbar.tsx`)
Persistent global navigation shell.
- **Props**:
  - `currentTab: 'employees' | 'attendance' | 'timeoff'`
  - `onTabChange: (tab: 'employees' | 'attendance' | 'timeoff') => void`
- **Features**:
  - Module switcher with live badge counts.
  - Interactive Systray Check-in/Out pill with live ticking stopwatch (`Since HH:MM AM/PM`).
  - Global search input with instant clear.
  - Profile menu dropdown with one-click Role Switching (`Admin/HR` vs `Employee`).

---

### `ProfileModal` (`src/components/profile/ProfileModal.tsx`)
Multi-tab modal for comprehensive employee inspection and editing.
- **Tabs**:
  1. `Resume`: Job scope, bio, skill tags (add/remove), certifications.
  2. `Private Info`: Residing address, phone, avatar, DOB, nationality, and bank info.
  3. `Salary Info`: **Admin Only**. Renders `SalaryCalculator`.
  4. `Security`: 2FA status, password reset, active node sessions.
- **RBAC Behavior**:
  - Regular employees cannot access the `Salary Info` tab.
  - Regular employees can only self-edit `phone`, `residingAddress`, and `avatar`.

---

### `SalaryCalculator` (`src/components/profile/SalaryCalculator.tsx`)
Real-time automated salary decomposition engine.
- **Props**:
  - `employee: Employee`
  - `isAdmin: boolean`
- **Calculations**:
  - Basic Salary ($50\%$), HRA ($50\%$ of Basic), Standard Allowance ($16.67\%$), Performance Bonus ($8.33\%$), LTA ($8.33\%$), Fixed Allowance (remainder), PF ($12\%$), Professional Tax (₹200).

---

### `ManualAttendanceModal` (`src/components/attendance/ManualAttendanceModal.tsx`)
Allows Admin/HR officers to manually insert or adjust daily punch records for any team member.
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`

---

### `ApplyLeaveModal` (`src/components/timeoff/ApplyLeaveModal.tsx`)
Interactive leave petition creator with live working-day computation (excluding weekends).
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`

---

### `AddEmployeeModal` (`src/components/common/AddEmployeeModal.tsx`)
Admin modal for provisioning new organization members with automated Login ID generation preview.
- **Props**:
  - `isOpen: boolean`
  - `onClose: () => void`

---

## 3. Accessibility & Keyboard Navigation (WCAG 2.1 AAA)
- All interactive buttons have explicit focus rings and keyboard trigger support (`Enter` / `Space`).
- Modals support closing via `ESC` key and outside backdrop clicks.
- Monospace figures utilize tabular lining (`font-feature-settings: "tnum" 1`) for high readability.
- High contrast color ratios exceeding 7:1 against dark `#0B0F17` surfaces.
