export const M_PER_MILE = 1609.344;
export const MPS_TO_MPH = 2.2369362921;

export function duration(value: number): string {
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function shortDuration(value: number): string {
  if (value < 60) return `${Math.max(1, Math.round(value))} sec`;
  return `${Math.max(1, Math.round(value / 60))} min`;
}

export function miles(distanceM: number | null): string {
  return distanceM === null ? '—' : `${(distanceM / M_PER_MILE).toFixed(1)} mi`;
}

export function dateLabel(epoch: number): string {
  return new Date(epoch).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function momentTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}
