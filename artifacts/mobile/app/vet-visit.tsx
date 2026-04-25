import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";
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
import { HerdPicker } from "@/components/ui/HerdPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

const VISIT_REASONS = [
  { key: "routine-health-check", label: "Routine Health Check", icon: "activity" as const },
  { key: "illness-treatment", label: "Illness / Treatment", icon: "thermometer" as const },
  { key: "tb-testing", label: "TB Testing", icon: "shield" as const },
  { key: "pregnancy-scanning", label: "Pregnancy Scanning", icon: "eye" as const },
  { key: "calving-lambing-assist", label: "Calving / Lambing Assistance", icon: "heart" as const },
  { key: "vaccination", label: "Vaccination Programme", icon: "zap" as const },
  { key: "post-mortem", label: "Post-Mortem Examination", icon: "file-text" as const },
  { key: "emergency", label: "Emergency Call-Out", icon: "alert-triangle" as const },
  { key: "other", label: "Other", icon: "more-horizontal" as const },
];

const ADMIN_ROUTES = ["Oral", "Injection IM", "Injection IV", "Injection SC", "Topical", "Intramammary", "Eye/Ear", "Other"];

interface MedicineRow {
  id: string;
  medicineName: string;
  batchNumber: string;
  dose: string;
  route: string;
  withdrawalDays: string;
  vetDispensed: boolean;
}

