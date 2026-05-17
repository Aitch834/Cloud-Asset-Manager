import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
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
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId } from "@/lib/storage";

const today = new Date().toISOString().split("T")[0];

const LOCATIONS = [
  { value: "cellar-door", label: "Cellar Door" },
  { value: "shop", label: "Farm Shop" },
  { value: "tour", label: "Winery Tour" },
  { value: "event", label: "Event / Tasting" },
  { value: "other", label: "Other" },
];

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      style={[styles.toggleRow, value && styles.toggleRowActive]}
      onPress={() => { Haptics.selectionAsync(); onChange(!value); }}
    >
      <Feather name={value ? "check-square" : "square"} size={18} color={value ? colors.success : colors.textSecondary} />
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

function LocationPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.locationRow}>
      {LOCATIONS.map(loc => (
        <Pressable
          key={loc.value}
          style={[styles.locationBtn, value === loc.value && styles.locationBtnActive]}
          onPress={() => { Haptics.selectionAsync(); onChange(loc.value); }}
        >
          <Text style={[styles.locationBtnText, value === loc.value && styles.locationBtnTextActive]}>
            {loc.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function VineAgeRefusalScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [refusalDate, setRefusalDate] = useState(today);
  const [selectedStaff, setSelectedStaff] = useState<ApiFarmMember | null>(null);
  const [manualStaff, setManualStaff] = useState(user?.name || "");
  const staffName = selectedStaff ? memberFullName(selectedStaff) : manualStaff;

  const [location, setLocation] = useState("");
  const [estimatedAge, setEstimatedAge] = useState("");
  const [idRequested, setIdRequested] = useState(false);
  const [idProduced, setIdProduced] = useState(false);
  const [supervisorNotified, setSupervisorNotified] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!refusalDate || !staffName.trim()) {
      Alert.alert("Required Fields", "Please enter a date and the staff member who refused the sale.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      recordType: "refusal",
      recordDate: refusalDate,
      staffName: staffName.trim(),
      refusalLocation: location || undefined,
      estimatedAge: estimatedAge ? parseInt(estimatedAge, 10) : undefined,
      idRequested,
      idProduced,
      supervisorNotified,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_winery_age_verification", entry);
    await refreshPendingCount();

    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Log Age Verification Refusal</Text>
        </View>

        <View style={[styles.infoBanner]}>
          <Feather name="info" size={14} color="#7c3aed" style={{ marginTop: 1 }} />
          <Text style={styles.infoBannerText}>
            Challenge 25 — record every refusal made to a customer who appeared under 25 and could not produce valid ID. These records must be available for licensing authority inspection.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Refusal Details</Text>

          <Text style={styles.fieldLabel}>Date of Refusal *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={refusalDate}
            onChangeText={v => { if (v <= today) setRefusalDate(v); }}
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Staff Member Who Refused *</Text>
          <StaffMemberPicker
            members={members}
            selected={selectedStaff}
            onSelect={setSelectedStaff}
          />
          {!selectedStaff && (
            <Input
              placeholder={members.length ? "Or type name manually" : "Staff member name"}
              value={manualStaff}
              onChangeText={setManualStaff}
              style={{ marginTop: 4 }}
            />
          )}

          <Text style={styles.fieldLabel}>Location</Text>
          <LocationPicker value={location} onChange={setLocation} />

          <Text style={styles.fieldLabel}>Customer's Estimated Age</Text>
          <Input
            placeholder="e.g. 17"
            value={estimatedAge}
            onChangeText={setEstimatedAge}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions Taken</Text>
          <ToggleRow label="ID requested from customer" value={idRequested} onChange={setIdRequested} />
          <ToggleRow label="ID produced by customer" value={idProduced} onChange={setIdProduced} />
          <ToggleRow label="Supervisor notified" value={supervisorNotified} onChange={setSupervisorNotified} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            placeholder="Any additional details about the refusal…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button title={saving ? "Saving…" : "Save Refusal Record"} onPress={handleSave} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  backBtn: { padding: spacing.xs },
  title: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: colors.text, flex: 1 },
  infoBanner: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#f5f3ff", borderWidth: 1, borderColor: "#ddd6fe", borderRadius: radius.md, padding: spacing.sm },
  infoBannerText: { flex: 1, fontSize: fontSize.xs, color: "#5b21b6", lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.text },
  fieldLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: spacing.xs },
  locationRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  locationBtn: { paddingVertical: 6, paddingHorizontal: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  locationBtnActive: { borderColor: "#7c3aed", backgroundColor: "#f5f3ff" },
  locationBtnText: { fontSize: fontSize.xs, fontFamily: fonts.medium, color: colors.textSecondary },
  locationBtnTextActive: { color: "#7c3aed" },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  toggleRowActive: { borderColor: colors.success, backgroundColor: "#f0fdf4" },
  toggleLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },
});
