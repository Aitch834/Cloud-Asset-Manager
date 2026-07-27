import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const STORAGE_TYPES = ["Indoor", "Outdoor Covered", "Outdoor Uncovered"];

export default function StrawJourneysScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const params = useLocalSearchParams<{ balingOpId?: string; fieldName?: string; totalBales?: string }>();
  const [saving, setSaving] = useState(false);

  const balingOpId = params.balingOpId ? Number(params.balingOpId) : null;
  const fieldLabel = params.fieldName || "Field";
  const totalBales = params.totalBales ? Number(params.totalBales) : null;

  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().slice(0, 10));
  const [journeyTime, setJourneyTime] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) =>
      setStaffOptions(members.map(m => ({ id: m.id, label: m.label, sublabel: m.role || undefined })))
    );
  }, [currentFarm?.id]);
  const [tractorDescription, setTractorDescription] = useState("");
  const [trailerDescription, setTrailerDescription] = useState("");
  const [balesMoved, setBalesMoved] = useState("");
  const [fromLocation, setFromLocation] = useState(params.fieldName || "");
  const [toLocation, setToLocation] = useState("");
  const [toStorageType, setToStorageType] = useState("Indoor");
  const [notes, setNotes] = useState("");

  async function save() {
    if (!balesMoved || isNaN(Number(balesMoved)) || Number(balesMoved) <= 0) {
      Alert.alert("Required", "Please enter the number of bales moved on this journey.");
      return;
    }
    if (!toLocation) {
      Alert.alert("Required", "Please enter the destination storage location.");
      return;
    }
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        balingOperationId: balingOpId,
        journeyDate,
        journeyTime: journeyTime || null,
        operatorName: operatorName || null,
        tractorDescription: tractorDescription || null,
        trailerDescription: trailerDescription || null,
        balesMoved: Number(balesMoved),
        fromLocation: fromLocation || null,
        toLocation,
        toStorageType,
        notes: notes || null,
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, {
        id: generateId(),
        recordType: "bde_straw_cartage_journeys",
        data: record,
        createdAt: new Date().toISOString(),
      });
      await refreshPendingCount();
      Alert.alert(
        "Journey Saved",
        `${balesMoved} bales → ${toLocation} recorded. It will sync when you're online.`,
        [
          { text: "Add Another Journey", onPress: resetForm },
          { text: "Done", onPress: () => router.back() },
        ]
      );
    } catch (e) {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setBalesMoved(""); setToLocation(""); setJourneyTime("");
    setOperatorName(""); setTractorDescription(""); setTrailerDescription(""); setNotes("");
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Cartage Journey</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Context banner */}
        <View style={styles.contextBanner}>
          <Feather name="truck" size={14} color="#92400e" />
          <Text style={styles.contextText}>
            <Text style={{ fontFamily: fonts.semiBold }}>Phase 2:</Text>
            {" "}Recording a trailer load from{" "}
            <Text style={{ fontFamily: fonts.semiBold }}>{fieldLabel}</Text>
            {totalBales != null ? ` (${totalBales} bales produced)` : ""} to storage.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Details</Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Date *</Text>
              <Input
                value={journeyDate}
                onChangeText={setJourneyDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Time (optional)</Text>
              <Input
                value={journeyTime}
                onChangeText={setJourneyTime}
                placeholder="HH:MM"
                style={styles.input}
              />
            </View>
          </View>

          <LookupPicker
            label="Operator Name"
            value={operatorName}
            options={staffOptions}
            onSelect={(_id, label) => setOperatorName(label)}
            placeholder="Select or type name…"
            allowFreeText
            icon="user"
          />

          <Text style={styles.label}>Bales This Journey *</Text>
          <Input
            value={balesMoved}
            onChangeText={setBalesMoved}
            keyboardType="number-pad"
            placeholder="e.g. 40"
            style={styles.input}
          />
          <Text style={styles.hint}>Number of bales on this single trailer load</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>

          <Text style={styles.label}>From (Field / Area)</Text>
          <Input
            value={fromLocation}
            onChangeText={setFromLocation}
            placeholder="Auto-filled from baling op"
            style={styles.input}
          />

          <Text style={styles.label}>To (Storage Location) *</Text>
          <Input
            value={toLocation}
            onChangeText={setToLocation}
            placeholder="e.g. Home Farm Barn 2"
            style={styles.input}
          />

          <Text style={styles.label}>Storage Type</Text>
          <View style={styles.chipRow}>
            {STORAGE_TYPES.map(t => (
              <Pressable
                key={t}
                style={[styles.chip, toStorageType === t && styles.chipActive]}
                onPress={() => setToStorageType(t)}
              >
                <Text style={[styles.chipText, toStorageType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Machine</Text>

          <Text style={styles.label}>Tractor</Text>
          <Input
            value={tractorDescription}
            onChangeText={setTractorDescription}
            placeholder="e.g. JD 6175R"
            style={styles.input}
          />

          <Text style={styles.label}>Trailer</Text>
          <Input
            value={trailerDescription}
            onChangeText={setTrailerDescription}
            placeholder="e.g. 14T grain trailer"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details…"
            multiline
            numberOfLines={3}
            style={[styles.input, { minHeight: 72, textAlignVertical: "top" }]}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
          <Button
            title={saving ? "Saving…" : "Save Journey"}
            onPress={save}
            disabled={saving || !balesMoved || !toLocation}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs, borderRadius: radius.sm },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  contextBanner: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#fef3c7", borderBottomWidth: 1, borderBottomColor: "#fde68a",
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  contextText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e" },
  section: {
    backgroundColor: colors.surface, marginHorizontal: spacing.md,
    marginTop: spacing.md, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 4, marginTop: spacing.sm },
  input: { marginBottom: 0 },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: "#d97706", borderColor: "#d97706" },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: "#fff", fontFamily: fonts.medium },
  saveBtn: { marginBottom: spacing.sm },
});
