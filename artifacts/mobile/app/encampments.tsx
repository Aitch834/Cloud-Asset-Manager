import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import type { EncampmentReport } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "legal_action", label: "Legal Action" },
  { value: "resolved", label: "Resolved" },
];

const POLICE_ACTIONS = [
  "Section 61 direction served (CJPOA / PCSC Act 2022)",
  "Section 62A direction — alternative site offered",
  "Declined to act — civil matter",
  "Officers attended — verbal warning only",
  "Criminal investigation opened",
  "Arrests made",
  "Other — see notes",
];

const LEGAL_NOTICE_TYPES = [
  "Section 61 CJPOA direction",
  "Notice to Quit served",
  "Injunction obtained (High Court)",
  "Possession order (Part 55 CPR)",
  "Trespass notice served",
  "Emergency injunction ex parte",
];

export default function EncampmentsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { triggerSync } = useSync();

  const [discoveredAt, setDiscoveredAt] = useState(todayDate());
  const [locationDescription, setLocationDescription] = useState("");
  const [fieldParcel, setFieldParcel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [entryPoint, setEntryPoint] = useState("");
  const [vehicleCount, setVehicleCount] = useState("");
  const [personCount, setPersonCount] = useState("");
  const [caravanCount, setCaravanCount] = useState("");
  const [vehicleDescriptions, setVehicleDescriptions] = useState("");
  const [landDamageDescription, setLandDamageDescription] = useState("");
  const [cropsAffected, setCropsAffected] = useState(false);
  const [estimatedDamage, setEstimatedDamage] = useState("");
  const [policeNotified, setPoliceNotified] = useState(false);
  const [policeRefNumber, setPoliceRefNumber] = useState("");
  const [policeAction, setPoliceAction] = useState("");
  const [councilNotified, setCouncilNotified] = useState(false);
  const [councilRefNumber, setCouncilRefNumber] = useState("");
  const [legalActionTaken, setLegalActionTaken] = useState(false);
  const [legalActionDetails, setLegalActionDetails] = useState("");
  const [solicitorInstructed, setSolicitorInstructed] = useState(false);
  const [courtOrderObtained, setCourtOrderObtained] = useState(false);
  const [courtOrderRef, setCourtOrderRef] = useState("");
  const [vacatedAt, setVacatedAt] = useState("");
  const [insuranceClaimMade, setInsuranceClaimMade] = useState(false);
  const [insuranceClaimRef, setInsuranceClaimRef] = useState("");
  const [remediationRequired, setRemediationRequired] = useState(false);
  const [remediationNotes, setRemediationNotes] = useState("");
  const [status, setStatus] = useState("active");
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = locationDescription.trim().length > 0 && discoveredAt.length > 0;

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("No Farm Selected", "Please select a farm first.");
      return;
    }
    if (!canSave) {
      Alert.alert("Required Fields", "Please enter the discovery date and location description.");
      return;
    }

    setSaving(true);
    try {
      const record: EncampmentReport = {
        id: generateId(),
        farmId: String(currentFarm.id),
        discoveredAt,
        locationDescription: locationDescription.trim(),
        fieldParcel: fieldParcel.trim(),
        latitude: latitude.trim(),
        longitude: longitude.trim(),
        entryPoint: entryPoint.trim(),
        vehicleCount: vehicleCount.trim(),
        personCount: personCount.trim(),
        caravanCount: caravanCount.trim(),
        vehicleDescriptions: vehicleDescriptions.trim(),
        landDamageDescription: landDamageDescription.trim(),
        cropsAffected,
        estimatedDamage: estimatedDamage.trim(),
        policeNotified,
        policeRefNumber: policeRefNumber.trim(),
        policeAction: policeAction.trim(),
        councilNotified,
        councilRefNumber: councilRefNumber.trim(),
        legalActionTaken,
        legalActionDetails: legalActionDetails.trim(),
        solicitorInstructed,
        courtOrderObtained,
        courtOrderRef: courtOrderRef.trim(),
        vacatedAt: vacatedAt.trim(),
        insuranceClaimMade,
        insuranceClaimRef: insuranceClaimRef.trim(),
        remediationRequired,
        remediationNotes: remediationNotes.trim(),
        photoUris,
        status,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        synced: false,
      };

      await appendToList(STORAGE_KEYS.ENCAMPMENT_REPORTS, record);
      await triggerSync();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Encampment Logged", "The unauthorized encampment has been recorded.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Unauthorized Encampment</Text>
          {currentFarm && <Text style={styles.headerSub}>{currentFarm.name}</Text>}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + spacing.xl, gap: spacing.md }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Legal reminder */}
        <View style={styles.warningBanner}>
          <Feather name="phone" size={14} color="#92400e" />
          <Text style={styles.warningText}>
            <Text style={{ fontFamily: fonts.semiBold }}>Immediate action: </Text>
            Call police on <Text style={{ fontFamily: fonts.semiBold }}>101</Text> (or 999 if violence threatened) and request a Section 61 CJPOA direction. Contact your solicitor if court action may be needed. Document everything immediately — evidence is time-critical.
          </Text>
        </View>

        {/* Incident Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Date Discovered *</Text>
            <Input placeholder="YYYY-MM-DD" value={discoveredAt} onChangeText={setDiscoveredAt} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location Description *</Text>
            <Input
              placeholder="e.g. Lower Meadow, off Elm Lane — OS TF123456"
              value={locationDescription}
              onChangeText={setLocationDescription}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56 }}
            />
          </View>

          <View style={[styles.field, { flexDirection: "row", gap: spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Field / Parcel Ref</Text>
              <Input placeholder="e.g. OS 1234 / Field 7" value={fieldParcel} onChangeText={setFieldParcel} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Entry Point</Text>
              <Input placeholder="e.g. Cut hedge, north side" value={entryPoint} onChangeText={setEntryPoint} />
            </View>
          </View>

          <View style={[styles.field, { flexDirection: "row", gap: spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>GPS Latitude</Text>
              <Input placeholder="51.5074" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>GPS Longitude</Text>
              <Input placeholder="-1.8043" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" />
            </View>
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.chipWrap}>
              {STATUS_OPTIONS.map(o => (
                <Pressable
                  key={o.value}
                  style={[styles.chip, status === o.value && styles.chipSelected]}
                  onPress={() => { Haptics.selectionAsync(); setStatus(o.value); }}
                >
                  <Text style={[styles.chipText, status === o.value && styles.chipTextSelected]}>{o.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Persons & Vehicles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Persons &amp; Vehicles</Text>

          <View style={[styles.field, { flexDirection: "row", gap: spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Vehicles</Text>
              <Input placeholder="0" value={vehicleCount} onChangeText={setVehicleCount} keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Persons (approx)</Text>
              <Input placeholder="0" value={personCount} onChangeText={setPersonCount} keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Caravans</Text>
              <Input placeholder="0" value={caravanCount} onChangeText={setCaravanCount} keyboardType="number-pad" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Vehicle Descriptions</Text>
            <Input
              placeholder="Make, colour, registration if visible — e.g. White Transit DP12 XYZ"
              value={vehicleDescriptions}
              onChangeText={setVehicleDescriptions}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56 }}
            />
          </View>
        </View>

        {/* Land Damage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Land Damage</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Description of Damage</Text>
            <Input
              placeholder="Gates, fencing, crops, soil compaction, waste left…"
              value={landDamageDescription}
              onChangeText={setLandDamageDescription}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56 }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Crops affected?</Text>
            </View>
            <Switch
              value={cropsAffected}
              onValueChange={v => { Haptics.selectionAsync(); setCropsAffected(v); }}
              trackColor={{ true: "#dc2626", false: colors.border }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Estimated Damage Value</Text>
            <Input placeholder="e.g. £2,500" value={estimatedDamage} onChangeText={setEstimatedDamage} />
          </View>
        </View>

        {/* Police */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Police</Text>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Police notified?</Text>
                <Text style={styles.hint}>Call 101 (or 999 if violence threatened)</Text>
              </View>
              <Switch
                value={policeNotified}
                onValueChange={v => { Haptics.selectionAsync(); setPoliceNotified(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {policeNotified && (
              <>
                <Input
                  placeholder="Police Reference Number"
                  value={policeRefNumber}
                  onChangeText={setPoliceRefNumber}
                  style={{ marginTop: spacing.xs }}
                />
                <Text style={[styles.label, { marginTop: spacing.sm }]}>Action Taken</Text>
                <View style={[styles.chipWrap, { marginTop: 4 }]}>
                  {POLICE_ACTIONS.map(a => (
                    <Pressable
                      key={a}
                      style={[styles.chip, policeAction === a && styles.chipSelected]}
                      onPress={() => { Haptics.selectionAsync(); setPoliceAction(a); }}
                    >
                      <Text style={[styles.chipText, { fontSize: 11 }, policeAction === a && styles.chipTextSelected]}>{a}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Council */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Council</Text>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Council notified?</Text>
              </View>
              <Switch
                value={councilNotified}
                onValueChange={v => { Haptics.selectionAsync(); setCouncilNotified(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {councilNotified && (
              <Input
                placeholder="Council Reference Number"
                value={councilRefNumber}
                onChangeText={setCouncilRefNumber}
                style={{ marginTop: spacing.xs }}
              />
            )}
          </View>
        </View>

        {/* Legal Action */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Action</Text>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Legal action taken?</Text>
              </View>
              <Switch
                value={legalActionTaken}
                onValueChange={v => { Haptics.selectionAsync(); setLegalActionTaken(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {legalActionTaken && (
              <>
                <Text style={[styles.label, { marginTop: spacing.sm }]}>Notice / Order Type</Text>
                <View style={[styles.chipWrap, { marginTop: 4 }]}>
                  {LEGAL_NOTICE_TYPES.map(t => (
                    <Pressable
                      key={t}
                      style={[styles.chip, legalActionDetails === t && styles.chipSelected]}
                      onPress={() => { Haptics.selectionAsync(); setLegalActionDetails(t); }}
                    >
                      <Text style={[styles.chipText, { fontSize: 11 }, legalActionDetails === t && styles.chipTextSelected]}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Solicitor instructed?</Text>
              </View>
              <Switch
                value={solicitorInstructed}
                onValueChange={v => { Haptics.selectionAsync(); setSolicitorInstructed(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Court order obtained?</Text>
              </View>
              <Switch
                value={courtOrderObtained}
                onValueChange={v => { Haptics.selectionAsync(); setCourtOrderObtained(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {courtOrderObtained && (
              <Input
                placeholder="Court Order Reference — e.g. HC-2025-001234"
                value={courtOrderRef}
                onChangeText={setCourtOrderRef}
                style={{ marginTop: spacing.xs }}
              />
            )}
          </View>
        </View>

        {/* Resolution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolution</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Date Vacated</Text>
            <Input placeholder="YYYY-MM-DD" value={vacatedAt} onChangeText={setVacatedAt} />
          </View>
        </View>

        {/* Insurance & Remediation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insurance &amp; Remediation</Text>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Insurance claim made?</Text>
              </View>
              <Switch
                value={insuranceClaimMade}
                onValueChange={v => { Haptics.selectionAsync(); setInsuranceClaimMade(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {insuranceClaimMade && (
              <Input
                placeholder="Insurance Claim Reference"
                value={insuranceClaimRef}
                onChangeText={setInsuranceClaimRef}
                style={{ marginTop: spacing.xs }}
              />
            )}
          </View>

          <View style={styles.reportRow}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Remediation required?</Text>
              </View>
              <Switch
                value={remediationRequired}
                onValueChange={v => { Haptics.selectionAsync(); setRemediationRequired(v); }}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
            {remediationRequired && (
              <Input
                placeholder="Describe remediation work required or completed"
                value={remediationNotes}
                onChangeText={setRemediationNotes}
                multiline
                numberOfLines={2}
                style={{ marginTop: spacing.xs, minHeight: 56 }}
              />
            )}
          </View>
        </View>

        {/* Photo Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo Evidence</Text>
          <Text style={styles.hint}>
            Photograph the access point, vehicles, any damage and surrounding land. Photos are saved with your report.
          </Text>
          {photoUris.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {photoUris.map((uri, i) => (
                <View key={i} style={{ position: "relative" }}>
                  <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb" }} />
                  <Pressable
                    onPress={() => setPhotoUris(p => p.filter((_, j) => j !== i))}
                    style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: "#dc2626", alignItems: "center", justifyContent: "center" }}
                    hitSlop={4}
                  >
                    <Feather name="x" size={11} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Pressable
              style={styles.photoBtn}
              onPress={async () => {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") { Alert.alert("Permission Required", "Camera access is needed."); return; }
                const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
                if (!result.canceled && result.assets[0]) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setPhotoUris(p => [...p, result.assets[0].uri]);
                }
              }}
            >
              <Feather name="camera" size={14} color={colors.text} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </Pressable>
            <Pressable
              style={styles.photoBtn}
              onPress={async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== "granted") { Alert.alert("Permission Required", "Photo library access is needed."); return; }
                const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsMultipleSelection: true, selectionLimit: 10 });
                if (!result.canceled) {
                  setPhotoUris(p => [...p, ...result.assets.map(a => a.uri)]);
                }
              }}
            >
              <Feather name="image" size={14} color={colors.text} />
              <Text style={styles.photoBtnText}>Choose from Library</Text>
            </Pressable>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Input
            placeholder="Any further detail about the incident, interactions with occupants, condition of animals present, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72 }}
          />
        </View>

        {/* Save */}
        <Button onPress={handleSave} disabled={!canSave || saving} style={{ marginTop: spacing.xs }}>
          {saving ? "Saving…" : "Log Encampment"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 1,
  },
  warningBanner: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.base,
    color: colors.text,
    marginBottom: 2,
  },
  field: {
    gap: 4,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: "#B45309",
    borderColor: "#B45309",
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextSelected: {
    fontFamily: fonts.semiBold,
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  reportRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
  },
  photoBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
