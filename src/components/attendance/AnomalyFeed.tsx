import React, { useState } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AnomalyTriageModal } from './AnomalyTriageModal';
import type { AttendanceAnomaly } from '../../types';

export const AnomalyFeed: React.FC = () => {
  const { anomalies } = useAttendanceStore();
  const [selectedAnomaly, setSelectedAnomaly] = useState<AttendanceAnomaly | null>(null);

  const activeAnomalies = anomalies.filter(a => !a.isResolved);

  if (activeAnomalies.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Alert Banner */}
      <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg flex items-center justify-between shadow-[0_0_15px_rgba(244,63,94,0.1)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-rose-200">
            ⚠️ {activeAnomalies.length} Attendance Anomal{activeAnomalies.length === 1 ? 'y' : 'ies'} Detected Today [Review Queue]
          </h3>
        </div>
      </div>

      {/* Horizontal Scrollable Feed */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {activeAnomalies.map(anomaly => (
          <button
            key={anomaly.id}
            onClick={() => setSelectedAnomaly(anomaly)}
            className="flex-shrink-0 w-72 p-3 text-left bg-surface-elevated hover:bg-surface-hover border border-surface-border rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border
                ${anomaly.severity === 'HIGH' || anomaly.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                  anomaly.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-sky-500/10 text-sky-400 border-sky-500/20'}
              `}>
                {anomaly.severity}
              </span>
              <span className="text-[10px] font-mono text-slate-400">Score: {anomaly.score}</span>
            </div>
            
            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">
              {anomaly.title}
            </h4>
            <p className="text-xs text-slate-400 mb-2 truncate">
              {anomaly.employeeName}
            </p>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
              <span className="text-[10px] font-mono text-brand-400">Review Required</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
            </div>
          </button>
        ))}
      </div>

      <AnomalyTriageModal 
        anomaly={selectedAnomaly} 
        isOpen={!!selectedAnomaly} 
        onClose={() => setSelectedAnomaly(null)} 
      />
    </div>
  );
};
