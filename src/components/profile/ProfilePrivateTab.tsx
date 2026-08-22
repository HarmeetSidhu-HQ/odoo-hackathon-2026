import React from 'react';
import { Phone, MapPin, Lock, CreditCard } from 'lucide-react';
import type { Employee } from '../../types';

interface ProfilePrivateTabProps {
  formData: Employee;
  setFormData: React.Dispatch<React.SetStateAction<Employee>>;
  isAdmin: boolean;
}

export const ProfilePrivateTab: React.FC<ProfilePrivateTabProps> = ({
  formData,
  setFormData,
  isAdmin,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Contact Phone
            </label>
            <span className="text-[10px] font-mono text-emerald-400">Self-Service OK</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
            <Phone className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Residing Address */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Residing Address
            </label>
            <span className="text-[10px] font-mono text-emerald-400">Self-Service OK</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={formData.privateInfo.residingAddress}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privateInfo: {
                    ...formData.privateInfo,
                    residingAddress: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
            />
            <MapPin className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
          </div>
        </div>

        {/* Avatar URL */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Avatar Image URL
            </label>
            <span className="text-[10px] font-mono text-emerald-400">Self-Service OK</span>
          </div>
          <input
            type="text"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {/* DOB (Admin Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Date of Birth
            </label>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500" />}
          </div>
          <input
            type="date"
            disabled={!isAdmin}
            value={formData.privateInfo.dob}
            onChange={(e) =>
              setFormData({
                ...formData,
                privateInfo: { ...formData.privateInfo, dob: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Nationality (Admin Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Nationality
            </label>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500" />}
          </div>
          <input
            type="text"
            disabled={!isAdmin}
            value={formData.privateInfo.nationality}
            onChange={(e) =>
              setFormData({
                ...formData,
                privateInfo: { ...formData.privateInfo, nationality: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Gender (Admin Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Gender Designation
            </label>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500" />}
          </div>
          <select
            disabled={!isAdmin}
            value={formData.privateInfo.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                privateInfo: {
                  ...formData.privateInfo,
                  gender: e.target.value as any,
                },
              })
            }
            className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Joining Date (Admin Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase text-slate-300 font-medium">
              Joining Date
            </label>
            {!isAdmin && <Lock className="w-3 h-3 text-slate-500" />}
          </div>
          <input
            type="date"
            disabled={!isAdmin}
            value={formData.privateInfo.joiningDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                privateInfo: { ...formData.privateInfo, joiningDate: e.target.value },
              })
            }
            className="w-full px-3 py-2 bg-canvas border border-surface-border rounded-lg text-xs text-white focus:outline-none focus:border-brand-500 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Bank Details Section */}
      <div className="p-4 rounded-xl bg-canvas border border-surface-border space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-white font-mono uppercase">
              Disbursal & Statutory Banking
            </span>
          </div>
          {!isAdmin && (
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> HR Controlled
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Bank Name
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={formData.privateInfo.bankDetails.bankName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privateInfo: {
                    ...formData.privateInfo,
                    bankDetails: {
                      ...formData.privateInfo.bankDetails,
                      bankName: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Account Number
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={formData.privateInfo.bankDetails.accountNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privateInfo: {
                    ...formData.privateInfo,
                    bankDetails: {
                      ...formData.privateInfo.bankDetails,
                      accountNumber: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={formData.privateInfo.bankDetails.ifscCode}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privateInfo: {
                    ...formData.privateInfo,
                    bankDetails: {
                      ...formData.privateInfo.bankDetails,
                      ifscCode: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white font-mono disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              PAN Number
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={formData.privateInfo.bankDetails.panNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privateInfo: {
                    ...formData.privateInfo,
                    bankDetails: {
                      ...formData.privateInfo.bankDetails,
                      panNumber: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white font-mono disabled:opacity-60"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              UAN (Universal Account Number)
            </label>
            <input
              type="text"
              disabled={!isAdmin}
              value={formData.privateInfo.bankDetails.uanNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  privateInfo: {
                    ...formData.privateInfo,
                    bankDetails: {
                      ...formData.privateInfo.bankDetails,
                      uanNumber: e.target.value,
                    },
                  },
                })
              }
              className="w-full px-3 py-1.5 bg-surface border border-surface-border rounded-lg text-xs text-white font-mono disabled:opacity-60"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
