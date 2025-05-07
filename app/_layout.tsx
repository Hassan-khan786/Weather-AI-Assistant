import { Stack } from 'expo-router';
import { SettingsProvider } from './SettingsContext';
import { WeatherProvider } from './WeatherContext';

export default function Layout() {
  return (
    <SettingsProvider>
      <WeatherProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </WeatherProvider>
    </SettingsProvider>
  );
} 