import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/lib/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initDatabase().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Crop Video' }} />
          <Stack.Screen name="video/[id]" options={{ title: 'Video Details' }} />
          <Stack.Screen name="video/[id]/edit" options={{ title: 'Edit Video' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
