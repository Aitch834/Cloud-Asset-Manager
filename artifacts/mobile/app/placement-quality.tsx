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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

type QualityScore = "excellent" | "good" | "acceptable" | "poor" | "fail";

const SCORES: { key: QualityScore; label: string; color: string }[] = [
  { key: "excellent",   label: "Excellent", color: "#16a34a" },
  { key: "good",        label: "Good",      color: colors.primary },
  { key: "acceptable",  label: "Acceptable", color: colors.accent },
  { key: "poor",        label: "Poor",      color: "#ea580c" },
  { key: "fail",        label: "Fail",      color: colors.error },
];

async function apiFetch(path: string, method: string, body?: object, signal?: AbortSignal) {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${getApiBase()}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal });
}

export default function PlacementQualityScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const farmId = currentFarm?.id;

  const [flocks, setFlocks] = useState<any[]>([]);
  const [selectedFlockId, setSelectedFlockId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [assessedBy, setAssessedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [qualityScore, setQualityScore] = useState<QualityScore | "">("");
  const [uniformityPercent, setUniformityPercent] = useState("");
  const [cullCount, setCullCount] = useState("");
  const [cullPercent, setCullPercent] = useState("");
  const [arrivalTemp, setArrivalTemp] = useState("");
  const [hatcheryNotified, setHatcheryNotified] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!farmId) return;
    const controller = new AbortController();
    apiFetch(`/api/farms/${farmId}/poultry-flocks`, "GET", undefined, controller.signal)
      .then(r => r.json())
      .then((data: any) => {
        const fl = data.flocks ?? [];
        setFlocks(fl);
        if (fl.length > 0) setSelectedFlockId(fl[0].id);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [farmId]);

  const flockName = (id: number) => {
    const f = flocks.find(fl => fl.id === id);
    return f ? (f.flockName || f.houseNumber || `Flock #${id}`) : `Flock #${id}`;
  };

  const save = async () => {
    if (!farmId || !selectedFlockId || !assessmentDate) {
      Alert.alert("Required", "Please select a flock and enter the assessment date.");
      return;
    }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/poultry-placement-quality`, "POST", {
        flockId: selectedFlockId,
        assessmentDate,
        assessedBy: assessedBy || null,
        overallQualityScore: qualityScore || null,
        uniformityPercent: uniformityPercent || null,
        cullCountAtPlacement: cullCount || null,
        cullPercentAtPlacement: cullPercent || null,
        arrivalTemperatureCelsius: arrivalTemp || null,
        hatcheryNotified,
        notes: notes || null,
      });
      if (!res.ok) throw new Error("Server error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Assessment Saved", "Chick quality assessment has been recorded.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save Failed", "Could not save the assessment. Check your connection and try again.");
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
            <Text style={styles.title}>Chick / Poult Placement Quality</Text>
            <Text style={styles.subtitle}>Red Tractor — Quality assessment at placement</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>FLOCK</Text>
            {flocks.length === 0 ? (
              <Text style={styles.emptyText}>No flocks found — add flocks on the dashboard first.</Text>
            ) : (
              <View style={styles.pickerBox}>
                {flocks.map(f => (
                  <Pressable
                    key={f.id}
                    style={[styles.pickerItem, selectedFlockId === f.id && styles.pickerItemSelected]}
                    onPress={() => setSelectedFlockId(f.id)}
                  >
                    <View style={[styles.radioOuter, selectedFlockId === f.id && styles.radioOuterSelected]}>
                      {selectedFlockId === f.id && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.pickerItemTitle}>{flockName(f.id)}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>ASSESSMENT DETAILS</Text>

            <Text style={styles.fieldLabel}>Assessment Date *</Text>
            <Input value={assessmentDate} onChangeText={setAssessmentDate} placeholder="YYYY-MM-DD" />

            <LookupPicker label="Assessed By" options={staffOptions} value={assessedBy} onSelect={(_id, l) => setAssessedBy(l)} allowFreeText />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Overall Quality Score</Text>
            <View style={styles.scoreRow}>
              {SCORES.map(s => (
                <Pressable
                  key={s.key}
                  style={[styles.scoreBtn, qualityScore === s.key && { borderColor: s.color, backgroundColor: s.color + "15" }]}
                  onPress={() => setQualityScore(s.key)}
                >
                  <Text style={[styles.scoreBtnText, qualityScore === s.key && { color: s.color, fontFamily: fonts.semiBold }]}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Uniformity (%)</Text>
            <Input value={uniformityPercent} onChangeText={setUniformityPercent} keyboardType="decimal-pad" placeholder="e.g. 85" />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Culls at Placement</Text>
            <Input value={cullCount} onChangeText={setCullCount} keyboardType="number-pad" placeholder="Count" />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Cull %</Text>
            <Input value={cullPercent} onChangeText={setCullPercent} keyboardType="decimal-pad" placeholder="e.g. 1.2" />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Arrival Temperature (°C)</Text>
            <Input value={arrivalTemp} onChangeText={setArrivalTemp} keyboardType="decimal-pad" placeholder="e.g. 38.5" />

            <View style={[styles.switchRow, { marginTop: spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Hatchery Notified</Text>
                <Text style={styles.fieldSub}>Quality issues reported back to hatchery</Text>
              </View>
              <Switch value={hatcheryNotified} onValueChange={setHatcheryNotified} trackColor={{ true: colors.primary }} />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Notes</Text>
            <Input value={notes} onChangeText={setNotes} placeholder="Any observations…" multiline numberOfLines={3} />
          </View>

          <Button
            title={saving ? "Saving…" : "Save Assessment"}
            onPress={save}
            disabled={saving || !assessmentDate || !selectedFlockId}
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
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  scoreRow: { gap: spacing.xs },
  scoreBtn: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight },
  scoreBtnText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  switchRow: { flexDirection: "row", alignItems: "center" },
  saveBtn: { marginTop: spacing.sm },
});
