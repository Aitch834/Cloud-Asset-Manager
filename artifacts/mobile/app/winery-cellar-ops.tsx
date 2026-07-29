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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId } from "@/lib/storage";

const today = new Date().toISOString().split("T")[0];

type OpType = {
  key: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  group: string;
  needsSo2?: boolean;
  needsFining?: boolean;
  needsVolume?: boolean;
};

const OPERATION_TYPES: OpType[] = [
  { key: "Racking", icon: "arrow-right", group: "Clarification", needsVolume: true },
  { key: "Filtering", icon: "filter", group: "Clarification", needsVolume: true },
  { key: "Fining", icon: "droplet", group: "Clarification", needsFining: true },
  { key: "Topping Up", icon: "arrow-up", group: "Maintenance", needsVolume: true },
  { key: "Barrel Rotation", icon: "refresh-cw", group: "Maintenance" },
  { key: "Stirring on Lees", icon: "wind", group: "Maintenance" },
  { key: "Sulfiting", icon: "zap", group: "SO₂ Management", needsSo2: true },
  { key: "Blending", icon: "shuffle", group: "Blending", needsVolume: true },
  { key: "Tartrate Stabilisation", icon: "thermometer", group: "Stabilisation" },
  { key: "Acidification", icon: "plus-circle", group: "Chemistry Adjustment" },
  { key: "Deacidification", icon: "minus-circle", group: "Chemistry Adjustment" },
  { key: "Chaptalization", icon: "plus-square", group: "Chemistry Adjustment" },
  { key: "Other", icon: "more-horizontal", group: "Other" },
];

export default function WineryCellarOpsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [opDate, setOpDate] = useState(today);
  const [opType, setOpType] = useState<string | null>(null);
  const [vesselName, setVesselName] = useState("");
  const [volumeLitres, setVolumeLitres] = useState("");
  const [so2AddedMgl, setSo2AddedMgl] = useState("");
  const [so2Form, setSo2Form] = useState("");
  const [finingAgent, setFiningAgent] = useState("");
  const [finingDoseGhl, setFiningDoseGhl] = useState("");
  const [additionDetails, setAdditionDetails] = useState("");
  const [notes, setNotes] = useState("");

  const selectedOp = OPERATION_TYPES.find(o => o.key === opType);

  const handleSave = async () => {
    if (!opDate || !opType) {
      Alert.alert("Required Fields", "Please select the date and operation type.");
      return;
    }
    if (selectedOp?.needsSo2 && !so2AddedMgl) {
      Alert.alert("SO₂ Amount Required", "Please enter the amount of SO₂ added.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      operationDate: opDate,
      operationType: opType,
      vesselName: vesselName.trim() || undefined,
      volumeLitres: volumeLitres ? Number(volumeLitres) : undefined,
      so2AddedMgl: so2AddedMgl ? Number(so2AddedMgl) : undefined,
      so2Form: so2Form.trim() || undefined,
      finingAgent: finingAgent.trim() || undefined,
      finingDoseGhl: finingDoseGhl ? Number(finingDoseGhl) : undefined,
      additionDetails: additionDetails.trim() || undefined,
      operatorName: operatorName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_winery_cellar_ops", entry);
    await refreshPendingCount();
    setSaving(false);
    router.back();
  };

  const grouped = OPERATION_TYPES.reduce<Record<string, OpType[]>>((acc, op) => {
    (acc[op.group] ??= []).push(op);
    return acc;
  }, {});

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
          <Text style={styles.title}>Cellar Operations Log</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operation Details</Text>
          <Text style={styles.fieldLabel}>Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={opDate}
            onChangeText={v => { if (v <= today) setOpDate(v); }}
            keyboardType="numeric"
          />
          <Text style={styles.fieldLabel}>Vessel / Tank</Text>
          <Input placeholder="e.g. Tank 3, Barrel 12A, Amphorae B" value={vesselName} onChangeText={setVesselName} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operation Type *</Text>
          {Object.entries(grouped).map(([group, ops]) => (
            <View key={group}>
              <Text style={styles.groupLabel}>{group}</Text>
              {ops.map(op => (
                <Pressable
                  key={op.key}
                  style={[styles.typeOption, opType === op.key && styles.typeOptionSelected]}
                  onPress={() => { Haptics.selectionAsync(); setOpType(op.key); }}
                >
                  <Feather name={op.icon} size={16} color={opType === op.key ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.typeText, opType === op.key && { color: colors.primary, fontFamily: fonts.semiBold }]}>{op.key}</Text>
                  {opType === op.key && <Feather name="check" size={14} color={colors.primary} />}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {selectedOp?.needsVolume && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Volume</Text>
            <Text style={styles.fieldLabel}>Volume (L)</Text>
            <Input placeholder="e.g. 2500" value={volumeLitres} onChangeText={setVolumeLitres} keyboardType="decimal-pad" />
          </View>
        )}

        {selectedOp?.needsSo2 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>SO₂ Addition</Text>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>SO₂ Added (mg/L) *</Text>
                <Input placeholder="e.g. 20" value={so2AddedMgl} onChangeText={setSo2AddedMgl} keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Form (e.g. K-meta)</Text>
                <Input placeholder="e.g. Potassium metabisulfite" value={so2Form} onChangeText={setSo2Form} />
              </View>
            </View>
          </View>
        )}

        {selectedOp?.needsFining && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Fining Agent</Text>
            <View style={styles.twoCol}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Agent</Text>
                <Input placeholder="e.g. Bentonite, Isinglass, Casein" value={finingAgent} onChangeText={setFiningAgent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Dose (g/hL)</Text>
                <Input placeholder="e.g. 50" value={finingDoseGhl} onChangeText={setFiningDoseGhl} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>
        )}

        {opType === "Other" && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Addition / Treatment Details</Text>
            <Input placeholder="Describe the operation and any additions made…" value={additionDetails} onChangeText={setAdditionDetails} multiline numberOfLines={3} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Operator</Text>
          <StaffMemberPicker members={members} selected={selectedOperator} onSelect={setSelectedOperator} loading={false} error={null} />
          {!selectedOperator && (
            <Input placeholder="Or type name manually" value={manualOperator} onChangeText={setManualOperator} style={{ marginTop: spacing.xs }} />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input placeholder="Observations, sensory assessment, next steps…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Cellar Operation"} onPress={handleSave} disabled={saving} />
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
});
