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

const GRAPE_CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];
const CONTAINER_TYPES = ["Trailer", "Gondola", "Bins", "Picking Crates", "Tote Bins"];
const WINE_TYPES = ["Red", "White", "Rosé", "Sparkling", "Orange"];

function ChipPicker({ options, value, onChange, colorMap }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  colorMap?: Record<string, string>;
}) {
  const defaultColor = colors.primary;
  return (
    <View style={styles.chipRow}>
      {options.map(o => {
        const active = value === o;
        const bg = colorMap?.[o] ?? defaultColor;
        return (
          <Pressable
            key={o}
            style={[styles.chip, active && { backgroundColor: bg, borderColor: bg }]}
            onPress={() => { Haptics.selectionAsync(); onChange(o); }}
          >
            <Text style={[styles.chipText, active && { color: "#fff" }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function WineryReceptionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperator, setManualOperator] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperator;

  const [receptionDate, setReceptionDate] = useState(today);
  const [vintageYear, setVintageYear] = useState(String(new Date().getFullYear()));
  const [supplierName, setSupplierName] = useState("");
  const [grapeVariety, setGrapeVariety] = useState("");
  const [wineType, setWineType] = useState("");
  const [containerType, setContainerType] = useState("");
  const [grossWeightKg, setGrossWeightKg] = useState("");
  const [tareWeightKg, setTareWeightKg] = useState("");
  const [brix, setBrix] = useState("");
  const [ph, setPh] = useState("");
  const [ta, setTa] = useState("");
  const [potentialAlcohol, setPotentialAlcohol] = useState("");
  const [tempOnArrival, setTempOnArrival] = useState("");
  const [mogPct, setMogPct] = useState("");
  const [condition, setCondition] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  const netWeight = grossWeightKg && tareWeightKg
    ? Math.max(0, Number(grossWeightKg) - Number(tareWeightKg))
    : grossWeightKg ? Number(grossWeightKg) : null;

  const handleSave = async () => {
    if (!receptionDate || !grossWeightKg) {
      Alert.alert("Required Fields", "Please enter the reception date and gross weight.");
      return;
    }
    if (!accepted && !rejectionReason.trim()) {
      Alert.alert("Rejection Reason", "Please enter a reason for rejecting this load.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      receptionDate,
      vintageYear: vintageYear ? Number(vintageYear) : new Date().getFullYear(),
      supplierName: supplierName.trim() || undefined,
      grapeVariety: grapeVariety.trim() || undefined,
      wineType: wineType || undefined,
      containerType: containerType || undefined,
      grossWeightKg: Number(grossWeightKg),
      tareWeightKg: tareWeightKg ? Number(tareWeightKg) : undefined,
      netWeightKg: netWeight ?? undefined,
      brix: brix ? Number(brix) : undefined,
      ph: ph ? Number(ph) : undefined,
      titratableAcidityGl: ta ? Number(ta) : undefined,
      potentialAlcohol: potentialAlcohol ? Number(potentialAlcohol) : undefined,
      tempOnArrivalC: tempOnArrival ? Number(tempOnArrival) : undefined,
      mogPct: mogPct ? Number(mogPct) : undefined,
      grapeCondition: condition || undefined,
      accepted,
      rejectionReason: !accepted ? rejectionReason.trim() : undefined,
      operatorName: operatorName.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_winery_reception", entry);
    await refreshPendingCount();
    setSaving(false);

    const conditionBad = condition === "Poor" || (mogPct && Number(mogPct) > 10);
    if (!accepted || conditionBad) {
      setTaskSheet({
        title: `Winery Reception ${!accepted ? "Rejection" : "Quality Concern"} — ${grapeVariety || supplierName || "Load"} · ${vintageYear}`,
        description: `${netWeight ? `Net: ${netWeight.toFixed(0)} kg · ` : ""}Condition: ${condition}${mogPct ? ` · MOG: ${mogPct}%` : ""}${!accepted ? ` · REJECTED: ${rejectionReason}` : ""}`,
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
          <Text style={styles.title}>Winery Grape Reception</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reception Details</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Reception Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={receptionDate}
                onChangeText={v => { if (v <= today) setReceptionDate(v); }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Vintage Year</Text>
              <Input
                placeholder={String(new Date().getFullYear())}
                value={vintageYear}
                onChangeText={setVintageYear}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Supplier / Vineyard</Text>
          <Input placeholder="e.g. Home Farm, Contract Grower" value={supplierName} onChangeText={setSupplierName} />
          <Text style={styles.fieldLabel}>Grape Variety</Text>
          <Input placeholder="e.g. Chardonnay, Pinot Noir" value={grapeVariety} onChangeText={setGrapeVariety} />
          <Text style={styles.fieldLabel}>Wine Type</Text>
          <ChipPicker options={WINE_TYPES} value={wineType} onChange={setWineType} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weight *</Text>
          <Text style={styles.helpText}>Enter gross weight. If tare is known, net weight is calculated automatically.</Text>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Gross Weight (kg)</Text>
              <Input placeholder="e.g. 8500" value={grossWeightKg} onChangeText={setGrossWeightKg} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Tare Weight (kg)</Text>
              <Input placeholder="e.g. 3200" value={tareWeightKg} onChangeText={setTareWeightKg} keyboardType="decimal-pad" />
            </View>
          </View>
          {netWeight !== null && (
            <View style={styles.netWeightBadge}>
              <Feather name="check-circle" size={14} color="#16a34a" />
              <Text style={styles.netWeightText}>Net Weight: <Text style={{ fontFamily: fonts.bold }}>{netWeight.toFixed(0)} kg</Text></Text>
            </View>
          )}
          <Text style={styles.fieldLabel}>Container Type</Text>
          <ChipPicker options={CONTAINER_TYPES} value={containerType} onChange={setContainerType} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Must Analysis</Text>
          <Text style={styles.helpText}>Fields can be completed in the lab and updated later if not available at reception.</Text>
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
              <Input placeholder="e.g. 9.5" value={ta} onChangeText={setTa} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Pot. Alcohol %</Text>
              <Input placeholder="e.g. 11.2" value={potentialAlcohol} onChangeText={setPotentialAlcohol} keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Temp on Arrival (°C)</Text>
              <Input placeholder="e.g. 12" value={tempOnArrival} onChangeText={setTempOnArrival} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>MOG %</Text>
              <Input placeholder="e.g. 2.5" value={mogPct} onChangeText={setMogPct} keyboardType="decimal-pad" />
            </View>
          </View>
          {mogPct && Number(mogPct) > 10 && (
            <View style={styles.advisoryAmber}>
              <Feather name="alert-triangle" size={14} color="#92400e" />
              <Text style={styles.advisoryAmberText}>MOG above 10% — consider raising a quality task for winemaker review.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Grape Condition</Text>
          <ChipPicker
            options={GRAPE_CONDITIONS}
            value={condition}
            onChange={setCondition}
            colorMap={{ Excellent: "#16a34a", Good: "#65a30d", Fair: "#d97706", Poor: "#dc2626" }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Acceptance Decision</Text>
          <View style={styles.decisionRow}>
            <Pressable
              style={[styles.decisionBtn, accepted && styles.decisionBtnAccepted]}
              onPress={() => { Haptics.selectionAsync(); setAccepted(true); }}
            >
              <Feather name="check-circle" size={18} color={accepted ? "#16a34a" : colors.textSecondary} />
              <Text style={[styles.decisionText, accepted && { color: "#16a34a", fontFamily: fonts.semiBold }]}>Accepted</Text>
            </Pressable>
            <Pressable
              style={[styles.decisionBtn, !accepted && styles.decisionBtnRejected]}
              onPress={() => { Haptics.selectionAsync(); setAccepted(false); }}
            >
              <Feather name="x-circle" size={18} color={!accepted ? "#dc2626" : colors.textSecondary} />
              <Text style={[styles.decisionText, !accepted && { color: "#dc2626", fontFamily: fonts.semiBold }]}>Rejected</Text>
            </Pressable>
          </View>
          {!accepted && (
            <>
              <Text style={styles.fieldLabel}>Rejection Reason *</Text>
              <Input placeholder="e.g. Excess botrytis, incorrect variety, documentation missing" value={rejectionReason} onChangeText={setRejectionReason} multiline numberOfLines={3} />
            </>
          )}
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
          <Input placeholder="Delivery conditions, driver details, vehicle reg…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Reception Record"} onPress={handleSave} disabled={saving} />
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
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  netWeightBadge: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#f0fdf4", borderRadius: radius.sm, padding: spacing.sm, borderWidth: 1, borderColor: "#bbf7d0" },
  netWeightText: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: "#16a34a" },
  decisionRow: { flexDirection: "row", gap: spacing.sm },
  decisionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  decisionBtnAccepted: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  decisionBtnRejected: { borderColor: "#dc2626", backgroundColor: "#fef2f2" },
  decisionText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  advisoryAmber: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#fffbeb", borderRadius: radius.sm, borderWidth: 1, borderColor: "#f59e0b", padding: spacing.sm },
  advisoryAmberText: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: "#92400e", flex: 1, lineHeight: 16 },
});
