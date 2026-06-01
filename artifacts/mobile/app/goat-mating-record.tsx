import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const MATING_METHODS = ["Natural", "AI", "Laparoscopic AI", "Embryo Transfer"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function GoatMatingRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState("");
  const [matingStartDate, setMatingStartDate] = useState(todayDate());
  const [matingEndDate, setMatingEndDate] = useState("");
  const [buckEarTag, setBuckEarTag] = useState("");
  const [buckBreed, setBuckBreed] = useState("");
  const [buckOwner, setBuckOwner] = useState("");
  const [buckHired, setBuckHired] = useState(false);
  const [doesExposed, setDoesExposed] = useState("");
  const [expectedKiddingDate, setExpectedKiddingDate] = useState("");
  const [matingMethod, setMatingMethod] = useState("Natural");
  const [progesteroneSponge, setProgesteroneSponge] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!matingStartDate.trim()) { Alert.alert("Date required", "Please enter the mating start date."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "goat-mating-record",
        herdId: flockId ? Number(flockId) : null,
        matingStartDate,
        matingEndDate: matingEndDate || null,
        buckEarTag: buckEarTag || null,
        buckBreed: buckBreed || null,
        buckOwner: buckOwner || null,
        buckHiredOrOwned: buckHired ? "hired" : "owned",
        doesExposed: doesExposed ? Number(doesExposed) : null,
        expectedKiddingDate: expectedKiddingDate || null,
        matingMethod,
        progesteroneSpongeUsed: progesteroneSponge,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-mating-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Mating record saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Goat Mating Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Herd</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading herds…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Herd"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No goat herds found — add one in the dashboard first.</Text>}

        <Text style={styles.sectionTitle}>Mating Dates</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Start Date *</Text>
            <Input value={matingStartDate} onChangeText={setMatingStartDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>End Date</Text>
            <Input value={matingEndDate} onChangeText={setMatingEndDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Expected Kidding Date</Text>
          <Input value={expectedKiddingDate} onChangeText={setExpectedKiddingDate} placeholder="YYYY-MM-DD" />
        </View>

        <Text style={styles.sectionTitle}>Buck Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Buck Ear Tag</Text>
            <Input value={buckEarTag} onChangeText={setBuckEarTag} placeholder="e.g. UK123456" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Does Exposed</Text>
            <Input value={doesExposed} onChangeText={setDoesExposed} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Buck Breed</Text>
            <Input value={buckBreed} onChangeText={setBuckBreed} placeholder="e.g. Boer" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Buck Owner</Text>
            <Input value={buckOwner} onChangeText={setBuckOwner} placeholder="Owner name" />
          </View>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Buck Hired In</Text>
          <Switch value={buckHired} onValueChange={setBuckHired} trackColor={{ false: colors.borderLight, true: "#0891b2" }} thumbColor="#fff" />
        </View>

        <Text style={styles.sectionTitle}>Mating Method</Text>
        <View style={styles.chips}>
          {MATING_METHODS.map((m) => <Chip key={m} label={m} selected={matingMethod === m} onPress={() => { Haptics.selectionAsync(); setMatingMethod(m); }} />)}
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Progesterone Sponge Used</Text>
          <Switch value={progesteroneSponge} onValueChange={setProgesteroneSponge} trackColor={{ false: colors.borderLight, true: "#0891b2" }} thumbColor="#fff" />
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Mating Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
