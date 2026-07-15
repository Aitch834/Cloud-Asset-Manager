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
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const SAMPLE_TYPES = [
  { key: "boot_swab", label: "Boot Swab (pre-harvest)" },
  { key: "neck_skin", label: "Neck Skin Swab (abattoir)" },
  { key: "caecal_content", label: "Caecal Content (abattoir)" },
  { key: "environmental", label: "Environmental Swab" },
];

const RESULTS = [
  { key: "negative", label: "Negative" },
  { key: "positive", label: "Positive" },
  { key: "pending", label: "Pending" },
];

const CATEGORIES = [
  { key: "lowest", label: "Lowest (≤1,000 ccu/g)" },
  { key: "lower", label: "Lower (1,000–10,000 ccu/g)" },
  { key: "higher", label: "Higher (>10,000 ccu/g)" },
];

const FSA_BANDS = [
  { key: "a_very_low", label: "Band A — Very Low" },
  { key: "b_low", label: "Band B — Low" },
  { key: "c_intermediate", label: "Band C — Intermediate" },
  { key: "d_high", label: "Band D — High" },
  { key: "e_very_high", label: "Band E — Very High" },
];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SwitchRow({ label, value, onValueChange, hint }: { label: string; value: boolean; onValueChange: (v: boolean) => void; hint?: string }) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.switchHint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: "#dc2626" }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function CampylobacterMonitoringScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [sampleDate, setSampleDate] = useState(todayDate());
  const [houseId, setHouseId] = useState("");
  const [flockId, setFlockId] = useState("");
  const [sampleType, setSampleType] = useState("boot_swab");
  const [result, setResult] = useState("pending");
  const [resultCategory, setResultCategory] = useState("");
  const [fsaBand, setFsaBand] = useState("");
  const [cfuCount, setCfuCount] = useState("");
  const [samplesTaken, setSamplesTaken] = useState("");
  const [zapTriggered, setZapTriggered] = useState(false);
  const [labName, setLabName] = useState("");
  const [labReference, setLabReference] = useState("");
  const [nextSampleDue, setNextSampleDue] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleSave = async () => {
    if (!sampleDate.trim()) {
      Alert.alert("Required", "Please enter the sample date.");
      return;
    }
    if (!sampleType) {
      Alert.alert("Required", "Please select the sample type.");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "campylobacter-monitoring",
        sampleDate,
        houseId: houseId ? Number(houseId) : null,
        flockId: flockId ? Number(flockId) : null,
        sampleType,
        result,
        resultCategory: resultCategory || null,
        fsa_band: fsaBand || null,
        cfuCount: cfuCount ? Number(cfuCount) : null,
        samplesTaken: samplesTaken ? Number(samplesTaken) : null,
        zapTriggered,
        labName: labName || null,
        labReference: labReference || null,
        nextSampleDue: nextSampleDue || null,
        notes: notes || null,
        photoUri: photoUri || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/campylobacter-monitoring`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };

      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (zapTriggered) {
        Alert.alert(
          "ZAP Trigger Recorded",
          "Campylobacter sample saved. Zoonoses Action Plan trigger has been recorded — ensure corrective actions are implemented and documented.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          "Campylobacter Sample Recorded",
          "The monitoring record has been saved and will sync when connected.",
          [{ text: "Done", onPress: () => router.back() }]
        );
      }
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Campylobacter Monitoring</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          Red Tractor Chicken/Turkey scheme requires documented Campylobacter monitoring with structured
          lab results, FSA bands and Zoonoses Action Plan (ZAP) trigger recording.
        </Text>

        <Text style={styles.sectionTitle}>Sample Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Sample Date *</Text>
            <Input value={sampleDate} onChangeText={setSampleDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Next Sample Due</Text>
            <Input value={nextSampleDue} onChangeText={setNextSampleDue} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>House ID</Text>
            <Input
              value={houseId}
              onChangeText={setHouseId}
              placeholder="House number"
              keyboardType="number-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Flock ID</Text>
            <Input
              value={flockId}
              onChangeText={setFlockId}
              placeholder="Flock number"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Samples Taken</Text>
            <Input
              value={samplesTaken}
              onChangeText={setSamplesTaken}
              placeholder="e.g. 5"
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }} />
        </View>

        <Text style={styles.sectionTitle}>Sample Type *</Text>
        <View style={styles.chips}>
          {SAMPLE_TYPES.map(t => (
            <Chip key={t.key} label={t.label} selected={sampleType === t.key} onPress={() => setSampleType(t.key)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Result</Text>
        <View style={styles.chips}>
          {RESULTS.map(r => (
            <Chip key={r.key} label={r.label} selected={result === r.key} onPress={() => setResult(r.key)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Result Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map(c => (
            <Chip key={c.key} label={c.label} selected={resultCategory === c.key} onPress={() => setResultCategory(resultCategory === c.key ? "" : c.key)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>FSA Band</Text>
        <View style={styles.chips}>
          {FSA_BANDS.map(b => (
            <Chip key={b.key} label={b.label} selected={fsaBand === b.key} onPress={() => setFsaBand(fsaBand === b.key ? "" : b.key)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>CFU Count & Lab</Text>

        <View style={styles.field}>
          <Text style={styles.label}>CFU Count (cfu/g)</Text>
          <Input
            value={cfuCount}
            onChangeText={setCfuCount}
            placeholder="Colony forming units per gram"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Laboratory</Text>
            <Input value={labName} onChangeText={setLabName} placeholder="Lab name" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Lab Reference</Text>
            <Input value={labReference} onChangeText={setLabReference} placeholder="Lab ref" />
          </View>
        </View>

        <SwitchRow
          label="ZAP Triggered"
          value={zapTriggered}
          onValueChange={setZapTriggered}
          hint="Zoonoses Action Plan activated — corrective action required"
        />

        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.field}>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Actions taken, corrective measures, observations"
            multiline
            numberOfLines={3}
          />
        </View>

        <PhotoAttachButton
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          label="Attach Lab Result / Photo Evidence"
          promptTitle="Campylobacter Lab Result"
        />

        <Button
          title={saving ? "Saving…" : "Save Campylobacter Record"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  switchHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saveBtn: { marginTop: spacing.md },
});
