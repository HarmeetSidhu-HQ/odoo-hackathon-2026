import React, { useState, useEffect } from 'react';
import { Play, Square, MapPin, Loader2, Globe, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { GeoLocationModal } from './GeoLocationModal';
import { validatePunchLocation, HQ_OFFICE_ZONE } from '../../utils/geoUtils';
import type { GeoCoordinates } from '../../types';

export const GeoPunchButton: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { isCheckedIn, checkInTimestamp, toggleCheckIn } = useAttendanceStore();

  const [isLocating, setIsLocating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  // Live timer tick for Check-in
  useEffect(() => {
    if (!isCheckedIn || !checkInTimestamp) {
      setElapsedTime('00:00:00');
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(checkInTimestamp).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - startTime);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTimestamp]);

  const handleSystrayAction = async (simulatedMode?: 'OFFICE' | 'COFFEE' | 'REMOTE') => {
    if (!currentUser) return;
    
    // If checking out, we don't strictly need a verified location block, 
    // but in a real app we might. For now, just checkout.
    if (isCheckedIn) {
      toggleCheckIn(currentUser.employeeId, currentUser.name, currentUser.loginId);
      return;
    }

    setIsLocating(true);

    try {
      let coords: GeoCoordinates;

      if (simulatedMode) {
        // Mock the coordinates based on simulator choice
        await new Promise(resolve => setTimeout(resolve, 800)); // fake delay
        if (simulatedMode === 'OFFICE') {
          coords = { latitude: 37.7749, longitude: -122.4194, accuracyMeters: 5 };
        } else if (simulatedMode === 'COFFEE') {
          coords = { latitude: 37.7780, longitude: -122.4200, accuracyMeters: 10 }; // ~350m away
        } else {
          coords = { latitude: 47.6062, longitude: -122.3321, accuracyMeters: 15 }; // Seattle
        }
      } else {
        // Real HTML5 Geolocation
        coords = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
          }
          navigator.geolocation.getCurrentPosition(
            pos => resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracyMeters: pos.coords.accuracy
            }),
            err => reject(err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        });
      }

      const isRemoteEmployee = simulatedMode === 'REMOTE';
      const validation = validatePunchLocation(coords, HQ_OFFICE_ZONE, isRemoteEmployee);

      if (validation.punchMode === 'OUT_OF_BOUNDS') {
        alert(`Location blocked: You are ${validation.distanceMeters}m away from the office zone, which exceeds the ${HQ_OFFICE_ZONE.radiusMeters}m radius.`);
        setIsLocating(false);
        return; // Prevent check-in
      }

      // Proceed with Check-in
      toggleCheckIn(currentUser.employeeId, currentUser.name, currentUser.loginId, {
        status: validation.verificationStatus === 'VERIFIED' 
          ? (validation.punchMode === 'OFFICE' ? 'OFFICE_VERIFIED' : 'REMOTE_VERIFIED') 
          : 'UNVERIFIED',
        zone: validation.zoneName || 'Remote'
      });

    } catch (err) {
      console.warn('Geolocation failed', err);
      // Fallback behavior if location is denied or times out
      alert('Location access denied or unavailable. Falling back to Unverified Punch.');
      toggleCheckIn(currentUser.employeeId, currentUser.name, currentUser.loginId, {
        status: 'UNVERIFIED',
        zone: 'Unknown'
      });
    } finally {
      setIsLocating(false);
    }
  };

  const checkInTimeFormatted = checkInTimestamp
    ? new Date(checkInTimestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '09:00 AM';

  return (
    <>
      <div className="flex items-center gap-2 p-1 pl-2.5 rounded-lg bg-canvas border border-surface-border shadow-inner">
        {isCheckedIn ? (
          <>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-[10px] font-mono text-emerald-400 leading-tight">
                  Since {checkInTimeFormatted}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-200 tracking-wider">
                  {elapsedTime}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleSystrayAction()}
              title="Check out of work session"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer group"
            >
              <Square className="w-3 h-3 text-rose-400 fill-rose-400 group-hover:scale-110 transition-transform" />
              <span>Check Out &rarr;</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {isLocating ? (
                <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
              ) : (
                <MapPin className="w-3 h-3 text-slate-400" />
              )}
              <span className="text-xs font-mono text-slate-400 hidden xl:inline">
                {isLocating ? 'Locating...' : 'Checked Out'}
              </span>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              disabled={isLocating}
              title="Simulate Check-in"
              className="px-1.5 py-1 rounded hover:bg-surface-elevated text-slate-400 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleSystrayAction()}
              disabled={isLocating}
              title="Check in to start shift"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{isLocating ? 'Verifying...' : 'Check IN →'}</span>
            </button>
          </>
        )}
      </div>

      <GeoLocationModal 
        isOpen={isSimulatorOpen} 
        onClose={() => setIsSimulatorOpen(false)} 
        onSimulateLocation={(mode) => handleSystrayAction(mode)} 
      />
    </>
  );
};
