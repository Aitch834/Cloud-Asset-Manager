import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { RFIDTagInput } from "@/components/ui/RFIDTagInput";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";
import type { CasualtySlaughter } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const SPECIES = ["Cattle", "Sheep", "Pig", "Goat", "Deer", "Other"];

const METHODS = [
  { key: "captive_bolt", label: "Captive Bolt" },
  { key: "free_bullet", label: "Free Bullet" },
  { key: "barbiturate_injection", label: "Barbiturate Injection (Vet)" },
  { key: "other", label: "Other" },
];

const DISPOSAL_METHODS = [
  { key: "licensed_contractor", label: "Licensed Fallen Stock Contractor" },
  { key: "hunt_kennel", label: "Hunt Kennel / Knacker" },
  { key: "incineration", label: "Licensed Incineration" },
  { key: "rendering", label: "Rendering Plant" },
  { key: "burial_permitted", label: "On-farm Burial (EA Permit)" },
  { key: "other", label: "Other permitted method" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

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
        thumbColor="#fff"
      />
    </View>
  );
}

export default function CasualtySlaughterScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [species, setSpecies] = useState("");
  const [animalEarTag, setAnimalEarTag] = useState("");
  const [ageOrDescription, setAgeOrDescription] = useState("");
  const [reasonForSlaughter, setReasonForSlaughter] = useState("");
  const [method, setMethod] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [waskWatokCertRef, setWaskWatokCertRef] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [veterinaryInvolved, setVeterinaryInvolved] = useState(false);
  const [vetName, setVetName] = useState("");
  const [carcaseDisposalMethod, setCarcaseDisposalMethod] = useState("");
  const [carcaseCollectionDate, setCarcaseCollectionDate] = useState("");
  const [carcaseDisposalRef, setCarcaseDisposalRef] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!species || !reasonForSlaughter.trim() || !method || !performedBy.trim()) {
      Alert.alert(
        "Required Fields",
        "Please select the species, enter the reason for slaughter, select the method, and enter who performed the slaughter.",
      );
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const apiBase = getApiBase();
        const objectPath = await uploadPhotoToStorage(photoUri, apiBase, "casualty-slaughter.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch { /* best-effort */ }
    }

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

    const record: CasualtySlaughter = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      eventDate,
      species,
      animalEarTag: animalEarTag.trim(),
      ageOrDescription: ageOrDescription.trim(),
      reasonForSlaughter: reasonForSlaughter.trim(),
      method,
      performedBy: performedBy.trim(),
      waskWatokCertRef: waskWatokCertRef.trim(),
      witnessName: witnessName.trim(),
      veterinaryInvolved,
      vetName: vetName.trim(),
      carcaseDisposalMethod,
      carcaseCollectionDate,
      carcaseDisposalRef: carcaseDisposalRef.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.CASUALTY_SLAUGHTER_RECORDS, { ...record, documentUrl } as CasualtySlaughter);
      await refreshPendingCount();
      Alert.alert(
        "Record Saved",
        "The casualty slaughter record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save casualty slaughter error:", err);
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
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Casualty / Emergency Slaughter</Text>
          <Text style={styles.headerSub}>Red Tractor legal compliance record</Text>
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
            Red Tractor requires a written record of every on-farm emergency killing. The person
            performing the slaughter must hold a current WASK (cattle/sheep) or WATOK (pigs) certificate.
            Retain the carcase disposal documentation for a minimum of 3 years.
          </Text>
        </View>

        <Section title="Animal Details">
          <Text style={styles.label}>Species *</Text>
          <SpeciesRow value={species} onSelect={setSpecies} />
          <Text style={styles.label}>Ear Tag / Identification</Text>
          <RFIDTagInput
            value={animalEarTag}
            onChangeText={setAnimalEarTag}
            onTagScanned={setAnimalEarTag}
            placeholder="e.g. UK123456 78901"
          />
          <Text style={styles.label}>Age / Description</Text>
          <Input
            placeholder="e.g. 3yo Holstein cow, lame in right hind"
            value={ageOrDescription}
            onChangeText={setAgeOrDescription}
          />
        </Section>

        <Section title="Slaughter Details">
          <Text style={styles.label}>Date of Slaughter *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={eventDate}
            onChangeText={setEventDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Reason for Emergency Slaughter *</Text>
          <Input
            placeholder="e.g. Severe compound fracture — animal irretrievable and suffering"
            value={reasonForSlaughter}
            onChangeText={setReasonForSlaughter}
            multiline
            numberOfLines={3}
          />
          <Text style={styles.label}>Method of Slaughter *</Text>
          <OptionRow options={METHODS} value={method} onSelect={setMethod} />
          <Text style={styles.label}>Performed By (full name) *</Text>
          <Input
            placeholder="Full name of person carrying out the slaughter"
            value={performedBy}
            onChangeText={setPerformedBy}
          />
          <Text style={styles.label}>WASK / WATOK Certificate Reference</Text>
          <Input
            placeholder="Certificate number or issue date"
            value={waskWatokCertRef}
            onChangeText={setWaskWatokCertRef}
            autoCapitalize="characters"
          />
          <LookupPicker label="Witness (if present)" options={staffOptions} value={witnessName} onSelect={(_id, l) => setWitnessName(l)} allowFreeText />
        </Section>

        <Section title="Veterinary Involvement">
          <ToggleRow
            label="Vet involved"
            sublabel="Was a vet called or consulted prior to slaughter?"
            value={veterinaryInvolved}
            onChange={setVeterinaryInvolved}
          />
          {veterinaryInvolved && (
            <>
              <Text style={[styles.label, { marginTop: spacing.sm }]}>Vet Name / Practice</Text>
              <Input
                placeholder="e.g. Ms J. Smith BVSc, Valley Vets"
                value={vetName}
                onChangeText={setVetName}
              />
            </>
          )}
        </Section>

        <Section title="Carcase Disposal">
          <Text style={styles.label}>Disposal Method</Text>
          <OptionRow options={DISPOSAL_METHODS} value={carcaseDisposalMethod} onSelect={setCarcaseDisposalMethod} />
          <Text style={styles.label}>Disposal / Collection Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={carcaseCollectionDate}
            onChangeText={setCarcaseCollectionDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Disposal Reference / Waste Transfer Note</Text>
          <Input
            placeholder="NFAS certificate no., collection note ref."
            value={carcaseDisposalRef}
            onChangeText={setCarcaseDisposalRef}
            autoCapitalize="characters"
          />
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Any additional observations, circumstances or actions taken..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PhotoAttachButton
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          label="Attach WASK/WATOK cert or disposal note"
          promptTitle="Attach Document"
        />
        <Button
          title={saving ? "Saving…" : "Save Casualty Slaughter Record"}
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: colors.error }}
        />
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
    color: colors.text,
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
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
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
    color: "#fff",
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
    color: "#fff",
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
    color: colors.text,
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
});
