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
import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { Input } from "@/components/ui/Input";
import { SmallRuminantPicker } from "@/components/ui/SmallRuminantPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const SESSIONS = [
  { value: "morning",  label: "AM" },
  { value: "afternoon", label: "PM" },
  { value: "evening",  label: "Evening" },
  { value: "full-day", label: "Full day" },
];

const ABR_OPTIONS = [
  { value: "",             label: "Not tested" },
  { value: "negative",     label: "Negative ✓" },
  { value: "positive",     label: "Positive ⚠" },
  { value: "borderline",   label: "Borderline" },
  { value: "invalid",      label: "Invalid (test void)" },
];

export default function GoatMilkRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const goatAlert = useDiseaseAlert("goat");
  const { flocks, loading: flocksLoading, fromCache: flocksCached, error: flocksError } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  // Milking event
  const [recordDate, setRecordDate] = useState(todayDate());
  const [sessionType, setSessionType] = useState("");
  const [flockGroup, setFlockGroup] = useState("");
  const [volumeLitres, setVolumeLitres] = useState("");
  const [lactationNumber, setLactationNumber] = useState("");

  // On-farm measurements
  const [milkTemperature, setMilkTemperature] = useState("");
  const [fatPercentage, setFatPercentage] = useState("");
  const [proteinPercentage, setProteinPercentage] = useState("");
  const [sccCount, setSccCount] = useState("");
  const [tbcCount, setTbcCount] = useState("");
  const [abrResult, setAbrResult] = useState("");
  const [abrKitLot, setAbrKitLot] = useState("");

  // Collection & buyer lab
  const [milkBuyer, setMilkBuyer] = useState("");
  const [collectorReference, setCollectorReference] = useState("");
  const [buyerScc, setBuyerScc] = useState("");
  const [buyerFat, setBuyerFat] = useState("");
  const [buyerProtein, setBuyerProtein] = useState("");
  const [pencePerLitre, setPencePerLitre] = useState("");

  const [notes, setNotes] = useState("");

  const sccWarning = sccCount && Number(sccCount) > 1000;

  const handleSave = async () => {
    if (!volumeLitres.trim()) {
      Alert.alert("Volume required", "Please enter the volume collected in litres.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "goat-milk-record",
        recordDate,
        sessionType: sessionType || null,
        flockGroup: flockGroup || null,
        volumeLitres,
        milkTemperatureCelsius: milkTemperature || null,
        fatPercent: fatPercentage || null,
        proteinPercent: proteinPercentage || null,
        sccThousands: sccCount ? Number(sccCount) : null,
        tbcCfuMl: tbcCount ? Number(tbcCount) : null,
        antibioticResidueTestResult: abrResult || null,
        abrTestKitLot: abrKitLot || null,
        milkBuyer: milkBuyer || null,
        collectorReference: collectorReference || null,
        buyerSccThousands: buyerScc ? Number(buyerScc) : null,
        buyerFatPercent: buyerFat || null,
        buyerProteinPercent: buyerProtein || null,
        pencePerLitre: pencePerLitre || null,
        lactationNumber: lactationNumber ? Number(lactationNumber) : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-dairy/milk-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Milk record saved",
        `${volumeLitres}L recorded for ${recordDate}. Will sync when connected.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Goat Milk Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <DiseaseAlertBanner alert={goatAlert} sector="Goat" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Milking Event ── */}
        <Text style={styles.sectionTitle}>Milking Event</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Record Date *</Text>
            <Input value={recordDate} onChangeText={setRecordDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Volume (litres) *</Text>
            <Input value={volumeLitres} onChangeText={setVolumeLitres} placeholder="e.g. 420" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Session</Text>
          <View style={styles.pillRow}>
            {SESSIONS.map(s => (
              <Pressable
                key={s.value}
                style={[styles.pill, sessionType === s.value && styles.pillActive]}
                onPress={() => setSessionType(sessionType === s.value ? "" : s.value)}
              >
                <Text style={[styles.pillText, sessionType === s.value && styles.pillTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Herd / Group</Text>
          <SmallRuminantPicker species="goat" value={flockGroup} onChange={setFlockGroup} flocks={flocks} loading={flocksLoading} fromCache={flocksCached} error={flocksError} />
        </View>

        {/* ── On-Farm Measurements ── */}
        <Text style={styles.sectionTitle}>On-Farm Measurements</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Milk Temp (°C)</Text>
            <Input value={milkTemperature} onChangeText={setMilkTemperature} placeholder="Target ≤4°C" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Lactation No.</Text>
            <Input value={lactationNumber} onChangeText={setLactationNumber} placeholder="e.g. 2" keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>On-farm Fat %</Text>
            <Input value={fatPercentage} onChangeText={setFatPercentage} placeholder="e.g. 4.8" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>On-farm Protein %</Text>
            <Input value={proteinPercentage} onChangeText={setProteinPercentage} placeholder="e.g. 3.5" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>On-farm SCC (k/mL)</Text>
            <Input value={sccCount} onChangeText={setSccCount} placeholder="limit 1,000k" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>On-farm TBC (k/mL)</Text>
            <Input value={tbcCount} onChangeText={setTbcCount} placeholder="e.g. 25" keyboardType="number-pad" />
          </View>
        </View>

        {!!sccWarning && (
          <View style={styles.warning}>
            <Feather name="alert-triangle" size={14} color="#92400e" />
            <Text style={styles.warningText}>SCC exceeds the 1,000k/mL regulatory limit for goat milk</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>ABR Test Result</Text>
          <View style={styles.pillRow}>
            {ABR_OPTIONS.map(o => (
              <Pressable
                key={o.value}
                style={[styles.pill, abrResult === o.value && styles.pillActive, abrResult === o.value && (o.value === "positive" ? styles.pillDanger : (o.value === "borderline" || o.value === "invalid") ? styles.pillWarning : null)]}
                onPress={() => setAbrResult(abrResult === o.value ? "" : o.value)}
              >
                <Text style={[styles.pillText, abrResult === o.value && styles.pillTextActive]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>ABR Kit Lot Number</Text>
          <Input value={abrKitLot} onChangeText={setAbrKitLot} placeholder="From kit packaging" />
        </View>

        {/* ── Collection & Buyer Lab ── */}
        <Text style={styles.sectionTitle}>Collection &amp; Buyer Lab</Text>

        <View style={styles.infoBox}>
          <Feather name="info" size={14} color="#92400e" style={{ marginTop: 1 }} />
          <Text style={styles.infoText}>
            A tanker typically collects every 2–3 days. Enter the same Collector Reference on every session that went into one collection. Buyer lab results are tied to the collection, not each individual milking.
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Milk Buyer</Text>
            <Input value={milkBuyer} onChangeText={setMilkBuyer} placeholder="e.g. Arla" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Collector Reference</Text>
            <Input value={collectorReference} onChangeText={setCollectorReference} placeholder="Slip/docket number" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Buyer SCC (k/mL)</Text>
            <Input value={buyerScc} onChangeText={setBuyerScc} placeholder="e.g. 180" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Pence per litre</Text>
            <Input value={pencePerLitre} onChangeText={setPencePerLitre} placeholder="e.g. 42.50" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Buyer Fat %</Text>
            <Input value={buyerFat} onChangeText={setBuyerFat} placeholder="e.g. 4.8" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Buyer Protein %</Text>
            <Input value={buyerProtein} onChangeText={setBuyerProtein} placeholder="e.g. 3.5" keyboardType="decimal-pad" />
          </View>
        </View>

        {/* ── Notes ── */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

        <Button title={saving ? "Saving…" : "Save Milk Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  pill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pillActive: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  pillDanger: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  pillWarning: { backgroundColor: "#d97706", borderColor: "#d97706" },
  pillText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  pillTextActive: { color: "#fff" },
  warning: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fef3c7", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  warningText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", flex: 1 },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, backgroundColor: "#fef3c7", borderRadius: radius.sm, borderWidth: 1, borderColor: "#fcd34d", padding: spacing.sm, marginBottom: spacing.sm },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", flex: 1, lineHeight: 16 },
  saveBtn: { marginTop: spacing.md },
});
