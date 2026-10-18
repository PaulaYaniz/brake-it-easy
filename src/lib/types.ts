export type TripSource = 'live' | 'recorded';
export type EventKind = 'braking' | 'acceleration';
export type MomentContext = 'Traffic changed' | 'Road surface' | 'Phone moved' | 'Necessary maneuver' | 'Not sure';

export interface TripPoint {
  t: number; // seconds since start
  speedMps?: number;
  motionMagnitude?: number; // magnitude only; source units may be unknown
  distanceM?: number;
}

export interface ReviewMoment {
  id: string;
  t: number;
  kind: EventKind;
  speedChangeMps: number;
  context?: MomentContext;
}

export interface VehicleAssumption {
  mpg: number | null;
  pricePerGallon: number | null;
  label: string;
}

export interface Trip {
  id: string;
  createdAt: number;
  source: TripSource;
  recordedDate?: string; // date from an attributed replay file, distinct from local import time
  recordedCase?: number; // one of four nonoverlapping excerpts from two source trips
  recordedWindow?: string; // local clock window in the source file
  originalReadingCount?: number;
  durationSec: number;
  distanceM: number | null;
  points: TripPoint[];
  moments: ReviewMoment[];
  vehicle: VehicleAssumption;
  practiceSaved: boolean;
  interrupted: boolean;
  motionUnit: 'm/s²' | 'source units';
}
