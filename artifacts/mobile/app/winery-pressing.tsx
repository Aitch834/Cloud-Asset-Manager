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

const PRESS_TYPES = ["Pneumatic Bladder", "Hydraulic Basket", "Continuous Screw", "Hand / Traditional", "Other"];
const SETTLING_METHODS = ["Gravity Settling", "Centrifuge", "Flotation", "Bentonite Addition", "Other"];

function ChipPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map(o => (
        <Pressable
          key={o}
          style={[styles.chip, value === o && styles.chipSelected]}
          onPress={() => { Haptics.selectionAsync(); onChange(o); }}
        >
          <Text style={[styles.chipText, value === o && styles.chipTextSelected]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function WineryPressingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [pressDate, setPressDate] = useState(today);
  const [vintageYear, setVintageYear] = useState(String(new Date().getFullYear()));
  const [grapeVariety, setGrapeVariety] = useState("");
  const [blockSource, setBlockSource] = useState("");
  const [weightPressedKg, setWeightPressedKg] = useState("");
  const [pressType, setPressType] = useState("");
  const [pressStartTime, setPressStartTime] = useState("");
  const [pressEndTime, setPressEndTime] = useState("");
  const [freeRunLitres, setFreeRunLitres] = useState("");
  const [pressJuiceLitres, setPressJuiceLitres] = useState("");
  const [freeRunBrix, setFreeRunBrix] = useState("");
  const [pressJuiceBrix, setPressJuiceBrix] = useState("");
  const [settlingVessel, setSettlingVessel] = useState("");
  const [settlingMethod, setSettlingMethod] = useState("");
  const [additionsAtPress, setAdditionsAtPress] = useState("");
  const [notes, setNotes] = useState("");

  const totalJuice = (freeRunLitres ? Number(freeRunLitres) : 0) + (pressJuiceLitres ? Number(pressJuiceLitres) : 0);
  const yieldPct = weightPressedKg && totalJuice > 0
    ? ((totalJuice / (Number(weightPressedKg) * 1.2)) * 100).toFixed(1)
    : null;

  const handleSave = async () => {
    if (!pressDate || !weightPressedKg) {
      Alert.alert("Required Fields", "Please enter the press date and total grape weight.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      pressDate,
      vintageYear: vintageYear ? Number(vintageYear) : new Date().getFullYear(),
      grapeVariety: grapeVariety.trim() || undefined,
      blockSource: blockSource.trim() || undefined,
      weightPressedKg: Number(weightPressedKg),
      pressType: pressType || undefined,
      pressStartTime: pressStartTime.trim() || undefined,
      pressEndTime: pressEndTime.trim() || undefined,
      freeRunLitres: freeRunLitres ? Number(freeRunLitres) : undefined,
      pressJuiceLitres: pressJuiceLitres ? Number(pressJuiceLitres) : undefined,
      totalJuiceLitres: totalJuice > 0 ? totalJuice : undefined,
      freeRunBrix: freeRunBrix ? Number(freeRunBrix) : undefined,
      pressJuiceBrix: pressJuiceBrix ? Number(pressJuiceBrix) : undefined,
      settlingVessel: settlingVessel.trim() || undefined,
      settlingMethod: settlingMethod || undefined,
      additionsAtPress: additionsAtPress.trim() || undefined,
      operatorName: operatorName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_winery_pressing", entry);
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
          <Text style={styles.title}>Pressing Record</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Press Run Details</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Press Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={pressDate}
                onChangeText={v => { if (v <= today) setPressDate(v); }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Vintage Year</Text>
              <Input placeholder={String(new Date().getFullYear())} value={vintageYear} onChangeText={setVintageYear} keyboardType="numeric" />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Grape Variety</Text>
          <Input placeholder="e.g. Chardonnay, Pinot Meunier" value={grapeVariety} onChangeText={setGrapeVariety} />
          <Text style={styles.fieldLabel}>Block / Source</Text>
          <Input placeholder="e.g. South Block, Contract Grower A" value={blockSource} onChangeText={setBlockSource} />
          <Text style={styles.fieldLabel}>Total Weight Pressed (kg) *</Text>
          <Input placeholder="e.g. 4500" value={weightPressedKg} onChangeText={setWeightPressedKg} keyboardType="decimal-pad" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Press Type</Text>
          <ChipPicker options={PRESS_TYPES} value={pressType} onChange={setPressType} />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Start Time</Text>
              <Input placeholder="e.g. 06:30" value={pressStartTime} onChangeText={setPressStartTime} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>End Time</Text>
              <Input placeholder="e.g. 10:45" value={pressEndTime} onChangeText={setPressEndTime} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Juice Yields</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Free-Run (L)</Text>
              <Input placeholder="e.g. 2800" value={freeRunLitres} onChangeText={setFreeRunLitres} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Press Juice (L)</Text>
              <Input placeholder="e.g. 700" value={pressJuiceLitres} onChangeText={setPressJuiceLitres} keyboardType="decimal-pad" />
            </View>
          </View>
          {totalJuice > 0 && (
            <View style={styles.yieldBadge}>
              <Feather name="droplet" size={14} color={colors.primary} />
              <Text style={styles.yieldText}>
                Total: <Text style={{ fontFamily: fonts.bold }}>{totalJuice.toLocaleString()} L</Text>
                {yieldPct ? `  ·  Yield ≈ ${yieldPct}%` : ""}
              </Text>
            </View>
          )}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Free-Run Brix °</Text>
              <Input placeholder="e.g. 18.5" value={freeRunBrix} onChangeText={setFreeRunBrix} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Press Juice Brix °</Text>
              <Input placeholder="e.g. 16.2" value={pressJuiceBrix} onChangeText={setPressJuiceBrix} keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Settling</Text>
          <Text style={styles.fieldLabel}>Settling Vessel</Text>
          <Input placeholder="e.g. Tank 4, Flotation Tank" value={settlingVessel} onChangeText={setSettlingVessel} />
          <Text style={styles.fieldLabel}>Settling Method</Text>
          <ChipPicker options={SETTLING_METHODS} value={settlingMethod} onChange={setSettlingMethod} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additions at Press</Text>
          <Input placeholder="e.g. SO₂ 50 ppm, pectolytic enzymes, ascorbic acid" value={additionsAtPress} onChangeText={setAdditionsAtPress} multiline numberOfLines={3} />
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
          <Input placeholder="Press programme, skin contact time, observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Pressing Record"} onPress={handleSave} disabled={saving} />
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
  twoCol: { flexDirection: "row", gap: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: (radius.full as number) ?? 99, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  yieldBadge: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#ede9fe", borderRadius: radius.sm, padding: spacing.sm, borderWidth: 1, borderColor: "#c4b5fd" },
  yieldText: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.primary },
});
