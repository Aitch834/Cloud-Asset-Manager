import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { setItem, STORAGE_KEYS } from "@/lib/storage";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!apiDomain) {
        setError("Server not configured. Use Demo Access to explore the app.");
        setLoading(false);
        return;
      }

      const response = await fetch(`https://${apiDomain}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        const data = await response.json();
        await setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
        await setItem(STORAGE_KEYS.AUTH_STATE, { isAuthenticated: true, token: data.token, userId: data.userId });
        await setItem(STORAGE_KEYS.USER_PROFILE, data.user);
        if (data.farms) {
          await setItem(STORAGE_KEYS.FARM_LIST, data.farms);
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
        return;
      }

      if (response.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to reach server. Please try again.");
      }
    } catch {
      setError("Connection failed. Check your internet or use Demo Access.");
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    await setItem(STORAGE_KEYS.AUTH_STATE, { isAuthenticated: true, token: null, userId: "user-1" });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    router.replace("/(tabs)");
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await handleDemoLogin();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Feather name="shield" size={40} color={colors.primary} />
          </View>
          <Text style={styles.appName}>BDE Farm Trac</Text>
          <Text style={styles.tagline}>Red Tractor Compliance{"\n"}Made Simple</Text>
        </View>

        <View style={styles.formSection}>
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            placeholder="you@yourfarm.co.uk"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock"
          />

          <Button
            title={loading ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            icon="log-in"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Demo Access"
            onPress={handleDemoAccess}
            variant="outline"
            fullWidth
            icon="play"
            disabled={loading}
          />

          <Text style={styles.footer}>
            bdefarmtrac.co.uk
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
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
