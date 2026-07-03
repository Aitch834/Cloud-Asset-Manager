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
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SlurryStoreInspection } from "@/lib/types";

type Outcome = SlurryStoreInspection["outcome"];

const OUTCOMES: { key: Outcome; label: string; color: string; icon: string }[] = [
  { key: "Pass", label: "Pass", color: colors.success, icon: "check-circle" },
  { key: "Advisory", label: "Advisory", color: "#F59E0B", icon: "alert-circle" },
  { key: "Fail", label: "Fail", color: colors.error, icon: "x-circle" },
];

export default function SilageInspectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [stores, setStores] = useState<{ id: number; storeName: string; storeType: string }[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [inspectionDate, setInspectionDate] = useState(today);
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorOrganisation, setInspectorOrganisation] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("Pass");
  const [effluentContained, setEffluentContained] = useState(true);
  const [coverSheetIntact, setCoverSheetIntact] = useState(true);
  const [wallsSound, setWallsSound] = useState(true);
  const [leaksOrDamageFound, setLeaksOrDamageFound] = useState(false);
  const [deficiencies, setDeficiencies] = useState("");
  const [actionsRequired, setActionsRequired] = useState("");
  const [nextInspectionDue, setNextInspectionDue] = useState("");
  const [notes, setNotes] = useState("");

  const [raiseTaskVisible, setRaiseTaskVisible] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<SlurryStoreInspection | null>(null);

  useEffect(() => {
    if (!currentFarm?.id) return;
    fetch(`/api/farms/${currentFarm.id}/slurry-stores`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        const list = (d.records ?? d ?? []).filter((s: any) => s.storeType === "Silage Clamp");
        setStores(list);
        if (list.length === 1) setSelectedStoreId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingStores(false));
  }, [currentFarm?.id]);

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  const doSave = async () => {
    if (!currentFarm?.id) {
      Alert.alert("No Farm", "Please select a farm first.");
      return;
    }
    if (!selectedStoreId) {
      Alert.alert("Clamp Required", "Please select the silage clamp being inspected.");
      return;
    }
    if (!inspectionDate) {
      Alert.alert("Date Required", "Please enter the inspection date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SlurryStoreInspection = {
      id: generateId(),
      farmId: String(currentFarm.id),
      storeId: String(selectedStoreId),
      storeName: selectedStore?.storeName ?? "",
      inspectionDate,
      inspectorName: inspectorName.trim(),
      inspectorOrganisation: inspectorOrganisation.trim(),
      outcome,
      freeboardOk: true,
      freeboardMm: "",
      leaksOrDamageFound,
      deficiencies: deficiencies.trim(),
      actionsRequired: actionsRequired.trim(),
      nextInspectionDue: nextInspectionDue.trim(),
      notes: notes.trim(),
      effluentContained,
      coverSheetIntact,
      wallsSound,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SLURRY_STORE_INSPECTIONS, record);
    await refreshPendingCount();
    setSaving(false);

    if ((outcome === "Advisory" || outcome === "Fail") && actionsRequired.trim()) {
      setPendingRecord(record);
      setRaiseTaskVisible(true);
    } else {
      Alert.alert("Saved", "Silage clamp inspection saved and queued for sync.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Silage Clamp Inspection</Text>
            <Text style={styles.subtitle}>SSAFO compliance — silage &amp; haylage clamps</Text>
          </View>
        </View>

        {/* Clamp selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Silage Clamp</Text>
          {loadingStores ? (
            <Text style={styles.hintText}>Loading clamps…</Text>
          ) : stores.length === 0 ? (
            <View style={[styles.alertBox, { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" }]}>
              <Feather name="alert-triangle" size={15} color="#B45309" />
              <Text style={[styles.alertText, { color: "#92400E" }]}>No silage clamps registered. Add a store with type "Silage Clamp" in the dashboard first.</Text>
            </View>
          ) : (
            <View style={styles.optionRow}>
              {stores.map(s => (
                <Pressable
                  key={s.id}
                  style={[styles.optionPill, selectedStoreId === s.id && styles.optionPillActive]}
                  onPress={() => { setSelectedStoreId(s.id); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.optionPillText, selectedStoreId === s.id && styles.optionPillTextActive]}>
                    {s.storeName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Inspection date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspection Date</Text>
          <Input
            value={inspectionDate}
            onChangeText={setInspectionDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Inspector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inspector Details</Text>
          <Input
            value={inspectorName}
            onChangeText={setInspectorName}
            placeholder="Inspector name"
            style={{ marginBottom: spacing.xs }}
          />
          <Input
            value={inspectorOrganisation}
            onChangeText={setInspectorOrganisation}
            placeholder="Organisation (e.g. Internal, EA, AHDB)"
          />
        </View>

        {/* Outcome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outcome</Text>
          <View style={styles.outcomeRow}>
            {OUTCOMES.map(o => (
              <Pressable
                key={o.key}
                style={[styles.outcomeBtn, outcome === o.key && { backgroundColor: o.color, borderColor: o.color }]}
                onPress={() => { setOutcome(o.key); Haptics.selectionAsync(); }}
              >
                <Feather name={o.icon as any} size={16} color={outcome === o.key ? "#fff" : o.color} />
                <Text style={[styles.outcomeBtnText, outcome === o.key && { color: "#fff" }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
          {outcome !== "Pass" && (
            <View style={[styles.alertBox, { borderColor: outcome === "Fail" ? colors.error : "#F59E0B", backgroundColor: outcome === "Fail" ? "#FEF2F2" : "#FFFBEB" }]}>
              <Feather name="alert-circle" size={15} color={outcome === "Fail" ? colors.error : "#B45309"} />
              <Text style={[styles.alertText, { color: outcome === "Fail" ? "#991B1B" : "#92400E" }]}>
                {outcome === "Fail" ? "Fail — this clamp has deficiencies requiring urgent action." : "Advisory — minor issues noted; monitor and take action where required."}
              </Text>
            </View>
          )}
        </View>

        {/* Silage-specific structural checks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clamp Checks (SSAFO)</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Effluent contained (no runoff)</Text>
            <Switch value={effluentContained} onValueChange={v => { setEffluentContained(v); Haptics.selectionAsync(); }} trackColor={{ true: colors.success }} />
          </View>
          <View style={[styles.toggleRow, { marginTop: spacing.sm }]}>
            <Text style={styles.toggleLabel}>Cover sheet intact &amp; weighted</Text>
            <Switch value={coverSheetIntact} onValueChange={v => { setCoverSheetIntact(v); Haptics.selectionAsync(); }} trackColor={{ true: colors.success }} />
          </View>
          <View style={[styles.toggleRow, { marginTop: spacing.sm }]}>
            <Text style={styles.toggleLabel}>Clamp walls sound (no cracks/leans)</Text>
            <Switch value={wallsSound} onValueChange={v => { setWallsSound(v); Haptics.selectionAsync(); }} trackColor={{ true: colors.success }} />
          </View>
          <View style={[styles.toggleRow, { marginTop: spacing.sm }]}>
            <Text style={[styles.toggleLabel, leaksOrDamageFound && { color: colors.error, fontFamily: fonts.semiBold }]}>
              Leaks or structural damage found
            </Text>
            <Switch
              value={leaksOrDamageFound}
              onValueChange={v => { setLeaksOrDamageFound(v); Haptics.selectionAsync(); }}
              trackColor={{ true: colors.error }}
            />
          </View>
        </View>

        {/* Deficiencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deficiencies Found</Text>
          <Input
            value={deficiencies}
            onChangeText={setDeficiencies}
            placeholder="Describe any deficiencies observed…"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Actions required */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Required</Text>
          <Input
            value={actionsRequired}
            onChangeText={setActionsRequired}
            placeholder="Describe remedial actions needed…"
            multiline
            numberOfLines={3}
          />
          {actionsRequired.trim().length > 0 && (
            <Text style={styles.taskHint}>
              A task will be raised on the Task Board — you can assign it to the responsible person.
            </Text>
          )}
        </View>

        {/* Next inspection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Inspection Due</Text>
          <Input
            value={nextInspectionDue}
            onChangeText={setNextInspectionDue}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any other observations…"
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Inspection"}
          onPress={doSave}
          disabled={saving || !selectedStoreId}
          style={styles.saveBtn}
        />
      </ScrollView>

      <RaiseTaskSheet
        visible={raiseTaskVisible}
        farmId={currentFarm?.id ?? 0}
        defaultTitle={`Silage Clamp Inspection Follow-up — ${selectedStore?.storeName ?? "clamp"} (${inspectionDate})`}
        defaultDescription={actionsRequired.trim()}
        module="Environmental"
        onRaised={() => {
          setRaiseTaskVisible(false);
          Alert.alert("Saved", "Inspection saved and task raised.", [{ text: "OK", onPress: () => router.back() }]);
        }}
        onSkip={() => {
          setRaiseTaskVisible(false);
          Alert.alert("Saved", "Inspection saved and queued for sync.", [{ text: "OK", onPress: () => router.back() }]);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  backBtn: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  hintText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionPill: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center",
  },
  optionPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionPillText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  optionPillTextActive: { color: "#fff" },
  outcomeRow: { flexDirection: "row", gap: spacing.sm },
  outcomeBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: spacing.sm + 2, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  outcomeBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  alertBox: {
    flexDirection: "row", alignItems: "flex-start", gap: spacing.sm,
    marginTop: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1,
  },
  alertText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1, marginRight: spacing.sm },
  taskHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400E", marginTop: spacing.xs },
  saveBtn: { marginTop: spacing.sm },
});
