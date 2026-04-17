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
import type { EquineHealthEventRecord } from "@/lib/types";

const EVENT_TYPES: { key: EquineHealthEventRecord["eventType"]; label: string; icon: string }[] = [
  { key: "vaccination", label: "Vaccination", icon: "shield" },
  { key: "worming", label: "Worming", icon: "activity" },
  { key: "farrier", label: "Farrier", icon: "tool" },
  { key: "dental", label: "Dental", icon: "user" },
  { key: "vet_visit", label: "Vet Visit", icon: "heart" },
  { key: "passport_check", label: "Passport Check", icon: "file-text" },
  { key: "other", label: "Other", icon: "more-horizontal" },
];

export default function EquineHealthEventScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [horseName, setHorseName] = useState("");
  const [eventDate, setEventDate] = useState(today);
  const [eventType, setEventType] = useState<EquineHealthEventRecord["eventType"]>("vet_visit");
  const [vetOrFarrierName, setVetOrFarrierName] = useState("");
  const [treatmentGiven, setTreatmentGiven] = useState("");
  const [productUsed, setProductUsed] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const showProduct = eventType === "vaccination" || eventType === "worming";

  const handleSave = async () => {
    if (!horseName.trim() || !eventDate) {
      Alert.alert("Required Fields", "Please enter the horse name and event date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: EquineHealthEventRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      horseName: horseName.trim(),
      eventDate,
      eventType,
      vetOrFarrierName: vetOrFarrierName.trim(),
      treatmentGiven: treatmentGiven.trim(),
      productUsed: productUsed.trim(),
      batchNumber: batchNumber.trim(),
      nextDueDate: nextDueDate.trim(),
      cost: cost.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.EQUINE_HEALTH_EVENTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Equine health event saved offline and queued for sync.", [
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
            <Text style={styles.title}>Equine Health Event</Text>
            <Text style={styles.subtitle}>Vaccination, worming, farrier & vet visits</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Horse</Text>
          <Input label="Horse Name *" value={horseName} onChangeText={setHorseName} placeholder="e.g. Star, Dobbin" />
          <Input label="Event Date *" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.sectionTitle}>Event Type</Text>
          <View style={styles.chipRow}>
            {EVENT_TYPES.map((e) => (
              <Pressable key={e.key} onPress={() => setEventType(e.key)} style={[styles.chip, eventType === e.key && styles.chipActive]}>
                <Feather name={e.icon as any} size={12} color={eventType === e.key ? colors.primary : colors.textSecondary} />
                <Text style={[styles.chipText, eventType === e.key && styles.chipTextActive]}>{e.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          <Input
            label={eventType === "farrier" ? "Farrier Name" : "Vet / Farrier Name"}
            value={vetOrFarrierName}
            onChangeText={setVetOrFarrierName}
            placeholder="Name of attending vet or farrier"
          />
          <Input
            label="Treatment Given"
            value={treatmentGiven}
            onChangeText={setTreatmentGiven}
            placeholder="e.g. Annual vaccination, trim and shoe"
          />

          {showProduct && (
            <>
              <Input label="Product Used" value={productUsed} onChangeText={setProductUsed} placeholder="e.g. Equilis Prequenza, Equest" />
              <Input label="Batch / Lot Number" value={batchNumber} onChangeText={setBatchNumber} placeholder="From product packaging" />
            </>
          )}

          <Input label="Next Due Date" value={nextDueDate} onChangeText={setNextDueDate} placeholder="YYYY-MM-DD" />
          <Input label="Cost (£)" value={cost} onChangeText={setCost} placeholder="e.g. 65.00" keyboardType="decimal-pad" />
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  saveButton: { marginTop: spacing.lg },
});
