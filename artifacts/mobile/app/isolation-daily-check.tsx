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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { getItem, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase } from "@/lib/uploadPhoto";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

type HealthStatus = "satisfactory" | "monitoring" | "poor" | "clear";

const STATUSES: { key: HealthStatus; label: string; color: string }[] = [
  { key: "satisfactory", label: "Satisfactory", color: colors.success },
  { key: "monitoring",   label: "Monitoring Required", color: colors.accent },
  { key: "poor",        label: "Poor — Vet Notified", color: colors.error },
  { key: "clear",       label: "Clear — Released", color: colors.primary },
];

async function apiFetch(path: string, method: string, body?: object) {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${getApiBase()}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

export default function IsolationDailyCheckScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const farmId = currentFarm?.id;

  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [checkDate, setCheckDate] = useState(new Date().toISOString().slice(0, 10));
  const [checkedBy, setCheckedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("satisfactory");
  const [temperatureCelsius, setTemperatureCelsius] = useState("");
  const [notes, setNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  useEffect(() => {
    if (!farmId) return;
    setLoadingRecords(true);
    apiFetch(`/api/farms/${farmId}/isolation-records`, "GET")
      .then(r => r.json())
      .then((data: any) => {
        const active = (data.records ?? []).filter((r: any) => !r.clearanceDate);
        setRecords(active);
        if (active.length > 0) setSelectedRecordId(active[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingRecords(false));
  }, [farmId]);

  const save = async () => {
    if (!farmId || !selectedRecordId || !checkDate) {
      Alert.alert("Required", "Please select an isolation record and enter a check date.");
      return;
    }
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiFetch(
        `/api/farms/${farmId}/isolation-records/${selectedRecordId}/health-checks`,
        "POST",
        { checkDate, checkedBy, healthStatus, temperatureCelsius: temperatureCelsius || null, notes: notes || null, actionTaken: actionTaken || null }
      );
      if (!res.ok) throw new Error("Server error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Health Check Saved", "The daily health check has been recorded.", [
        { text: "Done", onPress: () => router.back() },
        { text: "Log Another", onPress: () => { setNotes(""); setTemperatureCelsius(""); setActionTaken(""); setHealthStatus("satisfactory"); } },
      ]);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save Failed", "Could not save the health check. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Isolation Health Check</Text>
            <Text style={styles.subtitle}>Red Tractor — Daily monitoring of incoming stock</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>ISOLATION RECORD</Text>
            {loadingRecords ? (
              <Text style={styles.emptyText}>Loading active isolation records…</Text>
            ) : records.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="shield" size={24} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No active isolation records found.</Text>
                <Text style={[styles.emptyText, { fontSize: fontSize.xs }]}>Create one on the dashboard first.</Text>
              </View>
            ) : (
              <View style={styles.pickerBox}>
                {records.map(r => (
                  <Pressable
                    key={r.id}
                    style={[styles.pickerItem, selectedRecordId === r.id && styles.pickerItemSelected]}
                    onPress={() => setSelectedRecordId(r.id)}
                  >
                    <View style={[styles.radioOuter, selectedRecordId === r.id && styles.radioOuterSelected]}>
                      {selectedRecordId === r.id && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerItemTitle}>{r.animalDescription || r.isolationReason || "Isolation Record"}</Text>
                      <Text style={styles.pickerItemSub}>
                        Started {r.isolationStartDate?.slice(0, 10)}{r.animalCount ? ` · ${r.animalCount} animals` : ""}{r.supplierName ? ` · ${r.supplierName}` : ""}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {selectedRecord && (
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>HEALTH CHECK DETAILS</Text>

              <Text style={styles.fieldLabel}>Check Date *</Text>
              <Input value={checkDate} onChangeText={setCheckDate} placeholder="YYYY-MM-DD" />

              <LookupPicker label="Checked By" options={staffOptions} value={checkedBy} onSelect={(_id, l) => setCheckedBy(l)} allowFreeText />

              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Health Status</Text>
              <View style={styles.statusRow}>
                {STATUSES.map(s => (
                  <Pressable
                    key={s.key}
                    style={[styles.statusBtn, healthStatus === s.key && { borderColor: s.color, backgroundColor: s.color + "15" }]}
                    onPress={() => setHealthStatus(s.key)}
                  >
                    <Text style={[styles.statusBtnText, healthStatus === s.key && { color: s.color, fontFamily: fonts.semiBold }]}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Temperature (°C)</Text>
              <Input value={temperatureCelsius} onChangeText={setTemperatureCelsius} placeholder="e.g. 38.5" keyboardType="decimal-pad" />

              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Action Taken</Text>
              <Input value={actionTaken} onChangeText={setActionTaken} placeholder="e.g. Vet called, medication given" />

              <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Notes</Text>
              <Input value={notes} onChangeText={setNotes} placeholder="Any observations…" multiline numberOfLines={3} />
            </View>
          )}

          {selectedRecord && (
            <Button
              title={saving ? "Saving…" : "Save Health Check"}
              onPress={save}
              disabled={saving || !checkDate}
              style={styles.saveBtn}
            />
          )}
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
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textTertiary, letterSpacing: 0.8, marginBottom: spacing.xs },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  emptyBox: { alignItems: "center", paddingVertical: spacing.lg, gap: spacing.xs },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  pickerBox: { gap: spacing.xs },
  pickerItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight },
  pickerItemSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "0D" },
  pickerItemTitle: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pickerItemSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  statusRow: { gap: spacing.xs },
  statusBtn: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderLight },
  statusBtnText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  saveBtn: { marginTop: spacing.sm },
});
