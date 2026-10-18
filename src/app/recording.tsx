import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { nextReplayCase } from '@/lib/analysis';
import { duration } from '@/lib/format';
import { makeReplay } from '@/lib/replay';
import { getTrips, getVehicle, saveTrip } from '@/lib/storage';
import { colors, fonts, side } from '@/lib/theme';

export default function Recording() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const startedAt = useRef<number | null>(null);
  const finishingRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    startedAt.current = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000)), 250);
    return () => clearInterval(timer);
  }, []);

  async function finish() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    setSaveError(false);
    try {
      const caseNumber = nextReplayCase(await getTrips(db));
      const trip = makeReplay(await getVehicle(db), caseNumber);
      await saveTrip(db, trip);
      router.replace({ pathname: '/recap/[id]', params: { id: trip.id } });
    } catch {
      finishingRef.current = false;
      setFinishing(false);
      setSaveError(true);
    }
  }

  return <View style={[styles.page, { paddingTop: insets.top + 14, paddingBottom: Math.max(insets.bottom, 14) + 12 }]}>
    <View style={styles.header}><Text style={styles.brand}>Brake It Easy</Text><View style={styles.status}><View style={styles.statusDot} /><Text style={styles.statusText}>In progress</Text></View></View>
    <View style={styles.center}>
      <View style={styles.circle}><View style={styles.tinyDot} /><Text style={styles.circleText}>Driving</Text></View>
      <Text style={styles.timer} accessibilityLabel={`${duration(elapsed)} elapsed`}>{duration(elapsed)}</Text>
      <Text style={styles.timerLabel}>Elapsed time</Text>
    </View>
    <View style={styles.footer}>
      {saveError && <Text style={styles.error}>This drive could not be saved. Try again.</Text>}
      <PrimaryButton label={finishing ? 'Opening your drive…' : saveError ? 'Try again' : 'Finish drive'} onPress={() => void finish()} disabled={finishing} />
      <Text style={styles.hint}>Finish to see your drive recap.</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: side, backgroundColor: colors.seaGlass },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: colors.ink, fontSize: 18, fontFamily: fonts.bold },
  status: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 22, backgroundColor: colors.white, paddingVertical: 10, paddingHorizontal: 13 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  statusText: { fontSize: 13, fontFamily: fonts.bold, color: colors.muted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  circle: { width: 172, height: 172, borderRadius: 86, backgroundColor: colors.green, borderWidth: 11, borderColor: colors.sky, alignItems: 'center', justifyContent: 'center' },
  tinyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#BCE2EA', marginBottom: 10 },
  circleText: { fontSize: 20, color: colors.white, fontFamily: fonts.bold },
  timer: { fontSize: 44, fontFamily: fonts.bold, color: colors.ink, fontVariant: ['tabular-nums'], marginTop: 30, letterSpacing: -1 },
  timerLabel: { fontSize: 14, color: colors.muted, fontFamily: fonts.regular, marginTop: 2 },
  footer: { gap: 12 },
  error: { fontSize: 14, color: colors.coral, textAlign: 'center', fontFamily: fonts.medium },
  hint: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular, textAlign: 'center' },
});
