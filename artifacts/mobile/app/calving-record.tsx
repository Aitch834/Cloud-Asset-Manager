import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

import { Input } from "@/components/ui/Input";
import { RFIDTagInput } from "@/components/ui/RFIDTagInput";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList } from "@/lib/storage";
import type { DairyCalvingRecord } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

const CALVING_EASE = ["Unassisted", "Easy pull", "Hard pull", "Mechanical assistance", "C-section"];
const CALF_OUTCOMES = ["Live", "Stillbirth", "Weak — survived", "Weak — died"];
const CALF_SEX = ["Bull", "Heifer", "Twin bulls", "Twin heifers", "Bull & heifer twin"];
const COLOSTRUM_SOURCES = ["Dam", "Frozen colostrum bank", "Powder supplement", "Pooled colostrum"];

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
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderLight, true: "#16a34a" }}
        thumbColor={"#fff"}
      />
    </View>
  );
}

function ChipRow({
  options,
  value,
  onSelect,
  color = colors.info,
}: {
  options: string[];
  value: string;
  onSelect: (v: string) => void;
  color?: string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o}
          style={[styles.chip, value === o && { backgroundColor: color, borderColor: color }]}
          onPress={() => {
            Haptics.selectionAsync();
            onSelect(o);
          }}
        >
          <Text style={[styles.chipText, value === o && { color: "#fff" }]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function CalvingRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();

  const [cowEarTag, setCowEarTag] = useState("");
  const [calvingDate, setCalvingDate] = useState(new Date().toISOString().split("T")[0]);
  const [calvingEaseScore, setCalvingEaseScore] = useState("");
  const [numberOfCalves, setNumberOfCalves] = useState("1");
  const [calfOutcome, setCalfOutcome] = useState("");
  const [calfSex, setCalfSex] = useState("");
  const [calfEarTag, setCalfEarTag] = useState("");
  const [assistanceRequired, setAssistanceRequired] = useState(false);
  const [vetAttended, setVetAttended] = useState(false);
  const [vetName, setVetName] = useState("");
  const [colostrumWithin2Hours, setColostrumWithin2Hours] = useState(false);
  const [colostrumWithin6Hours, setColostrumWithin6Hours] = useState(false);
  const [colostrumVolumeFirstFeed, setColostrumVolumeFirstFeed] = useState("");
  const [colostrumSource, setColostrumSource] = useState("");
  const [cowComplications, setCowComplications] = useState("");
  const [calfDisposition, setCalfDisposition] = useState("");
  const [bcmsPassportApplied, setBcmsPassportApplied] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    if (!cowEarTag.trim()) {
      Alert.alert("Required", "Please enter the cow ear tag.");
      return;
    }
    if (!calvingEaseScore) {
      Alert.alert("Required", "Please select a calving ease score.");
      return;
    }
    if (!calfOutcome) {
      Alert.alert("Required", "Please select a calf outcome.");
      return;
    }

    setSaving(true);
    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "calving-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {}
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DairyCalvingRecord = {
      id: `calving_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      farmId: currentFarm?.id?.toString() ?? "unknown",
      cowEarTag: cowEarTag.trim(),
      calvingDate,
      calvingEaseScore,
      numberOfCalves: parseInt(numberOfCalves, 10) || 1,
      calfOutcome,
      calfSex,
      calfEarTag: calfEarTag.trim(),
      assistanceRequired,
      vetAttended,
      vetName: vetName.trim(),
      colostrumGivenWithin2Hours: colostrumWithin2Hours,
      colostrumGivenWithin6Hours: colostrumWithin6Hours,
      colostrumVolumeFirstFeedLitres: colostrumVolumeFirstFeed.trim(),
      colostrumSource,
      cowComplications: cowComplications.trim(),
      calfDisposition: calfDisposition.trim(),
      bcmsPassportApplied,
      notes: notes.trim(),
      latitude: null,
      longitude: null,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DAIRY_CALVING_RECORDS, { ...record, documentUrl } as DairyCalvingRecord);
      await refreshPendingCount();
      Alert.alert(
        "Calving Record Saved",
        "The calving record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save calving error:", err);
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
          <Text style={styles.headerTitle}>Calving Record</Text>
          <Text style={styles.headerSub}>Record birth details and colostrum management</Text>
        </View>
        <View style={styles.dairyBadge}>
          <Feather name="heart" size={14} color="#065f46" />
          <Text style={styles.dairyBadgeText}>Dairy</Text>
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
            Colostrum must be given within 6 hours of birth. BCMS passport application required within 27 days
            for cattle. Record is part of your Red Tractor dairy compliance audit trail.
          </Text>
        </View>

        <Section title="Cow Details">
          <Text style={styles.label}>Cow Ear Tag *</Text>
          <RFIDTagInput
            value={cowEarTag}
            onChangeText={setCowEarTag}
            onTagScanned={setCowEarTag}
            placeholder="e.g. UK123456 78901"
          />
          <Text style={styles.label}>Calving Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={calvingDate}
            onChangeText={setCalvingDate}
            keyboardType="numbers-and-punctuation"
          />
        </Section>

        <Section title="Calving Ease *">
          <ChipRow
            options={CALVING_EASE}
            value={calvingEaseScore}
            onSelect={setCalvingEaseScore}
            color="#16a34a"
          />
        </Section>

        <Section title="Calf Details">
          <Text style={styles.label}>Number of Calves</Text>
          <Input
            placeholder="1"
            value={numberOfCalves}
            onChangeText={setNumberOfCalves}
            keyboardType="number-pad"
          />
          <Text style={styles.label}>Calf Outcome *</Text>
          <ChipRow options={CALF_OUTCOMES} value={calfOutcome} onSelect={setCalfOutcome} color={colors.info} />
          <Text style={styles.label}>Calf Sex</Text>
          <ChipRow options={CALF_SEX} value={calfSex} onSelect={setCalfSex} color="#7c3aed" />
          <Text style={styles.label}>Calf Ear Tag</Text>
          <RFIDTagInput
            value={calfEarTag}
            onChangeText={setCalfEarTag}
            onTagScanned={setCalfEarTag}
            placeholder="e.g. UK123456 11111"
          />
          <Text style={styles.label}>Calf Disposition</Text>
          <Input placeholder="e.g. Retained, sold to dealer" value={calfDisposition} onChangeText={setCalfDisposition} />
        </Section>

        <Section title="Assistance">
          <ToggleRow label="Assistance required" value={assistanceRequired} onChange={setAssistanceRequired} />
          <ToggleRow label="Vet attended" value={vetAttended} onChange={setVetAttended} />
          {vetAttended && (
            <>
              <Text style={styles.label}>Vet Name / Practice</Text>
              <Input placeholder="e.g. David Smith, BVSc" value={vetName} onChangeText={setVetName} />
            </>
          )}
          <Text style={styles.label}>Cow Complications</Text>
          <Input
            placeholder="e.g. Retained placenta, milk fever"
            value={cowComplications}
            onChangeText={setCowComplications}
          />
        </Section>

        <Section title="Colostrum Management">
          <ToggleRow label="Colostrum given within 2 hours" value={colostrumWithin2Hours} onChange={setColostrumWithin2Hours} />
          <ToggleRow label="Colostrum given within 6 hours" value={colostrumWithin6Hours} onChange={setColostrumWithin6Hours} />
          <Text style={styles.label}>Volume of First Feed (litres)</Text>
          <Input
            placeholder="e.g. 2.0"
            value={colostrumVolumeFirstFeed}
            onChangeText={setColostrumVolumeFirstFeed}
            keyboardType="decimal-pad"
          />
          <Text style={styles.label}>Colostrum Source</Text>
          <ChipRow options={COLOSTRUM_SOURCES} value={colostrumSource} onSelect={setColostrumSource} color="#d97706" />
        </Section>

        <Section title="BCMS Compliance">
          <ToggleRow label="BCMS passport application submitted" value={bcmsPassportApplied} onChange={setBcmsPassportApplied} />
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Any additional observations..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 80 }}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PhotoAttachButton
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          label="Attach Photo"
          promptTitle="Attach Photo to Calving Record"
        />
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Calving Record"}</Text>
        </Pressable>
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
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dairyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dairyBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xs,
    color: "#065f46",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  complianceNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#eff6ff",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bfdbfe",
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
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
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: "#16a34a",
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.base,
    color: "#fff",
  },
  white: {
    color: "#fff",
  },
});
