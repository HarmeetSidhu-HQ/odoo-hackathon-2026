import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  FileText, 
  Lock, 
  DollarSign, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Check, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';
import { SalaryCalculator } from './SalaryCalculator';
import { ProfileResumeTab } from './ProfileResumeTab';
import { ProfilePrivateTab } from './ProfilePrivateTab';
import { ProfileSecurityTab } from './ProfileSecurityTab';
import type { Employee, Role } from '../../types';

export const ProfileModal: React.FC = () => {
  const { 
    selectedEmployee, 
    isProfileModalOpen, 
    closeProfileModal, 
    activeProfileTab, 
    setActiveProfileTab,
    updateEmployee
  } = useEmployeeStore();

  const { currentUser } = useAuthStore();

  const [formData, setFormData] = useState<Employee | null>(selectedEmployee);
  const [saveStatus, setSaveStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  useEffect(() => {
    setFormData(selectedEmployee);
  }, [selectedEmployee]);

  if (!isProfileModalOpen || !selectedEmployee || !formData) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isOwnProfile = currentUser?.employeeId === selectedEmployee.id || currentUser?.loginId === selectedEmployee.loginId;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const result = updateEmployee(selectedEmployee.id, formData, currentUser.role as Role);
    if (result.success) {
      setSaveStatus({ type: 'success', message: 'Employee profile updated successfully.' });
      setTimeout(() => setSaveStatus({ type: 'idle' }), 3000);
    } else {
      setSaveStatus({ type: 'error', message: result.error || 'Failed to update employee.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="fixed inset-0"
        onClick={closeProfileModal}
      />

      <div className="relative w-full max-w-4xl bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-slide-up">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-surface-elevated border-b border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-surface-border shadow-md"
              />
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface ${
                formData.status === 'present' 
                  ? 'bg-emerald-500' 
                  : formData.status === 'on_leave' 
                  ? 'bg-sky-500' 
                  : 'bg-amber-500'
              }`} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{formData.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-mono font-bold">
                  {formData.loginId}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                  formData.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700/40 text-slate-300'
                }`}>
                  {formData.role}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                <span className="text-slate-300 font-medium">{formData.jobTitle}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  {formData.department} ({formData.companyName})
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {formData.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={closeProfileModal}
              className="p-2 rounded-lg bg-surface border border-surface-border text-slate-400 hover:text-white hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-surface-elevated/50 border-b border-surface-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveProfileTab('resume')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeProfileTab === 'resume'
                ? 'border-brand-500 text-white bg-surface rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-brand-400" />
            <span>Resume & Skills</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab('private')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeProfileTab === 'private'
                ? 'border-brand-500 text-white bg-surface rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span>Private & Banking</span>
          </button>

          {/* RBAC Protected Tab: Salary Info */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setActiveProfileTab('salary')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeProfileTab === 'salary'
                  ? 'border-emerald-500 text-white bg-surface rounded-t-lg'
                  : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Salary Info</span>
              <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300">
                ADMIN
              </span>
            </button>
          ) : (
            <div 
              title="Restricted to Admin & HR"
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed opacity-50 whitespace-nowrap"
            >
              <Lock className="w-3 h-3" />
              <span>Salary (Restricted)</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setActiveProfileTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeProfileTab === 'security'
                ? 'border-brand-500 text-white bg-surface rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Security & Sessions</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto flex-1 bg-surface space-y-6">
          {saveStatus.type === 'success' && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-slide-up">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{saveStatus.message}</span>
            </div>
          )}

          {saveStatus.type === 'error' && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{saveStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {activeProfileTab === 'resume' && (
              <ProfileResumeTab
                formData={formData}
                setFormData={setFormData as React.Dispatch<React.SetStateAction<Employee>>}
                isAdmin={isAdmin}
                isOwnProfile={isOwnProfile}
              />
            )}

            {activeProfileTab === 'private' && (
              <ProfilePrivateTab
                formData={formData}
                setFormData={setFormData as React.Dispatch<React.SetStateAction<Employee>>}
                isAdmin={isAdmin}
              />
            )}

            {activeProfileTab === 'salary' && (
              <div className="animate-fade-in">
                <SalaryCalculator employee={selectedEmployee} isAdmin={isAdmin} />
              </div>
            )}

            {activeProfileTab === 'security' && (
              <ProfileSecurityTab formData={formData} />
            )}

            {/* Footer controls */}
            <div className="pt-4 border-t border-surface-border flex items-center justify-between">
              <div className="text-xs text-slate-500 font-mono">
                {isAdmin
                  ? '⚡ Admin Clearance: Full read/write matrix'
                  : '🔒 Employee Clearance: Limited self-service'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeProfileModal}
                  className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold font-mono tracking-wider flex items-center gap-2 shadow-md shadow-brand-600/20 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>SAVE CHANGES</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
