import type { AttendanceRecord, AttendanceAnomaly } from '../types';

// Helper to convert time string (e.g. "09:05 AM") to minutes since midnight
function timeToMinutes(timeStr: string | null): number {
  if (!timeStr) return 0;
  
  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return 0;
  
  let [hours, minutes] = time.split(':').map(Number);
  
  if (hours === 12) {
    hours = 0;
  }
  
  if (modifier === 'PM') {
    hours += 12;
  }
  
  return hours * 60 + (minutes || 0);
}

// Calculate mean and std deviation for an array of numbers
function calculateStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0 };
  if (values.length === 1) return { mean: values[0], stdDev: 0 };
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (values.length - 1);
  const stdDev = Math.sqrt(variance);
  
  return { mean, stdDev };
}

export function evaluateAnomalies(allRecords: AttendanceRecord[]): AttendanceAnomaly[] {
  const anomalies: AttendanceAnomaly[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Group historical records by employee for statistical analysis
  const employeeHistory = new Map<string, AttendanceRecord[]>();
  allRecords.forEach(r => {
    if (!employeeHistory.has(r.employeeId)) {
      employeeHistory.set(r.employeeId, []);
    }
    employeeHistory.get(r.employeeId)!.push(r);
  });

  allRecords.forEach(record => {
    // Only flag anomalies for today to avoid retroactive spam, 
    // unless building a full audit log. For this UI, we focus on recent/today.
    if (record.date !== todayStr) return;

    // 1. Ghost Punching (> 14 hours active shift without checkout)
    if (record.checkIn && !record.checkOut) {
      const checkInDate = new Date(`${record.date} ${record.checkIn}`);
      const hoursActive = (now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursActive > 14) {
        anomalies.push({
          id: `anom-${record.id}-ghost`,
          attendanceRecordId: record.id,
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          type: 'GHOST_PUNCH',
          severity: 'HIGH',
          score: 85,
          title: 'Ghost Punch Detected',
          description: `Shift has been active for ${hoursActive.toFixed(1)} hours without a check-out.`,
          detectedAt: now.toISOString(),
          isResolved: false
        });
      }
    }

    // 2. Rapid In-Out Bounce (< 15 mins)
    if (record.checkIn && record.checkOut) {
      const inMins = timeToMinutes(record.checkIn);
      const outMins = timeToMinutes(record.checkOut);
      
      if (outMins > inMins && (outMins - inMins) < 15) {
        anomalies.push({
          id: `anom-${record.id}-bounce`,
          attendanceRecordId: record.id,
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          type: 'RAPID_BOUNCE',
          severity: 'MEDIUM',
          score: 60,
          title: 'Rapid Punch Bounce',
          description: `Check-in and Check-out occurred within ${outMins - inMins} minutes.`,
          detectedAt: now.toISOString(),
          isResolved: false
        });
      }
    }

    // 3. Excessive Daily Hours (> 12 hours)
    if (record.workHours > 12) {
      anomalies.push({
        id: `anom-${record.id}-excessive`,
        attendanceRecordId: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        type: 'EXCESSIVE_HOURS',
        severity: 'HIGH',
        score: 80,
        title: 'Excessive Work Hours',
        description: `Logged ${record.workHours} hours today, exceeding 12-hour limit.`,
        detectedAt: now.toISOString(),
        isResolved: false
      });
    }

    // 4. Weekend / Off-Hours Activity
    const recordDate = new Date(record.date);
    const dayOfWeek = recordDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      anomalies.push({
        id: `anom-${record.id}-weekend`,
        attendanceRecordId: record.id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        type: 'OFF_HOURS_PUNCH',
        severity: 'LOW',
        score: 40,
        title: 'Unscheduled Weekend Punch',
        description: 'Activity recorded on a non-working day without prior authorization flag.',
        detectedAt: now.toISOString(),
        isResolved: false
      });
    }

    // 5. Statistical Punch Time Drift (Z-Score)
    if (record.checkIn) {
      const history = employeeHistory.get(record.employeeId) || [];
      // Get last 30 days history, excluding today
      const past30Days = history.filter(h => h.date !== todayStr && h.checkIn);
      
      if (past30Days.length >= 3) { // Require at least 3 historical points
        const historicalMins = past30Days.map(h => timeToMinutes(h.checkIn));
        const { mean, stdDev } = calculateStats(historicalMins);
        const currentMins = timeToMinutes(record.checkIn);
        
        // If stdDev is very small, use a minimum threshold to prevent division by near-zero
        const effectiveStdDev = Math.max(stdDev, 15); // min 15 min std dev
        const zScore = Math.abs((currentMins - mean) / effectiveStdDev);
        
        if (zScore > 2.5) {
          const diffHrs = Math.abs(currentMins - mean) / 60;
          anomalies.push({
            id: `anom-${record.id}-drift`,
            attendanceRecordId: record.id,
            employeeId: record.employeeId,
            employeeName: record.employeeName,
            type: 'TIME_DRIFT',
            severity: zScore > 3.5 ? 'HIGH' : 'MEDIUM',
            score: Math.min(100, Math.round(zScore * 20)),
            title: 'Significant Time Drift',
            description: `Punch-in was ${diffHrs.toFixed(1)} hours ${currentMins > mean ? 'later' : 'earlier'} than historical average.`,
            detectedAt: now.toISOString(),
            isResolved: false
          });
        }
      }
    }
  });

  return anomalies;
}
