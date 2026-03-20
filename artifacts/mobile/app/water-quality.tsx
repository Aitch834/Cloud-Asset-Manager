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
import type { WaterQualityRecord } from "@/lib/types";

const WATER_SOURCES = [
  { key: "mains", label: "Mains Supply" },
  { key: "borehole", label: "Borehole / Well" },
  { key: "stream", label: "Stream / River" },
  { key: "reservoir", label: "Farm Reservoir / Pond" },
  { key: "rainwater", label: "Rainwater Harvesting" },
  { key: "bowser", label: "Water Bowser / Tanker" },
  { key: "other", label: "Other" },
];

const TEST_RESULTS = [
  { key: "pass-clean", label: "Pass — Suitable" },
  { key: "pass-monitor", label: "Pass — Monitor" },
  { key: "fail-e-coli", label: "Fail — E. coli / Coliforms" },
  { key: "fail-nitrates", label: "Fail — High Nitrates" },
  { key: "fail-hardness", label: "Fail — pH / Hardness" },
  { key: "fail-other", label: "Fail — Other Contaminant" },
  { key: "pending", label: "Test Pending / Lab Sent" },
];

function OptionRow<T extends { key: string; label: string }>({
  options,
  value,
  onSelect,
  selectedColor = colors.info,
}: {
  options: T[];
  value: string;
  onSelect: (k: string) => void;
  selectedColor?: string;
}) {
  return (
    <View style={styles.optionGrid}>
      {options.map((o) => {
        const selected = value === o.key;
        return (
          <Pressable
            key={o.key}
            style={[
              styles.optionChip,
              selected && { backgroundColor: selectedColor, borderColor: selectedColor },
            ]}
            onPress={() => onSelect(o.key)}
          >
            <Text style={[styles.optionChipText, selected && { color: "#fff" }]}>
              {o.label}
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

export default function WaterQualityScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [herdName, setHerdName] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [customWaterSource, setCustomWaterSource] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [testResult, setTestResult] = useState("");
  const [testPass, setTestPass] = useState(true);
  const [notes, setNotes] = useState("");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "capturing" | "captured" | "denied">("idle");

  const handleTogglePass = (value: boolean) => {
    if (!value) {
      Alert.alert(
        "⚠️ Mark Water as Unsuitable?",
        "This will flag the water source as unsuitable for livestock. When this record syncs, an urgent alert and SMS will be sent to farm management. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes — Mark Unsuitable",
            style: "destructive",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setTestPass(false);
            },
          },
        ],
      );
    } else {
      setTestPass(true);
    }
  };

  const captureGps = async (): Promise<{ latitude?: number; longitude?: number }> => {
    setGpsStatus("capturing");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsStatus("denied");
        return {};
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setGpsCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setGpsStatus("captured");
      return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
    } catch (err) {
      console.warn("GPS unavailable:", err instanceof Error ? err.message : "unknown");
      setGpsStatus("idle");
      return {};
    }
  };

  const handleSave = async () => {
    const resolvedSource = waterSource === "other" ? customWaterSource.trim() : waterSource;
    if (!herdName.trim() || !resolvedSource) {
      Alert.alert(
        "Required Fields",
        "Please enter the herd/flock name and select the water source.",
      );
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const { latitude, longitude } = await captureGps();

    const record: WaterQualityRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      waterSource: resolvedSource,
      testDate,
      testResult: testResult || "not-tested",
      testPass,
      urgentAlert: !testPass,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.WATER_QUALITY_RECORDS, record);
      await refreshPendingCount();

      if (!testPass) {
        Alert.alert(
          "Record Saved — Alert Queued",
          "The water quality failure has been saved. An urgent SMS alert will be sent to farm management when this device next syncs.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      } else {
        Alert.alert(
          "Water Record Saved",
          "The water quality record has been saved and will sync when connected.",
          [{ text: "Done", onPress: () => router.back() }],
        );
      }
    } catch (err) {
      console.error("Save water record error:", err);
      Alert.alert("Save Failed", "Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFail = !testPass;

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
          <Text style={styles.headerTitle}>Water Quality Record</Text>
          <Text style={styles.headerSub}>Livestock water source & test log</Text>
        </View>
        <View style={styles.blueBadge}>
          <Feather name="droplet" size={14} color="#1e40af" />
          <Text style={styles.blueBadgeText}>Welfare</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoNote}>
          <Feather name="info" size={14} color="#1e40af" style={{ marginTop: 2 }} />
          <Text style={styles.infoNoteText}>
            Red Tractor requires annual water quality testing for pigs and poultry, and where water
            is from a non-mains source for cattle and sheep. Retain lab certificates for audit.
          </Text>
        </View>

        <Section title="Herd / Flock">
          <Text style={styles.label}>Herd or Flock Name *</Text>
          <Input
            placeholder="e.g. Pig finishing unit, Dairy herd"
            value={herdName}
            onChangeText={setHerdName}
          />
        </Section>

        <Section title="Water Source *">
          <OptionRow
            options={WATER_SOURCES}
            value={waterSource}
            onSelect={setWaterSource}
            selectedColor={colors.info}
          />
          {waterSource === "other" && (
            <>
              <Text style={[styles.label, { marginTop: spacing.sm }]}>Specify Source</Text>
              <Input
                placeholder="Describe the water source..."
                value={customWaterSource}
                onChangeText={setCustomWaterSource}
              />
            </>
          )}
        </Section>

        <Section title="Test Details">
          <Text style={styles.label}>Test Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={testDate}
            onChangeText={setTestDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Test Result</Text>
          <OptionRow
            options={TEST_RESULTS}
            value={testResult}
            onSelect={(k) => {
              setTestResult(k);
              if (k.startsWith("fail")) {
                handleTogglePass(false);
              } else if (k.startsWith("pass")) {
                setTestPass(true);
              }
            }}
            selectedColor={testResult.startsWith("fail") ? colors.error : colors.success}
          />

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleLabel, isFail && { color: colors.error }]}>
                {isFail ? "⚠️  Water NOT suitable for livestock" : "✓  Water suitable for livestock"}
              </Text>
              <Text style={[styles.toggleSublabel, isFail && { color: colors.error }]}>
                {isFail
                  ? "Urgent SMS alert will be sent to farm management on sync"
                  : "Toggle off if action is required"}
              </Text>
            </View>
            <Switch
              value={testPass}
              onValueChange={handleTogglePass}
              trackColor={{ false: colors.error, true: colors.success }}
              thumbColor={colors.white}
            />
          </View>
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Lab reference, remedial actions taken, retest date, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </Section>

        <View style={styles.gpsNote}>
          <Feather
            name={gpsStatus === "captured" ? "check-circle" : "map-pin"}
            size={13}
            color={gpsStatus === "captured" ? colors.success : gpsStatus === "denied" ? colors.error : colors.textTertiary}
          />
          <Text style={[styles.gpsNoteText, gpsStatus === "captured" && { color: colors.success }]}>
            {gpsStatus === "captured" && gpsCoords
              ? `GPS captured: ${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lon.toFixed(5)}`
              : gpsStatus === "denied"
              ? "GPS permission denied — location not recorded"
              : "GPS coordinates of water source will be captured on save"}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {isFail && (
          <View style={styles.failBanner}>
            <Feather name="alert-triangle" size={15} color="#7f1d1d" />
            <Text style={styles.failBannerText}>
              Water marked as UNSUITABLE — urgent alert will be sent on sync
            </Text>
          </View>
        )}
        <Button
          title={saving ? "Saving…" : "Save Water Record"}
          onPress={handleSave}
          loading={saving}
          fullWidth
          style={{ backgroundColor: isFail ? colors.error : colors.info }}
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
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  blueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  blueBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: "#1e40af",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  infoNoteText: {
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
  optionChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  toggleLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  toggleSublabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  gpsNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  gpsNoteText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  failBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  failBannerText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#7f1d1d",
  },
});
