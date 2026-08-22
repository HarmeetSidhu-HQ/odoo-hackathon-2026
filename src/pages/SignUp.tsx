import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, User, Mail, Phone, Lock, Sparkles, ArrowRight, Shield, UserCircle, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEmployeeStore } from '../store/employeeStore';
import { generateLoginId } from '../utils/idGenerator';
import type { Role } from '../types';

const signUpSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  name: z.string().min(2, 'Full legal name is required'),
  email: z.string().email('Please enter a valid work email'),
  phone: z.string().min(8, 'Valid contact number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'employee']),
  department: z.string().min(2, 'Department is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  location: z.string().min(2, 'Location is required'),
  monthlyWage: z.coerce.number().min(10000, 'Minimum wage is ₹10,000'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onNavigateToLogin, onSignUpSuccess }) => {
  const { signup } = useAuthStore();
  const { addEmployee } = useEmployeeStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      companyName: 'Odoo India',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+91 98765 43210',
      password: 'password123',
      role: 'employee',
      department: 'Engineering',
      jobTitle: 'Senior Software Engineer',
      location: 'Bengaluru, IND',
      monthlyWage: 120000,
    },
  });

  const watchedCompany = useWatch({ control, name: 'companyName' });
  const watchedName = useWatch({ control, name: 'name' });
  const watchedRole = useWatch({ control, name: 'role' });

  // Real-time generated Login ID preview
  const liveLoginId = useMemo(() => {
    const year = new Date().getFullYear();
    return generateLoginId(watchedCompany || 'DAYFLOW', watchedName || 'USER NAME', year, 1001);
  }, [watchedCompany, watchedName]);

  const onSubmit = (data: SignUpFormData) => {
    const avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256';

    // 1. Add employee to employee store
    const createdEmp = addEmployee({
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar,
      companyName: data.companyName,
      department: data.department,
      jobTitle: data.jobTitle,
      manager: data.role === 'admin' ? 'Board' : 'Executive Lead',
      location: data.location,
      status: 'present',
      role: data.role as Role,
      monthlyWage: data.monthlyWage,
      resume: {
        jobDescription: `Team member in ${data.department} driving ${data.jobTitle} objectives.`,
        biography: 'Newly onboarded enterprise professional with verified credentials.',
        skills: ['Enterprise Ops', 'Agile Delivery', 'Domain Strategy'],
        certifications: ['Dayflow Certified Professional'],
        experienceYears: 4,
      },
      privateInfo: {
        dob: '1995-05-15',
        residingAddress: `${data.location} Corporate Corridor`,
        nationality: 'Citizen',
        gender: 'Male',
        joiningDate: new Date().toISOString().split('T')[0],
        bankDetails: {
          accountNumber: '990011223344',
          ifscCode: 'HDFC0002345',
          panNumber: 'PLMKO1234Q',
          uanNumber: '100887766554',
          bankName: 'HDFC Bank Ltd',
        },
      },
      security: {
        lastPasswordChange: new Date().toISOString().split('T')[0],
        twoFactorEnabled: true,
        activeSessionsCount: 1,
      },
    });

    // 2. Authenticate through auth store
    signup({
      companyName: data.companyName,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role as Role,
      avatar: createdEmp.avatar,
    });

    onSignUpSuccess?.();
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center p-4 sm:p-6 bg-canvas">
      <div className="w-full max-w-2xl animate-fade-in my-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-surface-border mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-mono tracking-wider text-slate-300 uppercase">
              Automated Identity Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
            Register Enterprise Member
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Instantly provision corporate credentials and automated salary structure
          </p>
        </div>

        {/* Live ID Calculation Banner */}
        <div className="mb-6 p-4 rounded-xl bg-surface-elevated border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Formula: [CC][FL][YYYY][0001]
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Live Generated Corporate ID
              </div>
            </div>
          </div>
          <div className="px-4 py-2 rounded-lg bg-canvas border border-brand-500/30 text-emerald-400 font-mono text-base font-bold tracking-wider shadow-inner">
            {liveLoginId}
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-surface rounded-xl border border-surface-border p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                System Role & RBAC Clearance
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'admin')}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all text-left cursor-pointer ${
                    watchedRole === 'admin'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-canvas border-surface-border text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Admin / HR Officer</div>
                    <div className="text-[10px] text-slate-400">Full RBAC & Salary edits</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('role', 'employee')}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all text-left cursor-pointer ${
                    watchedRole === 'employee'
                      ? 'bg-brand-500/10 border-brand-500/50 text-brand-300 ring-1 ring-brand-500/40'
                      : 'bg-canvas border-surface-border text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <UserCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">Standard Employee</div>
                    <div className="text-[10px] text-slate-400">Self-service & Attendance</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Odoo India"
                    {...register('companyName')}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                {errors.companyName && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.companyName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Employee Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    {...register('name')}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Work Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email')}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    {...register('phone')}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  {...register('department')}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
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
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Architect"
                  {...register('jobTitle')}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.jobTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Location / Office
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, IND"
                  {...register('location')}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Monthly Base Wage (₹)
                </label>
                <input
                  type="number"
                  placeholder="120000"
                  {...register('monthlyWage')}
                  className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                />
                {errors.monthlyWage && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.monthlyWage.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    {...register('password')}
                    className="w-full px-3.5 py-2.5 bg-canvas border border-surface-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400 font-mono">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 cursor-pointer"
            >
              <span>Provision Account & Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-surface-border text-center">
            <p className="text-xs text-slate-400">
              Already have an enterprise Login ID?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-brand-500 hover:text-brand-400 font-semibold transition-colors cursor-pointer"
              >
                Sign In to Systray →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
