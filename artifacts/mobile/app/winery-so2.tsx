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
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId } from "@/lib/storage";

const today = new Date().toISOString().split("T")[0];

const WINE_TYPES = ["Red", "White", "Rosé", "Sparkling", "Orange"];
const TEST_METHODS = ["Ripper Titration", "Aeration-Oxidation", "Enzymatic", "FTIR", "Other"];

const ORGANIC_SO2_LIMITS: Record<string, number> = {
  Red: 100,
  White: 150,
  "Rosé": 150,
  Sparkling: 185,
  Orange: 150,
};

const CONVENTIONAL_SO2_LIMITS: Record<string, number> = {
  Red: 150,
  White: 200,
  "Rosé": 200,
  Sparkling: 235,
  Orange: 200,
};

function WineTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colorMap: Record<string, string> = {
    Red: "#991b1b",
    White: "#d97706",
    "Rosé": "#db2777",
    Sparkling: "#2563eb",
    Orange: "#ea580c",
  };
  return (
    <View style={styles.chipRow}>
      {WINE_TYPES.map(t => {
        const active = value === t;
        const bg = colorMap[t] ?? colors.primary;
        return (
          <Pressable
            key={t}
            style={[styles.chip, active && { backgroundColor: bg, borderColor: bg }]}
            onPress={() => { Haptics.selectionAsync(); onChange(t); }}
          >
            <Text style={[styles.chipText, active && { color: "#fff" }]}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function WinerySo2Screen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [testDate, setTestDate] = useState(today);
  const [wineName, setWineName] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [wineType, setWineType] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);
  const [freeSo2, setFreeSo2] = useState("");
  const [totalSo2, setTotalSo2] = useState("");
  const [ph, setPh] = useState("");
  const [testMethod, setTestMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  const organicLimit = wineType ? ORGANIC_SO2_LIMITS[wineType] : null;
  const conventionalLimit = wineType ? CONVENTIONAL_SO2_LIMITS[wineType] : null;
  const activeLimit = isOrganic ? organicLimit : conventionalLimit;
  const totalSo2Num = totalSo2 ? Number(totalSo2) : null;
  const freeSo2Num = freeSo2 ? Number(freeSo2) : null;

  const overLimit = totalSo2Num !== null && activeLimit !== null && totalSo2Num > activeLimit;
  const nearLimit = totalSo2Num !== null && activeLimit !== null && !overLimit && totalSo2Num > activeLimit * 0.85;

  const complianceStatus = () => {
    if (!wineType || totalSo2Num === null || activeLimit === null) return null;
    if (overLimit) return { label: `Over limit (max ${activeLimit} mg/L)`, color: "#dc2626", bg: "#fef2f2", icon: "x-circle" as const };
    if (nearLimit) return { label: `Approaching limit (max ${activeLimit} mg/L)`, color: "#d97706", bg: "#fffbeb", icon: "alert-triangle" as const };
    return { label: `Within limit (max ${activeLimit} mg/L)`, color: "#16a34a", bg: "#f0fdf4", icon: "check-circle" as const };
  };

  const status = complianceStatus();

  const handleSave = async () => {
    if (!testDate || (!freeSo2 && !totalSo2)) {
      Alert.alert("Required Fields", "Please enter the test date and at least one SO₂ measurement.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      testDate,
      wineName: wineName.trim() || undefined,
      vesselName: vesselName.trim() || undefined,
      wineType: wineType || undefined,
      isOrganic,
      freeSo2MgL: freeSo2Num ?? undefined,
      totalSo2MgL: totalSo2Num ?? undefined,
      ph: ph ? Number(ph) : undefined,
      testMethod: testMethod || undefined,
      organicLimitMgL: organicLimit ?? undefined,
      overOrganicLimit: isOrganic ? overLimit : undefined,
      operatorName: operatorName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_winery_so2", entry);
    await refreshPendingCount();
    setSaving(false);

    if (overLimit) {
      setTaskSheet({
        title: `SO₂ Over Limit — ${wineName || vesselName || wineType || "Wine"}`,
        description: `Total SO₂: ${totalSo2} mg/L — exceeds ${isOrganic ? "organic" : "conventional"} maximum of ${activeLimit} mg/L for ${wineType}. Immediate review required.`,
      });
    } else {
      router.back();
    }
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
          <Text style={styles.title}>SO₂ Test Entry</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Test Details</Text>
          <Text style={styles.fieldLabel}>Test Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={testDate}
            onChangeText={v => { if (v <= today) setTestDate(v); }}
            keyboardType="numeric"
          />
          <Text style={styles.fieldLabel}>Wine Name / Batch Ref</Text>
          <Input placeholder="e.g. Pinot Noir 2025, Lot A" value={wineName} onChangeText={setWineName} />
          <Text style={styles.fieldLabel}>Vessel / Tank</Text>
          <Input placeholder="e.g. Tank 2, Barrel 5B" value={vesselName} onChangeText={setVesselName} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Wine Type</Text>
          <WineTypePicker value={wineType} onChange={setWineType} />

          <Pressable
            style={[styles.toggleRow, isOrganic && styles.toggleRowOrganic]}
            onPress={() => { Haptics.selectionAsync(); setIsOrganic(v => !v); }}
          >
            <Feather name={isOrganic ? "check-square" : "square"} size={18} color={isOrganic ? "#16a34a" : colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, isOrganic && { color: "#16a34a" }]}>Organic wine</Text>
              {wineType && (
                <Text style={styles.limitHint}>
                  Organic limit: {organicLimit ?? "—"} mg/L  ·  Conventional: {conventionalLimit ?? "—"} mg/L
                </Text>
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SO₂ Measurements *</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Free SO₂ (mg/L)</Text>
              <Input placeholder="e.g. 28" value={freeSo2} onChangeText={setFreeSo2} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Total SO₂ (mg/L)</Text>
              <Input placeholder="e.g. 95" value={totalSo2} onChangeText={setTotalSo2} keyboardType="decimal-pad" />
            </View>
          </View>

          {status && (
            <View style={[styles.statusBadge, { backgroundColor: status.bg, borderColor: status.color + "55" }]}>
              <Feather name={status.icon} size={14} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>pH at Time of Test</Text>
          <Input placeholder="e.g. 3.35" value={ph} onChangeText={setPh} keyboardType="decimal-pad" />
          <Text style={styles.helpText}>pH affects the ratio of free molecular SO₂. Record at time of test for accurate calculations.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Test Method</Text>
          <View style={styles.chipRow}>
            {TEST_METHODS.map(m => (
              <Pressable
                key={m}
                style={[styles.chip, testMethod === m && styles.chipSelected]}
                onPress={() => { Haptics.selectionAsync(); setTestMethod(m); }}
              >
                <Text style={[styles.chipText, testMethod === m && styles.chipTextSelected]}>{m}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operator</Text>
          <StaffMemberPicker members={members} selected={selectedOperator} onSelect={setSelectedOperator} loading={false} error={null} />
          {!selectedOperator && (
            <Input placeholder="Or type name manually" value={manualOperator} onChangeText={setManualOperator} style={{ marginTop: spacing.xs }} />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input placeholder="Sample condition, any concerns, adjustment planned…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save SO₂ Test"} onPress={handleSave} disabled={saving} />
      </ScrollView>

      {taskSheet && (
        <RaiseTaskSheet
          visible
          farmId={currentFarm?.id ?? ""}
          module="viticulture"
          defaultTitle={taskSheet.title}
          defaultDescription={taskSheet.description}
          onRaised={() => { setTaskSheet(null); router.back(); }}
          onSkip={() => { setTaskSheet(null); router.back(); }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  backBtn: { padding: spacing.xs },
  title: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: colors.text, flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.text },
  fieldLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: spacing.xs },
  helpText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary, lineHeight: 16 },
  twoCol: { flexDirection: "row", gap: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: (radius.full as number) ?? 99, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  toggleRowOrganic: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  toggleLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text },
  limitHint: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: spacing.xs, borderRadius: radius.sm, padding: spacing.sm, borderWidth: 1 },
  statusText: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, flex: 1 },
});
