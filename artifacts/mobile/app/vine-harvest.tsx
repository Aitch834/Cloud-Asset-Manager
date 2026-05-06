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

const HARVEST_METHODS = [
  { key: "Hand Picked", icon: "user" as const },
  { key: "Machine Harvested", icon: "settings" as const },
  { key: "Selective Hand Pick", icon: "eye" as const },
  { key: "Triage Pick", icon: "filter" as const },
];

const GRAPE_CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

function MethodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.methodGrid}>
      {HARVEST_METHODS.map(m => (
        <Pressable
          key={m.key}
          style={[styles.methodOption, value === m.key && styles.methodOptionSelected]}
          onPress={() => { Haptics.selectionAsync(); onChange(m.key); }}
        >
          <Feather name={m.icon} size={20} color={value === m.key ? colors.primary : colors.textSecondary} />
          <Text style={[styles.methodText, value === m.key && { color: colors.primary, fontFamily: fonts.semiBold }]}>{m.key}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function ConditionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colors_map: Record<string, string> = { Excellent: "#16a34a", Good: "#65a30d", Fair: "#d97706", Poor: "#dc2626" };
  return (
    <View style={styles.chipRow}>
      {GRAPE_CONDITIONS.map(c => (
        <Pressable
          key={c}
          style={[styles.chip, value === c && { backgroundColor: colors_map[c], borderColor: colors_map[c] }]}
          onPress={() => { Haptics.selectionAsync(); onChange(c); }}
        >
          <Text style={[styles.chipText, value === c && { color: "#fff" }]}>{c}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function VineHarvestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [harvestDate, setHarvestDate] = useState(today);
  const [vintageYear, setVintageYear] = useState(String(new Date().getFullYear()));
  const [blockName, setBlockName] = useState("");
  const [harvestMethod, setHarvestMethod] = useState("");
  const [yieldKg, setYieldKg] = useState("");
  const [yieldKgPerVine, setYieldKgPerVine] = useState("");
  const [yieldTonnesPerHa, setYieldTonnesPerHa] = useState("");
  const [brix, setBrix] = useState("");
  const [ph, setPh] = useState("");
  const [titratable, setTitratable] = useState("");
  const [potentialAlcohol, setPotentialAlcohol] = useState("");
  const [grapeCondition, setGrapeCondition] = useState("");
  const [botrytisPresent, setBotrytisPresent] = useState(false);
  const [botrytisPercentage, setBotrytisPercentage] = useState("");
  const [destinationWinery, setDestinationWinery] = useState("");
  const [notes, setNotes] = useState("");
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  const handleSave = async () => {
    if (!harvestDate || !yieldKg) {
      Alert.alert("Required Fields", "Please enter the harvest date and yield.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      harvestDate,
      vintageYear: vintageYear ? Number(vintageYear) : new Date().getFullYear(),
      blockName: blockName.trim() || undefined,
      harvestMethod: harvestMethod || undefined,
      yieldKg: Number(yieldKg),
      yieldKgPerVine: yieldKgPerVine ? Number(yieldKgPerVine) : undefined,
      yieldTonnesPerHa: yieldTonnesPerHa ? Number(yieldTonnesPerHa) : undefined,
      brix: brix ? Number(brix) : undefined,
      ph: ph ? Number(ph) : undefined,
      titratableAcidityGl: titratable ? Number(titratable) : undefined,
      potentialAlcohol: potentialAlcohol ? Number(potentialAlcohol) : undefined,
      grapeCondition: grapeCondition || undefined,
      botrytisPresent,
      botrytisPercentage: botrytisPresent && botrytisPercentage ? Number(botrytisPercentage) : undefined,
      destinationWinery: destinationWinery.trim() || undefined,
      operatorName: operatorName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_vine_harvest", entry);
    await refreshPendingCount();

    setSaving(false);

    if (grapeCondition === "Poor" || (botrytisPresent && Number(botrytisPercentage) > 30)) {
      setTaskSheet({
        title: `Harvest Quality Concern — ${blockName || "Vineyard"} · ${vintageYear}`,
        description: `Yield: ${yieldKg}kg · Condition: ${grapeCondition}${botrytisPresent ? ` · Botrytis: ${botrytisPercentage}%` : ""} · Brix: ${brix}°. Review with winemaker.`,
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
          <Text style={styles.title}>Vine Harvest Record</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Harvest Details</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Harvest Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={harvestDate}
                onChangeText={v => { if (v <= today) setHarvestDate(v); }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Vintage Year *</Text>
              <Input
                placeholder={String(new Date().getFullYear())}
                value={vintageYear}
                onChangeText={setVintageYear}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Block / Area</Text>
          <Input placeholder="e.g. South Slope, Block 3" value={blockName} onChangeText={setBlockName} />
          <Text style={styles.fieldLabel}>Harvest Method</Text>
          <MethodPicker value={harvestMethod} onChange={setHarvestMethod} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Yield *</Text>
          <View style={styles.threeCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Total (kg)</Text>
              <Input placeholder="e.g. 5200" value={yieldKg} onChangeText={setYieldKg} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>kg / Vine</Text>
              <Input placeholder="e.g. 2.1" value={yieldKgPerVine} onChangeText={setYieldKgPerVine} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>t / ha</Text>
              <Input placeholder="e.g. 5.2" value={yieldTonnesPerHa} onChangeText={setYieldTonnesPerHa} keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Must Chemistry</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Brix °</Text>
              <Input placeholder="e.g. 17.5" value={brix} onChangeText={setBrix} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>pH</Text>
              <Input placeholder="e.g. 3.2" value={ph} onChangeText={setPh} keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>TA (g/L)</Text>
              <Input placeholder="e.g. 9.8" value={titratable} onChangeText={setTitratable} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Pot. Alcohol %</Text>
              <Input placeholder="e.g. 11.2" value={potentialAlcohol} onChangeText={setPotentialAlcohol} keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Grape Condition</Text>
          <ConditionPicker value={grapeCondition} onChange={setGrapeCondition} />

          <Pressable
            style={[styles.toggleRow, botrytisPresent && styles.toggleRowWarning]}
            onPress={() => { Haptics.selectionAsync(); setBotrytisPresent(v => !v); }}
          >
            <Feather name={botrytisPresent ? "check-square" : "square"} size={18} color={botrytisPresent ? colors.error : colors.textSecondary} />
            <Text style={[styles.toggleLabel, botrytisPresent && { color: colors.error }]}>Botrytis present at harvest</Text>
          </Pressable>
          {botrytisPresent && (
            <>
              <Text style={styles.fieldLabel}>Botrytis Percentage (%)</Text>
              <Input placeholder="e.g. 15" value={botrytisPercentage} onChangeText={setBotrytisPercentage} keyboardType="numeric" />
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Destination & Operator</Text>
          <Text style={styles.fieldLabel}>Destination Winery</Text>
          <Input placeholder="e.g. Chapel Down, own winery" value={destinationWinery} onChangeText={setDestinationWinery} />
          <Text style={styles.fieldLabel}>Operator / Harvest Manager</Text>
          <StaffMemberPicker members={members} selected={selectedOperator} onSelect={setSelectedOperator} loading={false} error={null} />
          {!selectedOperator && (
            <Input placeholder="Or type name manually" value={manualOperator} onChangeText={setManualOperator} style={{ marginTop: spacing.xs }} />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input placeholder="Observations, delays, weather conditions…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Harvest Record"} onPress={handleSave} disabled={saving} />
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
  threeCol: { flexDirection: "row", gap: spacing.sm },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  methodOption: { flexDirection: "column", alignItems: "center", gap: 4, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: "45%" },
  methodOptionSelected: { borderColor: colors.primary, backgroundColor: "#ede9fe" },
  methodText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.text, textAlign: "center" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full ?? 99, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  toggleRowWarning: { borderColor: colors.error, backgroundColor: "#fef2f2" },
  toggleLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },
});
