import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initialize } from '@/lib/storage';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="brake-it-easy.db" onInit={initialize}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas }, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="recording" options={{ gestureEnabled: false }} />
          <Stack.Screen name="history" />
          <Stack.Screen name="recap/[id]" />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
