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
import { SmallRuminantPicker } from "@/components/ui/SmallRuminantPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { farmBirthRecordHtml } from "@/lib/printTemplates";
import { usePrint } from "@/lib/hooks/usePrint";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const EASE_OPTIONS = [
  { key: 1, label: "1 — Unassisted", color: "#16a34a" },
  { key: 2, label: "2 — Easy assist", color: "#2563eb" },
  { key: 3, label: "3 — Hard assist", color: "#d97706" },
  { key: 4, label: "4 — Vet/caesarean", color: "#dc2626" },
];

const KID_OUTCOMES = ["Live", "Stillborn", "Died within 24h", "Unknown"];
const KID_SEXES = ["Male", "Female", "Unknown"];
const LITTER_SIZES = [1, 2, 3, 4];

function Chip<T extends string | number>({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: color ?? colors.primary, borderColor: color ?? colors.primary }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.borderLight, true: "#16a34a" }} thumbColor="#fff" />
    </View>
  );
}

export default function KiddingRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("kidding", currentFarm?.id, user?.id);
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const { flocks, loading: flocksLoading, fromCache: flocksCached, error: flocksError } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [kiddingDate, setKiddingDate] = useState(todayDate());
  const [flockGroup, setFlockGroup] = useState("");
  const [doeTagNumber, setDoeTagNumber] = useState("");
  const [doeName, setDoeName] = useState("");
  const [breed, setBreed] = useState("");
  const [litterSize, setLitterSize] = useState<number>(1);
  const [easeScore, setEaseScore] = useState<number>(0);
  const [kidsAlive, setKidsAlive] = useState("");
  const [kidsStillborn, setKidsStillborn] = useState("");
  const [colostrumGiven, setColostrumGiven] = useState(true);
  const [sireTagNumber, setSireTagNumber] = useState("");
  const [attendedByVet, setAttendedByVet] = useState(false);
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleSave = async () => {
    if (!doeTagNumber.trim() && !doeName.trim()) {
      Alert.alert("Doe identification required", "Please enter the doe's tag number or name.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "kidding-record",
        kiddingDate,
        flockGroup: flockGroup || null,
        doeTagNumber: doeTagNumber || null,
        doeName: doeName || null,
        breed: breed || null,
        litterSize,
        easeScore: easeScore || null,
        kidsAlive: kidsAlive ? Number(kidsAlive) : null,
        kidsStillborn: kidsStillborn ? Number(kidsStillborn) : null,
        colostrumGiven,
        sireTagNumber: sireTagNumber || null,
        attendedByVet,
        notes: notes || null,
        photoUri: photoUri || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-dairy/kidding-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const aliveCount = payload.kidsAlive ?? Math.max(0, payload.litterSize - (payload.kidsStillborn ?? 0));
      const stillbornCount = payload.kidsStillborn ?? 0;
      const html = farmBirthRecordHtml({
        species: "goat",
        recordId: payload.id,
        birthDate: payload.kiddingDate,
        dam: payload.doeTagNumber || payload.doeName,
        damDetails: [payload.doeName, payload.breed, payload.flockGroup].filter(Boolean).join(" · ") || null,
        sire: payload.sireTagNumber,
        ease: payload.easeScore,
        offspring: Array.from({ length: payload.litterSize }, (_, index) => ({
          label: `Kid ${index + 1}`,
          outcome: index < aliveCount ? "Live" : index < aliveCount + stillbornCount ? "Stillborn" : "Unknown",
        })),
        vet: payload.attendedByVet,
        colostrum: payload.colostrumGiven ? "Given" : "Not recorded as given",
        disposition: stillbornCount ? `${stillbornCount} stillborn` : "No stillbirth recorded",
        notes: payload.notes,
        evidence: payload.photoUri ? "Photo evidence attached" : "No attachment",
      }, currentFarm);
      Alert.alert(
        "Kidding recorded",
        `Kidding record for ${doeTagNumber || doeName} saved. Will sync when connected.`,
        [
          { text: "OK", onPress: () => router.back() },
          { text: "Print", onPress: () => { void print(html).finally(() => router.back()); } },
          { text: "Save PDF", onPress: () => { void savePdf(html, "Farm Birth Record").finally(() => router.back()); } },
        ]
      );
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Kidding Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="kidding submissions"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Doe Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Kidding Date *</Text>
            <Input value={kiddingDate} onChangeText={setKiddingDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Breed</Text>
            <Input value={breed} onChangeText={setBreed} placeholder="e.g. British Saanen" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Doe Tag No. *</Text>
            <Input value={doeTagNumber} onChangeText={setDoeTagNumber} placeholder="e.g. UK123456 789012" autoCapitalize="characters" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Doe Name</Text>
            <Input value={doeName} onChangeText={setDoeName} placeholder="Optional name" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Herd / Group</Text>
          <SmallRuminantPicker species="goat" value={flockGroup} onChange={setFlockGroup} flocks={flocks} loading={flocksLoading} fromCache={flocksCached} error={flocksError} />
        </View>

        <Text style={styles.sectionTitle}>Litter Size</Text>
        <View style={styles.chips}>
          {LITTER_SIZES.map(n => (
            <Chip key={n} label={`${n} kid${n > 1 ? "s" : ""}`} selected={litterSize === n} onPress={() => setLitterSize(n)} color="#15803d" />
          ))}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Kids Alive</Text>
            <Input value={kidsAlive} onChangeText={setKidsAlive} placeholder="e.g. 2" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Stillborn</Text>
            <Input value={kidsStillborn} onChangeText={setKidsStillborn} placeholder="e.g. 0" keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Kidding Ease</Text>
        <View style={styles.chips}>
          {EASE_OPTIONS.map(e => (
            <Chip key={e.key} label={e.label} selected={easeScore === e.key} onPress={() => setEaseScore(easeScore === e.key ? 0 : e.key)} color={e.color} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Management</Text>

        <ToggleRow label="Colostrum Given" value={colostrumGiven} onChange={setColostrumGiven} />
        <ToggleRow label="Attended by Vet" value={attendedByVet} onChange={setAttendedByVet} />

        <View style={styles.field}>
          <Text style={styles.label}>Sire Tag No.</Text>
          <Input value={sireTagNumber} onChangeText={setSireTagNumber} placeholder="e.g. UK123456 789013" autoCapitalize="characters" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

        <PhotoAttachButton
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          label="Attach Photo Evidence"
          promptTitle="Kidding Record Photo"
        />

        <Button title={saving ? "Saving…" : "Save Kidding Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.xs },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  saveBtn: { marginTop: spacing.md },
});
