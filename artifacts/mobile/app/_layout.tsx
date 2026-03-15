import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FarmProvider } from "@/lib/context/FarmContext";
import { SyncProvider } from "@/lib/context/SyncContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="spray-record" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="weather-entry" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="visitor-log" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="crop-event" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="soil-sample" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="photo-capture" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="compliance-form" options={{ headerShown: false, presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <FarmProvider>
                <SyncProvider>
                  <RootLayoutNav />
                </SyncProvider>
              </FarmProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
