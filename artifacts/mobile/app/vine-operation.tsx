import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId } from "@/lib/storage";
import { VineBlockPicker } from "@/components/VineBlockPicker";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";

const today = new Date().toISOString().split("T")[0];

const OPERATION_TYPES = [
  { key: "Winter Pruning", icon: "scissors" as const, group: "Pruning" },
  { key: "Spur Thinning", icon: "git-branch" as const, group: "Pruning" },
  { key: "Cane Laying / Tie Down", icon: "link" as const, group: "Pruning" },
  { key: "Bud Rubbing", icon: "circle" as const, group: "Spring" },
  { key: "Shoot Thinning", icon: "sliders" as const, group: "Spring" },
  { key: "Wire Lifting", icon: "arrow-up" as const, group: "Canopy" },
  { key: "Leaf Removal", icon: "wind" as const, group: "Canopy" },
  { key: "Topping / Hedging", icon: "minus-square" as const, group: "Canopy" },
  { key: "Green Harvest (Crop Thinning)", icon: "scissors" as const, group: "Summer" },
  { key: "Soil Cultivation", icon: "layers" as const, group: "Soil" },
  { key: "Mulching", icon: "box" as const, group: "Soil" },
  { key: "Other", icon: "more-horizontal" as const, group: "Other" },
];

const PRUNING_SYSTEMS = ["Double Guyot", "Single Guyot", "Cordon Spur", "Scott Henry", "Cane Replacement", "Other"];

const PRUNING_TYPES = ["Winter Pruning", "Spur Thinning", "Cane Laying / Tie Down"];

