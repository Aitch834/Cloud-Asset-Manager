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
import type { SfiAction } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";

const SCHEME_NAMES = [
  "SFI 2023",
  "SFI 2024",
  "SFI Pilot",
  "Countryside Stewardship (Higher Tier)",
  "Countryside Stewardship (Mid Tier)",
  "England Woodland Creation Offer (EWCO)",
  "Farming in Protected Landscapes (FiPL)",
  "ELMs Pilot",
];

const MANAGING_BODIES = [
  "Rural Payments Agency (RPA)",
  "Natural England",
  "Forestry Commission",
];

const COMMON_SFI_ACTIONS: { code: string; title: string }[] = [
  { code: "SAM1", title: "Assess soil, produce a soil management plan and test soil organic matter" },
  { code: "SAM2", title: "Multi-species winter cover crop" },
  { code: "SAM3", title: "Herbal leys" },
  { code: "NUM1", title: "Assess nutrient management and produce a nutrient management plan" },
  { code: "NUM2", title: "Optimise application of inorganic fertiliser" },
  { code: "NUM3", title: "Precision application of nitrogen to agricultural land" },
  { code: "IGL1", title: "Take improved grassland field corners and blocks out of management" },
  { code: "IGL2", title: "Manage grassland with very low nutrient inputs (outside SDAs)" },
  { code: "IGL3", title: "Manage grassland with low nutrient inputs (outside SDAs)" },
  { code: "AHL1", title: "Arable and horticultural land: assess soil, produce a soil management plan" },
  { code: "AHL2", title: "Arable and horticultural land: establish and maintain a year-round green cover" },
  { code: "AHL3", title: "Arable and horticultural land: establish and maintain temporary grassland" },
  { code: "IPM1", title: "Assess integrated pest management and produce a plan" },
  { code: "IPM2", title: "Insect monitoring traps" },
  { code: "IPM3", title: "Companion cropping on arable and horticultural land" },
  { code: "IPM4", title: "Cultivated areas for arable plants" },
  { code: "HRW1", title: "Manage hedgerows" },
  { code: "HRW2", title: "Add woody features to hedgerows" },
  { code: "HRW3", title: "Manage hedgerow trees on farms" },
  { code: "WBD1", title: "Create or restore bunds, dams or scrapes" },
  { code: "FG1",  title: "Manage farmland around ponds" },
  { code: "OFC1", title: "Manage or create traditional farm orchards" },
];

const COMPLIANCE_OPTIONS = [
  { value: "compliant",          label: "Compliant" },
  { value: "non-compliant",      label: "Non-compliant" },
  { value: "under-review",       label: "Under Review" },
  { value: "pending-assessment", label: "Pending Assessment" },
];

