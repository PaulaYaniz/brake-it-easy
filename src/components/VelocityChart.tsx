import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { MPS_TO_MPH, momentTime } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';
import type { TripPoint } from '@/lib/types';

export function VelocityChart({ points, durationSec, selectedSec, onSelect, compact = false }: {
  points: TripPoint[]; durationSec: number; selectedSec?: number; onSelect?: (time: number) => void; compact?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const touchOriginX = useRef(0);
  const height = compact ? 104 : 154;
  const speed = points.filter((point) => point.speedMps !== undefined && Number.isFinite(point.speedMps));
  const maxMph = Math.max(10, Math.ceil(Math.max(0, ...speed.map((point) => point.speedMps! * MPS_TO_MPH)) / 10) * 10);
  const left = compact ? 8 : 28;
  const right = 12;
  const top = 10;
  const bottom = compact ? 14 : 27;
  const plotW = Math.max(0, width - left - right);
  const plotH = height - top - bottom;
  const x = (t: number) => left + Math.min(1, Math.max(0, t / Math.max(durationSec, 1))) * plotW;
  const y = (mps: number) => top + plotH - Math.min(1, mps * MPS_TO_MPH / maxMph) * plotH;
  const path = speed.map((point, index) => `${index ? 'L' : 'M'}${x(point.t).toFixed(1)},${y(point.speedMps!).toFixed(1)}`).join(' ');
  const selected = selectedSec === undefined ? undefined : speed.reduce<TripPoint | undefined>((nearest, point) =>
    !nearest || Math.abs(point.t - selectedSec) < Math.abs(nearest.t - selectedSec) ? point : nearest, undefined);
  const selectAt = (localX: number) => {
    if (!onSelect || !speed.length || plotW <= 0) return;
    const time = Math.max(0, Math.min(1, (localX - left) / plotW)) * durationSec;
    const nearest = speed.reduce((best, point) => Math.abs(point.t - time) < Math.abs(best.t - time) ? point : best);
    onSelect(nearest.t);
  };
  const beginSelection = (pageX: number, locationX: number) => {
    touchOriginX.current = pageX - locationX;
    selectAt(locationX);
  };
  const moveSelection = (pageX: number) => selectAt(pageX - touchOriginX.current);
  if (!speed.length) return <View style={[styles.empty, { height }]}><Text style={styles.emptyText}>Speed was unavailable for this drive.</Text></View>;
  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} onStartShouldSetResponderCapture={() => Boolean(onSelect)} onMoveShouldSetResponderCapture={() => Boolean(onSelect)} onResponderTerminationRequest={() => false} onResponderGrant={(event) => beginSelection(event.nativeEvent.pageX, event.nativeEvent.locationX)} onResponderMove={(event) => moveSelection(event.nativeEvent.pageX)} accessibilityRole={onSelect ? 'adjustable' : 'image'} accessibilityLabel={`Velocity over time, up to ${maxMph} miles per hour during ${momentTime(durationSec)}${selected ? `. Selected ${momentTime(selected.t)}, ${Math.round(selected.speedMps! * MPS_TO_MPH)} miles per hour` : ''}`} accessibilityActions={onSelect ? [{ name: 'increment' }, { name: 'decrement' }] : undefined} onAccessibilityAction={onSelect ? (event) => onSelect(Math.max(0, Math.min(durationSec, (selected?.t ?? 0) + (event.nativeEvent.actionName === 'increment' ? 10 : -10)))) : undefined}>
      {width > 0 && <Svg width={width} height={height}>
        {[0, 0.5, 1].map((part) => <Line key={part} x1={left} x2={width - right} y1={top + plotH * part} y2={top + plotH * part} stroke={colors.line} strokeWidth="1" />)}
        {!compact && <><SvgText x="2" y={top + 5} fontSize="10" fill={colors.faint}>{maxMph}</SvgText><SvgText x="10" y={top + plotH + 3} fontSize="10" fill={colors.faint}>0</SvgText></>}
        <Path d={path} fill="none" stroke={colors.green} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {selected && <><Line x1={x(selected.t)} x2={x(selected.t)} y1={top} y2={top + plotH} stroke={colors.coral} strokeDasharray="3 4" opacity="0.65" /><Circle cx={x(selected.t)} cy={y(selected.speedMps!)} r="5" fill={colors.white} stroke={colors.coral} strokeWidth="2" /></>}
        {!compact && <><SvgText x={left} y={height - 4} fontSize="10" fill={colors.faint}>0</SvgText><SvgText x={width - right} y={height - 4} textAnchor="end" fontSize="10" fill={colors.faint}>{momentTime(durationSec)}</SvgText></>}
      </Svg>}
      {!compact && <><View style={styles.axis}><Text style={styles.axisText}>Velocity (mph)</Text><Text style={styles.axisText}>Time</Text></View>{selected && <View style={styles.readout}><Text style={styles.readoutText}>{momentTime(selected.t)} · {Math.round(selected.speedMps! * MPS_TO_MPH)} mph</Text><Text style={styles.scrubHint}>Tap or drag to explore</Text></View>}</>}
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  axisText: { fontSize: 12, fontFamily: fonts.medium, color: colors.muted },
  readout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 14 },
  readoutText: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink, fontVariant: ['tabular-nums'] },
  scrubHint: { fontSize: 11, fontFamily: fonts.regular, color: colors.muted },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular },
});
