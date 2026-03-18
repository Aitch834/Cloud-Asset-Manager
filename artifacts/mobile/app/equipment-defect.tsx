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
import type { EquipmentDefect } from "@/lib/types";

type Severity = EquipmentDefect["severity"];

const SEVERITIES: { key: Severity; label: string; sub: string; color: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "minor", label: "Minor", sub: "Can still work", color: colors.accent, icon: "alert-circle" },
  { key: "major", label: "Major", sub: "Needs repair soon", color: colors.error, icon: "alert-triangle" },
  { key: "unsafe", label: "Unsafe", sub: "Take out of service immediately", color: "#7C3AED", icon: "x-circle" },
];

const COMMON_EQUIPMENT = [
  "Sprayer", "Combine Harvester", "Tractor", "Trailer", "Fertiliser Spreader",
  "Plough", "Cultivator", "Drill", "Mower", "Baler", "Forklift", "ATV/Quad", "Other",
];

export default function EquipmentDefectScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [equipmentName, setEquipmentName] = useState("");
  const [reportedBy, setReportedBy] = useState(user?.name || "");
  const [defectDescription, setDefectDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("minor");
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!equipmentName.trim() || !defectDescription.trim()) {
      Alert.alert("Required Fields", "Please enter equipment name and describe the defect.");
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

    const record: EquipmentDefect = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      equipmentName: equipmentName.trim(),
      reportedDate: new Date().toISOString(),
      reportedBy: reportedBy.trim(),
      defectDescription: defectDescription.trim(),
      severity,
      actionTaken: actionTaken.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.EQUIPMENT_DEFECTS, record);
    await refreshPendingCount();
    setSaving(false);

    const msg = severity === "unsafe"
      ? "Defect reported. This item has been flagged as UNSAFE — remove from service immediately."
      : "Equipment defect report saved successfully.";
    Alert.alert("Saved", msg, [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Equipment Defect Report</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="tool" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Equipment</Text>
          </View>
          <View style={styles.chipRow}>
            {COMMON_EQUIPMENT.map((e) => (
              <Pressable
                key={e}
                onPress={() => { Haptics.selectionAsync(); setEquipmentName(e); }}
                style={[
                  styles.chip,
                  equipmentName === e && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.chipText, equipmentName === e && { color: colors.textInverse }]}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Equipment Name / Description"
            placeholder="e.g. JD 6155R Reg AB12CDE, Kverneland 8m drill"
            value={equipmentName}
            onChangeText={setEquipmentName}
            required
          />

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Severity</Text>
          </View>
          <View style={styles.severityGrid}>
            {SEVERITIES.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSeverity(s.key); }}
                style={[
                  styles.severityCard,
                  severity === s.key && { borderColor: s.color, backgroundColor: s.color + "15" },
                ]}
              >
                <Feather name={s.icon} size={22} color={severity === s.key ? s.color : colors.textSecondary} />
                <Text style={[styles.severityLabel, severity === s.key && { color: s.color }]}>{s.label}</Text>
                <Text style={styles.severitySub}>{s.sub}</Text>
              </Pressable>
            ))}
          </View>

          {severity === "unsafe" && (
            <View style={styles.unsafeBanner}>
              <Feather name="x-circle" size={16} color="#7C3AED" />
              <Text style={styles.unsafeBannerText}>
                Unsafe equipment must be taken out of service immediately and tagged. Do not use until repaired and inspected.
              </Text>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="file-text" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Defect Details</Text>
          </View>
          <Input
            label="Defect Description"
            placeholder="Describe what is wrong and where on the machine..."
            value={defectDescription}
            onChangeText={setDefectDescription}
            multiline
            numberOfLines={4}
            required
          />
          <Input
            label="Action Taken"
            placeholder="e.g. Taken out of service, repair booked for Friday"
            value={actionTaken}
            onChangeText={setActionTaken}
            multiline
            numberOfLines={2}
          />
          <Input
            label="Reported By"
            value={reportedBy}
            onChangeText={setReportedBy}
            placeholder="Your name"
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <Button
            title="Submit Defect Report"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  severityGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  severityCard: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  severityLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  severitySub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  unsafeBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#EDE9FE",
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  unsafeBannerText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#7C3AED",
    lineHeight: 20,
  },
});
