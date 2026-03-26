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
import type { FlyTippingReport } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const WASTE_TYPES = [
  "Household waste (bags / loose)",
  "Commercial waste",
  "Construction / demolition debris",
  "Asbestos / fibrous material",
  "Tyres",
  "Electrical / WEEE",
  "Chemical containers / drums",
  "Clinical / medical waste",
  "Scrap metal / vehicles",
  "Garden / green waste",
  "Soil / hardcore",
  "Animal carcasses",
  "Mixed waste",
];

const CLEARANCE_OPTIONS = [
  { value: "pending", label: "Pending Clearance" },
  { value: "arranged", label: "Clearance Arranged" },
  { value: "cleared", label: "Cleared" },
];

export default function FlyTippingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { triggerSync } = useSync();

  const [discoveredAt, setDiscoveredAt] = useState(todayDate());
  const [locationDescription, setLocationDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accessPoint, setAccessPoint] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [estimatedQuantity, setEstimatedQuantity] = useState("");
  const [isHazardous, setIsHazardous] = useState(false);
  const [policeReported, setPoliceReported] = useState(false);
  const [policeRefNumber, setPoliceRefNumber] = useState("");
  const [councilReported, setCouncilReported] = useState(false);
  const [councilRefNumber, setCouncilRefNumber] = useState("");
  const [eaReported, setEaReported] = useState(false);
  const [eaRefNumber, setEaRefNumber] = useState("");
  const [clearanceStatus, setClearanceStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleType(t: string) {
    Haptics.selectionAsync();
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  const canSave =
    locationDescription.trim().length > 0 &&
    discoveredAt.length > 0 &&
    selectedTypes.length > 0;

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("No Farm Selected", "Please select a farm first.");
      return;
    }
    if (!canSave) {
      Alert.alert(
        "Required Fields",
        "Please enter the discovery date, location, and at least one waste type."
      );
      return;
    }

    setSaving(true);
    try {
      const record: FlyTippingReport = {
        id: generateId(),
        farmId: String(currentFarm.id),
        discoveredAt,
        locationDescription: locationDescription.trim(),
        latitude: latitude.trim() || "",
        longitude: longitude.trim() || "",
        wasteTypes: JSON.stringify(selectedTypes),
        estimatedQuantity: estimatedQuantity.trim(),
        isHazardous,
        accessPoint: accessPoint.trim(),
        policeReported,
        policeRefNumber: policeRefNumber.trim(),
        councilReported,
        councilRefNumber: councilRefNumber.trim(),
        eaReported,
        eaRefNumber: eaRefNumber.trim(),
        clearanceStatus,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        synced: false,
      };

      await appendToList(STORAGE_KEYS.FLY_TIPPING_REPORTS, record);
      await triggerSync();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Incident Recorded", "Fly-tipping incident has been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Failed to save the incident. Please try again.");
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
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing.sm },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Fly-Tipping Report</Text>
          {currentFarm && (
            <Text style={styles.headerSub}>{currentFarm.name}</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + spacing.xl,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Legal reminder */}
        <View style={styles.warningBanner}>
          <Feather name="alert-triangle" size={14} color="#92400e" />
          <Text style={styles.warningText}>
            <Text style={{ fontFamily: fonts.semiBold }}>Landowner responsibility: </Text>
            You are responsible for clearing fly-tipped waste from your land. Do{" "}
            <Text style={{ fontFamily: fonts.semiBold }}>NOT</Text> touch or
            move hazardous waste (asbestos, chemicals). Call the Environment
            Agency on{" "}
            <Text style={{ fontFamily: fonts.semiBold }}>0800 80 70 60</Text>.
          </Text>
        </View>

        {/* Discovery date & location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Date Discovered *</Text>
            <Input
              placeholder="YYYY-MM-DD"
              value={discoveredAt}
              onChangeText={setDiscoveredAt}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location Description *</Text>
            <Input
              placeholder="e.g. North-east corner of Top Field, by the bridleway gate — OS TF123456"
              value={locationDescription}
              onChangeText={setLocationDescription}
              multiline
              numberOfLines={2}
              style={{ minHeight: 56 }}
            />
          </View>

          <View style={[styles.field, { flexDirection: "row", gap: spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>GPS Latitude</Text>
              <Input
                placeholder="e.g. 53.2145"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>GPS Longitude</Text>
              <Input
                placeholder="e.g. -0.5432"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Access Point / Entry Route</Text>
            <Input
              placeholder="e.g. Gate on Pottergate Road — padlock found cut"
              value={accessPoint}
              onChangeText={setAccessPoint}
            />
          </View>
        </View>

        {/* Waste types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Waste Types *</Text>
          <View style={styles.chipWrap}>
            {WASTE_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.chip,
                  selectedTypes.includes(t) && styles.chipSelected,
                ]}
                onPress={() => toggleType(t)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedTypes.includes(t) && styles.chipTextSelected,
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.field, { marginTop: spacing.sm }]}>
            <Text style={styles.label}>Estimated Volume / Quantity</Text>
            <Input
              placeholder="e.g. 2 transit van loads, 3 tonnes"
              value={estimatedQuantity}
              onChangeText={setEstimatedQuantity}
            />
          </View>
        </View>

        {/* Hazardous */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 2 }]}>
                ⚠ Hazardous Waste
              </Text>
              <Text style={styles.hint}>
                Asbestos, chemicals, clinical / medical, fuel / oil
              </Text>
            </View>
            <Switch
              value={isHazardous}
              onValueChange={(v) => {
                Haptics.selectionAsync();
                setIsHazardous(v);
              }}
              trackColor={{ true: "#dc2626", false: colors.border }}
              thumbColor="#fff"
            />
          </View>
          {isHazardous && (
            <View style={styles.hazardBanner}>
              <Feather name="alert-triangle" size={12} color="#dc2626" />
              <Text style={styles.hazardText}>
                Do NOT touch or move. Report to the Environment Agency immediately on{" "}
                <Text style={{ fontFamily: fonts.semiBold }}>0800 80 70 60</Text>.
                Use a licensed contractor for removal.
              </Text>
            </View>
          )}
        </View>

        {/* Authority reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authority Reports</Text>

          {[
            {
              label: "Reported to Police",
              hint: "Call 101 or report online",
              toggled: policeReported,
              setToggled: setPoliceReported,
              refVal: policeRefNumber,
              setRefVal: setPoliceRefNumber,
              refPlaceholder: "Crime Reference Number",
            },
            {
              label: "Reported to Local Council",
              hint: "Use your district council fly-tipping form",
              toggled: councilReported,
              setToggled: setCouncilReported,
              refVal: councilRefNumber,
              setRefVal: setCouncilRefNumber,
              refPlaceholder: "Council Reference Number",
            },
            {
              label: "Reported to Environment Agency",
              hint: "0800 80 70 60 — required for hazardous waste",
              toggled: eaReported,
              setToggled: setEaReported,
              refVal: eaRefNumber,
              setRefVal: setEaRefNumber,
              refPlaceholder: "EA Reference Number",
            },
          ].map(({ label, hint, toggled, setToggled, refVal, setRefVal, refPlaceholder }) => (
            <View key={label} style={styles.reportRow}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.hint}>{hint}</Text>
                </View>
                <Switch
                  value={toggled}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setToggled(v);
                  }}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#fff"
                />
              </View>
              {toggled && (
                <Input
                  placeholder={refPlaceholder}
                  value={refVal}
                  onChangeText={setRefVal}
                  style={{ marginTop: spacing.xs }}
                />
              )}
            </View>
          ))}
        </View>

        {/* Clearance status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clearance Status</Text>
          <View style={styles.chipWrap}>
            {CLEARANCE_OPTIONS.map((o) => (
              <Pressable
                key={o.value}
                style={[
                  styles.chip,
                  clearanceStatus === o.value && styles.chipSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setClearanceStatus(o.value);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    clearanceStatus === o.value && styles.chipTextSelected,
                  ]}
                >
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <Input
            placeholder="Vehicle descriptions, witness details, any identifying material found in the waste…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ minHeight: 72 }}
          />
        </View>

        {/* Save */}
        <Button
          onPress={handleSave}
          disabled={!canSave || saving}
          style={{ marginTop: spacing.xs }}
        >
          {saving ? "Saving…" : "Record Incident"}
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
  hazardBanner: {
    flexDirection: "row",
    gap: 6,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    marginTop: spacing.sm,
  },
  hazardText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#dc2626",
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
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
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
  },
});
