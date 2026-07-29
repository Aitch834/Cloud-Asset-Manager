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

const FERMENTATION_STAGES = ["Active", "Sluggish", "Stuck", "Near Dryness", "Complete"];

function StagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colorMap: Record<string, string> = {
    Active: "#16a34a",
    Sluggish: "#d97706",
    Stuck: "#dc2626",
    "Near Dryness": "#2563eb",
    Complete: "#6b7280",
  };
  return (
    <View style={styles.chipRow}>
      {FERMENTATION_STAGES.map(s => {
        const active = value === s;
        const bg = colorMap[s] ?? colors.primary;
        return (
          <Pressable
            key={s}
            style={[styles.chip, active && { backgroundColor: bg, borderColor: bg }]}
            onPress={() => { Haptics.selectionAsync(); onChange(s); }}
          >
            <Text style={[styles.chipText, active && { color: "#fff" }]}>{s}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function WineryFermentationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [recordDate, setRecordDate] = useState(today);
  const [vesselName, setVesselName] = useState("");
  const [wineName, setWineName] = useState("");
  const [vintageYear, setVintageYear] = useState(String(new Date().getFullYear()));
  const [stage, setStage] = useState("");
  const [brix, setBrix] = useState("");
  const [sg, setSg] = useState("");
  const [tempC, setTempC] = useState("");
  const [ph, setPh] = useState("");
  const [ta, setTa] = useState("");
  const [va, setVa] = useState("");
  const [nutrientAddition, setNutrientAddition] = useState("");
  const [notes, setNotes] = useState("");
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  const isStuck = stage === "Stuck";
  const tempWarning = tempC !== "" && (Number(tempC) > 32 || Number(tempC) < 10);
  const vaWarning = va !== "" && Number(va) > 0.8;

  const handleSave = async () => {
    if (!recordDate || !vesselName) {
      Alert.alert("Required Fields", "Please enter the date and vessel/tank name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      recordDate,
      vesselName: vesselName.trim(),
      wineName: wineName.trim() || undefined,
      vintageYear: vintageYear ? Number(vintageYear) : new Date().getFullYear(),
      fermentationStage: stage || undefined,
      brix: brix ? Number(brix) : undefined,
      specificGravity: sg ? Number(sg) : undefined,
      tempC: tempC ? Number(tempC) : undefined,
      ph: ph ? Number(ph) : undefined,
      ta: ta ? Number(ta) : undefined,
      volatileAcidityGl: va ? Number(va) : undefined,
      nutrientAddition: nutrientAddition.trim() || undefined,
      operatorName: operatorName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_winery_fermentation", entry);
    await refreshPendingCount();
    setSaving(false);

    if (isStuck || vaWarning || tempWarning) {
      setTaskSheet({
        title: `Fermentation Alert — ${vesselName}${wineName ? ` (${wineName})` : ""} · ${vintageYear}`,
        description: [
          isStuck ? "STUCK FERMENTATION" : null,
          tempWarning ? `Temp: ${tempC}°C (outside 10–32°C range)` : null,
          vaWarning ? `VA: ${va} g/L (above 0.8 g/L threshold)` : null,
          brix ? `Brix: ${brix}°` : null,
        ].filter(Boolean).join(" · "),
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
          <Text style={styles.title}>Fermentation Monitoring</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Batch Details</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={recordDate}
                onChangeText={v => { if (v <= today) setRecordDate(v); }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Vintage Year</Text>
              <Input placeholder={String(new Date().getFullYear())} value={vintageYear} onChangeText={setVintageYear} keyboardType="numeric" />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Vessel / Tank *</Text>
          <Input placeholder="e.g. Tank 3, Barrel 12A" value={vesselName} onChangeText={setVesselName} />
          <Text style={styles.fieldLabel}>Wine Name / Batch Ref</Text>
          <Input placeholder="e.g. Pinot Noir 2025, Lot B" value={wineName} onChangeText={setWineName} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fermentation Stage</Text>
          <StagePicker value={stage} onChange={setStage} />
          {isStuck && (
            <View style={styles.advisoryRed}>
              <Feather name="alert-triangle" size={14} color="#991b1b" />
              <Text style={styles.advisoryRedText}>Stuck fermentation — you will be prompted to raise a task for immediate winemaker attention.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sugar & Gravity</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Brix °</Text>
              <Input placeholder="e.g. 8.5" value={brix} onChangeText={setBrix} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Specific Gravity</Text>
              <Input placeholder="e.g. 1.034" value={sg} onChangeText={setSg} keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Temperature & Chemistry</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Temperature (°C)</Text>
              <Input placeholder="e.g. 18" value={tempC} onChangeText={setTempC} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>pH</Text>
              <Input placeholder="e.g. 3.3" value={ph} onChangeText={setPh} keyboardType="decimal-pad" />
            </View>
          </View>
          {tempWarning && (
            <View style={styles.advisoryAmber}>
              <Feather name="thermometer" size={14} color="#92400e" />
              <Text style={styles.advisoryAmberText}>Temperature {Number(tempC) > 32 ? "too high — risk of stuck fermentation" : "too low — yeast may become inactive"}. Adjust temperature control.</Text>
            </View>
          )}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>TA (g/L)</Text>
              <Input placeholder="e.g. 8.5" value={ta} onChangeText={setTa} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Volatile Acidity (g/L)</Text>
              <Input placeholder="e.g. 0.4" value={va} onChangeText={setVa} keyboardType="decimal-pad" />
            </View>
          </View>
          {vaWarning && (
            <View style={styles.advisoryAmber}>
              <Feather name="alert-triangle" size={14} color="#92400e" />
              <Text style={styles.advisoryAmberText}>VA above 0.8 g/L — monitor closely. Spoilage risk increasing.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nutrient Addition</Text>
          <Input placeholder="e.g. DAP 25 g/hL, Fermaid-O 20 g/hL" value={nutrientAddition} onChangeText={setNutrientAddition} />
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
          <Input placeholder="Sensory observations, aroma, colour, any concerns…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Monitoring Record"} onPress={handleSave} disabled={saving} />
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
  twoCol: { flexDirection: "row", gap: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: (radius.full as number) ?? 99, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  advisoryAmber: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#fffbeb", borderRadius: radius.sm, borderWidth: 1, borderColor: "#f59e0b", padding: spacing.sm },
  advisoryAmberText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: "#92400e", flex: 1, lineHeight: 16 },
  advisoryRed: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#fef2f2", borderRadius: radius.sm, borderWidth: 1, borderColor: "#fca5a5", padding: spacing.sm },
  advisoryRedText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: "#991b1b", flex: 1, lineHeight: 16 },
});
