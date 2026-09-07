import { Feather } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useAuth, useSignIn, useSSO } from "@clerk/expo";
import { Link, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  useWarmUpBrowser();

  useEffect(() => {
    if (isSignedIn) router.replace("/(tabs)");
  }, [isSignedIn]);

  const complete = useCallback(async () => {
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: () => router.replace("/(tabs)") });
    }
  }, [signIn]);

  const handleEmailSignIn = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (!error) await complete();
  };

  const handleGoogleSignIn = useCallback(async () => {
    const { createdSessionId, setActive } = await startSSOFlow({
      strategy: "oauth_google",
      redirectUrl: AuthSession.makeRedirectUri(),
    });
    if (createdSessionId) {
      await setActive?.({
        session: createdSessionId,
        navigate: () => router.replace("/(tabs)"),
      });
    }
  }, [startSSOFlow]);

  const busy = fetchStatus === "fetching";
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom }]}>
      <View style={styles.logoSection}>
        <View style={styles.logoBox}><Feather name="shield" size={40} color={colors.primary} /></View>
        <Text style={styles.appName}>BDE Farm Trac</Text>
        <Text style={styles.tagline}>Red Tractor Compliance{"\n"}Made Simple</Text>
      </View>
      <View style={styles.formSection}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.label}>Email address</Text>
        <TextInput style={styles.input} autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} placeholder="you@example.com" placeholderTextColor={colors.textTertiary} />
        {errors.fields.identifier && <Text style={styles.error}>{errors.fields.identifier.message}</Text>}
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} autoComplete="password" secureTextEntry value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={colors.textTertiary} />
        {errors.fields.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}
        <Pressable testID="sign-in-email" style={[styles.button, (!emailAddress || !password || busy) && styles.disabled]} disabled={!emailAddress || !password || busy} onPress={handleEmailSignIn}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
        <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} /></View>
        <Pressable testID="sign-in-google" style={styles.googleButton} onPress={handleGoogleSignIn} disabled={busy}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>
        <Text style={styles.signup}>New to BDE Farm Trac? <Link href="/sign-up" style={styles.link}>Create an account</Link></Text>
      </View>
      <Text style={styles.footer}>bdefarmtrac.co.uk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  logoSection: { alignItems: "center", marginBottom: spacing.xxl },
  logoBox: { width: 80, height: 80, borderRadius: radius.xl, backgroundColor: colors.primaryMuted + "33", alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  appName: { fontFamily: fonts.bold, fontSize: fontSize.xxl + 4, color: colors.primary, marginBottom: spacing.sm },
  tagline: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", lineHeight: 22 },
  formSection: { flex: 1 }, title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.xl },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.regular, marginBottom: spacing.md },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.sm },
  disabled: { opacity: 0.55 }, buttonText: { color: "#fff", fontFamily: fonts.bold, fontSize: fontSize.md },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: spacing.lg }, dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textTertiary, marginHorizontal: spacing.md, fontFamily: fonts.regular }, googleButton: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: "center" },
  googleText: { color: colors.text, fontFamily: fonts.medium, fontSize: fontSize.md }, signup: { color: colors.textSecondary, fontFamily: fonts.regular, textAlign: "center", marginTop: spacing.xl }, link: { color: colors.primary, fontFamily: fonts.bold },
  error: { color: colors.error, fontFamily: fonts.regular, fontSize: fontSize.sm, marginTop: -spacing.sm, marginBottom: spacing.sm }, footer: { textAlign: "center", color: colors.textTertiary, fontFamily: fonts.regular, fontSize: fontSize.sm },
});