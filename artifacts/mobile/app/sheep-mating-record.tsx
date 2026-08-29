import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
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

const MATING_METHODS = ["Natural", "AI", "Laparoscopic AI", "Embryo Transfer"];
const RADDLE_COLOURS = ["Red", "Orange", "Yellow", "Green", "Blue", "None"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SheepMatingRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const sheepAlert = useDiseaseAlert("sheep");
  const { flocks, loading: flocksLoading } = useApiSheepFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("sheep-mating", farmId, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [flockId, setFlockId] = useState("");
  const [matingStartDate, setMatingStartDate] = useState(todayDate());
  const [matingEndDate, setMatingEndDate] = useState("");
  const [ramEarTag, setRamEarTag] = useState("");
  const [ramBreed, setRamBreed] = useState("");
  const [ramOwner, setRamOwner] = useState("");
  const [ewesExposed, setEwesExposed] = useState("");
  const [expectedLambingDate, setExpectedLambingDate] = useState("");
  const [matingMethod, setMatingMethod] = useState("Natural");
  const [raddleUsed, setRaddleUsed] = useState(false);
  const [raddleColour, setRaddleColour] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!matingStartDate.trim()) { Alert.alert("Date required", "Please enter the mating start date."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "sheep-mating-record",
        flockId: flockId ? Number(flockId) : null,
        matingStartDate,
        matingEndDate: matingEndDate || null,
        ramEarTag: ramEarTag || null,
        ramBreed: ramBreed || null,
        ramOwner: ramOwner || null,
        ramHiredOrOwned: "owned",
        ewesExposed: ewesExposed ? Number(ewesExposed) : null,
        expectedLambingDate: expectedLambingDate || null,
        matingMethod,
        raddleUsed,
        raddleColourSequence: raddleColour || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/sheep-mating-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Mating record saved", "Tupping record will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Sheep Mating / Tupping</Text>
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
        context="mating records"
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Flock</Text>
        {flocksLoading ? (
          <Text style={styles.hint}>Loading flocks…</Text>
        ) : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Flock"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : (
          <Text style={styles.hint}>No sheep flocks found — add one in the dashboard first.</Text>
        )}

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
          <Text style={styles.label}>Expected Lambing Date</Text>
          <Input value={expectedLambingDate} onChangeText={setExpectedLambingDate} placeholder="YYYY-MM-DD" />
        </View>

        <Text style={styles.sectionTitle}>Ram Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Ram Ear Tag</Text>
            <Input value={ramEarTag} onChangeText={setRamEarTag} placeholder="e.g. UK123456" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Ewes Exposed</Text>
            <Input value={ewesExposed} onChangeText={setEwesExposed} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Ram Breed</Text>
            <Input value={ramBreed} onChangeText={setRamBreed} placeholder="e.g. Texel" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Ram Owner</Text>
            <Input value={ramOwner} onChangeText={setRamOwner} placeholder="Owner name" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Mating Method</Text>
        <View style={styles.chips}>
          {MATING_METHODS.map((m) => <Chip key={m} label={m} selected={matingMethod === m} onPress={() => { Haptics.selectionAsync(); setMatingMethod(m); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Raddle</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Raddle / Marker Used</Text>
          <Switch value={raddleUsed} onValueChange={setRaddleUsed} trackColor={{ false: colors.borderLight, true: "#16a34a" }} thumbColor="#fff" />
        </View>
        {raddleUsed && (
          <>
            <Text style={[styles.label, { marginTop: spacing.sm }]}>Raddle Colour</Text>
            <View style={styles.chips}>
              {RADDLE_COLOURS.map((c) => <Chip key={c} label={c} selected={raddleColour === c} onPress={() => { Haptics.selectionAsync(); setRaddleColour(c); }} />)}
            </View>
          </>
        )}

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
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
