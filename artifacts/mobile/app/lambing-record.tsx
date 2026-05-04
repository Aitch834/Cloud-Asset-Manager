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
import { STORAGE_KEYS, appendToList, generateId } from "@/lib/storage";
import type { LambingRecord } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

const EASE_OPTIONS = [
  { key: 1, label: "1 — Unassisted", color: "#16a34a" },
  { key: 2, label: "2 — Easy assist", color: "#2563eb" },
  { key: 3, label: "3 — Hard assist", color: "#d97706" },
  { key: 4, label: "4 — Vet/caesarean", color: "#dc2626" },
];

const LAMB_OUTCOMES = ["live", "stillborn", "died-within-24h", "unknown"];
const LAMB_SEXES = ["male", "female", "unknown"];
const LITTER_SIZES = [1, 2, 3, 4];

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
  options: (string | number)[];
  value: string | number;
  onSelect: (v: string | number) => void;
  color?: string;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={String(o)}
          style={[styles.chip, value === o && { backgroundColor: color, borderColor: color }]}
          onPress={() => {
            Haptics.selectionAsync();
            onSelect(o);
          }}
        >
          <Text style={[styles.chipText, value === o && { color: "#fff" }]}>{String(o)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

interface LambFields {
  outcome: string;
  sex: string;
  earTag: string;
}

function LambCard({
  index,
  data,
  onChange,
}: {
  index: number;
  data: LambFields;
  onChange: (f: Partial<LambFields>) => void;
}) {
  const label = ["First", "Second", "Third", "Fourth"][index];
  return (
    <View style={styles.lambCard}>
      <Text style={styles.lambCardTitle}>{label} Lamb</Text>
      <Text style={styles.fieldLabel}>Outcome</Text>
      <ChipRow
        options={LAMB_OUTCOMES}
        value={data.outcome}
        onSelect={(v) => onChange({ outcome: v as string })}
        color="#16a34a"
      />
      <Text style={styles.fieldLabel}>Sex</Text>
      <ChipRow
        options={LAMB_SEXES}
        value={data.sex}
        onSelect={(v) => onChange({ sex: v as string })}
        color="#2563eb"
      />
      <Text style={styles.fieldLabel}>Ear Tag (optional)</Text>
      <RFIDTagInput
        value={data.earTag}
        onChangeText={(t) => onChange({ earTag: t })}
        onTagScanned={(t) => onChange({ earTag: t })}
        placeholder="e.g. UK123456 0001"
      />
    </View>
  );
}

export default function LambingRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { triggerSync } = useSync();

  const today = new Date().toISOString().slice(0, 10);

  const [eweEarTag, setEweEarTag] = useState("");
  const [lambingDate, setLambingDate] = useState(today);
  const [easeScore, setEaseScore] = useState<number>(1);
  const [numberOfLambs, setNumberOfLambs] = useState<number>(1);
  const [lambs, setLambs] = useState<LambFields[]>([
    { outcome: "live", sex: "unknown", earTag: "" },
    { outcome: "live", sex: "unknown", earTag: "" },
    { outcome: "live", sex: "unknown", earTag: "" },
    { outcome: "live", sex: "unknown", earTag: "" },
  ]);
  const [colostrum2h, setColostrum2h] = useState(true);
  const [assisted, setAssisted] = useState(false);
  const [vetAttended, setVetAttended] = useState(false);
  const [fostering, setFostering] = useState(false);
  const [fosteringDetails, setFosteringDetails] = useState("");
  const [attendedBy, setAttendedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [perinatalCollectionDate, setPerinatalCollectionDate] = useState("");
  const [perinatalCollectionRef, setPerinatalCollectionRef] = useState("");
  const [perinatalDisposalMethod, setPerinatalDisposalMethod] = useState("");
  const [perinatalDisposalNotes, setPerinatalDisposalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  function updateLamb(index: number, fields: Partial<LambFields>) {
    setLambs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...fields };
      return next;
    });
  }

  async function handleSave() {
    if (!eweEarTag.trim()) {
      Alert.alert("Required", "Please enter the ewe's ear tag.");
      return;
    }
    if (!lambingDate.trim()) {
      Alert.alert("Required", "Please enter the lambing date.");
      return;
    }
    setSaving(true);
    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "lambing-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {}
    }
    try {
      const farmId = String(currentFarm?.id ?? "");
      const record: LambingRecord = {
        id: generateId(),
        farmId,
        eweEarTag: eweEarTag.trim(),
        lambingDate,
        lambingEaseScore: easeScore,
        numberOfLambs,
        lambOutcome1: lambs[0]?.outcome ?? "",
        lambSex1: lambs[0]?.sex ?? "",
        lambEarTag1: lambs[0]?.earTag ?? "",
        lambOutcome2: numberOfLambs >= 2 ? (lambs[1]?.outcome ?? "") : "",
        lambSex2: numberOfLambs >= 2 ? (lambs[1]?.sex ?? "") : "",
        lambEarTag2: numberOfLambs >= 2 ? (lambs[1]?.earTag ?? "") : "",
        lambOutcome3: numberOfLambs >= 3 ? (lambs[2]?.outcome ?? "") : "",
        lambSex3: numberOfLambs >= 3 ? (lambs[2]?.sex ?? "") : "",
        lambEarTag3: numberOfLambs >= 3 ? (lambs[2]?.earTag ?? "") : "",
        lambOutcome4: numberOfLambs >= 4 ? (lambs[3]?.outcome ?? "") : "",
        lambSex4: numberOfLambs >= 4 ? (lambs[3]?.sex ?? "") : "",
        lambEarTag4: numberOfLambs >= 4 ? (lambs[3]?.earTag ?? "") : "",
        colostrumGivenWithin2Hours: colostrum2h,
        assistanceRequired: assisted,
        vetAttended,
        fosteringRequired: fostering,
        fosteringDetails: fosteringDetails.trim(),
        attendedBy: attendedBy.trim(),
        notes: notes.trim(),
        perinatalCollectionDate: perinatalCollectionDate.trim() || undefined,
        perinatalCollectionRef: perinatalCollectionRef.trim() || undefined,
        perinatalDisposalMethod: perinatalDisposalMethod.trim() || undefined,
        perinatalDisposalNotes: perinatalDisposalNotes.trim() || undefined,
        latitude: null,
        longitude: null,
        createdAt: new Date().toISOString(),
        synced: false,
      };
      await appendToList(STORAGE_KEYS.LAMBING_RECORDS, { ...record, documentUrl } as LambingRecord);
      await triggerSync();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Lambing record saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const hasDeadLambs = Array.from({ length: numberOfLambs }).some(
    (_, i) => lambs[i]?.outcome === "stillborn" || lambs[i]?.outcome === "died-within-24h"
  );

  const selectedEase = EASE_OPTIONS.find((e) => e.key === easeScore);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Lambing Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badge}>
          <Feather name="shield" size={12} color="#16a34a" />
          <Text style={styles.badgeText}>Red Tractor Sheep Assurance — required record</Text>
        </View>

        <Section title="Ewe Details">
          <Text style={styles.fieldLabel}>Ewe Ear Tag *</Text>
          <RFIDTagInput
            value={eweEarTag}
            onChangeText={setEweEarTag}
            onTagScanned={setEweEarTag}
            placeholder="e.g. UK123456 78901"
          />
          <Text style={styles.fieldLabel}>Lambing Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            maxDate="today"
            value={lambingDate}
            onChangeText={setLambingDate}
            keyboardType="numeric"
          />
        </Section>

        <Section title="Lambing Ease Score">
          {EASE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[
                styles.easeOption,
                easeScore === opt.key && { borderColor: opt.color, backgroundColor: opt.color + "18" },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setEaseScore(opt.key);
              }}
            >
              <View style={[styles.easeCircle, { backgroundColor: opt.color }]}>
                <Text style={styles.easeNum}>{opt.key}</Text>
              </View>
              <Text style={styles.easeLabel}>{opt.label}</Text>
              {easeScore === opt.key && (
                <Feather name="check-circle" size={16} color={opt.color} style={{ marginLeft: "auto" }} />
              )}
            </Pressable>
          ))}
        </Section>

        <Section title="Litter">
          <Text style={styles.fieldLabel}>Number of Lambs</Text>
          <ChipRow
            options={LITTER_SIZES}
            value={numberOfLambs}
            onSelect={(v) => setNumberOfLambs(v as number)}
            color="#16a34a"
          />
        </Section>

        {Array.from({ length: numberOfLambs }).map((_, i) => (
          <Section key={i} title={`Lamb ${i + 1} Details`}>
            <LambCard
              index={i}
              data={lambs[i] ?? { outcome: "live", sex: "unknown", earTag: "" }}
              onChange={(f) => updateLamb(i, f)}
            />
          </Section>
        ))}

        <Section title="Management">
          <ToggleRow label="Colostrum given within 2 hours" value={colostrum2h} onChange={setColostrum2h} />
          <ToggleRow label="Assistance required at birth" value={assisted} onChange={setAssisted} />
          <ToggleRow label="Vet attended" value={vetAttended} onChange={setVetAttended} />
          <ToggleRow label="Fostering required" value={fostering} onChange={setFostering} />
          {fostering && (
            <>
              <Text style={styles.fieldLabel}>Fostering details</Text>
              <Input
                placeholder="Describe the fostering arrangement"
                value={fosteringDetails}
                onChangeText={setFosteringDetails}
                multiline
              />
            </>
          )}
        </Section>

        <Section title="Additional">
          <Text style={styles.fieldLabel}>Attended by</Text>
          <Input
            placeholder="Name of person present"
            value={attendedBy}
            onChangeText={setAttendedBy}
          />
          <Text style={styles.fieldLabel}>Notes</Text>
          <Input
            placeholder="Any additional observations"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Section>

        {hasDeadLambs && (
          <Section title="Perinatal Disposal (ABP Required)">
            <View style={styles.disposalBanner}>
              <Feather name="alert-triangle" size={13} color="#92400e" />
              <Text style={styles.disposalBannerText}>
                Stillborn / died-within-24h lambs must be disposed of by an approved Animal By-Products contractor. Record the collection details below. You can link to a registered contractor on the dashboard.
              </Text>
            </View>
            <Text style={styles.fieldLabel}>Collection Date (YYYY-MM-DD)</Text>
            <Input
              placeholder="e.g. 2026-03-15"
              value={perinatalCollectionDate}
              onChangeText={setPerinatalCollectionDate}
              keyboardType="numeric"
            />
            <Text style={styles.fieldLabel}>Consignment / NFAS Certificate Ref</Text>
            <Input
              placeholder="Contractor consignment note reference"
              value={perinatalCollectionRef}
              onChangeText={setPerinatalCollectionRef}
            />
            <Text style={styles.fieldLabel}>Disposal Method</Text>
            <Input
              placeholder="e.g. NFAS collection, hunt kennels, on-farm incinerator"
              value={perinatalDisposalMethod}
              onChangeText={setPerinatalDisposalMethod}
            />
            <Text style={styles.fieldLabel}>Disposal Notes</Text>
            <Input
              placeholder="Any additional disposal details"
              value={perinatalDisposalNotes}
              onChangeText={setPerinatalDisposalNotes}
              multiline
            />
          </Section>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Record Summary</Text>
          <Text style={styles.summaryLine}>Ease score: {selectedEase?.label ?? "—"}</Text>
          <Text style={styles.summaryLine}>
            Litter: {numberOfLambs === 1 ? "Single" : numberOfLambs === 2 ? "Twins" : numberOfLambs === 3 ? "Triplets" : "Quads"}
          </Text>
          <Text style={styles.summaryLine}>
            Live: {Array.from({ length: numberOfLambs }).filter((_, i) => lambs[i]?.outcome === "live").length}
          </Text>
          <Text style={styles.summaryLine}>Colostrum ≤2h: {colostrum2h ? "Yes" : "No"}</Text>
          {hasDeadLambs && (
            <Text style={[styles.summaryLine, { color: perinatalCollectionRef || perinatalCollectionDate ? "#166534" : "#b91c1c" }]}>
              Perinatal disposal: {perinatalCollectionRef || perinatalCollectionDate ? "Details recorded ✓" : "Not yet recorded"}
            </Text>
          )}
        </View>

        <PhotoAttachButton
          photoUri={photoUri}
          onPhotoSelected={setPhotoUri}
          label="Attach Photo"
          promptTitle="Attach Photo to Lambing Record"
        />

        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Lambing Record"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { width: 36, alignItems: "flex-start" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  content: { padding: spacing.md },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: spacing.md,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  badgeText: { fontFamily: fonts.medium, fontSize: 11, color: "#16a34a" },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 4, marginTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  easeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: 6,
    gap: spacing.sm,
  },
  easeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  easeNum: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: "#fff" },
  easeLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1, marginRight: spacing.sm },
  lambCard: {
    backgroundColor: "#f8fafc",
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  lambCardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: 4 },
  summaryCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  summaryTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#16a34a", marginBottom: 6 },
  summaryLine: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#166534", lineHeight: 18 },
  saveBtn: {
    backgroundColor: "#16a34a",
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: "#fff" },
  disposalBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#fef3c7",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  disposalBannerText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", flex: 1, lineHeight: 16 },
});
