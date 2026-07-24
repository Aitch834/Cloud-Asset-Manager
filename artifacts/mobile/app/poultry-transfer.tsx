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

const TRANSFER_REASONS = ["Relocation", "Contract rearing", "Flock splitting", "Site consolidation", "Other"];

export default function PoultryTransferScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [toFarmName, setToFarmName] = useState("");
  const [toCph, setToCph] = useState("");
  const [transferDate] = useState(today);
  const [quantityTransferred, setQuantityTransferred] = useState("");
  const [reason, setReason] = useState(TRANSFER_REASONS[0]);
  const [transportCompany, setTransportCompany] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [driverName, setDriverName] = useState("");
  const [estimatedJourneyHours, setEstimatedJourneyHours] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!toFarmName.trim()) {
      Alert.alert("Required", "Please enter the destination farm name.");
      return;
    }
    if (!quantityTransferred.trim() || isNaN(Number(quantityTransferred))) {
      Alert.alert("Required", "Please enter a valid number of birds transferred.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      toFarmName: toFarmName.trim(),
      toCph: toCph.trim(),
      transferDate,
      quantityTransferred: quantityTransferred.trim(),
      reason,
      transportCompany: transportCompany.trim(),
      vehicleReg: vehicleReg.trim().toUpperCase(),
      driverName: driverName.trim(),
      estimatedJourneyHours: estimatedJourneyHours.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_TRANSFERS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Transfer Recorded",
      `${quantityTransferred} birds to ${toFarmName} — ${reason}.`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Inter-Site Transfer</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBanner}>
            <Feather name="info" size={16} color="#1d4ed8" />
            <Text style={styles.infoText}>
              Records movement of birds between holdings you own or manage. This is distinct from an FCI slaughter movement — use this for inter-site flock relocations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destination</Text>
            <Input
              label="Destination Farm / Holding Name"
              value={toFarmName}
              onChangeText={setToFarmName}
              placeholder="e.g. North Unit — Llanfair Farm"
              autoCapitalize="words"
            />
            <Input
              label="Destination CPH Number (optional)"
              value={toCph}
              onChangeText={setToCph}
              placeholder="e.g. 12/345/6789"
              autoCapitalize="characters"
            />
            <Input
              label="Transfer Date"
              value={transferDate}
              editable={false}
            />
            <Input
              label="Number of Birds Transferred"
              value={quantityTransferred}
              onChangeText={setQuantityTransferred}
              placeholder="e.g. 5000"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason</Text>
            <View style={styles.optionsRow}>
              {TRANSFER_REASONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setReason(opt)}
                  style={[styles.option, reason === opt && styles.optionActive]}
                >
                  <Text style={[styles.optionLabel, reason === opt && styles.optionLabelActive]}>
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport Details</Text>
            <Input
              label="Transport Company (optional)"
              value={transportCompany}
              onChangeText={setTransportCompany}
              placeholder="e.g. Williams Haulage"
              autoCapitalize="words"
            />
            <Input
              label="Vehicle Registration (optional)"
              value={vehicleReg}
              onChangeText={setVehicleReg}
              placeholder="e.g. AB12 CDE"
              autoCapitalize="characters"
            />
            <Input
              label="Driver Name (optional)"
              value={driverName}
              onChangeText={setDriverName}
              placeholder="e.g. John Williams"
              autoCapitalize="words"
            />
            <Input
              label="Estimated Journey Duration (hours, optional)"
              value={estimatedJourneyHours}
              onChangeText={setEstimatedJourneyHours}
              placeholder="e.g. 1.5"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Input
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes"
              multiline
            />
          </View>

          <Button
            title={saving ? "Saving…" : "Save Transfer Record"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { marginRight: spacing.sm },
  title: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.text },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#eff6ff", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, gap: spacing.xs },
  infoText: { flex: 1, fontSize: fontSize.sm, color: "#1d4ed8", fontFamily: fonts.regular, lineHeight: 18 },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.xs },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  option: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text },
  optionLabelActive: { color: "#fff", fontFamily: fonts.semiBold },
  saveButton: { marginTop: spacing.md },
});
