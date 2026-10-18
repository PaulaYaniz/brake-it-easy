import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/lib/theme';

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" style={({ pressed }) => [styles.button, { backgroundColor: disabled ? '#9BC1C8' : pressed ? colors.greenPressed : colors.green }]}>
    <Text style={styles.label}>{label}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  label: { fontSize: 16, fontFamily: fonts.bold, color: colors.white },
});
