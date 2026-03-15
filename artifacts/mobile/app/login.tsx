import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useAuth } from "@/lib/auth";
import { setItem, STORAGE_KEYS } from "@/lib/storage";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await login();
  };

  const handleDemoAccess = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setItem(STORAGE_KEYS.AUTH_STATE, { isAuthenticated: true, token: null, userId: "user-1" });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom }]}>
      <View style={styles.flex}>
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Feather name="shield" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>BDE Farm Trac</Text>
          <Text style={styles.tagline}>Red Tractor Compliance{"\n"}Made Simple</Text>
        </View>

        <View style={styles.formSection}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Checking authentication...</Text>
            </View>
          ) : (
            <>
              <Button
                title="Log In"
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                icon="log-in"
              />

              {__DEV__ && (
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
              )}

              {__DEV__ && (
                <Button
                  title="Demo Access"
                  onPress={handleDemoAccess}
                  variant="outline"
                  fullWidth
                  icon="play"
                  disabled={isLoading}
                />
              )}
            </>
          )}

          <Text style={styles.footer}>
            bdefarmtrac.co.uk
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryMuted + "33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl + 4,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
  },
  loadingBox: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },
  footer: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
