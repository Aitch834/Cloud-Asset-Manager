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

import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList } from "@/lib/storage";
import type { DairyNmrRecordingVisit } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

function calcFpr(fat: string, protein: string): string | null {
  const f = parseFloat(fat);
  const p = parseFloat(protein);
  if (!fat || !protein || isNaN(f) || isNaN(p) || p === 0) return null;
  return (f / p).toFixed(2);
}

function FprRow({ fat, protein }: { fat: string; protein: string }) {
  const ratio = calcFpr(fat, protein);
  if (!ratio) return null;
  const r = parseFloat(ratio);
  let bgColor = "#dcfce7";
  let textColor = "#15803d";
  let label = "Target Range";
  if (r < 1.0) { bgColor = "#fee2e2"; textColor = "#dc2626"; label = "Acidosis Risk"; }
  else if (r < 1.2) { bgColor = "#fef3c7"; textColor = "#b45309"; label = "Below Target"; }
  else if (r > 1.5) { bgColor = "#fef3c7"; textColor = "#b45309"; label = "Check Energy"; }
  return (
    <View style={[styles.fprRow, { backgroundColor: bgColor }]}>
      <Text style={[styles.fprRatio, { color: textColor }]}>F:P Ratio {ratio}</Text>
      <Text style={[styles.fprLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function NmrRecordingVisitScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();

  const today = new Date().toISOString().split("T")[0];

  const [visitDate, setVisitDate] = useState(today);
  const [recorderName, setRecorderName] = useState("");
  const [recorderNumber, setRecorderNumber] = useState("");
  const [cowsInMilk, setCowsInMilk] = useState("");
  const [cowsRecorded, setCowsRecorded] = useState("");
  const [avgYield, setAvgYield] = useState("");
  const [avgFat, setAvgFat] = useState("");
  const [avgProtein, setAvgProtein] = useState("");
  const [avgLactose, setAvgLactose] = useState("");
  const [avgScc, setAvgScc] = useState("");
  const [highSccCount, setHighSccCount] = useState("");
  const [highSccTags, setHighSccTags] = useState("");
  const [qualityAlert, setQualityAlert] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!visitDate) {
      Alert.alert("Required", "Please enter the recording visit date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DairyNmrRecordingVisit = {
      id: `nmr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      farmId: currentFarm?.id?.toString() ?? "unknown",
      visitDate,
      recorderName: recorderName.trim(),
      recorderNumber: recorderNumber.trim(),
      cowsInMilk: cowsInMilk.trim(),
      cowsRecorded: cowsRecorded.trim(),
      avgYieldLitresPerDay: avgYield.trim(),
      avgFatPercent: avgFat.trim(),
      avgProteinPercent: avgProtein.trim(),
      avgLactosePercent: avgLactose.trim(),
      avgSccThousands: avgScc.trim(),
      highSccCount: highSccCount.trim(),
      highSccAnimalTags: highSccTags.trim(),
      qualityAlert: qualityAlert.trim(),
      nextVisitDate: nextVisitDate.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DAIRY_NMR_RECORDING_VISITS, record);
      await refreshPendingCount();
      Alert.alert(
        "Recording Visit Saved",
        "The NMR recording visit has been saved and will sync to the dashboard when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save NMR recording visit error:", err);
      Alert.alert("Save Failed", "Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const sccVal = parseFloat(avgScc);
  const sccHigh = !isNaN(sccVal) && sccVal > 200;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>NMR Recording Visit</Text>
          <Text style={styles.headerSub}>Log monthly NMR recorder visit results</Text>
        </View>
        <View style={styles.dairyBadge}>
          <Feather name="clipboard" size={14} color="#164e63" />
          <Text style={styles.dairyBadgeText}>Dairy</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.complianceNote}>
          <Feather name="info" size={14} color="#1e40af" style={{ marginTop: 2 }} />
          <Text style={styles.complianceNoteText}>
            Record results from your NMR recorder's monthly visit. Milk recording supports Red Tractor Dairy
            compliance and SCC trend management. Sync to the dashboard to view trend charts.
          </Text>
        </View>

        <Section title="Visit Details">
          <Label>Visit Date</Label>
          <Input
            placeholder="YYYY-MM-DD"
            value={visitDate}
            onChangeText={setVisitDate}
            keyboardType="numbers-and-punctuation"
            maxDate="today"
          />
          <Label>Recorder Name</Label>
          <Input
            placeholder="NMR recorder's name"
            value={recorderName}
            onChangeText={setRecorderName}
          />
          <Label>NMR Employee Number</Label>
          <Input
            placeholder="Recorder's employee / ID number"
            value={recorderNumber}
            onChangeText={setRecorderNumber}
            keyboardType="numbers-and-punctuation"
          />
          <Label>Next Visit Date (optional)</Label>
          <Input
            placeholder="YYYY-MM-DD"
            value={nextVisitDate}
            onChangeText={setNextVisitDate}
            keyboardType="numbers-and-punctuation"
          />
        </Section>

        <Section title="Cows">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>Cows in Milk</Label>
              <Input
                placeholder="e.g. 120"
                value={cowsInMilk}
                onChangeText={setCowsInMilk}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Label>Cows Recorded</Label>
              <Input
                placeholder="e.g. 118"
                value={cowsRecorded}
                onChangeText={setCowsRecorded}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </Section>

        <Section title="Herd Averages">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>Avg Yield / Cow / Day (L)</Label>
              <Input
                placeholder="e.g. 28.5"
                value={avgYield}
                onChangeText={setAvgYield}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Label>Avg SCC (k/mL)</Label>
              <Input
                placeholder="e.g. 150"
                value={avgScc}
                onChangeText={setAvgScc}
                keyboardType="number-pad"
              />
            </View>
          </View>
          {sccHigh && (
            <View style={styles.sccWarning}>
              <Feather name="alert-triangle" size={13} color="#b45309" />
              <Text style={styles.sccWarningText}>SCC above 200k — review high-SCC animals below</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>Avg Fat %</Label>
              <Input
                placeholder="e.g. 4.15"
                value={avgFat}
                onChangeText={setAvgFat}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ width: spacing.md }} />
            <View style={{ flex: 1 }}>
              <Label>Avg Protein %</Label>
              <Input
                placeholder="e.g. 3.30"
                value={avgProtein}
                onChangeText={setAvgProtein}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <FprRow fat={avgFat} protein={avgProtein} />

          <Label>Avg Lactose % (optional)</Label>
          <Input
            placeholder="e.g. 4.70"
            value={avgLactose}
            onChangeText={setAvgLactose}
            keyboardType="decimal-pad"
          />
        </Section>

        <Section title="High-SCC Animals (>200k)">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Label>Count Above 200k</Label>
              <Input
                placeholder="e.g. 4"
                value={highSccCount}
                onChangeText={setHighSccCount}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Label>Ear Tags (comma-separated, optional)</Label>
          <Input
            placeholder="UK123456 789012, UK123456 789013"
            value={highSccTags}
            onChangeText={setHighSccTags}
            multiline
            style={{ minHeight: 60 }}
          />
        </Section>

        <Section title="Quality & Notes">
          <Label>Quality Alert / NMR Action Note (optional)</Label>
          <Input
            placeholder="Any action note from the NMR report"
            value={qualityAlert}
            onChangeText={setQualityAlert}
            multiline
            style={{ minHeight: 60 }}
          />
          <Label>Additional Notes (optional)</Label>
          <Input
            placeholder="Additional observations from the visit"
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 60 }}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Recording Visit"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dairyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#cffafe",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dairyBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#164e63",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  complianceNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#eff6ff",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: spacing.sm,
  },
  complianceNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#1e40af",
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  sccWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#fef3c7",
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#fcd34d",
    marginTop: spacing.xs,
  },
  sccWarningText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#b45309",
    flex: 1,
  },
  fprRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  fprRatio: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
  },
  fprLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: "#0891b2",
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
});
