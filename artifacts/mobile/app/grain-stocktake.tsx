import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import {
  getCachedGrainBins,
  getCachedStaffMembers,
  getRefCacheSyncedMinsAgo,
  type RefGrainBin,
  type RefStaffMember,
} from "@/lib/refCache";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

type MeasurementMethod = "probe" | "auger_sample" | "weighbridge" | "visual_estimate";

const METHODS: { key: MeasurementMethod; label: string; description: string }[] = [
  { key: "probe", label: "Probe", description: "Grain probe inserted into stored crop" },
  { key: "auger_sample", label: "Auger Sample", description: "Sample taken by auger then weighed" },
  { key: "weighbridge", label: "Weighbridge", description: "Weight-based measurement" },
  { key: "visual_estimate", label: "Visual Estimate", description: "Based on visual inspection of store" },
];

export default function GrainStocktakeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [binId, setBinId] = useState("");
  const [binName, setBinName] = useState("");
  const [commodity, setCommodity] = useState("");
  const [variety, setVariety] = useState("");
  const [systemQtyTonnes, setSystemQtyTonnes] = useState("");
  const [physicalQtyTonnes, setPhysicalQtyTonnes] = useState("");
  const [measurementMethod, setMeasurementMethod] = useState<MeasurementMethod>("probe");
  const [conductedBy, setConductedBy] = useState(user?.name || "");
  const [stocktakeDate, setStocktakeDate] = useState(today);
  const [notes, setNotes] = useState("");

  const [binOptions, setBinOptions] = useState<LookupOption[]>([]);
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  const [binsSyncedMinsAgo, setBinsSyncedMinsAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!currentFarm?.id) return;
    const farmId = String(currentFarm.id);
    getCachedGrainBins(farmId).then((bins: RefGrainBin[]) => {
      setBinOptions(bins.map((b) => ({ id: b.id, label: b.label, sublabel: b.sublabel || undefined })));
    });
    getCachedStaffMembers(farmId).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
    getRefCacheSyncedMinsAgo("grain-bins", farmId).then(setBinsSyncedMinsAgo);
  }, [currentFarm?.id]);

  const physicalNum = parseFloat(physicalQtyTonnes);
  const systemNum = parseFloat(systemQtyTonnes);
  const variance = !isNaN(physicalNum) && !isNaN(systemNum) ? physicalNum - systemNum : null;
  const varianceLarge = variance !== null && Math.abs(variance) >= 1;
  const varianceNegative = variance !== null && variance < 0;

  const handleSave = async () => {
    if (!binName.trim()) {
      Alert.alert("Required", "Please select or enter the bin / store name.");
      return;
    }
    if (!physicalQtyTonnes.trim() || isNaN(physicalNum) || physicalNum < 0) {
      Alert.alert("Required", "Please enter a valid physical quantity in tonnes.");
      return;
    }

    setSaving(true);

    if (varianceLarge && varianceNegative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const record = {
      id: generateId(),
      farmId: String(currentFarm?.id || ""),
      binId: binId || null,
      binName: binName.trim(),
      commodity: commodity.trim(),
      variety: variety.trim(),
      systemQtyTonnes: systemQtyTonnes.trim() || null,
      physicalQtyTonnes: physicalQtyTonnes.trim(),
      varianceTonnes: variance !== null ? variance.toFixed(3) : null,
      measurementMethod,
      conductedBy: conductedBy.trim(),
      stocktakeDate,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.GRAIN_STOCK_STOCKTAKES, record);
    await refreshPendingCount();
    setSaving(false);

    const title = varianceLarge && varianceNegative ? "Shortfall Recorded" : "Stocktake Saved";
    const message =
      variance !== null
        ? varianceLarge && varianceNegative
          ? `${Math.abs(variance).toFixed(2)} t shortfall vs system records. Saved and queued for sync.`
          : `Variance: ${variance >= 0 ? "+" : ""}${variance.toFixed(2)} t. Saved and queued for sync.`
        : "Grain stocktake saved offline and queued for sync.";

    Alert.alert(title, message, [{ text: "Done", onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Grain Store Stocktake</Text>
            <Text style={styles.subtitle}>Record a physical probe count against system stock</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Location</Text>
            <LookupPicker
              label="Bin / Store *"
              value={binName}
              options={binOptions}
              onSelect={(id, label) => { setBinId(id); setBinName(label); }}
              placeholder="Select or search bins…"
              allowFreeText
              syncedMinsAgo={binsSyncedMinsAgo}
              emptyMessage="No bins cached — sync when online to populate, or type manually."
              icon="package"
            />
            <Input
              label="Commodity"
              value={commodity}
              onChangeText={setCommodity}
              placeholder="e.g. Winter Wheat, Oilseed Rape"
              autoCapitalize="words"
            />
            <Input
              label="Variety"
              value={variety}
              onChangeText={setVariety}
              placeholder="e.g. Extase, Campus (optional)"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Quantities</Text>
            <Input
              label="Physical Qty (tonnes) *"
              value={physicalQtyTonnes}
              onChangeText={setPhysicalQtyTonnes}
              placeholder="e.g. 248.50"
              keyboardType="decimal-pad"
            />
            <Input
              label="System Qty (tonnes)"
              value={systemQtyTonnes}
              onChangeText={setSystemQtyTonnes}
              placeholder="From records — leave blank if unknown"
              keyboardType="decimal-pad"
            />

            {variance !== null && (
              <View
                style={[
                  styles.varianceCard,
                  {
                    borderColor: varianceLarge
                      ? varianceNegative ? colors.error : colors.accent
                      : colors.success + "66",
                    backgroundColor: varianceLarge
                      ? varianceNegative ? colors.error + "12" : colors.accent + "12"
                      : colors.success + "10",
                  },
                ]}
              >
                <Feather
                  name={varianceLarge ? (varianceNegative ? "alert-triangle" : "info") : "check-circle"}
                  size={18}
                  color={varianceLarge ? (varianceNegative ? colors.error : colors.accent) : colors.success}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.varianceTitle,
                      { color: varianceLarge ? (varianceNegative ? colors.error : colors.accent) : colors.success },
                    ]}
                  >
                    {varianceLarge && varianceNegative
                      ? "Shortfall — Investigate"
                      : varianceLarge
                      ? "Surplus — Check Records"
                      : "Within Tolerance"}
                  </Text>
                  <Text style={styles.varianceDetail}>
                    {variance >= 0 ? "+" : ""}
                    {variance.toFixed(2)} t variance
                    {varianceLarge && varianceNegative
                      ? " — check for undeclared outloadings or weighing error"
                      : varianceLarge
                      ? " — check for unrecorded intake or transfer"
                      : " — within normal probe measurement tolerance"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurement Method</Text>
            {METHODS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMeasurementMethod(m.key)}
                style={[
                  styles.option,
                  measurementMethod === m.key && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "12",
                  },
                ]}
              >
                <View style={[styles.radio, measurementMethod === m.key && { borderColor: colors.primary }]}>
                  {measurementMethod === m.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, measurementMethod === m.key && { color: colors.primary }]}>
                    {m.label}
                  </Text>
                  <Text style={styles.optionSub}>{m.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <LookupPicker
              label="Conducted By"
              value={conductedBy}
              options={staffOptions}
              onSelect={(_id, label) => setConductedBy(label)}
              placeholder="Name of person conducting the stocktake"
              allowFreeText
              icon="user"
            />
            <Input
              label="Stocktake Date"
              value={stocktakeDate}
              onChangeText={setStocktakeDate}
              placeholder="YYYY-MM-DD"
              maxDate="today"
            />
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any observations, conditions or actions taken…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Stocktake"}
              onPress={handleSave}
              disabled={saving}
            />
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  optionSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  varianceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  varianceTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, marginBottom: 2 },
  varianceDetail: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 16 },
});
