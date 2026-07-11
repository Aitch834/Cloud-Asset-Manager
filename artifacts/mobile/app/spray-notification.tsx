import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { getItem, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase } from "@/lib/uploadPhoto";

type RecipientType = "beekeeper" | "neighbour" | "other";
type Method = "phone" | "email" | "letter" | "in-person";

const RECIPIENT_TYPES: { key: RecipientType; label: string }[] = [
  { key: "beekeeper", label: "Beekeeper" },
  { key: "neighbour", label: "Neighbour" },
  { key: "other",     label: "Other" },
];

const METHODS: { key: Method; label: string; icon: string }[] = [
  { key: "phone",     label: "Phone",     icon: "phone" },
  { key: "email",     label: "Email",     icon: "mail" },
  { key: "letter",    label: "Letter",    icon: "mail" },
  { key: "in-person", label: "In Person", icon: "users" },
];

async function apiFetch(path: string, method: string, body?: object) {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${getApiBase()}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

export default function SprayNotificationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;
  const [saving, setSaving] = useState(false);

  const [notificationDate, setNotificationDate] = useState(new Date().toISOString().slice(0, 10));
  const [plannedSprayDate, setPlannedSprayDate] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("beekeeper");
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [method, setMethod] = useState<Method>("phone");
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");

  const save = async () => {
    if (!farmId || !notificationDate) {
      Alert.alert("Required", "Please enter the notification date.");
      return;
    }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/spray-notifications`, "POST", {
        notificationDate,
        plannedSprayDate: plannedSprayDate || null,
        recipientType,
        recipientName: recipientName || null,
        recipientContact: recipientContact || null,
        contactMethod: method,
        confirmed,
        notes: notes || null,
      });
      if (!res.ok) throw new Error("Server error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Notification Logged", "The spray notification has been recorded.", [
        { text: "Done", onPress: () => router.back() },
        { text: "Log Another", onPress: () => { setRecipientName(""); setRecipientContact(""); setNotes(""); setPlannedSprayDate(""); setConfirmed(false); } },
      ]);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save Failed", "Could not save the notification. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Spray Notification</Text>
            <Text style={styles.subtitle}>Red Tractor — Log pre-spray notification to beekeeper or neighbour</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>RECIPIENT</Text>

            <Text style={styles.fieldLabel}>Recipient Type</Text>
            <View style={styles.segRow}>
              {RECIPIENT_TYPES.map(t => (
                <Pressable
                  key={t.key}
                  style={[styles.seg, recipientType === t.key && styles.segSelected]}
                  onPress={() => setRecipientType(t.key)}
                >
                  <Text style={[styles.segText, recipientType === t.key && styles.segTextSelected]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Name</Text>
            <Input value={recipientName} onChangeText={setRecipientName} placeholder="Beekeeper or neighbour name" />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Phone / Email</Text>
            <Input value={recipientContact} onChangeText={setRecipientContact} placeholder="Contact details" />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>NOTIFICATION DETAILS</Text>

            <Text style={styles.fieldLabel}>Date Notified *</Text>
            <Input value={notificationDate} onChangeText={setNotificationDate} placeholder="YYYY-MM-DD" />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Planned Spray Date</Text>
            <Text style={styles.fieldSub}>Enter to check 48-hour lead time</Text>
            <Input value={plannedSprayDate} onChangeText={setPlannedSprayDate} placeholder="YYYY-MM-DD (optional)" style={{ marginTop: 4 }} />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Method</Text>
            <View style={styles.methodRow}>
              {METHODS.map(m => (
                <Pressable
                  key={m.key}
                  style={[styles.methodBtn, method === m.key && styles.methodBtnSelected]}
                  onPress={() => setMethod(m.key)}
                >
                  <Feather name={m.icon as any} size={14} color={method === m.key ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.methodBtnText, method === m.key && styles.methodBtnTextSelected]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.switchRow, { marginTop: spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Confirmation Received</Text>
                <Text style={styles.fieldSub}>Recipient confirmed they received the notification</Text>
              </View>
              <Switch value={confirmed} onValueChange={setConfirmed} trackColor={{ true: colors.primary }} />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} placeholder="Products to be applied, fields affected, date of spray…" multiline numberOfLines={3} />
          </View>

          <Button
            title={saving ? "Saving…" : "Log Notification"}
            onPress={save}
            disabled={saving || !notificationDate}
            style={styles.saveBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textTertiary, letterSpacing: 0.8 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  fieldSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  segRow: { flexDirection: "row", gap: spacing.xs, marginTop: spacing.xs },
  seg: { flex: 1, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight, alignItems: "center" },
  segSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "0D" },
  segText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  segTextSelected: { fontFamily: fonts.semiBold, color: colors.primary },
  methodRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  methodBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight },
  methodBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "0D" },
  methodBtnText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  methodBtnTextSelected: { fontFamily: fonts.semiBold, color: colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center" },
  saveBtn: { marginTop: spacing.sm },
});
