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
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { OrganicOutdoorAccess } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const ANIMAL_GROUPS = [
  "Dairy Cattle",
  "Beef Cattle",
  "Sheep / Lambs",
  "Pigs",
  "Poultry — Layers",
  "Poultry — Broilers",
  "Goats",
  "Other",
];

const RESTRICTION_REASONS = [
  "Severe weather conditions",
  "Disease risk / veterinary advice",
  "Ground conditions (poaching risk)",
  "Late season / crop establishment",
  "Regulatory restriction",
  "Other",
];

const COMPLIANCE_OPTIONS = [
  { key: "compliant", label: "Compliant", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "derogation", label: "Derogation", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "non-compliant", label: "Non-Compliant", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

function matchesAnimalGroup(herdType: string, group: string): boolean {
  const t = herdType.toLowerCase().trim();
  const g = group.toLowerCase().split(/[\s/—-]/)[0].trim();
  return t === g || t.startsWith(g) || g.startsWith(t);
}

export default function OrganicOutdoorAccessScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds } = useApiHerds(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [animalGroup, setAnimalGroup] = useState("");
  const [herdFlockName, setHerdFlockName] = useState("");
  const [date, setDate] = useState(todayDate());
  const [accessProvided, setAccessProvided] = useState<boolean | null>(null);
  const [durationHours, setDurationHours] = useState("");
  const [numberOfAnimals, setNumberOfAnimals] = useState("");
  const [pastureArea, setPastureArea] = useState("");
  const [complianceStatus, setComplianceStatus] = useState("compliant");
  const [restrictionReason, setRestrictionReason] = useState("");
  const [paddockArea, setPaddockArea] = useState("");
  const [notes, setNotes] = useState("");

  const filteredHerds = animalGroup
    ? herds.filter(h => matchesAnimalGroup(h.type, animalGroup))
    : herds;

  const handleSave = async () => {
    if (!animalGroup.trim()) {
      Alert.alert("Required Field", "Please select or enter an animal group.");
      return;
    }
    if (!date.trim()) {
      Alert.alert("Required Field", "Please enter the date.");
      return;
    }
    if (accessProvided === null) {
      Alert.alert("Required Field", "Please indicate whether outdoor access was provided.");
      return;
    }
    if (!accessProvided && !restrictionReason.trim()) {
      Alert.alert("Required Field", "Please provide a reason for restricting outdoor access.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicOutdoorAccess = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      animalGroup: animalGroup.trim(),
      herdFlockName: herdFlockName.trim(),
      date: date.trim(),
      accessProvided: accessProvided ?? true,
      durationHours: durationHours.trim(),
      numberOfAnimals: numberOfAnimals.trim(),
      pastureArea: pastureArea.trim(),
      complianceStatus,
      restrictionReason: restrictionReason.trim(),
      paddockArea: paddockArea.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_OUTDOOR_ACCESS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Outdoor Access Recorded",
      "Record saved and will sync when online.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Outdoor Access Log</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <Feather name="sun" size={14} color="#d97706" />
            <Text style={styles.infoText}>
              Organic livestock must have access to open-air exercise areas. Log daily outdoor access and record any restrictions with reasons — required for scheme compliance.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Group &amp; Date</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Animal Group *</Text>
              <View style={styles.chipWrap}>
                {ANIMAL_GROUPS.map((g) => (
                  <Pressable
                    key={g}
                    style={[styles.chip, animalGroup === g && styles.chipActive]}
                    onPress={() => { Haptics.selectionAsync(); setAnimalGroup(g); setHerdFlockName(""); }}
                  >
                    <Text style={[styles.chipText, animalGroup === g && styles.chipTextActive]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
              <Input
                placeholder="Or type custom group name..."
                value={ANIMAL_GROUPS.includes(animalGroup) ? "" : animalGroup}
                onChangeText={v => { setAnimalGroup(v); setHerdFlockName(""); }}
                style={{ marginTop: spacing.sm }}
              />
            </View>

            {filteredHerds.length > 0 ? (
              <View style={styles.field}>
                <Text style={styles.label}>Herd / Flock (from Livestock Register)</Text>
                <View style={styles.chipWrap}>
                  {filteredHerds.map((h) => (
                    <Pressable
                      key={h.id}
                      style={[styles.chip, herdFlockName === h.name && styles.chipActive]}
                      onPress={() => { Haptics.selectionAsync(); setHerdFlockName(herdFlockName === h.name ? "" : h.name); }}
                    >
                      <Text style={[styles.chipText, herdFlockName === h.name && styles.chipTextActive]}>
                        {h.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Input
                  placeholder="Or type herd / flock name..."
                  value={filteredHerds.some(h => h.name === herdFlockName) ? "" : herdFlockName}
                  onChangeText={setHerdFlockName}
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.label}>Herd / Flock Name</Text>
                <Input
                  placeholder="e.g. Main Dairy Herd, North Flock"
                  value={herdFlockName}
                  onChangeText={setHerdFlockName}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Date *</Text>
              <Input placeholder="YYYY-MM-DD" value={date} onChangeText={setDate} maxDate="today" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Access Provided?</Text>

            <View style={styles.accessRow}>
              <Pressable
                style={[
                  styles.accessBtn,
                  accessProvided === true && { backgroundColor: "#f0fdf4", borderColor: "#16a34a" },
                ]}
                onPress={() => { Haptics.selectionAsync(); setAccessProvided(true); }}
              >
                <Feather name="check-circle" size={20} color={accessProvided === true ? "#16a34a" : colors.textSecondary} />
                <Text style={[styles.accessLabel, { color: accessProvided === true ? "#16a34a" : colors.textSecondary }]}>
                  Yes — Access Provided
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.accessBtn,
                  accessProvided === false && { backgroundColor: "#fef2f2", borderColor: "#dc2626" },
                ]}
                onPress={() => { Haptics.selectionAsync(); setAccessProvided(false); }}
              >
                <Feather name="x-circle" size={20} color={accessProvided === false ? "#dc2626" : colors.textSecondary} />
                <Text style={[styles.accessLabel, { color: accessProvided === false ? "#dc2626" : colors.textSecondary }]}>
                  No — Access Restricted
                </Text>
              </Pressable>
            </View>

            {accessProvided === true && (
              <>
                <View style={[styles.field, { marginTop: spacing.md }]}>
                  <Text style={styles.label}>Duration (hours, optional)</Text>
                  <Input
                    placeholder="e.g. 8"
                    value={durationHours}
                    onChangeText={setDurationHours}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Number of Animals</Text>
                    <Input
                      placeholder="e.g. 120"
                      value={numberOfAnimals}
                      onChangeText={setNumberOfAnimals}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Pasture Area (ha)</Text>
                    <Input
                      placeholder="e.g. 4.5"
                      value={pastureArea}
                      onChangeText={setPastureArea}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Paddock / Area Used (optional)</Text>
                  <Input
                    placeholder="e.g. North paddock, 3.2 ha"
                    value={paddockArea}
                    onChangeText={setPaddockArea}
                  />
                </View>
              </>
            )}

            {accessProvided === false && (
              <>
                <View style={styles.restrictionWarning}>
                  <Feather name="alert-triangle" size={13} color="#92400e" />
                  <Text style={styles.restrictionText}>
                    A valid reason must be recorded whenever outdoor access is restricted. Continued restrictions may require certifier notification.
                  </Text>
                </View>

                <View style={[styles.field, { marginTop: spacing.md }]}>
                  <Text style={styles.label}>Reason for Restriction *</Text>
                  <View style={styles.chipWrap}>
                    {RESTRICTION_REASONS.map((r) => (
                      <Pressable
                        key={r}
                        style={[styles.chip, restrictionReason === r && styles.chipActive]}
                        onPress={() => { Haptics.selectionAsync(); setRestrictionReason(r); }}
                      >
                        <Text style={[styles.chipText, restrictionReason === r && styles.chipTextActive]}>{r}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Input
                    placeholder="Or describe the restriction reason..."
                    value={RESTRICTION_REASONS.includes(restrictionReason) ? "" : restrictionReason}
                    onChangeText={setRestrictionReason}
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compliance Status</Text>
            <View style={styles.complianceRow}>
              {COMPLIANCE_OPTIONS.map((o) => (
                <Pressable
                  key={o.key}
                  style={[
                    styles.complianceChip,
                    {
                      borderColor: complianceStatus === o.key ? o.color : colors.border,
                      backgroundColor: complianceStatus === o.key ? o.bg : colors.surface,
                    },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setComplianceStatus(o.key); }}
                >
                  <View style={[styles.complianceDot, { backgroundColor: o.color }]} />
                  <Text style={[styles.complianceLabel, { color: complianceStatus === o.key ? o.color : colors.textSecondary }]}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Additional observations, weather conditions, operator..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.textarea}
              />
            </View>
          </View>

          <Button
            title={saving ? "Saving…" : "Save Outdoor Access Record"}
            onPress={handleSave}
            disabled={saving}
          />
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: "#fff" },
  accessRow: { gap: spacing.sm },
  accessBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  accessLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  restrictionWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginTop: spacing.md,
  },
  restrictionText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
  complianceRow: { gap: spacing.sm },
  complianceChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  complianceDot: { width: 8, height: 8, borderRadius: 4 },
  complianceLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  textarea: { minHeight: 90, textAlignVertical: "top" },
});
