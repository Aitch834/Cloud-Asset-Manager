import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { AnimalMortality } from "@/lib/types";

const SPECIES = ["Cattle", "Sheep", "Pigs", "Poultry", "Goats", "Deer", "Other"];

const CAUSES = [
  { key: "disease", label: "Disease / Illness" },
  { key: "injury", label: "Injury / Trauma" },
  { key: "metabolic", label: "Metabolic Disorder" },
  { key: "difficult-birth", label: "Difficult Birth / Dystocia" },
  { key: "hypothermia", label: "Hypothermia / Exposure" },
  { key: "predation", label: "Predation" },
  { key: "accidental", label: "Accidental / Misadventure" },
  { key: "euthanised", label: "Euthanised (on vet advice)" },
  { key: "unknown", label: "Unknown / Sudden Death" },
  { key: "other", label: "Other (see notes)" },
];

const DISPOSAL_METHODS = [
  { key: "nfas", label: "Fallen Stock Collection (NFAS / NFU)" },
  { key: "hunt-kennel", label: "Hunt Kennel / Knacker" },
  { key: "incineration", label: "Licensed Incineration / Cremation" },
  { key: "burial-licensed", label: "On-farm Burial (with licence)" },
  { key: "rendering", label: "Rendering Plant" },
  { key: "other", label: "Other (see notes)" },
];

