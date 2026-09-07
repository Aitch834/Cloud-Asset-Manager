import { useAuth, useSignUp, useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import { Link, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

export default function SignUpScreen() {
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  useEffect(() => { if (isSignedIn) router.replace("/(tabs)"); }, [isSignedIn]);
  const finish = useCallback(async () => {
    if (signUp.status === "complete") await signUp.finalize({ navigate: () => router.replace("/(tabs)") });
  }, [signUp]);
  const submit = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (!error) await signUp.verifications.sendEmailCode();
  };
  const google = async () => {
    const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google", redirectUrl: AuthSession.makeRedirectUri() });
    if (createdSessionId) await setActive?.({ session: createdSessionId, navigate: () => router.replace("/(tabs)") });
  };
  const verify = async () => { await signUp.verifications.verifyEmailCode({ code }); await finish(); };
  const verifying = signUp.status === "missing_requirements" && signUp.unverifiedFields.includes("email_address") && signUp.missingFields.length === 0;
  const busy = fetchStatus === "fetching";
  return <View style={styles.container}>
    <Text style={styles.title}>{verifying ? "Verify your email" : "Create your account"}</Text>
    {verifying ? <>
      <Text style={styles.copy}>Enter the verification code sent to your email address.</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={code} onChangeText={setCode} placeholder="Verification code" placeholderTextColor={colors.textTertiary} />
      <Pressable testID="verify-sign-up" style={styles.button} onPress={verify} disabled={busy}><Text style={styles.buttonText}>Verify email</Text></Pressable>
      <Pressable onPress={() => signUp.verifications.sendEmailCode()}><Text style={styles.link}>Send a new code</Text></Pressable>
    </> : <>
      <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={emailAddress} onChangeText={setEmailAddress} placeholder="Email address" placeholderTextColor={colors.textTertiary} />
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textTertiary} />
      <Pressable testID="sign-up-email" style={styles.button} onPress={submit} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}</Pressable>
      <Pressable testID="sign-up-google" style={styles.google} onPress={google} disabled={busy}><Text style={styles.googleText}>Continue with Google</Text></Pressable>
      <Text style={styles.copy}>Already have an account? <Link href="/login" style={styles.link}>Sign in</Link></Text><View nativeID="clerk-captcha" />
    </>}
    {errors.fields.emailAddress && <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>}
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, justifyContent: "center" }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: fontSize.xxl, marginBottom: spacing.lg }, copy: { color: colors.textSecondary, fontFamily: fonts.regular, marginTop: spacing.lg, textAlign: "center" }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, color: colors.text, fontFamily: fonts.regular }, button: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: "center" }, buttonText: { color: "#fff", fontFamily: fonts.bold }, google: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.md }, googleText: { color: colors.text, fontFamily: fonts.medium }, link: { color: colors.primary, fontFamily: fonts.bold, textAlign: "center", marginTop: spacing.lg }, error: { color: colors.error, marginTop: spacing.sm } });