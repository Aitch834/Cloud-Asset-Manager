import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const FACILITY_TYPES = ["On-farm approved larder", "AGHE (Approved Game Handling Establishment)", "Licensed Game Handling Establishment", "Direct on-farm slaughter"];
const DESTINATION_TYPES = ["Game dealer", "Butcher / butchery", "Wholesale", "Direct consumer sale", "Restaurant / catering", "Export", "Own consumption"];
const GRADES = ["A — Premium", "B — Standard", "C — Manufacturing"];
const DEER_SPECIES = ["Red Deer", "Roe Deer", "Fallow Deer", "Sika Deer", "Muntjac", "Chinese Water Deer", "Reindeer", "Mixed / Other"];

const CHIP_COLOR = "#15803d";

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: CHIP_COLOR, borderColor: CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function VenisonCarcassSaleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds, loading: herdsLoading } = useApiHerds(currentFarm?.id);
  const displayHerds = herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? "")).length > 0
    ? herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? ""))
    : herds;
  const [saving, setSaving] = useState(false);

  const [herdId, setHerdId] = useState("");
  const [saleDate, setSaleDate] = useState(todayDate());
  const [facilityType, setFacilityType] = useState("On-farm approved larder");
  const [species, setSpecies] = useState("Roe Deer");
  const [numberCarcasses, setNumberCarcasses] = useState("");
  const [carcassNumbers, setCarcassNumbers] = useState("");
  const [gradeOrQuality, setGradeOrQuality] = useState("");
  const [destinationType, setDestinationType] = useState("Game dealer");
  const [buyerName, setBuyerName] = useState("");
  const [pricePerKgGbp, setPricePerKgGbp] = useState("");
  const [totalWeightKg, setTotalWeightKg] = useState("");
  const [totalValueGbp, setTotalValueGbp] = useState("");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [wildGameDeclarationNumber, setWildGameDeclarationNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!saleDate.trim()) { Alert.alert("Date required", "Please enter the sale date."); return; }
    if (!numberCarcasses.trim()) { Alert.alert("Count required", "Please enter the number of carcasses."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "venison-carcass-sale",
        herdId: herdId ? Number(herdId) : null,
        saleDate,
        facilityType,
        species: species || null,
        numberCarcasses: Number(numberCarcasses),
        carcassNumbers: carcassNumbers || null,
        gradeOrQuality: gradeOrQuality || null,
        destinationType,
        buyerName: buyerName || null,
        pricePerKgGbp: pricePerKgGbp || null,
        totalWeightKg: totalWeightKg || null,
        totalValueGbp: totalValueGbp || null,
        invoiceReference: invoiceReference || null,
        wildGameDeclarationNumber: wildGameDeclarationNumber || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/venison-carcass-sales`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Carcass sale saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Venison Carcass Sale</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Deer Herd</Text>
        {herdsLoading ? <Text style={styles.hint}>Loading herds…</Text> : displayHerds.length > 0 ? (
          <View style={styles.chips}>
            {displayHerds.map((h) => <Chip key={String(h.id)} label={h.name ?? "Herd"} selected={herdId === String(h.id)} onPress={() => { Haptics.selectionAsync(); setHerdId(String(h.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No herds found.</Text>}

        <Text style={styles.sectionTitle}>Sale Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Sale Date *</Text>
            <Input value={saleDate} onChangeText={setSaleDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>No. Carcasses *</Text>
            <Input value={numberCarcasses} onChangeText={setNumberCarcasses} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Carcass Numbers (comma-separated)</Text>
          <Input value={carcassNumbers} onChangeText={setCarcassNumbers} placeholder="e.g. C-001, C-002, C-003" />
        </View>

        <Text style={styles.sectionTitle}>Species</Text>
        <View style={styles.chips}>
          {DEER_SPECIES.map((s) => <Chip key={s} label={s} selected={species === s} onPress={() => { Haptics.selectionAsync(); setSpecies(s); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Processing Facility</Text>
        <View style={styles.chips}>
          {FACILITY_TYPES.map((f) => <Chip key={f} label={f} selected={facilityType === f} onPress={() => { Haptics.selectionAsync(); setFacilityType(f); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Grade / Quality</Text>
        <View style={styles.chips}>
          {GRADES.map((g) => <Chip key={g} label={g} selected={gradeOrQuality === g} onPress={() => { Haptics.selectionAsync(); setGradeOrQuality(g); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Destination</Text>
        <View style={styles.chips}>
          {DESTINATION_TYPES.map((d) => <Chip key={d} label={d} selected={destinationType === d} onPress={() => { Haptics.selectionAsync(); setDestinationType(d); }} />)}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Buyer / Game Dealer Name</Text>
          <Input value={buyerName} onChangeText={setBuyerName} placeholder="Name or company" />
        </View>

        <Text style={styles.sectionTitle}>Value</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Price per kg (£)</Text>
            <Input value={pricePerKgGbp} onChangeText={setPricePerKgGbp} keyboardType="decimal-pad" placeholder="0.00" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Total Weight (kg)</Text>
            <Input value={totalWeightKg} onChangeText={setTotalWeightKg} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Total Value (£)</Text>
            <Input value={totalValueGbp} onChangeText={setTotalValueGbp} keyboardType="decimal-pad" placeholder="0.00" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Invoice Reference</Text>
            <Input value={invoiceReference} onChangeText={setInvoiceReference} placeholder="e.g. INV-001" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Wild Game Declaration</Text>
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color="#0891b2" />
          <Text style={styles.infoText}>A Wild Game Declaration (WGD) is required under UK food hygiene law when deer enter the commercial food chain. Record the WGD reference number from the trained hunter's declaration form.</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Wild Game Declaration No.</Text>
          <Input value={wildGameDeclarationNumber} onChangeText={setWildGameDeclarationNumber} placeholder="e.g. WGD-2025-001" />
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Carcass Sale"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  infoBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#e0f2fe", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#0c4a6e", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
