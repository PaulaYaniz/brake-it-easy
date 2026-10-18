import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from '@/components/BottomSheet';
import { Icon } from '@/components/Icon';
import { MomentChart } from '@/components/MomentChart';
import { PrimaryButton } from '@/components/PrimaryButton';
import { VelocityChart } from '@/components/VelocityChart';
import { impact } from '@/lib/analysis';
import { dateLabel, MPS_TO_MPH, miles, momentTime, shortDuration } from '@/lib/format';
import { practiceForTrip } from '@/lib/practice';
import { getTrip, saveTrip, saveVehicle } from '@/lib/storage';
import { colors, fonts, radius, side } from '@/lib/theme';
import type { MomentContext, Trip, VehicleAssumption } from '@/lib/types';

const contexts: MomentContext[] = ['Traffic changed', 'Road surface', 'Phone moved', 'Necessary maneuver', 'Not sure'];

export default function Recap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [sheet, setSheet] = useState<'moment' | 'estimate' | null>(null);
  const [momentId, setMomentId] = useState<string | null>(null);
  const [view, setView] = useState<'passenger' | 'efficiency'>('passenger');
  const [mpgInput, setMpgInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [scrubSelection, setScrubSelection] = useState<{ tripId: string; sec: number } | null>(null);

  useEffect(() => { if (id) getTrip(db, id).then(setTrip); }, [db, id]);
  const selected = trip?.moments.find((moment) => moment.id === momentId);
  const estimate = trip ? impact(trip.distanceM, trip.vehicle) : null;
  const brakingCount = trip?.moments.filter((moment) => moment.kind === 'braking').length ?? 0;
  const acceleratingCount = trip?.moments.filter((moment) => moment.kind === 'acceleration').length ?? 0;
  const awarenessCount = brakingCount + acceleratingCount;
  const momentSummary = awarenessCount === 0 ? 'No clear moments to review' : acceleratingCount === 0 ? `${brakingCount} braking ${brakingCount === 1 ? 'moment' : 'moments'}` : brakingCount === 0 ? `${acceleratingCount} acceleration ${acceleratingCount === 1 ? 'moment' : 'moments'}` : `${awarenessCount} moments to review`;
  const motionNearby = useMemo(() => !!selected && !!trip?.points.some((point) => Math.abs(point.t - selected.t) <= 4 && point.motionMagnitude !== undefined), [selected, trip]);

  async function updateTrip(next: Trip) {
    setTrip(next);
    await saveTrip(db, next);
  }

  async function savePractice() {
    if (!trip) return;
    await updateTrip({ ...trip, practiceSaved: true });
    router.replace('/');
  }

  async function setContext(context: MomentContext) {
    if (!trip || !selected) return;
    await updateTrip({ ...trip, moments: trip.moments.map((moment) => moment.id === selected.id ? { ...moment, context } : moment) });
  }

  function openEstimate() {
    if (!trip) return;
    setMpgInput(trip.vehicle.mpg?.toString() ?? '');
    setPriceInput(trip.vehicle.pricePerGallon?.toString() ?? '');
    setInputError('');
    setSheet('estimate');
  }

  async function saveAssumptions() {
    if (!trip) return;
    const mpg = mpgInput.trim() ? Number(mpgInput) : null;
    const price = priceInput.trim() ? Number(priceInput) : null;
    if ((mpg !== null && (!Number.isFinite(mpg) || mpg <= 0 || mpg > 150)) || (price !== null && (!Number.isFinite(price) || price < 0 || price > 30))) {
      setInputError('Enter a valid mpg and optional price per gallon.');
      return;
    }
    const vehicle: VehicleAssumption = { mpg, pricePerGallon: price, label: mpg === null ? 'No vehicle assumption' : 'Gasoline vehicle assumption' };
    await saveVehicle(db, vehicle);
    await updateTrip({ ...trip, vehicle });
    setSheet(null);
  }

  if (!trip) return <View style={[styles.loading, { paddingTop: insets.top }]}><Text style={styles.loadingText}>Opening your drive…</Text></View>;
  const practice = practiceForTrip(trip);

  return <View style={[styles.page, { paddingTop: insets.top + 12 }]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 26 }}>
      <Pressable style={styles.back} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back"><Icon name="back" size={21} color={colors.ink} /></Pressable>
      <Text style={styles.title}>Your drive</Text>
      <Text style={styles.source}>{trip.source === 'recorded' ? `Recorded drive · ${trip.recordedDate ?? 'Mar 17, 2021'}` : `${trip.interrupted ? 'Live drive · recording interrupted' : 'Live drive'} · ${dateLabel(trip.createdAt)}`}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Icon name="clock" size={18} color={colors.muted} /><View><Text style={styles.statValue}>{shortDuration(trip.durationSec)}</Text><Text style={styles.statLabel}>Duration</Text></View></View>
        <View style={styles.statDivider} />
        <View style={styles.stat}><Icon name="route" size={18} color={colors.muted} /><View><Text style={styles.statValue}>{miles(trip.distanceM)}</Text><Text style={styles.statLabel}>Distance</Text></View></View>
      </View>
      <View style={styles.chartCard}><VelocityChart points={trip.points} durationSec={trip.durationSec} selectedSec={scrubSelection?.tripId === trip.id ? scrubSelection.sec : trip.moments[0]?.t ?? 0} onSelect={(sec) => setScrubSelection({ tripId: trip.id, sec })} /></View>

      <View style={styles.impactCard}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.white }]}><Icon name="leaf" size={22} /></View>
        <Text style={styles.sectionTitle}>Environmental impact</Text>
        <Text style={styles.sectionCopy}>{estimate ? `Estimated using ${trip.vehicle.mpg} mpg for a gasoline car.` : 'Add trip distance and vehicle economy to see estimates.'}</Text>
        <View style={styles.impactValues}>
          <View style={styles.impactValue}><Text style={styles.bigValue}>{estimate ? `${estimate.gallons.toFixed(2)} gal` : '—'}</Text><Text style={styles.valueLabel}>Estimated fuel</Text></View>
          <View style={styles.valueDivider} />
          <View style={styles.impactValue}><Text style={styles.bigValue}>{estimate ? `${estimate.co2Kg.toFixed(2)} kg` : '—'}</Text><Text style={styles.valueLabel}>Estimated tailpipe CO₂</Text></View>
        </View>
        <Pressable onPress={openEstimate} style={styles.detailLink} accessibilityRole="button"><Text style={styles.detailLinkText}>How it’s estimated</Text><Icon name="chevron" size={17} color={colors.green} /></Pressable>
      </View>

      <View style={styles.awarenessCard}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.white }]}><Icon name="shield" size={22} color={colors.blueInk} /></View>
        <Text style={styles.sectionTitle}>Driving awareness</Text>
        <Text style={styles.momentCount}>{momentSummary}</Text>
        {trip.moments.map((moment) => <Pressable key={moment.id} onPress={() => { setMomentId(moment.id); setView('passenger'); setSheet('moment'); }} style={styles.momentRow} accessibilityRole="button" accessibilityLabel={`${moment.kind === 'braking' ? 'Braking' : 'Acceleration'} moment at ${momentTime(moment.t)}, tap to review`}>
          <Text style={styles.momentTime}>{momentTime(moment.t)}</Text><View style={{ flex: 1 }}><Text style={styles.momentTitle}>{moment.kind === 'braking' ? 'Change in braking' : 'Change in acceleration'}</Text>{moment.context && <Text style={styles.contextLabel}>{moment.context}</Text>}</View><Icon name="chevron" size={16} color={colors.blueInk} />
        </Pressable>)}
        {awarenessCount === 0 && <Text style={styles.noMoments}>{trip.distanceM === null ? 'Speed was unavailable, so braking could not be interpreted.' : 'No changes crossed this prototype’s review threshold.'}</Text>}
      </View>

      <View style={styles.practiceCard}>
        <Text style={styles.practiceLabel}>One thing to practice</Text>
        <Text style={styles.practiceTitle}>{practice.title}</Text>
        <Text style={styles.practiceCopy}>{practice.explanation}</Text>
      </View>
      <PrimaryButton label={trip.practiceSaved ? 'Done' : 'Practice this next drive'} onPress={() => void savePractice()} />
    </ScrollView>

    <BottomSheet visible={sheet === 'moment'} title={selected ? `Moment at ${momentTime(selected.t)}` : 'Moment'} onClose={() => setSheet(null)}>
      {selected && <>
        <View style={styles.tabs}><Pressable onPress={() => setView('passenger')} style={[styles.tab, view === 'passenger' && styles.tabActive]} accessibilityRole="tab" accessibilityState={{ selected: view === 'passenger' }}><Text style={[styles.tabText, view === 'passenger' && styles.tabTextActive]}>Passenger</Text></Pressable><Pressable onPress={() => setView('efficiency')} style={[styles.tab, view === 'efficiency' && styles.tabActive]} accessibilityRole="tab" accessibilityState={{ selected: view === 'efficiency' }}><Text style={[styles.tabText, view === 'efficiency' && styles.tabTextActive]}>Efficiency</Text></Pressable></View>
        <MomentChart points={trip.points} momentSec={selected.t} signal={view === 'passenger' ? 'motion' : 'speed'} motionUnit={trip.motionUnit} />
        <Text style={styles.sheetExplanation}>{view === 'passenger' ? (motionNearby ? 'Movement was recorded near this change in speed.' : 'Movement data was unavailable near this change in speed.') : `Speed changed by about ${(selected.speedChangeMps * MPS_TO_MPH).toFixed(0)} mph here.`}</Text>
        <Text style={styles.contextTitle}>Add context (optional)</Text>
        <View style={styles.chips}>{contexts.map((context) => <Pressable key={context} onPress={() => void setContext(context)} style={[styles.chip, selected.context === context && styles.chipSelected]} accessibilityRole="radio" accessibilityState={{ selected: selected.context === context }}><Text style={[styles.chipText, selected.context === context && styles.chipTextSelected]}>{context}</Text></Pressable>)}</View>
      </>}
    </BottomSheet>

    <BottomSheet visible={sheet === 'estimate'} title="How it’s estimated" onClose={() => setSheet(null)}>
      <Text style={styles.methodText}>Estimated fuel = trip miles ÷ vehicle mpg. Estimated tailpipe CO₂ = fuel gallons × 8.887 kg. These are baseline estimates, not measured emissions or claimed savings.</Text>
      <Text style={styles.inputLabel}>Gasoline vehicle economy (mpg)</Text>
      <TextInput value={mpgInput} onChangeText={setMpgInput} placeholder="e.g. 25" keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Gasoline vehicle economy in miles per gallon" />
      <Text style={styles.inputLabel}>Fuel price per gallon (optional)</Text>
      <TextInput value={priceInput} onChangeText={setPriceInput} placeholder="e.g. 3.50" keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Fuel price in dollars per gallon" />
      {estimate?.cost !== null && estimate?.cost !== undefined && <Text style={styles.cost}>Estimated fuel cost: ${estimate.cost.toFixed(2)}</Text>}
      {inputError ? <Text style={styles.error}>{inputError}</Text> : null}
      <Text style={styles.methodNote}>{trip.source === 'recorded' ? 'Excerpt distance comes from the recorded trip field. Source speed and distance units are inferred; vehicle mpg is an independent illustration. Full data credit is in Home’s info sheet.' : 'Live distance is integrated from location speed and may be imprecise.'} Coordinates are not saved.</Text>
      <PrimaryButton label="Save assumptions" onPress={() => void saveAssumptions()} />
    </BottomSheet>
  </View>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }, loadingText: { color: colors.muted, fontSize: 16, fontFamily: fonts.regular },
  page: { flex: 1, backgroundColor: colors.canvas, paddingHorizontal: side },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 30, fontFamily: fonts.bold, letterSpacing: -0.8, color: colors.ink, marginTop: 24 },
  source: { fontSize: 13, fontFamily: fonts.regular, color: colors.muted, marginTop: 7, marginBottom: 20 },
  stats: { alignSelf: 'flex-start', borderRadius: 18, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, gap: 14, marginBottom: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 8 }, statValue: { fontSize: 16, fontFamily: fonts.bold, color: colors.ink }, statLabel: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted }, statDivider: { width: 1, height: 27, backgroundColor: colors.line },
  chartCard: { backgroundColor: colors.white, borderRadius: radius.card, padding: 18, marginBottom: 16 },
  impactCard: { borderRadius: radius.card, backgroundColor: colors.mint, padding: 20, marginBottom: 16 },
  awarenessCard: { borderRadius: radius.card, backgroundColor: colors.blue, padding: 20, marginBottom: 16 },
  sectionIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontFamily: fonts.bold, letterSpacing: -0.35 },
  sectionCopy: { color: colors.muted, fontSize: 14, fontFamily: fonts.regular, lineHeight: 21, marginTop: 7 },
  impactValues: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 18 },
  impactValue: { flex: 1, gap: 5 }, bigValue: { fontSize: 22, fontFamily: fonts.bold, color: colors.ink, letterSpacing: -0.4 }, valueLabel: { fontSize: 12, fontFamily: fonts.regular, color: colors.muted, lineHeight: 17 }, valueDivider: { width: 1, height: 40, backgroundColor: '#CAE7DE', marginHorizontal: 15 },
  detailLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, detailLinkText: { color: colors.green, fontSize: 14, fontFamily: fonts.bold },
  momentCount: { fontSize: 17, fontFamily: fonts.bold, color: colors.ink, marginTop: 22, marginBottom: 8 },
  momentRow: { minHeight: 62, borderTopWidth: 1, borderTopColor: '#CDE6F2', flexDirection: 'row', alignItems: 'center', gap: 12 },
  momentTime: { color: colors.blueInk, fontSize: 14, fontFamily: fonts.bold, fontVariant: ['tabular-nums'], width: 42 }, momentTitle: { color: colors.ink, fontSize: 14, fontFamily: fonts.medium }, contextLabel: { color: colors.muted, fontSize: 12, fontFamily: fonts.regular, marginTop: 2 }, noMoments: { color: colors.muted, fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
  practiceCard: { backgroundColor: colors.peach, borderRadius: radius.card, padding: 20, marginBottom: 16 }, practiceLabel: { fontSize: 13, fontFamily: fonts.bold, color: colors.green, marginBottom: 10 }, practiceTitle: { fontSize: 19, fontFamily: fonts.bold, color: colors.ink, lineHeight: 26 }, practiceCopy: { fontSize: 14, fontFamily: fonts.regular, lineHeight: 21, color: colors.muted, marginTop: 9 },
  tabs: { backgroundColor: colors.wash, borderRadius: 15, padding: 4, flexDirection: 'row', marginBottom: 16 }, tab: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, tabActive: { backgroundColor: colors.white }, tabText: { color: colors.muted, fontSize: 14, fontFamily: fonts.medium }, tabTextActive: { color: colors.ink, fontFamily: fonts.bold },
  sheetExplanation: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 23, color: colors.ink, marginTop: 16 }, contextTitle: { fontSize: 15, fontFamily: fonts.bold, color: colors.ink, marginTop: 24, marginBottom: 12 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderRadius: 22, paddingVertical: 10, paddingHorizontal: 13, backgroundColor: colors.wash, minHeight: 44, justifyContent: 'center' }, chipSelected: { backgroundColor: colors.mint }, chipText: { color: colors.ink, fontSize: 13, fontFamily: fonts.medium }, chipTextSelected: { color: colors.green, fontFamily: fonts.bold },
  methodText: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 23, color: colors.ink, marginBottom: 22 }, inputLabel: { fontSize: 14, fontFamily: fonts.medium, color: colors.ink, marginBottom: 8 }, input: { minHeight: 52, borderRadius: 15, backgroundColor: colors.wash, paddingHorizontal: 15, fontSize: 16, fontFamily: fonts.regular, color: colors.ink, marginBottom: 18 }, cost: { fontSize: 14, fontFamily: fonts.bold, color: colors.green, marginBottom: 12 }, error: { fontSize: 13, fontFamily: fonts.regular, color: '#A72B36', marginBottom: 10 }, methodNote: { fontSize: 13, fontFamily: fonts.regular, lineHeight: 20, color: colors.muted, marginBottom: 22 },
});
