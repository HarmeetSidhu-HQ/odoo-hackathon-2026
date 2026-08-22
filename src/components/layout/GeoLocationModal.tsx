import React, { useState } from 'react';
import { MapPin, X, Building2, Coffee, Globe } from 'lucide-react';

interface GeoLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateLocation: (mode: 'OFFICE' | 'COFFEE' | 'REMOTE') => void;
}

export const GeoLocationModal: React.FC<GeoLocationModalProps> = ({ isOpen, onClose, onSimulateLocation }) => {
  const [selected, setSelected] = useState<'OFFICE' | 'COFFEE' | 'REMOTE'>('OFFICE');

  if (!isOpen) return null;

  const handleApply = () => {
    onSimulateLocation(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-500/10 rounded-lg border border-brand-500/20">
              <MapPin className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Geo-Punch Simulator</h3>
              <p className="text-[10px] font-mono text-slate-400">Hackathon Demo Mode</p>
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
          <p className="text-xs text-slate-300">
            For demo purposes, select a mock physical location to test the Geolocation rules and Haversine Distance limits.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setSelected('OFFICE')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selected === 'OFFICE'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-canvas border-surface-border hover:bg-surface-elevated'
              }`}
            >
              <Building2 className={`w-5 h-5 ${selected === 'OFFICE' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div>
                <div className={`text-sm font-bold ${selected === 'OFFICE' ? 'text-emerald-400' : 'text-slate-200'}`}>HQ Office Lobby</div>
                <div className="text-[10px] font-mono text-slate-400">Distance: 0m (Within 150m radius)</div>
              </div>
            </button>

            <button
              onClick={() => setSelected('COFFEE')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selected === 'COFFEE'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-canvas border-surface-border hover:bg-surface-elevated'
              }`}
            >
              <Coffee className={`w-5 h-5 ${selected === 'COFFEE' ? 'text-amber-400' : 'text-slate-400'}`} />
              <div>
                <div className={`text-sm font-bold ${selected === 'COFFEE' ? 'text-amber-400' : 'text-slate-200'}`}>Nearby Coffee Shop</div>
                <div className="text-[10px] font-mono text-slate-400">Distance: 450m (Out of Bounds)</div>
              </div>
            </button>

            <button
              onClick={() => setSelected('REMOTE')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                selected === 'REMOTE'
                  ? 'bg-sky-500/10 border-sky-500/30'
                  : 'bg-canvas border-surface-border hover:bg-surface-elevated'
              }`}
            >
              <Globe className={`w-5 h-5 ${selected === 'REMOTE' ? 'text-sky-400' : 'text-slate-400'}`} />
              <div>
                <div className={`text-sm font-bold ${selected === 'REMOTE' ? 'text-sky-400' : 'text-slate-200'}`}>Remote City (Seattle, WA)</div>
                <div className="text-[10px] font-mono text-slate-400">Distance: 1245km (Remote Authorized)</div>
              </div>
            </button>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              Apply Coordinates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
