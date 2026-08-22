import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, Zap, Calendar, X, Check, FileText, Settings2 } from 'lucide-react';
import type { AttendanceAnomaly } from '../../types';
import { useAttendanceStore } from '../../store/attendanceStore';

interface AnomalyTriageModalProps {
  anomaly: AttendanceAnomaly | null;
  isOpen: boolean;
  onClose: () => void;
}

const severityConfig = {
  LOW: { color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  HIGH: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  CRITICAL: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const getIcon = (type: string) => {
  switch (type) {
    case 'GHOST_PUNCH': return <ShieldAlert className="w-5 h-5" />;
    case 'RAPID_BOUNCE': return <Zap className="w-5 h-5" />;
    case 'TIME_DRIFT': return <Clock className="w-5 h-5" />;
    case 'EXCESSIVE_HOURS': return <Clock className="w-5 h-5" />;
    case 'OFF_HOURS_PUNCH': return <Calendar className="w-5 h-5" />;
    default: return <AlertTriangle className="w-5 h-5" />;
  }
};

export const AnomalyTriageModal: React.FC<AnomalyTriageModalProps> = ({ anomaly, isOpen, onClose }) => {
  const { resolveAnomaly } = useAttendanceStore();

  if (!isOpen || !anomaly) return null;

  const config = severityConfig[anomaly.severity];

  const handleAction = (actionType: string) => {
    resolveAnomaly(anomaly.id, actionType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className={`p-4 border-b border-surface-border flex items-start justify-between ${config.bg}`}>
          <div className="flex gap-3">
            <div className={`p-2 rounded-lg bg-surface-elevated border border-surface-border ${config.color}`}>
              {getIcon(anomaly.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{anomaly.title}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${config.color} ${config.bg} ${config.border}`}>
                  {anomaly.severity}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{anomaly.employeeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-surface-elevated border border-surface-border rounded-lg">
            <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-1">Engine Analysis</h4>
            <p className="text-sm text-slate-200">{anomaly.description}</p>
            <div className="mt-3 text-[10px] font-mono text-brand-400 flex items-center gap-1">
              <Settings2 className="w-3 h-3" />
              Anomaly Score: {anomaly.score}/100
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase text-slate-400 mb-2">Triage Actions</h4>
            
            <button
              onClick={() => handleAction('ACKNOWLEDGE_OVERTIME')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-400">Acknowledge (Safe)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Mark as authorized overtime or valid shift.</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('REQUEST_EXPLANATION')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-md bg-sky-500/20 text-sky-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-sky-400">Request Employee Explanation</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Send a ping requesting a reason for this anomaly.</div>
              </div>
            </button>

            <button
              onClick={() => handleAction('AUTO_ADJUST')}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors text-left"
            >
              <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
                <Settings2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-400">Auto-Adjust Hours</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Truncate shift to standard 8 hours or fix ghost punch.</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
