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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList } from "@/lib/storage";
import type { DairyDctRecord } from "@/lib/types";

const PROTOCOLS = [
  { value: "selective", label: "Selective Dry Cow", subtitle: "Antibiotic tube + teat sealant" },
  { value: "blanket", label: "Blanket Dry Cow", subtitle: "Antibiotic tube only" },
  { value: "teat-sealant-only", label: "Teat Sealant Only", subtitle: "No antibiotic / no POM-V required" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
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
  subtitle,
  value,
  onChange,
  required,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleLabel}>
          {label}
          {required && <Text style={{ color: "#dc2626" }}> *</Text>}
        </Text>
        {subtitle ? <Text style={styles.toggleSub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderLight, true: "#0891b2" }}
        thumbColor={"#fff"}
      />
    </View>
  );
}

export default function DryCowtTherapyScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();

  const [cowEarTag, setCowEarTag] = useState("");
  const [dryOffDate, setDryOffDate] = useState(today());
  const [protocol, setProtocol] = useState<string>("");

  const [antibioticProduct, setAntibioticProduct] = useState("");
  const [antibioticBatch, setAntibioticBatch] = useState("");
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState("");
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState("");

  const [teatSealantProduct, setTeatSealantProduct] = useState("");
  const [teatSealantBatch, setTeatSealantBatch] = useState("");

  const [treatmentJustification, setTreatmentJustification] = useState("");
  const [sccAtDryOff, setSccAtDryOff] = useState("");
  const [mastitisEpisodes12m, setMastitisEpisodes12m] = useState("");

  const [administeredBy, setAdministeredBy] = useState(user?.name || "");
  const [pomvAuthorised, setPomvAuthorised] = useState(false);
  const [prescribingVet, setPrescribingVet] = useState("");

  const [expectedCalvingDate, setExpectedCalvingDate] = useState("");
  const [estimatedPrescriptionFeeGbp, setEstimatedPrescriptionFeeGbp] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const needsAntibiotic = protocol === "selective" || protocol === "blanket";
  const needsSealant = protocol === "selective" || protocol === "teat-sealant-only";
  const needsPomv = needsAntibiotic;

  const handleSave = async () => {
    if (!cowEarTag.trim()) {
      Alert.alert("Required", "Please enter the cow ear tag.");
      return;
    }
    if (!protocol) {
      Alert.alert("Required", "Please select a treatment protocol.");
      return;
    }
    if (needsAntibiotic && !antibioticProduct.trim()) {
      Alert.alert("Required", "Please enter the antibiotic tube product.");
      return;
    }
    if (needsPomv && !pomvAuthorised) {
      Alert.alert(
        "POM-V Authorisation Required",
        "Antibiotic dry cow therapy is a Prescription Only Medicine — Veterinarian (POM-V). You must confirm vet authorisation before saving.",
      );
      return;
    }
    if (needsPomv && !prescribingVet.trim()) {
      Alert.alert("Required", "Please enter the prescribing vet's name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DairyDctRecord = {
      id: `dct_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      farmId: currentFarm?.id?.toString() ?? "unknown",
      cowEarTag: cowEarTag.trim(),
      dryOffDate,
      protocol,
      antibioticProduct: antibioticProduct.trim(),
      antibioticBatch: antibioticBatch.trim(),
      milkWithdrawalDays: milkWithdrawalDays.trim(),
      meatWithdrawalDays: meatWithdrawalDays.trim(),
      teatSealantProduct: teatSealantProduct.trim(),
      teatSealantBatch: teatSealantBatch.trim(),
      treatmentJustification: treatmentJustification.trim(),
      sccAtDryOff: sccAtDryOff.trim(),
      mastitisEpisodes12m: mastitisEpisodes12m.trim(),
      administeredBy: administeredBy.trim(),
      pomvAuthorised,
      prescribingVet: prescribingVet.trim(),
      expectedCalvingDate: expectedCalvingDate.trim(),
      estimatedPrescriptionFeeGbp: estimatedPrescriptionFeeGbp.trim(),
      notes: notes.trim(),
      latitude: null,
      longitude: null,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DAIRY_DCT_RECORDS, record);
      await refreshPendingCount();
      Alert.alert(
        "DCT Record Saved",
        "The dry cow therapy record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save DCT error:", err);
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
          <Text style={styles.headerTitle}>Dry Cow Therapy Record</Text>
          <Text style={styles.headerSub}>Log DCT treatment at dry-off</Text>
        </View>
        <View style={styles.dctBadge}>
          <Feather name="droplet" size={14} color="#0e7490" />
          <Text style={styles.dctBadgeText}>DCT</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.complianceNote}>
          <Feather name="info" size={14} color="#92400e" style={{ marginTop: 2 }} />
          <Text style={styles.complianceNoteText}>
            Antibiotic DCT products are POM-V medicines under the Veterinary Medicines Regulations 2013.
            Vet authorisation is required before administering. Retain records for 5 years (Red Tractor &
            VMD requirement).
          </Text>
        </View>

        <Section title="Cow & Dry-Off Date">
          <Text style={styles.label}>Cow Ear Tag *</Text>
          <Input
            placeholder="e.g. UK123456 78901"
            value={cowEarTag}
            onChangeText={setCowEarTag}
            autoCapitalize="characters"
          />
          <Text style={styles.label}>Dry-Off Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={dryOffDate}
            onChangeText={setDryOffDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>SCC at Dry-Off (cells/ml)</Text>
          <Input
            placeholder="e.g. 250000"
            value={sccAtDryOff}
            onChangeText={setSccAtDryOff}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Mastitis Cases — Last 12 Months</Text>
          <Input
            placeholder="e.g. 2"
            value={mastitisEpisodes12m}
            onChangeText={setMastitisEpisodes12m}
            keyboardType="number-pad"
          />
        </Section>

        <Section title="Treatment Protocol *">
          {PROTOCOLS.map((p) => (
            <Pressable
              key={p.value}
              style={[
                styles.protocolCard,
                protocol === p.value && styles.protocolCardSelected,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setProtocol(p.value);
                if (p.value === "teat-sealant-only") {
                  setPomvAuthorised(false);
                  setPrescribingVet("");
                }
              }}
            >
              <View style={styles.protocolRadio}>
                {protocol === p.value && <View style={styles.protocolRadioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.protocolLabel, protocol === p.value && { color: "#0891b2" }]}>
                  {p.label}
                </Text>
                <Text style={styles.protocolSub}>{p.subtitle}</Text>
              </View>
            </Pressable>
          ))}
        </Section>

        {needsAntibiotic && (
          <Section title="Antibiotic Tube">
            <Text style={styles.label}>Product Name *</Text>
            <Input
              placeholder="e.g. Ubrolexin Intramammary Suspension"
              value={antibioticProduct}
              onChangeText={setAntibioticProduct}
            />
            <Text style={styles.label}>Batch Number</Text>
            <Input
              placeholder="e.g. A2B3C4"
              value={antibioticBatch}
              onChangeText={setAntibioticBatch}
              autoCapitalize="characters"
            />
            <Text style={styles.label}>Milk Withdrawal (days)</Text>
            <Input
              placeholder="e.g. 36"
              value={milkWithdrawalDays}
              onChangeText={setMilkWithdrawalDays}
              keyboardType="number-pad"
            />
            <Text style={styles.label}>Meat Withdrawal (days)</Text>
            <Input
              placeholder="e.g. 28"
              value={meatWithdrawalDays}
              onChangeText={setMeatWithdrawalDays}
              keyboardType="number-pad"
            />
          </Section>
        )}

        {needsSealant && (
          <Section title="Teat Sealant">
            <Text style={styles.label}>Product Name</Text>
            <Input
              placeholder="e.g. Orbeseal Intramammary Suspension"
              value={teatSealantProduct}
              onChangeText={setTeatSealantProduct}
            />
            <Text style={styles.label}>Batch Number</Text>
            <Input
              placeholder="e.g. X9Y8Z7"
              value={teatSealantBatch}
              onChangeText={setTeatSealantBatch}
              autoCapitalize="characters"
            />
          </Section>
        )}

        <Section title="Administration">
          <Text style={styles.label}>Administered By</Text>
          <Input
            placeholder="e.g. John Smith"
            value={administeredBy}
            onChangeText={setAdministeredBy}
          />
          <Text style={styles.label}>Treatment Justification</Text>
          <Input
            placeholder="e.g. High SCC, 3 mastitis cases in lactation"
            value={treatmentJustification}
            onChangeText={setTreatmentJustification}
            multiline
            style={{ minHeight: 64 }}
          />
          <Text style={styles.label}>Expected Calving Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={expectedCalvingDate}
            onChangeText={setExpectedCalvingDate}
            keyboardType="numbers-and-punctuation"
          />
        </Section>

        {needsPomv && (
          <Section title="POM-V Authorisation">
            <View style={styles.pomvWarning}>
              <Feather name="alert-triangle" size={14} color="#92400e" style={{ marginTop: 2 }} />
              <Text style={styles.pomvWarningText}>
                Intramammary antibiotics are POM-V medicines. Written vet authorisation is required before
                administration under VMR 2013 and RUMA guidelines.
              </Text>
            </View>
            <ToggleRow
              label="POM-V Authorisation Confirmed"
              subtitle="I confirm this treatment has been authorised by a prescribing vet"
              value={pomvAuthorised}
              onChange={setPomvAuthorised}
              required
            />
            {pomvAuthorised && (
              <>
                <Text style={styles.label}>Prescribing Vet *</Text>
                <Input
                  placeholder="e.g. Dr Jane Brown MRCVS"
                  value={prescribingVet}
                  onChangeText={setPrescribingVet}
                />
                <Text style={styles.label}>Estimated Prescription Fee (£)</Text>
                <Input
                  placeholder="e.g. 45.00"
                  value={estimatedPrescriptionFeeGbp}
                  onChangeText={setEstimatedPrescriptionFeeGbp}
                  keyboardType="decimal-pad"
                />
              </>
            )}
          </Section>
        )}

        <Section title="Notes">
          <Input
            placeholder="Additional notes, follow-up actions, next inspection date..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 80 }}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save DCT Record"}</Text>
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
  dctBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#cffafe",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dctBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xs,
    color: "#0e7490",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  complianceNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: spacing.sm,
  },
  complianceNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#92400e",
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
  protocolCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  protocolCardSelected: {
    borderColor: "#0891b2",
    backgroundColor: "#ecfeff",
  },
  protocolRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#0891b2",
    alignItems: "center",
    justifyContent: "center",
  },
  protocolRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0891b2",
  },
  protocolLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  protocolSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
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
  toggleSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    paddingRight: spacing.sm,
  },
  pomvWarning: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: spacing.sm,
  },
  pomvWarningText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: "#0891b2",
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
});
