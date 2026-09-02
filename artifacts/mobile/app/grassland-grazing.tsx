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
  Switch,
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
import { getItem, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase } from "@/lib/uploadPhoto";

type GrazingSystem = "set-stocking" | "rotational" | "strip-grazing" | "zero-grazing" | "other";

const SYSTEMS: { key: GrazingSystem; label: string }[] = [
  { key: "set-stocking", label: "Set Stocking" },
  { key: "rotational",   label: "Rotational" },
  { key: "strip-grazing", label: "Strip Grazing" },
  { key: "zero-grazing", label: "Zero Grazing" },
  { key: "other",        label: "Other" },
];

async function apiFetch(path: string, method: string, body?: object, signal?: AbortSignal) {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${getApiBase()}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal });
}

export default function GrasslandGrazingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;

  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [exitDate, setExitDate] = useState("");
  const [grazingSystem, setGrazingSystem] = useState<GrazingSystem>("rotational");
  const [speciesGrazed, setSpeciesGrazed] = useState("");
  const [animalCount, setAnimalCount] = useState("");
  const [preCoverMm, setPreCoverMm] = useState("");
  const [postResidualMm, setPostResidualMm] = useState("");
  const [manureApplied, setManureApplied] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!farmId) return;
    const controller = new AbortController();
    apiFetch(`/api/farms/${farmId}/fields`, "GET", undefined, controller.signal)
      .then(r => r.json())
      .then((data: any) => {
        const fl = data.fields ?? data ?? [];
        setFields(Array.isArray(fl) ? fl : []);
        if (fl.length > 0) setSelectedFieldId(fl[0].id);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [farmId]);

  const save = async () => {
    if (!farmId || !selectedFieldId || !entryDate) {
      Alert.alert("Required", "Please select a field and enter the entry date.");
      return;
    }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/grassland-grazing-events`, "POST", {
        fieldId: selectedFieldId,
        entryDate,
        exitDate: exitDate || null,
        grazingSystem,
        speciesGrazed: speciesGrazed || null,
        animalCount: animalCount || null,
        preGrazingCoverMm: preCoverMm || null,
        postGrazingResidualMm: postResidualMm || null,
        manureAppliedBeforeEntry: manureApplied,
        notes: notes || null,
      });
      if (!res.ok) throw new Error("Server error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Grazing Event Saved", "The grazing event has been recorded.", [
        { text: "Done", onPress: () => router.back() },
        { text: "Log Another", onPress: () => { setExitDate(""); setSpeciesGrazed(""); setAnimalCount(""); setPreCoverMm(""); setPostResidualMm(""); setNotes(""); setManureApplied(false); } },
      ]);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save Failed", "Could not save the grazing event. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Grazing Event</Text>
            <Text style={styles.subtitle}>Red Tractor — Log grassland grazing for rotation records</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>FIELD</Text>
            {fields.length === 0 ? (
              <Text style={styles.emptyText}>No fields found — add fields on the dashboard first.</Text>
            ) : (
              <View style={styles.pickerBox}>
                {fields.slice(0, 20).map(f => (
                  <Pressable
                    key={f.id}
                    style={[styles.pickerItem, selectedFieldId === f.id && styles.pickerItemSelected]}
                    onPress={() => setSelectedFieldId(f.id)}
                  >
                    <View style={[styles.radioOuter, selectedFieldId === f.id && styles.radioOuterSelected]}>
                      {selectedFieldId === f.id && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerItemTitle}>{f.name || `Field #${f.id}`}</Text>
                      {f.areaHectares ? <Text style={styles.pickerItemSub}>{f.areaHectares} ha</Text> : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>GRAZING DETAILS</Text>

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Entry Date *</Text>
                <Input value={entryDate} onChangeText={setEntryDate} placeholder="YYYY-MM-DD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Exit Date</Text>
                <Input value={exitDate} onChangeText={setExitDate} placeholder="YYYY-MM-DD" />
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Grazing System</Text>
            <View style={styles.systemRow}>
              {SYSTEMS.map(s => (
                <Pressable
                  key={s.key}
                  style={[styles.systemBtn, grazingSystem === s.key && styles.systemBtnSelected]}
                  onPress={() => setGrazingSystem(s.key)}
                >
                  <Text style={[styles.systemBtnText, grazingSystem === s.key && styles.systemBtnTextSelected]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Species Grazed</Text>
            <Input value={speciesGrazed} onChangeText={setSpeciesGrazed} placeholder="e.g. Beef cattle, Dairy cows, Sheep" />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Number of Animals</Text>
            <Input value={animalCount} onChangeText={setAnimalCount} keyboardType="number-pad" placeholder="Head count" />

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Pre-Grazing Cover (mm)</Text>
                <Input value={preCoverMm} onChangeText={setPreCoverMm} keyboardType="decimal-pad" placeholder="e.g. 2800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Post Residual (mm)</Text>
                <Input value={postResidualMm} onChangeText={setPostResidualMm} keyboardType="decimal-pad" placeholder="e.g. 1500" />
              </View>
            </View>

            <View style={[styles.switchRow, { marginTop: spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Manure Applied Before Entry</Text>
                <Text style={styles.fieldSub}>Organic manure applied to this field before grazing commenced</Text>
              </View>
              <Switch value={manureApplied} onValueChange={setManureApplied} trackColor={{ true: colors.primary }} />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} placeholder="Sward condition, any issues…" multiline numberOfLines={3} />
          </View>

          <Button
            title={saving ? "Saving…" : "Log Grazing Event"}
            onPress={save}
            disabled={saving || !selectedFieldId || !entryDate}
            style={styles.saveBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.sm },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textTertiary, letterSpacing: 0.8 },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  fieldSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  pickerBox: { gap: spacing.xs },
  pickerItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight },
  pickerItemSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "0D" },
  pickerItemTitle: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pickerItemSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  rowTwo: { flexDirection: "row", gap: spacing.sm },
  systemRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  systemBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight },
  systemBtnSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "0D" },
  systemBtnText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  systemBtnTextSelected: { fontFamily: fonts.semiBold, color: colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center" },
  saveBtn: { marginTop: spacing.sm },
});
