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
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

type Mode = "inventory" | "moisture";

const STRAW_TYPES = ["Wheat", "Barley", "Oat", "Rye", "OSR", "Mixed", "Other"];
const BALE_TYPES = ["Round", "Square (small)", "Square (big square)"];

function MoistureRiskBadge({ pct }: { pct: number }) {
  if (pct >= 25)
    return (
      <View style={[styles.badge, { backgroundColor: "#fca5a5" }]}>
        <Text style={[styles.badgeText, { color: "#7f1d1d" }]}>
          HIGH RISK — DO NOT STORE
        </Text>
      </View>
    );
  if (pct >= 20)
    return (
      <View style={[styles.badge, { backgroundColor: "#fcd34d" }]}>
        <Text style={[styles.badgeText, { color: "#78350f" }]}>
          ELEVATED — Monitor closely
        </Text>
      </View>
    );
  if (pct >= 16)
    return (
      <View style={[styles.badge, { backgroundColor: "#fde68a" }]}>
        <Text style={[styles.badgeText, { color: "#92400e" }]}>
          CAUTION — Check weekly
        </Text>
      </View>
    );
  return (
    <View style={[styles.badge, { backgroundColor: "#bbf7d0" }]}>
      <Text style={[styles.badgeText, { color: "#14532d" }]}>
        SAFE — &lt;16% moisture
      </Text>
    </View>
  );
}

