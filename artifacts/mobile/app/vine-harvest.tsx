import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
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
import { VineBlockPicker } from "@/components/VineBlockPicker";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";

const today = new Date().toISOString().split("T")[0];

const HARVEST_METHODS = [
  { key: "Hand Picked", icon: "user" as const },
  { key: "Machine Harvested", icon: "settings" as const },
  { key: "Selective Hand Pick", icon: "eye" as const },
  { key: "Triage Pick", icon: "filter" as const },
];

const GRAPE_CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

const DESTINATION_TYPES = [
  { key: "own-holding" as const, label: "Own Holding" },
  { key: "contract-processor" as const, label: "Contract Processor" },
  { key: "grape-sale" as const, label: "Grape Sale" },
];

type DestinationType = "" | "own-holding" | "contract-processor" | "grape-sale";

function DestinationTypePicker({ value, onChange }: { value: DestinationType; onChange: (v: DestinationType) => void }) {
  const colorMap: Record<string, string> = { "own-holding": "#7c3aed", "contract-processor": "#2563eb", "grape-sale": "#d97706" };
  return (
    <View style={styles.chipRow}>
      {DESTINATION_TYPES.map(d => (
        <Pressable
          key={d.key}
          style={[styles.chip, value === d.key && { backgroundColor: colorMap[d.key], borderColor: colorMap[d.key] }]}
          onPress={() => { Haptics.selectionAsync(); onChange(d.key); }}
        >
          <Text style={[styles.chipText, value === d.key && { color: "#fff" }]}>{d.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

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
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("vine-harvest", currentFarm?.id, user?.id);
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const { blockId } = useLocalSearchParams<{ blockId?: string }>();

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [harvestDate, setHarvestDate] = useState(today);
  const [vintageYear, setVintageYear] = useState(String(new Date().getFullYear()));
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);

  // Pre-select block when navigated from a linked spray diary entry
  useEffect(() => {
    if (blockId && blocks.length > 0 && !blocksLoading) {
      const match = blocks.find(b => String(b.id) === String(blockId));
      if (match) setSelectedBlock(match);
    }
  }, [blockId, blocks, blocksLoading]);
  const [manualBlockName, setManualBlockName] = useState("");
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
  const [destinationType, setDestinationType] = useState<DestinationType>("");
  const [destinationContact, setDestinationContact] = useState("");
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
      blockName: (selectedBlock?.blockName ?? manualBlockName.trim()) || undefined,
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
      destinationType: destinationType || undefined,
      destinationWinery: destinationContact.trim() || undefined,
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
        title: `Harvest Quality Concern — ${(selectedBlock?.blockName ?? manualBlockName) || "Vineyard"} · ${vintageYear}`,
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

        <IdentifierBanner
          justSaved={justSaved && !identifiersLoading}
          missingIdentifiers={missingIdentifiers}
          bannerDismissed={bannerDismissed}
          onClearJustSaved={clearJustSaved}
          onDismiss={dismissBanner}
          cphMissing={!cphNumber}
          sbiMissing={!sbiNumber}
          context="harvest records"
        />

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
          <VineBlockPicker blocks={blocks} selected={selectedBlock} onSelect={setSelectedBlock} loading={blocksLoading} />
          {!selectedBlock && (
            <Input placeholder={blocks.length ? "Or type block name manually" : "e.g. South Slope, Block 3"} value={manualBlockName} onChangeText={setManualBlockName} style={{ marginTop: 4 }} />
          )}
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
              <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>Lab result — can be added after harvest</Text>
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
              <View style={styles.advisoryAmber}>
                <Feather name="alert-triangle" size={14} color="#92400e" />
                <Text style={styles.advisoryAmberText}>
                  Botrytis advisory: record the affected percentage. If botrytis exceeds 30% you will be prompted to raise a task for winemaker review before processing.
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Destination & Operator</Text>
          <Text style={styles.fieldLabel}>Destination Type</Text>
          <DestinationTypePicker value={destinationType} onChange={setDestinationType} />
          <Text style={styles.fieldLabel}>
            {destinationType === "contract-processor" ? "Processor / Winery Name" : destinationType === "grape-sale" ? "Buyer / Trade Contact" : "Destination Contact (optional)"}
          </Text>
          <Input placeholder={destinationType === "own-holding" ? "e.g. Own winery, home processing" : "e.g. Chapel Down, local co-op"} value={destinationContact} onChangeText={setDestinationContact} />
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
  advisoryAmber: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#fffbeb", borderRadius: radius.sm, borderWidth: 1, borderColor: "#f59e0b", padding: spacing.sm },
  advisoryAmberText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: "#92400e", flex: 1, lineHeight: 16 },
});
