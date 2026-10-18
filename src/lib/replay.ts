import raw from '@/data/nazirkar_cases.json';
import { findMoments } from './analysis';
import type { Trip, TripPoint, VehicleAssumption } from './types';

type SourcePoint = { t: number; speed: number; distance: number; motion: number };
type SourceCase = { case: number; sourceFile: string; sourceWindow: string; originalReadingCount: number; points: SourcePoint[] };

export function makeReplay(vehicle: VehicleAssumption, caseNumber: number): Trip {
  const data = (raw as SourceCase[]).find((item) => item.case === caseNumber);
  if (!data) throw new Error(`Recorded drive case ${caseNumber} is unavailable`);
  const points: TripPoint[] = data.points.map((point) => ({
    t: point.t,
    speedMps: point.speed,
    distanceM: point.distance,
    motionMagnitude: point.motion,
  }));
  return {
    id: `nazirkar-case-${caseNumber}-${Date.now()}`,
    createdAt: Date.now(),
    source: 'recorded',
    recordedDate: 'Mar 17, 2021',
    recordedCase: caseNumber,
    recordedWindow: data.sourceWindow,
    originalReadingCount: data.originalReadingCount,
    durationSec: points[points.length - 1].t,
    distanceM: points[points.length - 1].distanceM ?? null,
    points,
    moments: findMoments(points),
    vehicle,
    practiceSaved: false,
    interrupted: false,
    motionUnit: 'source units',
  };
}
