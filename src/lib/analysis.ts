import { M_PER_MILE } from './format';
import type { ReviewMoment, Trip, TripPoint, VehicleAssumption } from './types';

export const REPLAY_CASE_COUNT = 4;

/** Pick the next recorded excerpt from locally saved sessions, wrapping after four. */
export function nextReplayCase(trips: Trip[]): number {
  const latest = trips.find((trip) => trip.source === 'recorded' && trip.recordedCase !== undefined);
  return latest?.recordedCase ? latest.recordedCase % REPLAY_CASE_COUNT + 1 : 1;
}

export function impact(distanceM: number | null, vehicle: VehicleAssumption) {
  if (distanceM === null || distanceM <= 0 || !vehicle.mpg || vehicle.mpg <= 0) return null;
  const gallons = distanceM / M_PER_MILE / vehicle.mpg;
  return {
    gallons,
    co2Kg: gallons * 8.887,
    cost: vehicle.pricePerGallon !== null ? gallons * vehicle.pricePerGallon : null,
  };
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Prototype review candidates, not a safety or comfort standard. */
export function findMoments(points: TripPoint[]): ReviewMoment[] {
  const speed = points.filter((point) => point.speedMps !== undefined && Number.isFinite(point.speedMps))
    .sort((a, b) => a.t - b.t);
  if (speed.length < 3) return [];
  const smoothed = speed.map((point, index) => ({
    t: point.t,
    speed: median(speed.slice(Math.max(0, index - 1), Math.min(speed.length, index + 2)).map((entry) => entry.speedMps!)),
  }));
  const candidates: { t: number; kind: 'braking' | 'acceleration'; delta: number }[] = [];
  for (let index = 1; index < smoothed.length; index++) {
    const gap = smoothed[index].t - smoothed[index - 1].t;
    if (gap < 0.5 || gap > 3) continue;
    const change = smoothed[index].speed - smoothed[index - 1].speed;
    const rate = change / gap;
    if (Math.abs(rate) < 1.75 || Math.abs(change) < 1.25) continue;
    candidates.push({ t: smoothed[index].t, kind: rate < 0 ? 'braking' : 'acceleration', delta: Math.abs(change) });
  }
  const grouped: typeof candidates = [];
  for (const candidate of candidates) {
    const previous = grouped[grouped.length - 1];
    if (previous && previous.kind === candidate.kind && candidate.t - previous.t <= 3) {
      previous.delta += candidate.delta;
    } else {
      grouped.push({ ...candidate });
    }
  }
  return grouped.map((item, index) => ({ id: `moment-${index}-${Math.round(item.t)}`, t: item.t, kind: item.kind, speedChangeMps: item.delta }));
}
