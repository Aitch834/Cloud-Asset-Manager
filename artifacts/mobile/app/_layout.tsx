import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { Stack, router, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SyncStatusBar } from "@/components/SyncStatusBar";
import { installMobileApiAuthFetch, setMobileAuthTokenGetter } from "@/lib/authToken";
import { BarrelAlertProvider } from "@/lib/context/BarrelAlertContext";
import { FarmProvider, useFarm } from "@/lib/context/FarmContext";
import { RFIDProvider } from "@/lib/context/RFIDContext";
import { SyncProvider } from "@/lib/context/SyncContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) setBaseUrl(`https://${domain}`);
if (domain) installMobileApiAuthFetch(`https://${domain}`);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const proxyUrl = process.env.EXPO_PUBLIC_CLERK_PROXY_URL || undefined;

function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn && pathname !== "/login" && pathname !== "/sign-up") {
      router.replace("/login");
    }
  }, [isLoaded, isSignedIn, pathname]);

  if (!isLoaded) return null;
  if (!isSignedIn && pathname !== "/login" && pathname !== "/sign-up") return null;

  return <>{children}</>;
}

function ClerkTokenBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    const getter = () => getToken();
    setMobileAuthTokenGetter(getter);
    setAuthTokenGetter(getter);
    return () => {
      setMobileAuthTokenGetter(async () => null);
      setAuthTokenGetter(null);
    };
  }, [getToken]);

  return null;
}

const FOREGROUND_POLL_INTERVAL_MS = 30_000;

function FarmRefresher() {
  const { refreshFarms } = useFarm();
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (intervalId !== null) return;
      intervalId = setInterval(() => {
        refreshFarms().catch(() => {});
      }, FOREGROUND_POLL_INTERVAL_MS);
    }

    function stopPolling() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    // Start polling immediately if app is already in the foreground
    if (AppState.currentState === "active") {
      startPolling();
    }

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        // Refresh immediately on foreground, then start interval
        refreshFarms().catch(() => {});
        startPolling();
      } else {
        // Pause polling when backgrounded or inactive to save battery
        stopPolling();
      }
    });

    return () => {
      sub.remove();
      stopPolling();
    };
  }, [refreshFarms]);
  return null;
}

function RootLayoutNav() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="spray-record" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="weather-entry" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="visitor-log" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="crop-event" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="soil-sample" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="photo-capture" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="compliance-form" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="cleaning-record" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="seed-drilling" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="waste-disposal" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="fuel-drawdown" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="fuel-meter-reading" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="fuel-stock-check" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="fuel-tank-delivery" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="dispatch-plans" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="rfid-settings" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="organic-overview" options={{ headerShown: false }} />
        <Stack.Screen name="organic-inspection" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="organic-input" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="organic-inputs-list" options={{ headerShown: false }} />
        <Stack.Screen name="organic-restricted-inputs" options={{ headerShown: false }} />
        <Stack.Screen name="organic-milk-collection" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="tb-test" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="dct-history" options={{ headerShown: false }} />
        <Stack.Screen name="welfare-outcome" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="ppe-issue" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="labour-timesheet" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="fly-tipping" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="encampments" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="pest-control-visit" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="silage-inspection" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="silage-additive" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="silage-quality-test" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="seed-store" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="seed-rate-calculator" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="field-crop-assignment" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="task-inbox" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="poultry-ncp-test" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="ahwr-review" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="hive-inspection" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="organic-poultry-feed" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="organic-poultry-access" options={{ headerShown: false, presentation: "modal" }} />
        <Stack.Screen name="organic-fp-inputs-list" options={{ headerShown: false }} />
        <Stack.Screen name="vine-block-photos" options={{ headerShown: false }} />
        <Stack.Screen name="irrigation-history" options={{ headerShown: false }} />
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
              <ClerkProvider
                publishableKey={publishableKey}
                tokenCache={tokenCache}
                proxyUrl={proxyUrl}
              >
                <ClerkLoaded>
                  <ClerkTokenBridge />
                  <FarmProvider>
                    <FarmRefresher />
                    <BarrelAlertProvider>
                      <SyncProvider>
                        <RFIDProvider>
                          <AuthGate>
                            <RootLayoutNav />
                          </AuthGate>
                        </RFIDProvider>
                      </SyncProvider>
                    </BarrelAlertProvider>
                  </FarmProvider>
                </ClerkLoaded>
              </ClerkProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
