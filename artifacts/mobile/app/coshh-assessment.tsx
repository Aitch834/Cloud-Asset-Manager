import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import {
  getCachedSuppliers,
  getRefCacheSyncedMinsAgo,
  syncRefData,
} from "@/lib/refCache";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { CoshhAssessment } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

type ExposureRisk = CoshhAssessment["exposureRisk"];

const HAZARD_CLASSIFICATIONS = [
  "Harmful (Xn)",
  "Irritant (Xi)",
  "Corrosive (C)",
  "Toxic (T)",
  "Very Toxic (T+)",
  "Flammable (F)",
  "Highly Flammable (F+)",
  "Oxidising (O)",
  "Explosive (E)",
  "Dangerous for Environment (N)",
  "Carcinogen / Mutagen",
  "Not classified hazardous",
];

const PPE_OPTIONS = ["Gloves", "Safety goggles", "Face shield", "Respirator / FFP3 mask", "Protective overalls", "Waterproof suit", "Rubber boots", "Apron", "None required"];

const RISK_LEVELS: { key: ExposureRisk; label: string; color: string; desc: string }[] = [
  { key: "low", label: "Low", color: colors.success, desc: "Minimal exposure likely with normal precautions" },
  { key: "medium", label: "Medium", color: colors.accent, desc: "Some risk — PPE and controls required" },
  { key: "high", label: "High", color: colors.error, desc: "Significant risk — strict controls mandatory" },
];

