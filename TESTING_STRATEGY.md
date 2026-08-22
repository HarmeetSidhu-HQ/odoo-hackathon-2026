# Dayflow HRMS — Testing Strategy & Quality Assurance Plan

This document outlines the testing patterns, unit test specifications, and edge-case verification strategies for Dayflow HRMS.

---

## 1. Test Coverage Hierarchy

```
+-----------------------------------------------------------------------------+
| UNIT TESTS: Formula Engines & Utilities (100% Coverage Target)             |
| - idGenerator.test.ts (Formula regex & padding verification)                |
| - salaryCalculator.test.ts (Component percentages, rounding & remainder)   |
| - calculateWorkingDays.test.ts (Weekend exclusion & boundary conditions)   |
+-----------------------------------------------------------------------------+
| INTEGRATION TESTS: Stores & RBAC Permission Boundaries                      |
| - authStore.test.ts (Simulated role switching & session hydration)          |
| - employeeStore.test.ts (Field-level mutation restrictions for employees)   |
| - attendanceStore.test.ts (Systray clock-in, timer & check-out hours)       |
| - timeOffStore.test.ts (Approval / rejection state transitions)             |
+-----------------------------------------------------------------------------+
| E2E / COMPONENT TESTS: User Flows & Workflows                               |
| - Login & Sign-up credential generation flow                                |
| - Employee Directory filtering & profile modal opening                      |
| - Admin Salary live modification and recalculation                          |
| - Time off petition submission and 1-click decision flow                    |
+-----------------------------------------------------------------------------+
```

---

## 2. Sample Vitest Unit Test Suites

### A. Automated Login ID Generation Tests (`src/utils/idGenerator.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import { generateLoginId } from './idGenerator';

describe('generateLoginId', () => {
  it('correctly formats standard company and two-word name', () => {
    // Pattern: [CC][FL][YYYY][0001]
    const id = generateLoginId('Odoo India', 'John Doe', 2026, 1);
    expect(id).toBe('OIJODO20260001');
  });

  it('pads single-digit serials with leading zeros to 4 digits', () => {
    const id = generateLoginId('Dayflow Technologies', 'Sarah Jenkins', 2026, 42);
    expect(id).toBe('DTSAJE20260042');
  });

  it('handles single-word company names by using first two letters', () => {
    const id = generateLoginId('Google', 'Alex Rivera', 2026, 999);
    expect(id).toBe('GOALRI20260999');
  });
});
```

---

### B. Salary Computation Engine Tests (`src/utils/salaryCalculator.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import { computeSalaryStructure } from './salaryCalculator';

describe('computeSalaryStructure', () => {
  it('correctly calculates breakdown for Monthly Wage of ₹100,000', () => {
    const res = computeSalaryStructure(100000, 'monthly');

    // 1. Basic (50%)
    expect(res.basic).toBe(50000);
    // 2. HRA (50% of Basic = 25% of Wage)
    expect(res.hra).toBe(25000);
    // 3. Standard Allowance (16.67%)
    expect(res.standardAllowance).toBe(16670);
    // 4. Performance Bonus (8.33%)
    expect(res.performanceBonus).toBe(8330);
    // 5. LTA (8.33%)
    expect(res.lta).toBe(8330);
    // 6. Fixed Allowance (Remainder)
    expect(res.fixedAllowance).toBe(0);
    // 7. PF Deduction (12% of Basic)
    expect(res.pfDeduction).toBe(6000);
    // 8. Professional Tax (Fixed ₹200)
    expect(res.professionalTax).toBe(200);

    // Total Deductions & Net Take Home
    expect(res.totalDeductions).toBe(6200);
    expect(res.netMonthly).toBe(93800);
  });
});
```

---

### C. Working Days Calculation Tests (`src/store/timeOffStore.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import { calculateWorkingDays } from './timeOffStore';

describe('calculateWorkingDays', () => {
  it('calculates 5 days for Monday to Friday', () => {
    // 2026-08-24 is Monday, 2026-08-28 is Friday
    const days = calculateWorkingDays('2026-08-24', '2026-08-28');
    expect(days).toBe(5);
  });

  it('excludes Saturday and Sunday from multi-week leaves', () => {
    // 2026-08-21 (Friday) to 2026-08-25 (Tuesday) -> Fri, Mon, Tue = 3 working days
    const days = calculateWorkingDays('2026-08-21', '2026-08-25');
    expect(days).toBe(3);
  });

  it('returns 1 day for single working day', () => {
    const days = calculateWorkingDays('2026-08-24', '2026-08-24');
    expect(days).toBe(1);
  });
});
```

---

## 3. RBAC Security Edge Cases
1. **Direct Tab Forgery**: If an employee user invokes `openProfileModal(emp, 'salary')`, `SalaryCalculator.tsx` renders a `Confidential Compensation Matrix` security blocker, preventing compensation exposure.
2. **Field-Level Mutation Guard**: If an employee tries to mutate `jobTitle` or `salaryStructure`, `updateEmployee` in `useEmployeeStore` rejects the payload with an explicit RBAC violation code.
