import type { GeoCoordinates, OfficeZone, GeoValidationResult } from '../types';

export const HQ_OFFICE_ZONE: OfficeZone = {
  id: 'hq-01',
  name: 'Global Headquarters',
  center: {
    latitude: 37.7749, // Example: SF
    longitude: -122.4194,
    accuracyMeters: 10,
  },
  radiusMeters: 150, // Default 150m radius
};

/**
 * Calculate the great circle distance between two points
 * on the earth (specified in decimal degrees) using Haversine formula
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRadians = (deg: number) => deg * (Math.PI / 180);

  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export function validatePunchLocation(
  userCoords: GeoCoordinates,
  targetZone: OfficeZone = HQ_OFFICE_ZONE,
  isRemoteEmployee: boolean = false
): GeoValidationResult {
  const distance = calculateHaversineDistance(
    userCoords.latitude,
    userCoords.longitude,
    targetZone.center.latitude,
    targetZone.center.longitude
  );

  const roundedDistance = Math.round(distance);

  if (isRemoteEmployee) {
    return {
      isValid: true,
      distanceMeters: roundedDistance,
      punchMode: 'REMOTE',
      verificationStatus: 'VERIFIED',
    };
  }

  if (distance <= targetZone.radiusMeters) {
    return {
      isValid: true,
      distanceMeters: roundedDistance,
      zoneName: targetZone.name,
      punchMode: 'OFFICE',
      verificationStatus: 'VERIFIED',
    };
  }

  return {
    isValid: false,
    distanceMeters: roundedDistance,
    punchMode: 'OUT_OF_BOUNDS',
    verificationStatus: 'FLAGGED',
  };
}
