import React, { useState } from 'react';
import { ShieldAlert, TrendingDown, Calendar, AlertCircle, Info } from 'lucide-react';
import type { SalaryStructure, TimeOffRequest, Employee } from '../../types';
import { calculateDynamicSalary, formatCurrency } from '../../utils/salaryCalculator';
import { useTimeOffStore } from '../../store/timeOffStore';

interface SalaryDeductionBreakdownProps {
  employee: Employee;
  isAdmin: boolean;
}

export const SalaryDeductionBreakdown: React.FC<SalaryDeductionBreakdownProps> = ({ employee, isAdmin }) => {
  const { requests } = useTimeOffStore();
  const employeeRequests = requests.filter(req => req.employeeId === employee.id);
  
  const [simulatedDays, setSimulatedDays] = useState(0);

  const breakdown = calculateDynamicSalary(employee.salaryStructure, employeeRequests, simulatedDays);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-amber-500" />
          Dynamic Payroll Engine
        </h3>
      </div>

      {isAdmin && (
        <div className="bg-surface-elevated border border-surface-border p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-brand-400" />
            <h4 className="text-sm font-semibold text-slate-200">Admin What-If Simulator</h4>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Simulate the impact of additional unpaid leave days on this month's payroll.
          </p>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="1"
              value={simulatedDays}
              onChange={(e) => setSimulatedDays(Number(e.target.value))}
              className="w-full max-w-xs accent-brand-500"
            />
            <span className="text-sm font-mono text-brand-300 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">
              +{simulatedDays} Days LOP
            </span>
          </div>
        </div>
      )}

      {/* Pay-Slip Visualizer Flow */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Base Gross */}
        <div className="flex-1 bg-canvas border border-surface-border p-4 rounded-xl flex flex-col justify-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Base Gross</span>
          <span className="text-lg font-mono font-bold text-slate-100">{formatCurrency(breakdown.baseGross)}</span>
        </div>

        {/* LOP Deduction */}
        <div className="flex-1 bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl flex flex-col justify-center relative group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300">(-) LOP ({breakdown.unpaidLeaveDays} days)</span>
            {breakdown.unpaidLeaveDays > 0 && (
              <Info className="w-4 h-4 text-rose-400 cursor-help" />
            )}
          </div>
          <span className="text-lg font-mono font-bold text-rose-400">-{formatCurrency(breakdown.lopDeductionTotal)}</span>
          
          {/* Deduction Audit Pill (Tooltip) */}
          {breakdown.unpaidLeaveDays > 0 && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-surface-elevated border border-surface-border p-3 rounded-lg shadow-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <h5 className="text-xs font-bold text-slate-200 mb-2 border-b border-surface-border pb-1">Unpaid Leave Dates</h5>
              <ul className="space-y-1">
                {breakdown.deductionAuditTrail.map((audit, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    <span className="font-mono">{audit.date}</span>
                  </li>
                ))}
                {simulatedDays > 0 && (
                  <li className="flex items-center gap-2 text-xs text-brand-300 italic mt-1 pt-1 border-t border-surface-border">
                    <ShieldAlert className="w-3 h-3" />
                    +{simulatedDays} simulated days
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Statutory Cuts */}
        <div className="flex-1 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">(-) Statutory</span>
          <span className="text-lg font-mono font-bold text-amber-400">-{formatCurrency(breakdown.totalDeductions)}</span>
          <span className="text-[10px] text-amber-400/70 font-mono mt-0.5">EPF, PT</span>
        </div>

        {/* Net Take-Home */}
        <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">(=) Net Payable</span>
          <span className="text-xl font-mono font-bold text-emerald-400">{formatCurrency(breakdown.netPayable)}</span>
        </div>
      </div>

      {breakdown.lopDeductionTotal > breakdown.baseGross && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <p className="text-xs text-rose-200">
            <strong>Warning:</strong> LOP deduction exceeds base gross earnings for this period. Net payable is capped at ₹0.
          </p>
        </div>
      )}
    </div>
  );
};
