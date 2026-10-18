import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { MPS_TO_MPH, momentTime } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';
import type { TripPoint } from '@/lib/types';

export function MomentChart({ points, momentSec, signal, motionUnit }: { points: TripPoint[]; momentSec: number; signal: 'speed' | 'motion'; motionUnit: 'm/s²' | 'source units' }) {
  const [width, setWidth] = useState(0);
  const subset = points.filter((point) => Math.abs(point.t - momentSec) <= 12 && (signal === 'speed' ? point.speedMps !== undefined : point.motionMagnitude !== undefined));
  const values = subset.map((point) => signal === 'speed' ? point.speedMps! * MPS_TO_MPH : point.motionMagnitude!);
  const max = Math.max(1, ...values);
  const label = signal === 'speed' ? 'Velocity (mph)' : `Phone movement (${motionUnit})`;
  const x = (time: number) => 12 + (time - (momentSec - 12)) / 24 * Math.max(1, width - 24);
  const y = (value: number) => 12 + 77 * (1 - value / max);
  const path = subset.map((point, index) => `${index ? 'L' : 'M'}${x(point.t).toFixed(1)},${y(values[index]).toFixed(1)}`).join(' ');
  return <View style={styles.root} accessibilityRole="image" accessibilityLabel={`${label} around ${momentTime(momentSec)}`}>
    <Text style={styles.label}>{label}</Text>
    {subset.length < 2 ? <Text style={styles.unavailable}>This signal is unavailable around this moment.</Text> : <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && <Svg width={width} height={112}>
        <Line x1="12" y1="89" x2={width - 12} y2="89" stroke={colors.line} />
        <Line x1={x(momentSec)} y1="12" x2={x(momentSec)} y2="89" stroke={colors.green} strokeDasharray="3 4" opacity="0.55" />
        <Path d={path} fill="none" stroke={signal === 'speed' ? colors.green : colors.blueInk} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <SvgText x="12" y="106" fontSize="10" fill={colors.faint}>{momentTime(Math.max(0, momentSec - 12))}</SvgText>
        <SvgText x={width - 12} y="106" textAnchor="end" fontSize="10" fill={colors.faint}>{momentTime(momentSec + 12)}</SvgText>
      </Svg>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.seaGlass, borderRadius: 18, padding: 14, minHeight: 154 },
  label: { fontSize: 13, fontFamily: fonts.bold, color: colors.ink, marginBottom: 8 },
  unavailable: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 20, color: colors.muted, marginTop: 20 },
});
