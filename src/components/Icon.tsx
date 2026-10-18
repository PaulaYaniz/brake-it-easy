import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { colors } from '@/lib/theme';

export type IconName = 'car' | 'history' | 'chevron' | 'back' | 'close' | 'info' | 'leaf' | 'shield' | 'clock' | 'route' | 'check' | 'spark';

export function Icon({ name, size = 22, color = colors.green, strokeWidth = 1.8 }: {
  name: IconName; size?: number; color?: string; strokeWidth?: number;
}) {
  const shared = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const body = {
    car: <><Path {...shared} d="M4 15V9.5L6 5h12l2 4.5V15" /><Path {...shared} d="M4 11h16M7 16v2m10-2v2M7 14h2m6 0h2" /></>,
    history: <><Path {...shared} d="M4 6v4h4M4.8 10a7.5 7.5 0 1 1-.3 4" /><Path {...shared} d="M12 7.5V12l3 2" /></>,
    chevron: <Polyline {...shared} points="9,5 16,12 9,19" />,
    back: <><Path {...shared} d="m14.5 5-7 7 7 7M8 12h12" /></>,
    close: <Path {...shared} d="M5 5l14 14M19 5 5 19" />,
    info: <><Circle {...shared} cx="12" cy="12" r="9" /><Path {...shared} d="M12 11v5M12 8h.01" /></>,
    leaf: <><Path {...shared} d="M19 4C10 4 5 7 5 14a5 5 0 0 0 5 5c7 0 10-5 9-15Z" /><Path {...shared} d="M6 18c2-3 5-6 10-9" /></>,
    shield: <><Path {...shared} d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" /><Path {...shared} d="m9 12 2 2 4-4" /></>,
    clock: <><Circle {...shared} cx="12" cy="12" r="9" /><Path {...shared} d="M12 7v5l3 2" /></>,
    route: <><Circle {...shared} cx="5" cy="6" r="2" /><Circle {...shared} cx="19" cy="18" r="2" /><Path {...shared} d="M6 8c0 5 11-1 12 8" /></>,
    check: <Path {...shared} d="m4 12 5 5L20 6" />,
    spark: <><Path {...shared} d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Z" /><Line {...shared} x1="19" y1="18" x2="21" y2="20" /></>,
  }[name];
  return <Svg width={size} height={size} viewBox="0 0 24 24">{body}</Svg>;
}
