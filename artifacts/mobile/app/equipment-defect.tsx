import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";
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
import { QrScanModal, type BdeScanResult } from "@/components/ui/QrScanModal";
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { EquipmentDefect } from "@/lib/types";

type Severity = EquipmentDefect["severity"];

const SEVERITIES: { key: Severity; label: string; sub: string; color: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "low", label: "Low", sub: "Monitor — repair at next service", color: "#22c55e", icon: "alert-circle" },
  { key: "medium", label: "Medium", sub: "Repair before next use", color: colors.accent, icon: "alert-triangle" },
  { key: "high", label: "High", sub: "Do not use until repaired", color: colors.error, icon: "alert-octagon" },
  { key: "critical", label: "Critical", sub: "Immediate safety risk — remove from service now", color: "#7C3AED", icon: "x-circle" },
];

const COMMON_EQUIPMENT = [
  "Sprayer", "Combine Harvester", "Tractor", "Trailer", "Fertiliser Spreader",
  "Plough", "Cultivator", "Drill", "Mower", "Baler", "Forklift", "ATV/Quad", "Other",
];

export default function EquipmentDefectScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const params = useLocalSearchParams<{ assetId?: string; assetName?: string }>();
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const [equipmentName, setEquipmentName] = useState(params.assetName ?? "");
  const [reportedBy, setReportedBy] = useState(user?.name || "");
  const [defectDescription, setDefectDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("low");
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  const handleSave = async () => {
    if (!equipmentName.trim() || !defectDescription.trim()) {
      Alert.alert("Required Fields", "Please enter equipment name and describe the defect.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const apiBase = getApiBase();
        const objectPath = await uploadPhotoToStorage(photoUri, apiBase, "defect-document.jpg");
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

    await appendToList(STORAGE_KEYS.EQUIPMENT_DEFECTS, { ...record, documentUrl } as EquipmentDefect);
    await refreshPendingCount();
    setSaving(false);

    setTaskSheet({
      title: `Equipment Defect — ${equipmentName.trim()}${severity === "critical" ? " [CRITICAL]" : severity === "high" ? " [High]" : ""}`,
      description: `Severity: ${severity} · ${defectDescription.trim().slice(0, 100)}${actionTaken.trim() ? ` · Action taken: ${actionTaken.trim().slice(0, 80)}` : ""}`,
    });
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
          <View style={[styles.sectionLabel, { justifyContent: "space-between" }]}>
            <View style={styles.sectionLabel}>
              <Feather name="tool" size={14} color={colors.textSecondary} />
              <Text style={styles.sectionTitle}>Equipment</Text>
            </View>
            <Pressable
              style={styles.qrScanPill}
              onPress={() => { Haptics.selectionAsync(); setScanOpen(true); }}
            >
              <Feather name="camera" size={13} color={colors.primary} />
              <Text style={styles.qrScanPillText}>Scan QR</Text>
            </Pressable>
          </View>

          <QrScanModal
            visible={scanOpen}
            onClose={() => setScanOpen(false)}
            onResolved={(r: BdeScanResult) => setEquipmentName((r.data.name as string) || `Asset #${r.data.id}`)}
            entityType="equipment"
            title="Scan Equipment QR Label"
          />

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

          {(severity === "critical" || severity === "high") && (
            <View style={[styles.unsafeBanner, severity === "high" && { backgroundColor: "#FEE2E2" }]}>
              <Feather name={severity === "critical" ? "x-circle" : "alert-octagon"} size={16} color={severity === "critical" ? "#7C3AED" : colors.error} />
              <Text style={[styles.unsafeBannerText, severity === "high" && { color: colors.error }]}>
                {severity === "critical"
                  ? "Critical defect — remove from service immediately and tag the equipment. Do not use until fully repaired and inspected."
                  : "High severity defect — equipment must not be used until this defect has been repaired."}
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

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Photo of Defect"
            promptTitle="Photograph Equipment Defect"
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
      {taskSheet && (
        <RaiseTaskSheet
          visible={!!taskSheet}
          farmId={currentFarm?.id ?? ""}
          defaultTitle={taskSheet.title}
          defaultDescription={taskSheet.description}
          module="workshop"
          onRaised={() => { setTaskSheet(null); router.back(); }}
          onSkip={() => { setTaskSheet(null); router.back(); }}
        />
      )}
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
  qrScanPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    backgroundColor: colors.primary + "0e",
  },
  qrScanPillText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
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
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  severityCard: {
    width: "48%",
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
