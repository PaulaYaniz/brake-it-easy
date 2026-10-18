import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { dateLabel, miles, shortDuration } from '@/lib/format';
import { getTrips } from '@/lib/storage';
import { practiceForTrip } from '@/lib/practice';
import { colors, fonts, radius, side } from '@/lib/theme';
import type { Trip } from '@/lib/types';

export default function History() {
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [trips, setTrips] = useState<Trip[]>([]);
  useFocusEffect(useCallback(() => { getTrips(db).then(setTrips); }, [db]));
  return <View style={[styles.page, { paddingTop: insets.top + 12 }]}>
    <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back to home"><Icon name="back" size={21} color={colors.ink} /></Pressable>
    <Text style={styles.title}>Drive history</Text>
    <Text style={styles.support}>Revisit a drive and the habit you chose to practice.</Text>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 26 }} showsVerticalScrollIndicator={false}>
      {trips.length === 0 ? <View style={styles.empty}><Icon name="history" size={28} color={colors.green} /><Text style={styles.emptyTitle}>No drives yet</Text><Text style={styles.emptyCopy}>A finished drive will appear here.</Text></View> : trips.map((trip) => <Pressable key={trip.id} onPress={() => router.push({ pathname: '/recap/[id]', params: { id: trip.id } })} style={styles.card} accessibilityRole="button" accessibilityLabel={`${trip.source === 'recorded' ? `Recorded drive ${trip.recordedWindow?.slice(0, 5) ?? ''}` : dateLabel(trip.createdAt)}, ${shortDuration(trip.durationSec)}`}>
        <View style={styles.cardIcon}><Icon name="route" size={20} /></View>
        <View style={styles.cardCopy}><Text style={styles.cardTitle}>{trip.source === 'recorded' ? `Recorded drive${trip.recordedWindow ? ` · ${trip.recordedWindow.slice(0, 5)}` : ''}` : dateLabel(trip.createdAt)}</Text><Text style={styles.cardMeta}>{trip.source === 'recorded' ? trip.recordedDate ?? 'Recorded phone data' : 'Live drive'} · {shortDuration(trip.durationSec)} · {miles(trip.distanceM)}</Text><Text style={styles.cardGoal}>{trip.practiceSaved ? `Practice: ${practiceForTrip(trip).title}` : 'Practice not saved yet'}</Text></View>
        <Icon name="chevron" size={17} color={colors.faint} />
      </Pressable>)}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: side, backgroundColor: colors.seaGlass },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.ink, fontSize: 30, fontFamily: fonts.bold, letterSpacing: -0.8, marginTop: 28 },
  support: { color: colors.muted, fontSize: 16, lineHeight: 24, fontFamily: fonts.regular, marginTop: 10, marginBottom: 28 },
  card: { backgroundColor: colors.white, borderRadius: radius.card, minHeight: 105, marginBottom: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.sky, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, gap: 4 },
  cardTitle: { color: colors.ink, fontSize: 16, fontFamily: fonts.bold },
  cardMeta: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular },
  cardGoal: { color: colors.green, fontSize: 13, fontFamily: fonts.medium, marginTop: 2 },
  empty: { backgroundColor: colors.white, borderRadius: radius.card, padding: 24, alignItems: 'flex-start', gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.ink },
  emptyCopy: { fontSize: 15, lineHeight: 22, fontFamily: fonts.regular, color: colors.muted },
});
