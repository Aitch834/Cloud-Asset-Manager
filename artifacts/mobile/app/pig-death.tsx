import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

const CAUSES = [
  { key: "disease", label: "Disease / Illness" },
  { key: "injury", label: "Injury / Trauma" },
  { key: "respiratory", label: "Respiratory Disease" },
  { key: "scour", label: "Enteric / Scour" },
  { key: "svd", label: "Swine Dysentery" },
  { key: "prrs", label: "PRRS" },
  { key: "crushing", label: "Overlain / Crushing" },
  { key: "starvation", label: "Starvation / Failure to thrive" },
  { key: "euthanised", label: "Euthanised (on vet advice)" },
  { key: "unknown", label: "Unknown / Sudden Death" },
  { key: "other", label: "Other (see notes)" },
];

const DISPOSAL_METHODS = [
  { key: "nfas", label: "Fallen Stock Collection (NFAS)" },
  { key: "hunt-kennel", label: "Hunt Kennel / Knacker" },
  { key: "incineration", label: "Licensed Incineration" },
  { key: "rendering", label: "Rendering Plant" },
  { key: "burial-licensed", label: "On-farm Burial (with licence)" },
  { key: "other", label: "Other (see notes)" },
];

function OptionChips({
  options,
  value,
  onSelect,
}: {
  options: { key: string; label: string }[];
  value: string;
  onSelect: (k: string) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <Pressable
            key={o.key}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => { Haptics.selectionAsync(); onSelect(o.key); }}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function PigDeathScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const {
    cphNumber,
    sbiNumber,
    loading: identifiersLoading,
    justSaved,
    clearJustSaved,
    refetch: refetchIdentifiers,
  } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss(
    "pig-death",
    currentFarm?.id,
    user?.id,
  );
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [deathDate, setDeathDate] = useState(new Date().toISOString().split("T")[0]);
  const [numberOfAnimals, setNumberOfAnimals] = useState("1");
  const [earTagOrId, setEarTagOrId] = useState("");
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [disposalMethod, setDisposalMethod] = useState("");
  const [vetAttended, setVetAttended] = useState(false);
  const [aphaNotified, setAphaNotified] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!deathDate.trim()) {
      Alert.alert("Required", "Please enter the date of death."); return;
    }
    if (!numberOfAnimals.trim() || parseInt(numberOfAnimals, 10) < 1) {
      Alert.alert("Required", "Please enter the number of animals."); return;
    }
    if (!causeOfDeath) {
      Alert.alert("Required", "Please select a cause of death."); return;
    }
    if (!disposalMethod) {
      Alert.alert("Required", "Please select a disposal method."); return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId: flockId || null,
      groupName: groupName.trim() || null,
      deathDate,
      numberOfAnimals: parseInt(numberOfAnimals, 10),
      earTagOrId: earTagOrId.trim() || null,
      causeOfDeath,
      disposalMethod,
      vetAttended,
      aphaNotified,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_DEATH_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Death record saved",
      "Record queued for sync. Ensure fallen stock is disposed of promptly in accordance with ABP regulations.",
      [
        {
          text: "Record Another",
          onPress: () => {
            setNumberOfAnimals("1"); setEarTagOrId(""); setCauseOfDeath("");
            setDisposalMethod(""); setVetAttended(false); setAphaNotified(false); setNotes("");
          },
        },
        { text: "Done", onPress: () => router.back() },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pig Death Record</Text>
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
        context="pig death notifications"
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              All pig deaths must be recorded. Fallen pigs are classed as Animal By-Products (ABP) and must be disposed of through an approved route. Notify APHA if there is any suspicion of notifiable disease.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Herd / Group</Text>
          </View>
          <PigPenPicker
            label="Select Group (optional)"
            value={groupName}
            onChange={setGroupName}
            onChangeFlock={(f) => setFlockId(f.id)}
            flocks={flocks}
            loading={flocksLoading}
            fromCache={fromCache}
            error={flocksError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Death Details</Text>
          </View>
          <Input label="Date of Death *" placeholder="YYYY-MM-DD" maxDate="today" value={deathDate} onChangeText={setDeathDate} required />
          <View style={styles.row}>
            <Input label="Number of Animals *" placeholder="1" value={numberOfAnimals} onChangeText={setNumberOfAnimals} keyboardType="number-pad" containerStyle={styles.flex} required />
            <Input label="Ear Tag / ID (optional)" placeholder="e.g. UK123456789" value={earTagOrId} onChangeText={setEarTagOrId} containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Cause of Death *</Text>
          </View>
          <OptionChips options={CAUSES} value={causeOfDeath} onSelect={setCauseOfDeath} />

          <View style={styles.sectionLabel}>
            <Feather name="trash-2" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Disposal Method *</Text>
          </View>
          <OptionChips options={DISPOSAL_METHODS} value={disposalMethod} onSelect={setDisposalMethod} />

          <View style={styles.sectionLabel}>
            <Feather name="user-check" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Notifications & Attendance</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="user-check" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Vet attended</Text>
                <Text style={styles.toggleSub}>A vet examined the animal(s) on farm</Text>
              </View>
            </View>
            <Switch
              value={vetAttended}
              onValueChange={(v) => { Haptics.selectionAsync(); setVetAttended(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={vetAttended ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="bell" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>APHA notified</Text>
                <Text style={styles.toggleSub}>Animal and Plant Health Agency informed of this death</Text>
              </View>
            </View>
            <Switch
              value={aphaNotified}
              onValueChange={(v) => { Haptics.selectionAsync(); setAphaNotified(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={aphaNotified ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Clinical signs, vet findings, post-mortem results…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Button title="Save Death Record" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: spacing.md },
  infoBox: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.info, flex: 1, lineHeight: 18 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#db2777", borderColor: "#db2777" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleInfo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, flex: 1 },
  toggleTextBlock: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  toggleSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