export default function CoshhAssessmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const farmId = currentFarm?.id ?? "";
  const today = new Date().toISOString().split("T")[0];
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const nextYearStr = nextYear.toISOString().split("T")[0];

  const [substanceName, setSubstanceName] = useState("");
  const [productReference, setProductReference] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierOptions, setSupplierOptions] = useState<LookupOption[]>([]);
  const [supplierSyncMins, setSupplierSyncMins] = useState<number | null>(null);

  const loadSuppliers = useCallback(async () => {
    if (!farmId) return;
    const suppliers = await getCachedSuppliers(farmId);
    const mins = await getRefCacheSyncedMinsAgo("suppliers", farmId);
    setSupplierOptions(
      suppliers.map((s) => ({
        id: s.id,
        label: s.label,
        sublabel: s.supplierType !== "general" ? s.supplierType : undefined,
      })),
    );
    setSupplierSyncMins(mins);
  }, [farmId]);

  useEffect(() => {
    loadSuppliers();
    if (farmId) {
      syncRefData(farmId)
        .then(() => loadSuppliers())
        .catch(() => {});
    }
  }, [farmId, loadSuppliers]);

  const [assessmentDate, setAssessmentDate] = useState(today);
  const [assessedBy, setAssessedBy] = useState(user?.name || "");
  const [hazardClassification, setHazardClassification] = useState("");
  const [exposureRisk, setExposureRisk] = useState<ExposureRisk>("low");
  const [controlMeasures, setControlMeasures] = useState("");
  const [selectedPpe, setSelectedPpe] = useState<string[]>([]);
  const [storageRequirements, setStorageRequirements] = useState("");
  const [disposalMethod, setDisposalMethod] = useState("");
  const [emergencyProcedure, setEmergencyProcedure] = useState("");
  const [reviewDate, setReviewDate] = useState(nextYearStr);
  const [notes, setNotes] = useState("");

  const togglePpe = (item: string) => {
    setSelectedPpe((prev) => prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]);
  };

  const handleSave = async () => {
    if (!substanceName.trim() || !assessedBy.trim()) {
      Alert.alert("Required Fields", "Please enter the substance name and assessor name.");
      return;
    }
    setSaving(true);
    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "coshh-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {}
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: CoshhAssessment = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      substanceName: substanceName.trim(),
      productReference: productReference.trim(),
      supplier: supplier.trim(),
      assessmentDate,
      assessedBy: assessedBy.trim(),
      hazardClassification: hazardClassification.trim(),
      exposureRisk,
      controlMeasures: controlMeasures.trim(),
      ppeRequired: selectedPpe.join(", "),
      storageRequirements: storageRequirements.trim(),
      disposalMethod: disposalMethod.trim(),
      emergencyProcedure: emergencyProcedure.trim(),
      reviewDate,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.COSHH_ASSESSMENTS, { ...record, documentUrl } as CoshhAssessment);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "COSHH assessment saved offline and queued for sync.", [
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
            <Text style={styles.title}>COSHH Assessment</Text>
            <Text style={styles.subtitle}>Control of Substances Hazardous to Health</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.warningBanner}>
            <Feather name="alert-triangle" size={14} color={colors.accent} />
            <Text style={styles.warningText}>COSHH assessments must be reviewed annually or when product/use changes. Always consult the product Safety Data Sheet (SDS) before completing.</Text>
          </View>

          <Text style={styles.sectionTitle}>Substance</Text>
          <Input label="Substance / Product Name *" value={substanceName} onChangeText={setSubstanceName} placeholder="e.g. Roundup ProActive" />
          <Input label="Product Reference / Reg Number" value={productReference} onChangeText={setProductReference} placeholder="MAPP or registration number" />
          <Text style={styles.label}>Supplier / Manufacturer</Text>
          <LookupPicker
            label="Select Supplier / Manufacturer"
            value={supplier}
            onSelect={(_id, label) => setSupplier(label)}
            options={supplierOptions}
            placeholder="Select or type supplier name…"
            syncedMinsAgo={supplierSyncMins}
            icon="truck"
            emptyMessage="No suppliers cached. Add suppliers via the Stock & Suppliers module on the web dashboard, then open this screen while connected."
          />

          <Text style={styles.sectionTitle}>Hazard Classification</Text>
          <Text style={styles.label}>GHS Hazard Category (from SDS)</Text>
          <View style={styles.chipRow}>
            {HAZARD_CLASSIFICATIONS.map((h) => (
              <Pressable key={h} onPress={() => setHazardClassification(h)} style={[styles.chip, hazardClassification === h && styles.chipDanger]}>
                <Text style={[styles.chipText, hazardClassification === h && styles.chipTextDanger]}>{h}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Exposure Risk</Text>
          <View style={styles.riskRow}>
            {RISK_LEVELS.map((r) => (
              <Pressable key={r.key} onPress={() => setExposureRisk(r.key)} style={[styles.riskCard, exposureRisk === r.key && { borderColor: r.color, backgroundColor: r.color + "15" }]}>
                <Text style={[styles.riskLabel, exposureRisk === r.key && { color: r.color }]}>{r.label}</Text>
                <Text style={styles.riskDesc}>{r.desc}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Controls & PPE</Text>
          <Input label="Engineering / Process Controls" value={controlMeasures} onChangeText={setControlMeasures} placeholder="e.g. Ventilation, closed system filling, LEV" multiline numberOfLines={3} />
          <Text style={styles.label}>PPE Required</Text>
          <View style={styles.chipRow}>
            {PPE_OPTIONS.map((p) => (
              <Pressable key={p} onPress={() => togglePpe(p)} style={[styles.chip, selectedPpe.includes(p) && styles.chipActive]}>
                {selectedPpe.includes(p) && <Feather name="check" size={11} color={colors.primary} />}
                <Text style={[styles.chipText, selectedPpe.includes(p) && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Storage & Disposal</Text>
          <Input label="Storage Requirements" value={storageRequirements} onChangeText={setStorageRequirements} placeholder="e.g. Locked chemical store, separate from food, flameproof cabinet" multiline numberOfLines={2} />
          <Input label="Disposal Method" value={disposalMethod} onChangeText={setDisposalMethod} placeholder="e.g. Licensed waste contractor, triple rinse & recycle" multiline numberOfLines={2} />

          <Text style={styles.sectionTitle}>Emergency Procedures</Text>
          <Input label="First Aid / Emergency Procedure" value={emergencyProcedure} onChangeText={setEmergencyProcedure} placeholder="e.g. Skin contact: remove clothing, wash with water 15 min. Eyes: irrigate 15 min. Call 999 if ingested." multiline numberOfLines={4} />

          <Text style={styles.sectionTitle}>Assessment</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Assessed By *" value={assessedBy} onChangeText={setAssessedBy} placeholder="Name" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Assessment Date" maxDate="today" value={assessmentDate} onChangeText={setAssessmentDate} placeholder="YYYY-MM-DD" />
            </View>
          </View>
          <Input label="Review Date (auto-set to +1 year)" minDate="today" value={reviewDate} onChangeText={setReviewDate} placeholder="YYYY-MM-DD" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional information…" multiline numberOfLines={3} />

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Safety Data Sheet Photo"
            promptTitle="Attach Photo to COSHH Assessment"
          />
          <Button title={saving ? "Saving…" : "Save COSHH Assessment"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  warningBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: colors.warningBg, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.accent + "40" },
  warningText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.accent, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipDanger: { borderColor: colors.error, backgroundColor: colors.error + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  chipTextDanger: { color: colors.error, fontFamily: fonts.semiBold },
  riskRow: { gap: spacing.sm, marginBottom: spacing.md },
  riskCard: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  riskLabel: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  riskDesc: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 16 },
  row: { flexDirection: "row", gap: spacing.md },
  saveButton: { marginTop: spacing.lg },
});