function OptionRow<T extends { key: string; label: string }>({
  options,
  value,
  onSelect,
}: {
  options: T[];
  value: string;
  onSelect: (k: string) => void;
}) {
  return (
    <View style={styles.optionGrid}>
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <Pressable
            key={o.key}
            style={[styles.optionChip, selected && styles.optionChipSelected]}
            onPress={() => onSelect(o.key)}
          >
            <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SpeciesRow({ value, onSelect }: { value: string; onSelect: (s: string) => void }) {
  return (
    <View style={styles.optionGrid}>
      {SPECIES.map((s) => {
        const selected = value === s;
        return (
          <Pressable
            key={s}
            style={[styles.speciesChip, selected && styles.speciesChipSelected]}
            onPress={() => onSelect(s)}
          >
            <Text style={[styles.speciesChipText, selected && styles.speciesChipTextSelected]}>
              {s}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel ? <Text style={styles.toggleSublabel}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderLight, true: colors.error }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function MortalityRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [herdName, setHerdName] = useState("");
  const [tagNumber, setTagNumber] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dateOfDeath, setDateOfDeath] = useState(new Date().toISOString().split("T")[0]);
  const [causeOfDeath, setCauseOfDeath] = useState("");
  const [causeDetail, setCauseDetail] = useState("");
  const [disposalMethod, setDisposalMethod] = useState("");
  const [disposalOperator, setDisposalOperator] = useState("");
  const [disposalRef, setDisposalRef] = useState("");
  const [veterinaryAttended, setVeterinaryAttended] = useState(false);
  const [vetName, setVetName] = useState("");
  const [postMortemCarriedOut, setPostMortemCarriedOut] = useState(false);
  const [postMortemFindings, setPostMortemFindings] = useState("");
  const [bcmsNotified, setBcmsNotified] = useState(false);
  const [bcmsNotificationRef, setBcmsNotificationRef] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!herdName.trim() || !species || !causeOfDeath || !disposalMethod) {
      Alert.alert(
        "Required Fields",
        "Please enter the herd/flock name, select a species, cause of death, and disposal method.",
      );
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: AnimalMortality = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      tagNumber: tagNumber.trim(),
      species,
      breed: breed.trim(),
      dateOfDeath,
      causeOfDeath,
      causeDetail: causeDetail.trim(),
      disposalMethod,
      disposalOperator: disposalOperator.trim(),
      disposalRef: disposalRef.trim(),
      veterinaryAttended,
      vetName: vetName.trim(),
      postMortemCarriedOut,
      postMortemFindings: postMortemFindings.trim(),
      bcmsNotified,
      bcmsNotificationRef: bcmsNotificationRef.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.MORTALITY_RECORDS, record);
      await refreshPendingCount();
      Alert.alert(
        "Mortality Record Saved",
        "The record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save mortality error:", err);
      Alert.alert("Save Failed", "Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Animal Mortality Record</Text>
          <Text style={styles.headerSub}>Red Tractor & BCMS compliance record</Text>
        </View>
        <View style={styles.warningBadge}>
          <Feather name="alert-triangle" size={14} color="#92400E" />
          <Text style={styles.warningBadgeText}>Legal</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.complianceNote}>
          <Feather name="info" size={14} color="#1e40af" style={{ marginTop: 2 }} />
          <Text style={styles.complianceNoteText}>
            Mortality records must be kept for a minimum of 3 years. BCMS notification is required
            within 7 days for cattle. Retain disposal documentation.
          </Text>
        </View>

        <Section title="Herd / Animal Details">
          <Text style={styles.label}>Herd or Flock Name *</Text>
          <Input
            placeholder="e.g. Main suckler herd"
            value={herdName}
            onChangeText={setHerdName}
          />
          <Text style={styles.label}>Ear Tag / Tag Number</Text>
          <Input
            placeholder="e.g. UK123456 78901"
            value={tagNumber}
            onChangeText={setTagNumber}
            autoCapitalize="characters"
          />
          <Text style={styles.label}>Species *</Text>
          <SpeciesRow value={species} onSelect={setSpecies} />
          <Text style={styles.label}>Breed</Text>
          <Input placeholder="e.g. Limousin × Friesian" value={breed} onChangeText={setBreed} />
        </Section>

        <Section title="Death Details">
          <Text style={styles.label}>Date of Death *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={dateOfDeath}
            onChangeText={setDateOfDeath}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Cause of Death *</Text>
          <OptionRow options={CAUSES} value={causeOfDeath} onSelect={setCauseOfDeath} />
          {causeOfDeath ? (
            <>
              <Text style={styles.label}>Additional Detail</Text>
              <Input
                placeholder="Describe symptoms, findings or circumstances..."
                value={causeDetail}
                onChangeText={setCauseDetail}
                multiline
                numberOfLines={3}
              />
            </>
          ) : null}
        </Section>

        <Section title="Disposal">
          <Text style={styles.label}>Disposal Method *</Text>
          <OptionRow
            options={DISPOSAL_METHODS}
            value={disposalMethod}
            onSelect={setDisposalMethod}
          />
          <Text style={styles.label}>Collector / Operator Name</Text>
          <Input
            placeholder="e.g. ABC Fallen Stock Ltd"
            value={disposalOperator}
            onChangeText={setDisposalOperator}
          />
          <Text style={styles.label}>Disposal / Collection Reference</Text>
          <Input
            placeholder="NFAS certificate no. or licence ref."
            value={disposalRef}
            onChangeText={setDisposalRef}
            autoCapitalize="characters"
          />
        </Section>

        <Section title="Veterinary & Post-mortem">
          <ToggleRow
            label="Veterinary attended"
            sublabel="Was a vet present or called to assess?"
            value={veterinaryAttended}
            onChange={setVeterinaryAttended}
          />
          {veterinaryAttended && (
            <>
              <Text style={[styles.label, { marginTop: spacing.sm }]}>Vet Name / Practice</Text>
              <Input
                placeholder="e.g. Mr A. Jones BVSc, Green Valley Vets"
                value={vetName}
                onChangeText={setVetName}
              />
            </>
          )}
          <ToggleRow
            label="Post-mortem carried out"
            sublabel="Was a PM examination performed?"
            value={postMortemCarriedOut}
            onChange={setPostMortemCarriedOut}
          />
          {postMortemCarriedOut && (
            <>
              <Text style={[styles.label, { marginTop: spacing.sm }]}>PM Findings</Text>
              <Input
                placeholder="Summary of post-mortem findings..."
                value={postMortemFindings}
                onChangeText={setPostMortemFindings}
                multiline
                numberOfLines={3}
              />
            </>
          )}
        </Section>

        <Section title="BCMS Notification">
          <ToggleRow
            label="BCMS notified"
            sublabel="Cattle: must notify within 7 days"
            value={bcmsNotified}
            onChange={setBcmsNotified}
          />
          {bcmsNotified && (
            <>
              <Text style={[styles.label, { marginTop: spacing.sm }]}>BCMS Notification Reference</Text>
              <Input
                placeholder="BCMS submission / online notification ref."
                value={bcmsNotificationRef}
                onChangeText={setBcmsNotificationRef}
                autoCapitalize="characters"
              />
            </>
          )}
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Any additional observations or circumstances..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: colors.error }}
        >
          {saving ? "Saving…" : "Save Mortality Record"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  warningBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: "#92400E",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  complianceNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  complianceNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#1e40af",
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  optionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  optionChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  optionChipTextSelected: {
    color: colors.white,
  },
  speciesChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  speciesChipSelected: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  speciesChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  speciesChipTextSelected: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  toggleSublabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  footer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  white: {
    color: "#fff",
  },
});