export default function StrawBalesScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [mode, setMode] = useState<Mode>("inventory");
  const [saving, setSaving] = useState(false);

  // ── Inventory form ────────────────────────────────────────────────────────
  const [strawType, setStrawType] = useState("");
  const [baleType, setBaleType] = useState("");
  const [baleCount, setBaleCount] = useState("");
  const [weightKgPerBale, setWeightKgPerBale] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [storageLocation, setStorageLocation] = useState("");
  const [redTractorCertified, setRedTractorCertified] = useState(false);
  const [biomassContract, setBiomassContract] = useState(false);
  const [biomassScheme, setBiomassScheme] = useState("");
  const [biomassUniqueBaleRef, setBiomassUniqueBaleRef] = useState("");
  const [notes, setNotes] = useState("");

  // ── Moisture form ─────────────────────────────────────────────────────────
  const [mBatchRef, setMBatchRef] = useState("");
  const [mLocation, setMLocation] = useState("");
  const [mMoisturePercent, setMMoisturePercent] = useState("");
  const [mInternalTempC, setMInternalTempC] = useState("");
  const [mCheckedBy, setMCheckedBy] = useState("");
  const [mNotes, setMNotes] = useState("");

  const moistureNum = parseFloat(mMoisturePercent);

  async function saveInventory() {
    if (!strawType) {
      Alert.alert("Required", "Please select the straw type.");
      return;
    }
    if (!baleCount || isNaN(Number(baleCount)) || Number(baleCount) <= 0) {
      Alert.alert("Required", "Please enter a valid bale count.");
      return;
    }
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        strawType,
        baleType: baleType || null,
        baleCount: Number(baleCount),
        weightKgPerBale: weightKgPerBale ? Number(weightKgPerBale) : null,
        fieldName: fieldName || null,
        harvestDate: harvestDate || null,
        storageLocation: storageLocation || null,
        redTractorCertified,
        biomassContract,
        biomassScheme: biomassContract ? (biomassScheme || null) : null,
        biomassUniqueBaleRef: biomassContract ? (biomassUniqueBaleRef || null) : null,
        status: "in-store",
        notes: notes || null,
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.STRAW_BALE_INVENTORY, record);
      await refreshPendingCount();
      Alert.alert("Saved", "Bale batch logged — will sync when online.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not save record.");
    } finally {
      setSaving(false);
    }
  }

  async function saveMoisture() {
    if (!mMoisturePercent || isNaN(moistureNum)) {
      Alert.alert("Required", "Please enter a valid moisture reading.");
      return;
    }
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        batchRef: mBatchRef || null,
        locationDescription: mLocation || null,
        moisturePercent: moistureNum,
        internalTempC: mInternalTempC ? Number(mInternalTempC) : null,
        checkedBy: mCheckedBy || null,
        notes: mNotes || null,
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.STRAW_MOISTURE_CHECKS, record);
      await refreshPendingCount();

      const riskMsg =
        moistureNum >= 25
          ? "⚠️ HIGH FIRE RISK — do not store this batch until dried."
          : moistureNum >= 20
            ? "Elevated moisture — monitor closely."
            : "Moisture level acceptable.";
      Alert.alert("Saved", `Moisture check logged.\n\n${riskMsg}`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not save record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Straw Bale Record</Text>
        </View>

        {/* Mode toggle */}
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeTab, mode === "inventory" && styles.modeTabActive]}
            onPress={() => setMode("inventory")}
          >
            <Feather
              name="layers"
              size={14}
              color={mode === "inventory" ? "#fff" : colors.textSecondary}
            />
            <Text
              style={[
                styles.modeTabLabel,
                mode === "inventory" && styles.modeTabLabelActive,
              ]}
            >
              Log Batch
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeTab, mode === "moisture" && styles.modeTabActive]}
            onPress={() => setMode("moisture")}
          >
            <Feather
              name="droplet"
              size={14}
              color={mode === "moisture" ? "#fff" : colors.textSecondary}
            />
            <Text
              style={[
                styles.modeTabLabel,
                mode === "moisture" && styles.modeTabLabelActive,
              ]}
            >
              Moisture Check
            </Text>
          </Pressable>
        </View>

        {mode === "inventory" ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bale Batch Details</Text>

            {/* Straw type chips */}
            <Text style={styles.label}>Straw Type *</Text>
            <View style={styles.chipRow}>
              {STRAW_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setStrawType(t)}
                  style={[
                    styles.chip,
                    strawType === t && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      strawType === t && styles.chipTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Bale type chips */}
            <Text style={[styles.label, { marginTop: spacing.md }]}>Bale Type</Text>
            <View style={styles.chipRow}>
              {BALE_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setBaleType(t)}
                  style={[
                    styles.chip,
                    baleType === t && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      baleType === t && styles.chipTextSelected,
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.row2}>
              <View style={styles.halfField}>
                <Input
                  label="Bale Count *"
                  value={baleCount}
                  onChangeText={setBaleCount}
                  keyboardType="numeric"
                  placeholder="e.g. 120"
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Weight/Bale (kg)"
                  value={weightKgPerBale}
                  onChangeText={setWeightKgPerBale}
                  keyboardType="numeric"
                  placeholder="e.g. 450"
                />
              </View>
            </View>

            <Input
              label="Source Field"
              value={fieldName}
              onChangeText={setFieldName}
              placeholder="Field name or number"
            />

            <Input
              label="Harvest Date"
              value={harvestDate}
              onChangeText={setHarvestDate}
              placeholder="YYYY-MM-DD"
            />

            <Input
              label="Storage Location"
              value={storageLocation}
              onChangeText={setStorageLocation}
              placeholder="e.g. Yard 2 barn, north stack"
            />

            {/* Red Tractor toggle */}
            <Pressable
              style={styles.toggleRow}
              onPress={() => setRedTractorCertified((v) => !v)}
            >
              <View
                style={[
                  styles.checkbox,
                  redTractorCertified && styles.checkboxChecked,
                ]}
              >
                {redTractorCertified && (
                  <Feather name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.toggleLabel}>
                Red Tractor Certified (Combinable Crops & Sugar Beet Standard)
              </Text>
            </Pressable>

            {/* Biomass / Energy Contract toggle */}
            <Pressable
              style={styles.toggleRow}
              onPress={() => setBiomassContract((v) => !v)}
            >
              <View
                style={[
                  styles.checkbox,
                  biomassContract && { backgroundColor: "#16a34a", borderColor: "#16a34a" },
                ]}
              >
                {biomassContract && (
                  <Feather name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.toggleLabel}>
                Biomass / Energy Contract (BECS, AD plant, etc.)
              </Text>
            </Pressable>

            {biomassContract && (
              <>
                <Input
                  label="Scheme / Buyer"
                  value={biomassScheme}
                  onChangeText={setBiomassScheme}
                  placeholder="e.g. BECS, Drax, AD plant name"
                />
                <Input
                  label="Unique Bale Reference"
                  value={biomassUniqueBaleRef}
                  onChangeText={setBiomassUniqueBaleRef}
                  placeholder="Scheme reference number"
                />
              </>
            )}

            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes"
              multiline
            />

            <Button
              title={saving ? "Saving…" : "Save Batch"}
              onPress={saveInventory}
              disabled={saving}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Moisture / Fire Safety Check</Text>
            <Text style={styles.hint}>
              HSE INDG125: straw above 20% moisture risks spontaneous combustion.
              Do not store bales above 25% — allow field drying first.
            </Text>

            <Input
              label="Batch Reference / Stack"
              value={mBatchRef}
              onChangeText={setMBatchRef}
              placeholder="e.g. WT-2024-003 or Yard 2"
            />

            <Input
              label="Location Description"
              value={mLocation}
              onChangeText={setMLocation}
              placeholder="e.g. North wall, row 3"
            />

            <Input
              label="Moisture % *"
              value={mMoisturePercent}
              onChangeText={setMMoisturePercent}
              keyboardType="numeric"
              placeholder="e.g. 14.5"
            />

            {mMoisturePercent && !isNaN(moistureNum) && (
              <View style={{ marginTop: spacing.sm }}>
                <MoistureRiskBadge pct={moistureNum} />
              </View>
            )}

            <Input
              label="Internal Temperature (°C)"
              value={mInternalTempC}
              onChangeText={setMInternalTempC}
              keyboardType="numeric"
              placeholder="e.g. 28"
            />

            <Input
              label="Checked By"
              value={mCheckedBy}
              onChangeText={setMCheckedBy}
              placeholder="Name of person checking"
            />

            <Input
              label="Notes / Action Taken"
              value={mNotes}
              onChangeText={setMNotes}
              placeholder="e.g. Opened ventilation gap on south side"
              multiline
            />

            <Button
              title={saving ? "Saving…" : "Save Moisture Check"}
              onPress={saveMoisture}
              disabled={saving}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  modeRow: {
    flexDirection: "row",
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  modeTabActive: { backgroundColor: "#d97706" },
  modeTabLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  modeTabLabelActive: { color: "#fff" },
  card: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    backgroundColor: "#fef9c3",
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: "#d97706",
    borderColor: "#d97706",
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextSelected: { color: "#fff" },
  row2: { flexDirection: "row", gap: spacing.sm },
  halfField: { flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  toggleLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
