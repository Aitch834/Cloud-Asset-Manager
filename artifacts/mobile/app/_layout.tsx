import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { FarmProvider } from "@/lib/context/FarmContext";
import { SyncProvider } from "@/lib/context/SyncContext";
import { getItem, STORAGE_KEYS } from "@/lib/storage";
import type { AuthState } from "@/lib/types";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const authState = await getItem<AuthState>(STORAGE_KEYS.AUTH_STATE);
        setAuthenticated(!!authState?.isAuthenticated);
      } catch {
        setAuthenticated(false);
      } finally {
        setChecked(true);
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  useEffect(() => {
    if (!checked) return;
    if (!authenticated && pathname !== "/login") {
      router.replace("/login");
    }
  }, [checked, authenticated, pathname]);

  if (!checked) return null;
  if (!authenticated && pathname !== "/login") return null;

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="spray-record" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="weather-entry" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="visitor-log" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="crop-event" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="soil-sample" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="photo-capture" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="compliance-form" options={{ headerShown: false, presentation: "modal" }} />
      </Stack>
      <SyncStatusBar />
    </View>
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
                  <AuthGate>
                    <RootLayoutNav />
                  </AuthGate>
                </SyncProvider>
              </FarmProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
