import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import type { Employee, SalaryStructure } from '../../types';
import { computeSalaryStructure, formatCurrency } from '../../utils/salaryCalculator';
import { useEmployeeStore } from '../../store/employeeStore';

interface SalaryCalculatorProps {
  employee: Employee;
  isAdmin: boolean;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({ employee, isAdmin }) => {
  const { updateEmployeeSalary } = useEmployeeStore();
  const [wageInput, setWageInput] = useState<number>(employee.salaryStructure.monthlyWage);
  const [wageType, setWageType] = useState<'monthly' | 'yearly'>('monthly');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live computed salary structure
  const structure: SalaryStructure = computeSalaryStructure(wageInput, wageType);

  const handleApplySalary = () => {
    updateEmployeeSalary(employee.id, wageInput, wageType);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-surface-elevated rounded-xl border border-surface-border">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Confidential Compensation Matrix</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          Salary structures are restricted to HR Executives and Payroll Administrators under Corporate Governance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top wage input control */}
      <div className="p-5 rounded-xl bg-surface-elevated border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Wage Basis Configuration
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust base compensation to recalculate exact statutory breakdown & deductions
            </p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="flex items-center bg-canvas p-1 rounded-lg border border-surface-border self-start">
            <button
              type="button"
              onClick={() => {
                if (wageType === 'yearly') {
                  setWageType('monthly');
                  setWageInput(Math.round(wageInput / 12));
                }
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                wageType === 'monthly'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => {
                if (wageType === 'monthly') {
                  setWageType('yearly');
                  setWageInput(Math.round(wageInput * 12));
                }
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                wageType === 'yearly'
                  ? 'bg-brand-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yearly (CTC)
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">₹</span>
            <input
              type="number"
              value={wageInput || ''}
              onChange={(e) => setWageInput(Number(e.target.value))}
              placeholder="Enter base wage..."
              className="w-full pl-8 pr-4 py-2 bg-canvas border border-surface-border rounded-lg text-white font-mono text-base font-bold focus:outline-none focus:border-brand-500 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleApplySalary}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>SAVED TO LEDGER</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>APPLY COMPENSATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-canvas border border-surface-border">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Monthly Gross
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            {formatCurrency(structure.grossMonthly)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> ₹{formatCurrency(structure.yearlyWage)} / yr
          </div>
        </div>

        <div className="p-4 rounded-xl bg-canvas border border-surface-border">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Total Deductions
          </div>
          <div className="text-xl font-bold font-mono text-rose-400 mt-1">
            - {formatCurrency(structure.totalDeductions)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            PF (12%) + PT (₹200)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-canvas border border-brand-500/40 bg-brand-500/5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-300 font-semibold">
            Net Monthly Take-Home
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(structure.netMonthly)}
          </div>
          <div className="text-[10px] text-emerald-300/70 mt-1 font-mono">
            Direct Bank Disbursal
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Ledger */}
      <div className="rounded-xl border border-surface-border overflow-hidden bg-canvas">
        <div className="px-4 py-3 bg-surface-elevated border-b border-surface-border flex items-center justify-between">
          <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Statutory Breakdown Formulas (CONTEXT.md Rule)
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Rule-based exact calculation
          </span>
        </div>

        <div className="divide-y divide-surface-border text-xs">
          {/* 1. Basic */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-surface/50">
            <div>
              <span className="font-semibold text-slate-200">Basic Salary</span>
              <span className="ml-2 font-mono text-[10px] text-slate-400">50% of Wage</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(structure.basic)}</span>
          </div>

          {/* 2. HRA */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-surface/50">
            <div>
              <span className="font-semibold text-slate-200">House Rent Allowance (HRA)</span>
              <span className="ml-2 font-mono text-[10px] text-slate-400">50% of Basic (25% Wage)</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(structure.hra)}</span>
          </div>

          {/* 3. Standard Allowance */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-surface/50">
            <div>
              <span className="font-semibold text-slate-200">Standard Allowance</span>
              <span className="ml-2 font-mono text-[10px] text-slate-400">Fixed 16.67% of Wage</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(structure.standardAllowance)}</span>
          </div>

          {/* 4. Performance Bonus */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-surface/50">
            <div>
              <span className="font-semibold text-slate-200">Performance Bonus</span>
              <span className="ml-2 font-mono text-[10px] text-slate-400">8.33% of Wage</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(structure.performanceBonus)}</span>
          </div>

          {/* 5. LTA */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-surface/50">
            <div>
              <span className="font-semibold text-slate-200">Leave Travel Allowance (LTA)</span>
              <span className="ml-2 font-mono text-[10px] text-slate-400">8.33% of Wage</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(structure.lta)}</span>
          </div>

          {/* 6. Fixed Allowance */}
          <div className="px-4 py-2.5 flex items-center justify-between hover:bg-surface/50">
            <div>
              <span className="font-semibold text-slate-200">Fixed Allowance</span>
              <span className="ml-2 font-mono text-[10px] text-slate-400">Wage - sum(components)</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(structure.fixedAllowance)}</span>
          </div>

          {/* 7. Deductions PF */}
          <div className="px-4 py-2.5 flex items-center justify-between bg-rose-500/5">
            <div>
              <span className="font-semibold text-rose-300">Provident Fund (PF)</span>
              <span className="ml-2 font-mono text-[10px] text-rose-400/70">12% of Basic</span>
            </div>
            <span className="font-mono font-bold text-rose-400">- {formatCurrency(structure.pfDeduction)}</span>
          </div>

          {/* 8. Professional Tax */}
          <div className="px-4 py-2.5 flex items-center justify-between bg-rose-500/5">
            <div>
              <span className="font-semibold text-rose-300">Professional Tax (PT)</span>
              <span className="ml-2 font-mono text-[10px] text-rose-400/70">Fixed Statutory</span>
            </div>
            <span className="font-mono font-bold text-rose-400">- {formatCurrency(structure.professionalTax)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