function MedicineEntry({
  med,
  onChange,
  onRemove,
}: {
  med: MedicineRow;
  onChange: (m: MedicineRow) => void;
  onRemove: () => void;
}) {
  return (
    <View style={medStyles.card}>
      <View style={medStyles.cardHeader}>
        <Feather name="package" size={14} color={colors.primary} />
        <Text style={medStyles.cardTitle}>Medicine</Text>
        <Pressable onPress={onRemove} style={medStyles.removeBtn}>
          <Feather name="x" size={14} color={colors.error} />
        </Pressable>
      </View>
      <Input
        label="Medicine name *"
        placeholder="e.g. Oxytetracycline 200 mg/ml"
        value={med.medicineName}
        onChangeText={v => onChange({ ...med, medicineName: v })}
      />
      <View style={medStyles.row}>
        <View style={medStyles.half}>
          <Input
            label="Batch number"
            placeholder="e.g. B2401"
            value={med.batchNumber}
            onChangeText={v => onChange({ ...med, batchNumber: v })}
          />
        </View>
        <View style={medStyles.half}>
          <Input
            label="Dose"
            placeholder="e.g. 10 ml"
            value={med.dose}
            onChangeText={v => onChange({ ...med, dose: v })}
          />
        </View>
      </View>
      <View style={medStyles.row}>
        <View style={medStyles.half}>
          <Input
            label="Withdrawal (days)"
            placeholder="e.g. 28"
            value={med.withdrawalDays}
            onChangeText={v => onChange({ ...med, withdrawalDays: v })}
            keyboardType="number-pad"
          />
        </View>
        <View style={medStyles.half}>
          <Text style={medStyles.routeLabel}>Route</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {["Inj. IM", "Inj. SC", "Oral", "Topical", "Other"].map(r => (
                <Pressable
                  key={r}
                  onPress={() => { Haptics.selectionAsync(); onChange({ ...med, route: r }); }}
                  style={[medStyles.routeChip, med.route === r && medStyles.routeChipOn]}
                >
                  <Text style={[medStyles.routeChipText, med.route === r && medStyles.routeChipTextOn]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
      <Pressable
        onPress={() => { Haptics.selectionAsync(); onChange({ ...med, vetDispensed: !med.vetDispensed }); }}
        style={[medStyles.toggleRow, med.vetDispensed && medStyles.toggleRowOn]}
      >
        <Feather name={med.vetDispensed ? "check-square" : "square"} size={16} color={med.vetDispensed ? colors.primary : colors.textSecondary} />
        <Text style={[medStyles.toggleText, med.vetDispensed && medStyles.toggleTextOn]}>Vet-dispensed (supplied by vet at visit)</Text>
      </Pressable>
    </View>
  );
}

export default function VetVisitScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds, loading: herdsLoading, fromCache: herdsCached } = useApiHerds(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [visitDate, setVisitDate] = useState(today);
  const [visitReason, setVisitReason] = useState<string>("illness-treatment");
  const [vetName, setVetName] = useState("");
  const [vetPractice, setVetPractice] = useState("");
  const [herdName, setHerdName] = useState("");
  const [animalTags, setAnimalTags] = useState("");
  const [clinicalFindings, setClinicalFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptionRef, setPrescriptionRef] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [callOutCost, setCallOutCost] = useState("");
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [notes, setNotes] = useState("");

  function addMedicine() {
    Haptics.selectionAsync();
    setMedicines(prev => [
      ...prev,
      { id: generateId(), medicineName: "", batchNumber: "", dose: "", route: "Inj. IM", withdrawalDays: "", vetDispensed: true },
    ]);
  }

  function updateMedicine(id: string, updated: MedicineRow) {
    setMedicines(prev => prev.map(m => (m.id === id ? updated : m)));
  }

  function removeMedicine(id: string) {
    Haptics.selectionAsync();
    setMedicines(prev => prev.filter(m => m.id !== id));
  }

  async function handleSave() {
    if (!visitReason || !clinicalFindings.trim()) {
      Alert.alert("Required Fields", "Please select a visit reason and describe the clinical findings.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const apiBase = getApiBase();
        const objectPath = await uploadPhotoToStorage(photoUri, apiBase, "vet-visit-document.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch { /* best-effort */ }
    }

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      visitDate,
      visitReason,
      vetName: vetName.trim(),
      vetPractice: vetPractice.trim(),
      herdName: herdName.trim(),
      animalTags: animalTags.trim(),
      clinicalFindings: clinicalFindings.trim(),
      diagnosis: diagnosis.trim(),
      prescriptionRef: prescriptionRef.trim(),
      followUpRequired,
      followUpDate: followUpRequired ? followUpDate : "",
      callOutCost: callOutCost.trim(),
      medicines: medicines.filter(m => m.medicineName.trim()),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.VET_VISITS, { ...record, documentUrl });
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Visit Logged",
      "Vet visit recorded and queued for dashboard sync. Remember to add the vet invoice in the Vet Ledger on the dashboard once received.",
      [{ text: "Done", onPress: () => router.back() }],
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Log Vet Visit</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Visit date */}
          <Input
            label="Visit date *"
            placeholder="YYYY-MM-DD"
            value={visitDate}
            onChangeText={setVisitDate}
          />

          {/* Reason for visit */}
          <View style={styles.sectionLabel}>
            <Feather name="clipboard" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Reason for Visit *</Text>
          </View>
          <View style={styles.reasonGrid}>
            {VISIT_REASONS.map(r => (
              <Pressable
                key={r.key}
                onPress={() => { Haptics.selectionAsync(); setVisitReason(r.key); }}
                style={[
                  styles.reasonCard,
                  visitReason === r.key && { borderColor: colors.primary, backgroundColor: colors.primary + "10" },
                ]}
              >
                <View style={[styles.reasonIcon, { backgroundColor: visitReason === r.key ? colors.primary + "20" : colors.surfaceAlt }]}>
                  <Feather name={r.icon} size={15} color={visitReason === r.key ? colors.primary : colors.textSecondary} />
                </View>
                <Text style={[styles.reasonLabel, visitReason === r.key && { color: colors.primary, fontFamily: fonts.semiBold }]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Vet details */}
          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Veterinary Details</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Vet name"
                placeholder="e.g. James Farrow"
                value={vetName}
                onChangeText={setVetName}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Practice name"
                placeholder="e.g. Minster Vets"
                value={vetPractice}
                onChangeText={setVetPractice}
              />
            </View>
          </View>

          {/* Animals affected */}
          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Animals Affected</Text>
          </View>
          {(herdsLoading || herdsCached) ? (
            <Input
              label="Herd / Group"
              placeholder="e.g. Spring calves, Milking herd"
              value={herdName}
              onChangeText={setHerdName}
            />
          ) : (
            <HerdPicker
              herds={herds}
              selected={herdName}
              onSelect={setHerdName}
              label="Herd / Group"
            />
          )}
          <Input
            label="Individual animal tags (optional)"
            placeholder="e.g. UK123456 789012, UK123456 789013"
            value={animalTags}
            onChangeText={setAnimalTags}
          />

          {/* Clinical findings */}
          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color="#f97316" />
            <Text style={styles.sectionTitle}>Clinical Findings *</Text>
          </View>
          <Input
            label=""
            placeholder="Describe what was observed — clinical signs, affected body systems, onset, severity, number of animals…"
            value={clinicalFindings}
            onChangeText={setClinicalFindings}
            multiline
            numberOfLines={4}
          />
          <Input
            label="Diagnosis / Suspected diagnosis"
            placeholder="e.g. Bovine Respiratory Disease, Ringworm, Digital Dermatitis"
            value={diagnosis}
            onChangeText={setDiagnosis}
          />

          {/* Medicines */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Medicines Administered</Text>
          </View>
          {medicines.map(m => (
            <MedicineEntry
              key={m.id}
              med={m}
              onChange={updated => updateMedicine(m.id, updated)}
              onRemove={() => removeMedicine(m.id)}
            />
          ))}
          <Pressable onPress={addMedicine} style={styles.addMedBtn}>
            <Feather name="plus-circle" size={15} color={colors.primary} />
            <Text style={styles.addMedText}>Add Medicine</Text>
          </Pressable>
          {medicines.length > 0 && (
            <View style={styles.infoRow}>
              <Feather name="info" size={13} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Also record medicines used from your own stock in the Medicine Records form to track withdrawal periods.
              </Text>
            </View>
          )}

          {/* Prescription & cost */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Prescription ref"
                placeholder="e.g. RX-2026-001"
                value={prescriptionRef}
                onChangeText={setPrescriptionRef}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Call-out cost (£)"
                placeholder="e.g. 85.00"
                value={callOutCost}
                onChangeText={setCallOutCost}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Follow-up */}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setFollowUpRequired(f => !f); }}
            style={[styles.followUpToggle, followUpRequired && styles.followUpToggleOn]}
          >
            <Feather name={followUpRequired ? "check-square" : "square"} size={18} color={followUpRequired ? colors.primary : colors.textSecondary} />
            <Text style={[styles.followUpText, followUpRequired && styles.followUpTextOn]}>Follow-up required</Text>
          </Pressable>
          {followUpRequired && (
            <Input
              label="Follow-up due date"
              placeholder="YYYY-MM-DD"
              value={followUpDate}
              onChangeText={setFollowUpDate}
            />
          )}

          <Input
            label="Additional notes"
            placeholder="Any other observations, instructions from the vet, or actions taken…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.infoRow}>
            <Feather name="cloud" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              Visit will sync to the Vet Ledger on the dashboard when connectivity is restored. Add the vet invoice in the Vet Ledger once received to reconcile costs.
            </Text>
          </View>

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Vet Report / Prescription"
            promptTitle="Attach Vet Visit Document"
          />

          <Button
            title={saving ? "Saving…" : "Log Vet Visit"}
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  form: { padding: spacing.lg, paddingBottom: spacing.xxl },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },

  reasonGrid: { gap: spacing.sm },
  reasonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  reasonIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  reasonLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },

  row: { flexDirection: "row", gap: spacing.md },
  halfInput: { flex: 1 },

  addMedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary + "60",
    borderStyle: "dashed",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  addMedText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },

  followUpToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  followUpToggleOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "0a",
  },
  followUpText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  followUpTextOn: { color: colors.primary },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  saveButton: { marginTop: spacing.md },
});

const medStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  removeBtn: { padding: 4 },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
  routeLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4 },
  routeChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  routeChipOn: { borderColor: colors.primary, backgroundColor: colors.primary + "12" },
  routeChipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  routeChipTextOn: { color: colors.primary },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  toggleRowOn: {},
  toggleText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  toggleTextOn: { color: colors.primary },
});
