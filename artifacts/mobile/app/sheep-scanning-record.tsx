import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { useApiSheepFlocks } from "@/lib/hooks/useApiSheepFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SheepScanningRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const sheepAlert = useDiseaseAlert("sheep");
  const { flocks, loading: flocksLoading } = useApiSheepFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("sheep-scanning", farmId, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [flockId, setFlockId] = useState("");
  const [scanDate, setScanDate] = useState(todayDate());
  const [scannerName, setScannerName] = useState("");
  const [scannerCompany, setScannerCompany] = useState("");
  const [totalEwesScanned, setTotalEwesScanned] = useState("");
  const [ewesBarren, setEwesBarren] = useState("");
  const [ewesSingles, setEwesSingles] = useState("");
  const [ewesDoubles, setEwesDoubles] = useState("");
  const [ewesTripletsPlus, setEwesTripletsPlus] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!scanDate.trim()) { Alert.alert("Date required", "Please enter the scan date."); return; }
    if (!totalEwesScanned.trim()) { Alert.alert("Count required", "Please enter the total ewes scanned."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const total = Number(totalEwesScanned);
      const barren = Number(ewesBarren || "0");
      const singles = Number(ewesSingles || "0");
      const doubles = Number(ewesDoubles || "0");
      const triplets = Number(ewesTripletsPlus || "0");
      const expectedLambs = singles + doubles * 2 + triplets * 3;
      const scanPct = total > 0 ? ((expectedLambs / (total - barren)) * 100).toFixed(1) : null;
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "sheep-scanning-record",
        flockId: flockId ? Number(flockId) : null,
        scanDate,
        scannerName: scannerName || null,
        scannerCompany: scannerCompany || null,
        totalEwesScanned: total,
        ewesBarren: barren,
        ewesSingles: singles,
        ewesDoubles: doubles,
        ewesTripletsPlus: triplets,
        expectedTotalLambs: expectedLambs,
        scanningPercentage: scanPct ? Number(scanPct) : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/sheep-scanning-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Scanning record saved", `${expectedLambs} lambs expected (${scanPct ?? "—"}% scanning). Syncs when connected.`, [{ text: "Done", onPress: () => router.back() }]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Sheep Scanning Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <DiseaseAlertBanner alert={sheepAlert} sector="Sheep" />
      <IdentifierBanner
        justSaved={justSaved}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="sheep scanning records"
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Flock</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading flocks…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Flock"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No sheep flocks found.</Text>}

        <Text style={styles.sectionTitle}>Scan Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Scan Date *</Text>
            <Input value={scanDate} onChangeText={setScanDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Total Ewes Scanned *</Text>
            <Input value={totalEwesScanned} onChangeText={setTotalEwesScanned} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Scanner Name</Text>
            <Input value={scannerName} onChangeText={setScannerName} placeholder="Scanner's name" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Scanner Company</Text>
            <Input value={scannerCompany} onChangeText={setScannerCompany} placeholder="Company" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Results Breakdown</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Barren</Text>
            <Input value={ewesBarren} onChangeText={setEwesBarren} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Singles</Text>
            <Input value={ewesSingles} onChangeText={setEwesSingles} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Doubles (Twins)</Text>
            <Input value={ewesDoubles} onChangeText={setEwesDoubles} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Triplets+</Text>
            <Input value={ewesTripletsPlus} onChangeText={setEwesTripletsPlus} keyboardType="numeric" placeholder="0" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Scanning Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
