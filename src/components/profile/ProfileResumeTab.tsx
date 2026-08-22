import React, { useState } from 'react';
import { Plus, X, Trash2, Shield } from 'lucide-react';
import type { Employee } from '../../types';

interface ProfileResumeTabProps {
  formData: Employee;
  setFormData: React.Dispatch<React.SetStateAction<Employee>>;
  isAdmin: boolean;
  isOwnProfile: boolean;
}

export const ProfileResumeTab: React.FC<ProfileResumeTabProps> = ({
  formData,
  setFormData,
  isAdmin,
  isOwnProfile,
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setFormData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        skills: [...prev.resume.skills, newSkill.trim()],
      },
    }));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    if (!isAdmin && !isOwnProfile) return;
    setFormData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        skills: prev.resume.skills.filter((_, i) => i !== index),
      },
    }));
  };

  const addCert = () => {
    if (!newCert.trim()) return;
    setFormData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        certifications: [...prev.resume.certifications, newCert.trim()],
      },
    }));
    setNewCert('');
  };

  const removeCert = (index: number) => {
    if (!isAdmin) return;
    setFormData((prev) => ({
      ...prev,
      resume: {
        ...prev.resume,
        certifications: prev.resume.certifications.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-medium">
          Role & Job Scope
        </label>
        <textarea
          rows={2}
          disabled={!isAdmin}
          value={formData.resume.jobDescription}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              resume: { ...prev.resume, jobDescription: e.target.value },
            }))
          }
          className="w-full p-3 bg-canvas border border-surface-border rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5 font-medium">
          Professional Biography
        </label>
        <textarea
          rows={3}
          disabled={!isAdmin}
          value={formData.resume.biography}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              resume: { ...prev.resume, biography: e.target.value },
            }))
          }
          className="w-full p-3 bg-canvas border border-surface-border rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* Skills Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-mono uppercase text-slate-300 font-medium">
            Technical & Operational Competencies
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            {formData.resume.skills.length} skills listed
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {formData.resume.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-elevated border border-surface-border text-xs text-slate-200 font-mono"
            >
              <span>{skill}</span>
              {(isAdmin || isOwnProfile) && (
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {(isAdmin || isOwnProfile) && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. React 19, Kubernetes)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="flex-1 px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs text-brand-400 font-mono cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        )}
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-xs font-mono uppercase text-slate-300 mb-2 font-medium">
          Accreditations & Certifications
        </label>
        <div className="space-y-2">
          {formData.resume.certifications.map((cert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2.5 rounded-lg bg-canvas border border-surface-border text-xs text-slate-300"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{cert}</span>
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => removeCert(index)}
                  className="text-slate-500 hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Add certification (e.g. AWS Solutions Architect)..."
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCert();
                }
              }}
              className="flex-1 px-3 py-1.5 bg-canvas border border-surface-border rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono"
            />
            <button
              type="button"
              onClick={addCert}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs text-emerald-400 font-mono cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
