import type { SalaryStructure } from '../types';

export function computeSalaryStructure(wage: number, wageType: 'monthly' | 'yearly' = 'monthly'): SalaryStructure {
  const validWage = Math.max(0, wage || 0);
  const monthlyWage = wageType === 'yearly' ? Math.round((validWage / 12) * 100) / 100 : validWage;
  const yearlyWage = wageType === 'monthly' ? Math.round(validWage * 12 * 100) / 100 : validWage;

  // Calculations based on Monthly Wage
  // 1. Basic: 50% of Wage
  const basic = Math.round(monthlyWage * 0.50 * 100) / 100;

  // 2. HRA: 50% of Basic (25% of Wage)
  const hra = Math.round(basic * 0.50 * 100) / 100;

  // 3. Standard Allowance: 16.67% of Wage
  const standardAllowance = Math.round(monthlyWage * 0.1667 * 100) / 100;

  // 4. Performance Bonus: 8.33% of Wage
  const performanceBonus = Math.round(monthlyWage * 0.0833 * 100) / 100;

  // 5. LTA: 8.33% of Wage
  const lta = Math.round(monthlyWage * 0.0833 * 100) / 100;

  // 6. Fixed Allowance: Remainder (Wage - sum of components)
  const computedSum = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, Math.round((monthlyWage - computedSum) * 100) / 100);

  // 7. Deductions
  // PF: 12% of Basic
  const pfDeduction = Math.round(basic * 0.12 * 100) / 100;
  // Professional Tax: Fixed ₹200 (if wage > 0, else 0)
  const professionalTax = monthlyWage > 0 ? 200 : 0;

  const grossMonthly = monthlyWage;
  const totalDeductions = Math.round((pfDeduction + professionalTax) * 100) / 100;
  const netMonthly = Math.max(0, Math.round((grossMonthly - totalDeductions) * 100) / 100);

  return {
    wageType,
    monthlyWage,
    yearlyWage,
    basic,
    hra,
    standardAllowance,
    performanceBonus,
    lta,
    fixedAllowance,
    pfDeduction,
    professionalTax,
    grossMonthly,
    totalDeductions,
    netMonthly,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
