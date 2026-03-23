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
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { DiversificationRecord } from "@/lib/types";

type ActivityType = DiversificationRecord["activityType"];

const ENTERPRISES = [
  "Farm Stays / Holiday Lets",
  "Camping / Glamping",
  "Wedding & Events Venue",
  "Farm Shop",
  "Pick Your Own",
  "Farm Tours / Education",
  "Equestrian Livery",
  "Storage / Warehousing",
  "Renewable Energy (Solar / Wind)",
  "Dog Kennel / Cattery",
  "Other",
];

const ACTIVITY_TYPES: { key: ActivityType; label: string; icon: string }[] = [
  { key: "booking", label: "Booking Made", icon: "calendar" },
  { key: "check_in", label: "Guest Check-in", icon: "log-in" },
  { key: "check_out", label: "Guest Check-out", icon: "log-out" },
  { key: "income", label: "Income Received", icon: "dollar-sign" },
  { key: "expense", label: "Expense Recorded", icon: "minus-circle" },
  { key: "inspection", label: "Safety Inspection", icon: "shield" },
  { key: "visitor_waiver", label: "Visitor Waiver Signed", icon: "file-text" },
  { key: "other", label: "Other Activity", icon: "more-horizontal" },
];

const PAYMENT_METHODS = ["Cash", "Card", "Bank Transfer", "Online Booking", "Cheque", "Other"];

export default function DiversificationRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [enterprise, setEnterprise] = useState("");
  const [activityDate, setActivityDate] = useState(today);
  const [activityType, setActivityType] = useState<ActivityType>("booking");
  const [guestOrGroupName, setGuestOrGroupName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [amountGbp, setAmountGbp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const isFinancial = activityType === "income" || activityType === "expense" || activityType === "booking";
  const isGuestEvent = activityType === "check_in" || activityType === "check_out" || activityType === "booking";

  const handleSave = async () => {
    if (!enterprise.trim() || !activityDate) {
      Alert.alert("Required Fields", "Please select the enterprise and enter the date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DiversificationRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      enterprise: enterprise.trim(),
      activityDate,
      activityType,
      guestOrGroupName: guestOrGroupName.trim(),
      numberOfGuests: numberOfGuests.trim(),
      amountGbp: amountGbp.trim(),
      paymentMethod,
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.DIVERSIFICATION_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Diversification record saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Farm Diversification Record</Text>
            <Text style={styles.subtitle}>Bookings, check-ins, income & visitor records</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Enterprise</Text>
          <Text style={styles.label}>Enterprise Type *</Text>
          <View style={styles.chipRow}>
            {ENTERPRISES.map((e) => (
              <Pressable key={e} onPress={() => setEnterprise(e)} style={[styles.chip, enterprise === e && styles.chipActive]}>
                <Text style={[styles.chipText, enterprise === e && styles.chipTextActive]}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Activity</Text>
          <Input label="Date *" value={activityDate} onChangeText={setActivityDate} placeholder="YYYY-MM-DD" />
          <Text style={styles.label}>Activity Type</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_TYPES.map((a) => (
              <Pressable key={a.key} onPress={() => setActivityType(a.key)} style={[styles.chip, activityType === a.key && styles.chipActive]}>
                <Feather name={a.icon as any} size={12} color={activityType === a.key ? colors.primary : colors.textSecondary} />
                <Text style={[styles.chipText, activityType === a.key && styles.chipTextActive]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          {isGuestEvent && (
            <>
              <Text style={styles.sectionTitle}>Guest Details</Text>
              <Input label="Guest / Group Name" value={guestOrGroupName} onChangeText={setGuestOrGroupName} placeholder="Name or booking reference" />
              <Input label="Number of Guests" value={numberOfGuests} onChangeText={setNumberOfGuests} placeholder="e.g. 4" keyboardType="numeric" />
            </>
          )}

          {isFinancial && (
            <>
              <Text style={styles.sectionTitle}>Financial</Text>
              <Input label="Amount (£)" value={amountGbp} onChangeText={setAmountGbp} placeholder="e.g. 250.00" keyboardType="decimal-pad" />
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.chipRow}>
                {PAYMENT_METHODS.map((p) => (
                  <Pressable key={p} onPress={() => setPaymentMethod(p)} style={[styles.chip, paymentMethod === p && styles.chipActive]}>
                    <Text style={[styles.chipText, paymentMethod === p && styles.chipTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
              <Input label="Reference / Invoice Number" value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Booking or invoice ref" />
            </>
          )}

          {activityType === "inspection" && (
            <>
              <Text style={styles.sectionTitle}>Inspection</Text>
              <Input label="Reference Number" value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Inspection cert or reference" />
            </>
          )}

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional details…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  saveButton: { marginTop: spacing.lg },
});
