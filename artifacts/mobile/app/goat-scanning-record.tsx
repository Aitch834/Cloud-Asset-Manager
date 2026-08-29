import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
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

export default function GoatScanningRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("goat-scanning", farmId, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [flockId, setFlockId] = useState("");
  const [scanDate, setScanDate] = useState(todayDate());
  const [scannerName, setScannerName] = useState("");
  const [scannerCompany, setScannerCompany] = useState("");
  const [totalDoesScanned, setTotalDoesScanned] = useState("");
  const [doesBarren, setDoesBarren] = useState("");
  const [doesSingles, setDoesSingles] = useState("");
  const [doesDoubles, setDoesDoubles] = useState("");
  const [doesTriples, setDoesTriples] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!scanDate.trim()) { Alert.alert("Date required", "Please enter the scan date."); return; }
    if (!totalDoesScanned.trim()) { Alert.alert("Count required", "Please enter the total does scanned."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const total = Number(totalDoesScanned);
      const barren = Number(doesBarren || "0");
      const singles = Number(doesSingles || "0");
      const doubles = Number(doesDoubles || "0");
      const triples = Number(doesTriples || "0");
      const expectedKids = singles + doubles * 2 + triples * 3;
      const scanPct = total > 0 ? ((expectedKids / (total - barren)) * 100).toFixed(1) : null;
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "goat-scanning-record",
        herdId: flockId ? Number(flockId) : null,
        scanDate,
        scannerName: scannerName || null,
        scannerCompany: scannerCompany || null,
        totalDoesScanned: total,
        doesBarren: barren,
        doesSingles: singles,
        doesDoubles: doubles,
        doesTriples: triples,
        expectedTotalKids: expectedKids,
        scanningPercentage: scanPct ? Number(scanPct) : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-scanning-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Scanning record saved", `${expectedKids} kids expected (${scanPct ?? "—"}% scanning). Syncs when connected.`, [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Goat Scanning Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <IdentifierBanner
        justSaved={justSaved}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="goat scanning records"
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Herd</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading herds…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Herd"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No goat herds found.</Text>}

        <Text style={styles.sectionTitle}>Scan Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Scan Date *</Text>
            <Input value={scanDate} onChangeText={setScanDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Total Does Scanned *</Text>
            <Input value={totalDoesScanned} onChangeText={setTotalDoesScanned} keyboardType="numeric" placeholder="0" />
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
            <Input value={doesBarren} onChangeText={setDoesBarren} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Singles</Text>
            <Input value={doesSingles} onChangeText={setDoesSingles} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Doubles (Twins)</Text>
            <Input value={doesDoubles} onChangeText={setDoesDoubles} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Triples</Text>
            <Input value={doesTriples} onChangeText={setDoesTriples} keyboardType="numeric" placeholder="0" />
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
  chipSelected: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
