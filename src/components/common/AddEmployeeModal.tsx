import React, { useState, useMemo } from 'react';
import { X, Sparkles, ArrowRight, Shield, UserCircle, CheckCircle2 } from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { generateLoginId } from '../../utils/idGenerator';
import type { Role } from '../../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee } = useEmployeeStore();

  const [companyName, setCompanyName] = useState('Dayflow Technologies');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('employee');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('San Francisco, CA (HQ)');
  const [monthlyWage, setMonthlyWage] = useState<number>(120000);
  const [manager] = useState('Sarah Jenkins');

  const liveLoginId = useMemo(() => {
    const year = new Date().getFullYear();
    return generateLoginId(companyName || 'DF', name || 'NEW USER', year, 1005);
  }, [companyName, name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addEmployee({
      name,
      email,
      phone: phone || '+1 (555) 000-0000',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
      companyName,
      department,
      jobTitle: jobTitle || 'Specialist',
      manager,
      location,
      status: 'present',
      role,
      monthlyWage,
      resume: {
        jobDescription: `Key contributor in ${department} team driving ${jobTitle || 'operational'} objectives.`,
        biography: 'Experienced specialist onboarded to Dayflow enterprise workspace.',
        skills: ['Enterprise Systems', 'Cross-functional Collaboration'],
        certifications: ['Dayflow Verified Associate'],
        experienceYears: 3,
      },
      privateInfo: {
        dob: '1995-01-01',
        residingAddress: `${location} Corporate Zone`,
        nationality: 'Citizen',
        gender: 'Male',
        joiningDate: new Date().toISOString().split('T')[0],
        bankDetails: {
          accountNumber: '998877665544',
          ifscCode: 'HDFC0003456',
          panNumber: 'ABCDE5678K',
          uanNumber: '100998877665',
          bankName: 'HDFC Bank Ltd',
        },
      },
      security: {
        lastPasswordChange: new Date().toISOString().split('T')[0],
        twoFactorEnabled: true,
        activeSessionsCount: 1,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 z-10 animate-slide-up space-y-5">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <h2 className="text-lg font-bold text-white">Provision Team Member</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new employee with automated Login ID generation & salary structure
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live ID Calculation Banner */}
        <div className="p-3.5 rounded-xl bg-canvas border border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Computed Login ID:</span>
          </div>
          <span className="px-3 py-1 rounded bg-surface-elevated border border-brand-500/30 text-emerald-400 font-mono text-sm font-bold tracking-wider">
            {liveLoginId}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
                role === 'admin'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-canvas border-surface-border text-slate-400'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Admin / HR</div>
                <div className="text-[10px] text-slate-400">Full write access</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('employee')}
              className={`p-2.5 rounded-lg border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
                role === 'employee'
                  ? 'bg-brand-500/10 border-brand-500/50 text-brand-300 ring-1 ring-brand-500/40'
                  : 'bg-canvas border-surface-border text-slate-400'
              }`}
            >
              <UserCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Standard Employee</div>
                <div className="text-[10px] text-slate-400">Self-service clearance</div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Finance & Legal">Finance & Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Lead Architect"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">Monthly Wage (₹)</label>
              <input
                type="number"
                value={monthlyWage}
                onChange={(e) => setMonthlyWage(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-elevated hover:bg-surface-hover text-xs text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold font-mono tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-brand-600/20"
            >
              <span>PROVISION IDENTITY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
