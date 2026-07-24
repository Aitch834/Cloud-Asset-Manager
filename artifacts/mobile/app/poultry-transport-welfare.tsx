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

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

const JOURNEY_PURPOSES = [
  { value: "to_slaughter", label: "To Slaughter" },
  { value: "inter_site", label: "Inter-Site Transfer" },
  { value: "hatchery_collection", label: "Hatchery Collection" },
  { value: "other", label: "Other" },
];

const WELFARE_OUTCOMES = [
  { value: "satisfactory", label: "Satisfactory" },
  { value: "unsatisfactory", label: "Unsatisfactory" },
  { value: "not_assessed", label: "Not Assessed" },
];

export default function PoultryTransportWelfareScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [journeyDate] = useState(today);
  const [journeyPurpose, setJourneyPurpose] = useState("to_slaughter");
  const [vehicleReg, setVehicleReg] = useState("");
  const [driverName, setDriverName] = useState("");
  const [transporterAuthorisationNo, setTransporterAuthorisationNo] = useState("");
  const [journeyStartTime, setJourneyStartTime] = useState("");
  const [journeyEndTime, setJourneyEndTime] = useState("");
  const [journeyDistanceKm, setJourneyDistanceKm] = useState("");
  const [stockingDensityBirdsM2, setStockingDensityBirdsM2] = useState("");
  const [temperatureAdequate, setTemperatureAdequate] = useState(true);
  const [waterProvision, setWaterProvision] = useState(true);
  const [ventilationAdequate, setVentilationAdequate] = useState(true);
  const [birdsDeadOnArrival, setBirdsDeadOnArrival] = useState("0");
  const [overallWelfareAssessment, setOverallWelfareAssessment] = useState("satisfactory");
  const [notes, setNotes] = useState("");

  const distanceKm = Number(journeyDistanceKm);
  const regulationApplies = distanceKm > 65;

  const handleSave = async () => {
    if (!vehicleReg.trim()) {
      Alert.alert("Required", "Please enter the vehicle registration.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      journeyDate,
      journeyPurpose,
      vehicleReg: vehicleReg.trim().toUpperCase(),
      driverName: driverName.trim(),
      transporterAuthorisationNo: transporterAuthorisationNo.trim(),
      journeyStartTime: journeyStartTime.trim(),
      journeyEndTime: journeyEndTime.trim(),
      journeyDistanceKm: journeyDistanceKm.trim(),
      stockingDensityBirdsM2: stockingDensityBirdsM2.trim(),
      temperatureAdequate,
      waterProvision,
      ventilationAdequate,
      birdsDeadOnArrival: birdsDeadOnArrival.trim() || "0",
      overallWelfareAssessment,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_TRANSPORT_WELFARE, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Transport Welfare Recorded",
      `${JOURNEY_PURPOSES.find(p => p.value === journeyPurpose)?.label} — ${vehicleReg.toUpperCase()} — ${WELFARE_OUTCOMES.find(o => o.value === overallWelfareAssessment)?.label}.`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Transport Welfare Log</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {regulationApplies && (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={16} color="#92400e" />
              <Text style={styles.warningText}>
                Journey exceeds 65 km — Welfare of Animals During Transport Regulation applies. A transporter authorisation number is required.
              </Text>
            </View>
          )}

          <View style={styles.infoBanner}>
            <Feather name="info" size={16} color="#1d4ed8" />
            <Text style={styles.infoText}>
              Required for Red Tractor, RSPCA Assured and organic audits. Mandatory for journeys over 65 km under UK WATD regulations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Journey Details</Text>
            <Input label="Journey Date" value={journeyDate} editable={false} />
            <Text style={styles.subLabel}>Journey Purpose</Text>
            <View style={styles.optionsRow}>
              {JOURNEY_PURPOSES.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setJourneyPurpose(opt.value)}
                  style={[styles.option, journeyPurpose === opt.value && styles.optionActive]}
                >
                  <Text style={[styles.optionLabel, journeyPurpose === opt.value && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Input
              label="Journey Distance (km, optional)"
              value={journeyDistanceKm}
              onChangeText={setJourneyDistanceKm}
              placeholder="e.g. 45"
              keyboardType="decimal-pad"
            />
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input label="Start Time (optional)" value={journeyStartTime} onChangeText={setJourneyStartTime} placeholder="e.g. 05:30" />
              </View>
              <View style={styles.halfInput}>
                <Input label="End Time (optional)" value={journeyEndTime} onChangeText={setJourneyEndTime} placeholder="e.g. 07:45" />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle & Driver</Text>
            <Input
              label="Vehicle Registration"
              value={vehicleReg}
              onChangeText={setVehicleReg}
              placeholder="e.g. AB12 CDE"
              autoCapitalize="characters"
            />
            <Input
              label="Driver Name (optional)"
              value={driverName}
              onChangeText={setDriverName}
              placeholder="e.g. John Williams"
              autoCapitalize="words"
            />
            <Input
              label={`Transporter Authorisation No. ${regulationApplies ? "(Required — >65 km)" : "(optional)"}`}
              value={transporterAuthorisationNo}
              onChangeText={setTransporterAuthorisationNo}
              placeholder="e.g. UK/TA/12345"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Welfare Conditions</Text>
            <Input
              label="Stocking Density (birds/m², optional)"
              value={stockingDensityBirdsM2}
              onChangeText={setStockingDensityBirdsM2}
              placeholder="e.g. 32"
              keyboardType="decimal-pad"
            />
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Temperature adequate</Text>
              <Switch value={temperatureAdequate} onValueChange={setTemperatureAdequate} trackColor={{ true: colors.primary }} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Water provision in place</Text>
              <Switch value={waterProvision} onValueChange={setWaterProvision} trackColor={{ true: colors.primary }} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Ventilation adequate</Text>
              <Switch value={ventilationAdequate} onValueChange={setVentilationAdequate} trackColor={{ true: colors.primary }} />
            </View>
            <Input
              label="Birds Dead on Arrival"
              value={birdsDeadOnArrival}
              onChangeText={setBirdsDeadOnArrival}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Welfare Assessment</Text>
            <View style={styles.optionsRow}>
              {WELFARE_OUTCOMES.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setOverallWelfareAssessment(opt.value)}
                  style={[
                    styles.option,
                    overallWelfareAssessment === opt.value && styles.optionActive,
                    opt.value === "unsatisfactory" && overallWelfareAssessment === opt.value && styles.optionDanger,
                  ]}
                >
                  <Text style={[styles.optionLabel, overallWelfareAssessment === opt.value && styles.optionLabelActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Input
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes or corrective actions"
              multiline
            />
          </View>

          <Button
            title={saving ? "Saving…" : "Save Transport Welfare Log"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { marginRight: spacing.sm },
  title: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.text },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  warningBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fef3c7", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.xs },
  warningText: { flex: 1, fontSize: fontSize.sm, color: "#92400e", fontFamily: fonts.regular, lineHeight: 18 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#eff6ff", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md, gap: spacing.xs },
  infoText: { flex: 1, fontSize: fontSize.sm, color: "#1d4ed8", fontFamily: fonts.regular, lineHeight: 18 },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.xs },
  subLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text, marginTop: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm },
  halfInput: { flex: 1 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  option: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  optionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionDanger: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  optionLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text },
  optionLabelActive: { color: "#fff", fontFamily: fonts.semiBold },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.xs },
  toggleLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text },
  saveButton: { marginTop: spacing.md },
});
