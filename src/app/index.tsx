import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import { Icon } from '@/components/Icon';
import { dateLabel, shortDuration } from '@/lib/format';
import { getTrips } from '@/lib/storage';
import { colors, fonts, radius, side } from '@/lib/theme';
import type { Trip } from '@/lib/types';

export default function Home() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const db = useSQLiteContext();
  const [latest, setLatest] = useState<Trip | null>(null);
  const [count, setCount] = useState(0);
  const [info, setInfo] = useState(false);

  useFocusEffect(useCallback(() => {
    getTrips(db).then((trips) => { setLatest(trips[0] ?? null); setCount(trips.length); });
  }, [db]));

  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.page, { minHeight: height, paddingTop: insets.top + 14, paddingBottom: Math.max(insets.bottom, 14) + 12 }]}>
    <View style={styles.header}>
      <View style={styles.headerSpace} /><Text style={styles.brandText}>Brake It Easy.</Text>
      <Pressable onPress={() => setInfo(true)} style={styles.info} accessibilityRole="button" accessibilityLabel="How Brake It Easy works"><Icon name="info" size={19} color={colors.muted} /></Pressable>
    </View>
    <Text style={styles.support}>Change your driving style to use less fuel and build safer habits.</Text>
    <View style={styles.center}>
      <Pressable onPress={() => router.push('/recording')} style={({ pressed }) => [styles.start, pressed && styles.startPressed]} accessibilityRole="button" accessibilityLabel="Start drive" accessibilityHint="Start the drive timer">
        <View style={styles.startIcon}><Icon name="car" size={36} color={colors.white} /></View>
        <Text style={styles.startLabel}>Start drive</Text>
      </Pressable>
    </View>
    <View style={styles.footer}>
      <Pressable onPress={() => router.push('/history')} style={styles.history} accessibilityRole="button" accessibilityLabel={`Drive history, ${count} saved drives`}>
        <View style={styles.historyIcon}><Icon name="history" size={21} /></View>
        <View style={styles.historyCopy}><Text style={styles.historyTitle}>Drive history</Text><Text style={styles.historyDetail}>{latest ? `${latest.source === 'recorded' ? 'Recorded drive' : dateLabel(latest.createdAt)} · ${shortDuration(latest.durationSec)}` : 'Your completed drives will appear here'}</Text></View>
        <Icon name="chevron" size={17} color={colors.faint} />
      </Pressable>
    </View>
    <BottomSheet visible={info} title="How it works" onClose={() => setInfo(false)}>
      <Text style={styles.sheetText}>Start the timer, tap Finish drive, then review a recorded trip’s speed and movement.</Text>
      <Text style={styles.sheetNote}>Data source: Shardul Nazirkar, “Phone sensor data while driving a car and normal or aggressive driving behaviour classification” (2021), DOI 10.17632/5stn873wft.1, CC BY 4.0.</Text>
      <Pressable onPress={() => void Linking.openURL('https://doi.org/10.17632/5stn873wft.1')} style={styles.sourceLink} accessibilityRole="link"><Text style={styles.sourceLinkText}>View original dataset</Text><Icon name="chevron" size={16} color={colors.green} /></Pressable>
    </BottomSheet>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, paddingHorizontal: side, backgroundColor: colors.sky },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSpace: { width: 44, height: 44 },
  brandText: { fontSize: 27, fontFamily: fonts.bold, letterSpacing: -0.9, color: colors.ink, flexShrink: 1 },
  info: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.78)', alignItems: 'center', justifyContent: 'center' },
  support: { color: colors.ink, fontSize: 18, lineHeight: 27, fontFamily: fonts.medium, maxWidth: 315, marginTop: 28, alignSelf: 'center', textAlign: 'center' },
  center: { flex: 1, minHeight: 250, alignItems: 'center', justifyContent: 'center' },
  start: { width: 212, height: 212, borderRadius: 106, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  startPressed: { backgroundColor: colors.greenPressed },
  startIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  startLabel: { color: colors.white, fontSize: 21, fontFamily: fonts.bold },
  footer: { gap: 10, paddingBottom: 12 },
  history: { minHeight: 78, borderRadius: radius.card, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 13 },
  historyIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.seaGlass, alignItems: 'center', justifyContent: 'center' },
  historyCopy: { flex: 1, gap: 3 },
  historyTitle: { color: colors.ink, fontSize: 16, fontFamily: fonts.bold },
  historyDetail: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular },
  sheetText: { fontSize: 16, lineHeight: 24, color: colors.ink, fontFamily: fonts.regular },
  sheetNote: { fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 16, fontFamily: fonts.regular },
  sourceLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  sourceLinkText: { color: colors.green, fontFamily: fonts.bold, fontSize: 14 },
});
