import type { SalaryStructure, TimeOffRequest, SalaryBreakdown } from '../types';

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

export function calculateDynamicSalary(
  structure: SalaryStructure,
  timeOffRequests: TimeOffRequest[],
  simulatedExtraUnpaidDays: number = 0
): SalaryBreakdown {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let W = 0;
  for(let d = 1; d <= lastDay.getDate(); d++) {
    const current = new Date(year, month, d);
    if(current.getDay() !== 0 && current.getDay() !== 6) W++;
  }

  const rBasic = structure.basic / W;
  const rGross = structure.grossMonthly / W;

  const unpaidLeaves = timeOffRequests.filter(req => 
    req.leaveType === 'unpaid' &&
    (req.status === 'approved' || req.status === 'pending')
  );

  let auditTrail: Array<{ date: string; leaveRequestId: string; reason: string }> = [];
  let dLop = simulatedExtraUnpaidDays;

  unpaidLeaves.forEach(req => {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const iter = new Date(Math.max(start.getTime(), firstDay.getTime()));
    const iterEnd = new Date(Math.min(end.getTime(), lastDay.getTime()));
    
    iter.setHours(0,0,0,0);
    iterEnd.setHours(0,0,0,0);

    while(iter <= iterEnd) {
      if(iter.getDay() !== 0 && iter.getDay() !== 6) {
        dLop++;
        auditTrail.push({
          date: iter.toISOString().split('T')[0],
          leaveRequestId: req.id,
          reason: req.reason
        });
      }
      iter.setDate(iter.getDate() + 1);
    }
  });

  if (dLop > W) dLop = W;

  const lopDeductionTotal = Math.round(dLop * rGross * 100) / 100;
  const adjustedGross = Math.max(0, structure.grossMonthly - lopDeductionTotal);

  const adjustedBasic = Math.max(0, structure.basic - (dLop * rBasic));
  
  const epfDeduction = Math.round(adjustedBasic * 0.12 * 100) / 100;
  const esiDeduction = 0;
  const professionalTax = adjustedGross > 0 ? 200 : 0;
  const tdsDeduction = 0;

  const totalDeductions = Math.round((epfDeduction + esiDeduction + professionalTax + tdsDeduction) * 100) / 100;
  const netPayable = Math.max(0, Math.round((adjustedGross - totalDeductions) * 100) / 100);

  return {
    baseGross: structure.grossMonthly,
    monthlyBasic: structure.basic,
    monthlyHRA: structure.hra,
    monthlySpecialAllowance: structure.standardAllowance + structure.fixedAllowance + structure.performanceBonus + structure.lta,
    workingDays: W,
    unpaidLeaveDays: dLop,
    perDayDeductionRate: Math.round(rGross * 100) / 100,
    lopDeductionTotal,
    adjustedGross,
    epfDeduction,
    esiDeduction,
    professionalTax,
    tdsDeduction,
    totalDeductions,
    netPayable,
    deductionAuditTrail: auditTrail,
  };
}
