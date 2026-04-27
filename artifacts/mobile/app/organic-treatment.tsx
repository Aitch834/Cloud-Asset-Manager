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
import type { OrganicTreatment } from "@/lib/types";

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

const ROUTES_OF_ADMIN = [
  "Oral",
  "Injection — IM",
  "Injection — IV",
  "Injection — SC",
  "Topical",
  "Pour-on",
  "Intramammary",
  "Other",
];

export default function OrganicTreatmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [animalGroup, setAnimalGroup] = useState("");
  const [animalIdentifiers, setAnimalIdentifiers] = useState("");
  const [dateOfTreatment, setDateOfTreatment] = useState(todayDate());
  const [medicineProduct, setMedicineProduct] = useState("");
  const [dosage, setDosage] = useState("");
  const [routeOfAdmin, setRouteOfAdmin] = useState("");
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState("");
  const [certifierNotified, setCertifierNotified] = useState<boolean | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!animalGroup.trim()) {
      Alert.alert("Required Field", "Please select or enter an animal group.");
      return;
    }
    if (!medicineProduct.trim()) {
      Alert.alert("Required Field", "Please enter the medicine or product name.");
      return;
    }
    if (!dateOfTreatment.trim()) {
      Alert.alert("Required Field", "Please enter the treatment date.");
      return;
    }
    if (certifierNotified === null) {
      Alert.alert("Required Field", "Please indicate whether your certifier was notified.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicTreatment = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      animalGroup: animalGroup.trim(),
      animalIdentifiers: animalIdentifiers.trim(),
      dateOfTreatment: dateOfTreatment.trim(),
      medicineProduct: medicineProduct.trim(),
      dosage: dosage.trim(),
      routeOfAdmin: routeOfAdmin.trim(),
      withdrawalPeriodDays: withdrawalPeriodDays.trim(),
      certifierNotified: certifierNotified ?? false,
      batchNumber: batchNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_TREATMENTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Treatment Recorded",
      "Treatment record saved and will sync when online.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Record Treatment</Text>
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
            <Feather name="thermometer" size={14} color="#7c3aed" />
            <Text style={styles.infoText}>
              All medicines used on organic livestock must be recorded — including homeopathic and phytotherapy treatments. Allopathic or antibiotic treatments may require certifier notification and extended withdrawal periods.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Animal Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Animal Group *</Text>
              <View style={styles.chipWrap}>
                {ANIMAL_GROUPS.map((g) => (
                  <Pressable
                    key={g}
                    style={[styles.chip, animalGroup === g && styles.chipActive]}
                    onPress={() => { Haptics.selectionAsync(); setAnimalGroup(g); }}
                  >
                    <Text style={[styles.chipText, animalGroup === g && styles.chipTextActive]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
              <Input
                placeholder="Or type custom group / enterprise..."
                value={ANIMAL_GROUPS.includes(animalGroup) ? "" : animalGroup}
                onChangeText={setAnimalGroup}
                style={{ marginTop: spacing.sm }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Animal Identifiers (ear tags, batch IDs)</Text>
              <Input
                placeholder="e.g. UK123456 7890, Pen 4B"
                value={animalIdentifiers}
                onChangeText={setAnimalIdentifiers}
                multiline
                numberOfLines={2}
                style={{ minHeight: 56, textAlignVertical: "top" }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Date of Treatment *</Text>
              <Input placeholder="YYYY-MM-DD" value={dateOfTreatment} onChangeText={setDateOfTreatment} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medicine / Product</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Product Name *</Text>
              <Input
                placeholder="e.g. Metacam 20 mg/mL, Arnica 30C"
                value={medicineProduct}
                onChangeText={setMedicineProduct}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Batch / Lot Number</Text>
              <Input placeholder="e.g. LT2045B" value={batchNumber} onChangeText={setBatchNumber} />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Dose Given</Text>
                <Input placeholder="e.g. 10 mL" value={dosage} onChangeText={setDosage} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Withdrawal (days)</Text>
                <Input
                  placeholder="e.g. 14"
                  value={withdrawalPeriodDays}
                  onChangeText={setWithdrawalPeriodDays}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Route of Administration</Text>
              <View style={styles.chipWrap}>
                {ROUTES_OF_ADMIN.map((r) => (
                  <Pressable
                    key={r}
                    style={[styles.chip, routeOfAdmin === r && styles.chipActive]}
                    onPress={() => { Haptics.selectionAsync(); setRouteOfAdmin(r); }}
                  >
                    <Text style={[styles.chipText, routeOfAdmin === r && styles.chipTextActive]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifier Notification</Text>

            <Text style={styles.certNote}>
              Organic standards generally require notifying your certifier when allopathic medicines (antibiotics, NSAIDs, etc.) are used. Record whether notification was made.
            </Text>

            <View style={styles.accessRow}>
              <Pressable
                style={[
                  styles.accessBtn,
                  certifierNotified === true && { backgroundColor: "#f0fdf4", borderColor: "#16a34a" },
                ]}
                onPress={() => { Haptics.selectionAsync(); setCertifierNotified(true); }}
              >
                <Feather name="check-circle" size={20} color={certifierNotified === true ? "#16a34a" : colors.textSecondary} />
                <Text style={[styles.accessLabel, { color: certifierNotified === true ? "#16a34a" : colors.textSecondary }]}>
                  Yes — Certifier Notified
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.accessBtn,
                  certifierNotified === false && { backgroundColor: "#fef2f2", borderColor: "#dc2626" },
                ]}
                onPress={() => { Haptics.selectionAsync(); setCertifierNotified(false); }}
              >
                <Feather name="x-circle" size={20} color={certifierNotified === false ? "#dc2626" : colors.textSecondary} />
                <Text style={[styles.accessLabel, { color: certifierNotified === false ? "#dc2626" : colors.textSecondary }]}>
                  No — Not Applicable / Not Notified
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Prescribing vet, diagnosis, withdrawal date calculated to, operator name..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.textarea}
              />
            </View>
          </View>

          <Button
            title={saving ? "Saving…" : "Save Treatment Record"}
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
    backgroundColor: "#f5f3ff",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#ddd6fe",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#6d28d9", flex: 1 },
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
  certNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
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
  accessLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, flex: 1 },
  textarea: { minHeight: 90, textAlignVertical: "top" },
});