export default function SfiActionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [schemeName, setSchemeName]                   = useState("");
  const [agreementNumber, setAgreementNumber]         = useState("");
  const [agreementStartDate, setAgreementStartDate]   = useState("");
  const [agreementEndDate, setAgreementEndDate]       = useState("");
  const [managingBody, setManagingBody]               = useState("");
  const [agentOrAdvisorName, setAgentOrAdvisorName]   = useState("");
  const [status, setStatus]                           = useState("Active");

  const [actionCode, setActionCode]                   = useState("");
  const [actionTitle, setActionTitle]                 = useState("");
  const [landParcelReference, setLandParcelReference] = useState("");
  const [eligibleAreaHa, setEligibleAreaHa]           = useState("");
  const [annualPaymentPerHa, setAnnualPaymentPerHa]   = useState("");
  const [annualPaymentAmount, setAnnualPaymentAmount] = useState("");
  const [complianceStatus, setComplianceStatus]       = useState("compliant");
  const [lastEvidenceDate, setLastEvidenceDate]       = useState("");
  const [nextEvidenceDate, setNextEvidenceDate]       = useState("");
  const [evidenceNotes, setEvidenceNotes]             = useState("");
  const [photoUri, setPhotoUri]                       = useState<string | null>(null);
  const [notes, setNotes]                             = useState("");
  const [latitude, setLatitude]                       = useState<number | undefined>();
  const [longitude, setLongitude]                     = useState<number | undefined>();

  const [showSchemePicker, setShowSchemePicker]         = useState(false);
  const [showActionPicker, setShowActionPicker]         = useState(false);
  const [showBodyPicker, setShowBodyPicker]             = useState(false);
  const [showCompliancePicker, setShowCompliancePicker] = useState(false);

  const calcAmount = () => {
    const area = parseFloat(eligibleAreaHa);
    const rate = parseFloat(annualPaymentPerHa);
    if (!isNaN(area) && !isNaN(rate) && !annualPaymentAmount) {
      setAnnualPaymentAmount((area * rate).toFixed(2));
    }
  };

  const selectAction = (code: string, title: string) => {
    setActionCode(code);
    if (!actionTitle) setActionTitle(title);
    setShowActionPicker(false);
    Haptics.selectionAsync();
  };

  const handleGps = async () => {
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  };

  const handleSave = async () => {
    if (!actionCode.trim() || !actionTitle.trim()) {
      Alert.alert("Required Fields", "Please enter the action code and title.");
      return;
    }
    if (!currentFarm?.id) {
      Alert.alert("No Farm", "Please select a farm first.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const computedAmount =
      annualPaymentAmount ||
      (() => {
        const a = parseFloat(eligibleAreaHa);
        const r = parseFloat(annualPaymentPerHa);
        return !isNaN(a) && !isNaN(r) ? (a * r).toFixed(2) : "";
      })();

    const record: SfiAction = {
      id: generateId(),
      farmId: currentFarm.id,
      schemeName: schemeName.trim(),
      agreementNumber: agreementNumber.trim(),
      agreementStartDate,
      agreementEndDate,
      managingBody: managingBody.trim(),
      agentOrAdvisorName: agentOrAdvisorName.trim(),
      status,
      actionCode: actionCode.trim().toUpperCase(),
      actionTitle: actionTitle.trim(),
      landParcelReference: landParcelReference.trim(),
      eligibleAreaHa: eligibleAreaHa.trim(),
      annualPaymentPerHa: annualPaymentPerHa.trim(),
      annualPaymentAmount: computedAmount,
      complianceStatus,
      lastEvidenceDate,
      nextEvidenceDate,
      evidenceNotes: evidenceNotes.trim(),
      photoTaken: !!photoUri,
      photoUri: photoUri || undefined,
      latitude,
      longitude,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SFI_ACTIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "SFI / ELMs action record saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>SFI / ELMs Action</Text>
            <Text style={styles.subtitle}>Log a Sustainable Farming Incentive or ELMs action</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ── Agreement Details ── */}
          <Text style={styles.sectionTitle}>Agreement</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Scheme Name</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); setShowSchemePicker(true); }} style={styles.selectButton}>
              <Text style={[styles.selectText, !schemeName && styles.placeholder]}>
                {schemeName || "Select scheme…"}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Input label="Agreement Number" value={agreementNumber} onChangeText={setAgreementNumber} placeholder="e.g. AG00012345" autoCapitalize="characters" />
          <Input label="Agreement Start Date" value={agreementStartDate} onChangeText={setAgreementStartDate} placeholder="YYYY-MM-DD" />
          <Input label="Agreement End Date" value={agreementEndDate} onChangeText={setAgreementEndDate} placeholder="YYYY-MM-DD" />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Managing Body</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); setShowBodyPicker(true); }} style={styles.selectButton}>
              <Text style={[styles.selectText, !managingBody && styles.placeholder]}>
                {managingBody || "e.g. Rural Payments Agency…"}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Input label="Agent / Advisor Name" value={agentOrAdvisorName} onChangeText={setAgentOrAdvisorName} placeholder="Name of farm agent or advisor" />

          {/* ── Action ── */}
          <Text style={styles.sectionTitle}>Action</Text>

          <Input
            label="Action Code *"
            value={actionCode}
            onChangeText={v => {
              setActionCode(v.toUpperCase());
              const match = COMMON_SFI_ACTIONS.find(a => a.code === v.toUpperCase());
              if (match && !actionTitle) setActionTitle(match.title);
            }}
            placeholder="e.g. SAM1"
            autoCapitalize="characters"
          />

          <Input
            label="Action Title *"
            value={actionTitle}
            onChangeText={setActionTitle}
            placeholder="Description of the action"
            multiline
            numberOfLines={2}
          />

          <Pressable onPress={() => { Haptics.selectionAsync(); setShowActionPicker(v => !v); }} style={styles.pickerToggle}>
            <Feather name={showActionPicker ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
            <Text style={styles.pickerToggleText}>Browse common SFI / ELMs action codes</Text>
          </Pressable>

          {showActionPicker && (
            <View style={styles.pickerList}>
              {COMMON_SFI_ACTIONS.map((a) => (
                <Pressable key={a.code} onPress={() => selectAction(a.code, a.title)} style={styles.pickerItem}>
                  <Text style={styles.pickerCode}>{a.code}</Text>
                  <Text style={styles.pickerName}>{a.title}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Location & Area ── */}
          <Text style={styles.sectionTitle}>Location &amp; Area</Text>
          <Input label="Land Parcel Reference" value={landParcelReference} onChangeText={setLandParcelReference} placeholder="e.g. TL1234 5678" autoCapitalize="characters" />
          <Input
            label="Eligible Area (ha)"
            value={eligibleAreaHa}
            onChangeText={setEligibleAreaHa}
            onBlur={calcAmount}
            placeholder="e.g. 3.50"
            keyboardType="decimal-pad"
          />

          <Pressable onPress={handleGps} style={styles.gpsButton}>
            <Feather name="map-pin" size={16} color={latitude ? colors.success : colors.primary} />
            <Text style={[styles.gpsText, latitude !== undefined ? { color: colors.success } : null]}>
              {latitude !== undefined ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : "Capture GPS Location"}
            </Text>
          </Pressable>

          {/* ── Payment ── */}
          <Text style={styles.sectionTitle}>Payment</Text>
          <Input
            label="Payment Rate (£/ha)"
            value={annualPaymentPerHa}
            onChangeText={setAnnualPaymentPerHa}
            onBlur={calcAmount}
            placeholder="e.g. 28.00"
            keyboardType="decimal-pad"
          />
          <Input
            label="Annual Payment Amount (£)"
            value={annualPaymentAmount}
            onChangeText={setAnnualPaymentAmount}
            placeholder={
              eligibleAreaHa && annualPaymentPerHa
                ? `${(parseFloat(eligibleAreaHa) * parseFloat(annualPaymentPerHa)).toFixed(2)} (auto)`
                : "Auto-calculated from area × rate"
            }
            keyboardType="decimal-pad"
          />

          {/* ── Compliance ── */}
          <Text style={styles.sectionTitle}>Compliance &amp; Evidence</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Compliance Status</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); setShowCompliancePicker(true); }} style={styles.selectButton}>
              <Text style={styles.selectText}>
                {COMPLIANCE_OPTIONS.find(o => o.value === complianceStatus)?.label ?? "Compliant"}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Input label="Last Evidence Date" value={lastEvidenceDate} onChangeText={setLastEvidenceDate} placeholder="YYYY-MM-DD" />
          <Input label="Next Evidence Date" value={nextEvidenceDate} onChangeText={setNextEvidenceDate} placeholder="YYYY-MM-DD" />
          <Input
            label="Evidence / Compliance Notes"
            value={evidenceNotes}
            onChangeText={setEvidenceNotes}
            placeholder="Describe work done and evidence gathered…"
            multiline
            numberOfLines={3}
          />

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Photo Evidence"
            promptTitle="SFI / ELMs Action Evidence"
          />

          <Input label="Additional Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes…" multiline numberOfLines={2} />

          <Button title={saving ? "Saving…" : "Save SFI / ELMs Action"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </View>

      {/* Scheme picker sheet */}
      {showSchemePicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Scheme</Text>
              <Pressable onPress={() => setShowSchemePicker(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {SCHEME_NAMES.map(n => (
                <Pressable key={n} onPress={() => { setSchemeName(n); Haptics.selectionAsync(); setShowSchemePicker(false); }}
                  style={[styles.sheetItem, schemeName === n && styles.sheetItemSelected]}>
                  <Text style={[styles.sheetItemText, schemeName === n && styles.sheetItemTextSelected]}>{n}</Text>
                  {schemeName === n && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}

      {/* Managing body picker sheet */}
      {showBodyPicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Managing Body</Text>
              <Pressable onPress={() => setShowBodyPicker(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MANAGING_BODIES.map(b => (
                <Pressable key={b} onPress={() => { setManagingBody(b); Haptics.selectionAsync(); setShowBodyPicker(false); }}
                  style={[styles.sheetItem, managingBody === b && styles.sheetItemSelected]}>
                  <Text style={[styles.sheetItemText, managingBody === b && styles.sheetItemTextSelected]}>{b}</Text>
                  {managingBody === b && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}

      {/* Compliance status picker sheet */}
      {showCompliancePicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Compliance Status</Text>
              <Pressable onPress={() => setShowCompliancePicker(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {COMPLIANCE_OPTIONS.map(o => (
                <Pressable key={o.value} onPress={() => { setComplianceStatus(o.value); Haptics.selectionAsync(); setShowCompliancePicker(false); }}
                  style={[styles.sheetItem, complianceStatus === o.value && styles.sheetItemSelected]}>
                  <Text style={[styles.sheetItemText, complianceStatus === o.value && styles.sheetItemTextSelected]}>{o.label}</Text>
                  {complianceStatus === o.value && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  fieldGroup: { marginBottom: spacing.lg },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  selectButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, minHeight: 44 },
  selectText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text, flex: 1 },
  placeholder: { color: colors.textTertiary },
  pickerToggle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm },
  pickerToggleText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  pickerList: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: spacing.sm },
  pickerItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  pickerCode: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },
  pickerName: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, marginTop: 2 },
  gpsButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  gpsText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  saveButton: { marginTop: spacing.lg },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: "75%", paddingTop: spacing.lg, paddingHorizontal: spacing.lg },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  sheetItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  sheetItemSelected: { backgroundColor: colors.successBg },
  sheetItemText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text, flex: 1 },
  sheetItemTextSelected: { fontFamily: fonts.medium, color: colors.primary },
});
