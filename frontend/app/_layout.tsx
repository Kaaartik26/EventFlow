import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function AuthenticatedStack() {
  const { user, userType, isLoading } = useAuth();

  if (isLoading) {
    return null; // Show loading screen
  }

  if (!user) {
    return (
      <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // Route based on user type
  if (userType === 'faculty') {
    return (
      <Stack>
        <Stack.Screen name="(faculty)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      </Stack>
    );
  } else if (userType === 'admin') {
    return (
      <Stack>
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      </Stack>
    );
  } else {
    return (
      <Stack>
        <Stack.Screen name="(student)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
      </Stack>
    );
  }
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthenticatedStack />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