export default function VineOperationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const { blockId } = useLocalSearchParams<{ blockId?: string }>();

  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved } = useFarmIdentifiers(currentFarm?.id);
  const { dismissed: bannerDismissed, dismiss: dismissIdentifierBanner } = useIdentifierBannerDismiss("vine-operations", currentFarm?.id, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [operationDate, setOperationDate] = useState(today);
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);

  // Pre-select block when navigated from a linked spray diary entry
  useEffect(() => {
    if (blockId && blocks.length > 0 && !blocksLoading) {
      const match = blocks.find(b => String(b.id) === String(blockId));
      if (match) setSelectedBlock(match);
    }
  }, [blockId, blocks, blocksLoading]);
  const [manualBlockName, setManualBlockName] = useState("");
  const [operationType, setOperationType] = useState<string | null>(null);
  const [pruningSystem, setPruningSystem] = useState<string | null>(null);
  const [budsPerVineTarget, setBudsPerVineTarget] = useState("");
  const [budsPerVineActual, setBudsPerVineActual] = useState("");
  const [pruningWeightKg, setPruningWeightKg] = useState("");
  const [shootsRemovedPct, setShootsRemovedPct] = useState("");
  const [leavesRemovedZone, setLeavesRemovedZone] = useState("");
  const [machineUsed, setMachineUsed] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [notes, setNotes] = useState("");

  const isPruning = operationType !== null && PRUNING_TYPES.includes(operationType);

  const handleSave = async () => {
    if (!operationDate || !operationType) {
      Alert.alert("Required Fields", "Please select an operation date and type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      operationDate,
      blockId: selectedBlock?.id ?? null,
      blockName: (selectedBlock?.blockName ?? manualBlockName.trim()) || undefined,
      operationType,
      pruningSystem: isPruning && pruningSystem ? pruningSystem : undefined,
      budsPerVineTarget: isPruning && budsPerVineTarget ? Number(budsPerVineTarget) : undefined,
      budsPerVineActual: isPruning && budsPerVineActual ? Number(budsPerVineActual) : undefined,
      pruningWeightKgPerVine: isPruning && pruningWeightKg ? Number(pruningWeightKg) : undefined,
      shootsRemovedPct: shootsRemovedPct ? Number(shootsRemovedPct) : undefined,
      leavesRemovedZone: leavesRemovedZone.trim() || undefined,
      machineUsed: machineUsed.trim() || undefined,
      operatorName: operatorName.trim() || undefined,
      contractorName: contractorName.trim() || undefined,
      hoursWorked: hoursWorked ? Number(hoursWorked) : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_vine_operation", entry);
    await refreshPendingCount();

    setSaving(false);
    router.back();
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
          <Text style={styles.title}>Vineyard Operation</Text>
        </View>

        <IdentifierBanner
          justSaved={justSaved && !identifiersLoading}
          loading={identifiersLoading}
          missingIdentifiers={missingIdentifiers}
          bannerDismissed={bannerDismissed}
          onClearJustSaved={clearJustSaved}
          onDismiss={dismissIdentifierBanner}
          cphMissing={!cphNumber}
          sbiMissing={!sbiNumber}
          context="operation records"
        />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operation Details</Text>
          <Text style={styles.fieldLabel}>Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={operationDate}
            onChangeText={v => { if (v <= today) setOperationDate(v); }}
            keyboardType="numeric"
          />
          <Text style={styles.fieldLabel}>Block / Area</Text>
          <VineBlockPicker blocks={blocks} selected={selectedBlock} onSelect={setSelectedBlock} loading={blocksLoading} />
          {!selectedBlock && (
            <Input placeholder={blocks.length ? "Or type block name manually" : "e.g. South Slope, All Blocks"} value={manualBlockName} onChangeText={setManualBlockName} style={{ marginTop: 4 }} />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operation Type *</Text>
          {Object.entries(
            OPERATION_TYPES.reduce<Record<string, typeof OPERATION_TYPES>>((acc, op) => {
              (acc[op.group] ??= []).push(op);
              return acc;
            }, {})
          ).map(([group, ops]) => (
            <View key={group}>
              <Text style={styles.groupLabel}>{group}</Text>
              {ops.map(op => (
                <Pressable
                  key={op.key}
                  style={[styles.typeOption, operationType === op.key && styles.typeOptionSelected]}
                  onPress={() => { Haptics.selectionAsync(); setOperationType(op.key); }}
                >
                  <Feather name={op.icon} size={16} color={operationType === op.key ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.typeText, operationType === op.key && { color: colors.primary, fontFamily: fonts.semiBold }]}>{op.key}</Text>
                  {operationType === op.key && <Feather name="check" size={14} color={colors.primary} />}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {isPruning && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Pruning Data</Text>
            <Text style={styles.fieldLabel}>Pruning System</Text>
            <View style={styles.chipRow}>
              {PRUNING_SYSTEMS.map(s => (
                <Pressable key={s} style={[styles.chip, pruningSystem === s && styles.chipSelected]} onPress={() => { Haptics.selectionAsync(); setPruningSystem(s); }}>
                  <Text style={[styles.chipText, pruningSystem === s && styles.chipTextSelected]}>{s}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Target Buds / Vine</Text>
                <Input placeholder="e.g. 12" value={budsPerVineTarget} onChangeText={setBudsPerVineTarget} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Actual Buds / Vine</Text>
                <Input placeholder="e.g. 11" value={budsPerVineActual} onChangeText={setBudsPerVineActual} keyboardType="numeric" />
              </View>
            </View>
            <Text style={styles.fieldLabel}>Pruning Weight (kg / vine)</Text>
            <Input placeholder="e.g. 0.450" value={pruningWeightKg} onChangeText={setPruningWeightKg} keyboardType="decimal-pad" />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Canopy Details</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Shoots Removed (%)</Text>
              <Input placeholder="e.g. 30" value={shootsRemovedPct} onChangeText={setShootsRemovedPct} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Leaves Removed Zone</Text>
              <Input placeholder="e.g. Fruit zone" value={leavesRemovedZone} onChangeText={setLeavesRemovedZone} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Labour & Equipment</Text>
          <Text style={styles.fieldLabel}>Operator</Text>
          <StaffMemberPicker members={members} selected={selectedOperator} onSelect={setSelectedOperator} loading={false} error={null} />
          {!selectedOperator && (
            <Input placeholder="Or type name manually" value={manualOperator} onChangeText={setManualOperator} style={{ marginTop: spacing.xs }} />
          )}
          <Text style={styles.fieldLabel}>Contractor (if applicable)</Text>
          <Input placeholder="Contractor / company name" value={contractorName} onChangeText={setContractorName} />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Machine / Equipment</Text>
              <Input placeholder="e.g. Pellenc pruner" value={machineUsed} onChangeText={setMachineUsed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Hours Worked</Text>
              <Input placeholder="e.g. 8.5" value={hoursWorked} onChangeText={setHoursWorked} keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input placeholder="Additional observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Operation"} onPress={handleSave} disabled={saving} />
      </ScrollView>
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
  groupLabel: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.xs, marginBottom: 2 },
  twoCol: { flexDirection: "row", gap: spacing.sm },
  typeOption: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  typeOptionSelected: { borderColor: colors.primary, backgroundColor: "#ede9fe" },
  typeText: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full ?? 99, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.xs, fontFamily: fonts.medium, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
});
