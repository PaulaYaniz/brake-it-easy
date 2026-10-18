import type { Trip } from './types';

export interface PracticeTip { title: string; explanation: string }

const tips: Record<number, PracticeTip> = {
  1: { title: 'Ease off the accelerator earlier.', explanation: 'Looking farther ahead can help you change pace more gradually.' },
  2: { title: 'Leave more room ahead.', explanation: 'Extra space can give you more time to slow when traffic changes.' },
  3: { title: 'Build speed gradually.', explanation: 'A gentler start can make changes in pace feel smoother.' },
  4: { title: 'Keep a steady pace when you can.', explanation: 'Small adjustments may reduce repeated acceleration and braking.' },
};

export function practiceForTrip(trip: Trip): PracticeTip {
  return tips[trip.recordedCase ?? 0] ?? tips[2];
}
