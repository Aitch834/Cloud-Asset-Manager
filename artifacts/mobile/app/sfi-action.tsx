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
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SfiAction } from "@/lib/types";

const COMMON_SFI_ACTIONS = [
  { code: "CSAM1", name: "Assess soil, produce a soil management plan" },
  { code: "CSAM2", name: "Assess soil, produce a soil management plan on arable and horticultural land" },
  { code: "CSAM3", name: "Assess soil, produce a soil management plan on grassland" },
  { code: "CNUM1", name: "Nutrient management planning on arable land" },
  { code: "CNUM3", name: "Nutrient management planning on grassland" },
  { code: "CLIG1", name: "Assess legumes, produce legume plan" },
  { code: "CLIG2", name: "Grow legumes in the sward" },
  { code: "AHL1", name: "Pollen and nectar flower mix" },
  { code: "AHL2", name: "Winter bird food on arable and horticultural land" },
  { code: "AHL3", name: "Grassy field corners and blocks" },
  { code: "IGL1", name: "Manage grassland with very low nutrient inputs (outside NVZ)" },
  { code: "IPM1", name: "Assess integrated pest management, produce a plan" },
  { code: "IPM2", name: "Use integrated pest management techniques" },
  { code: "IPM3", name: "Manage and monitor open-field horticulture land" },
  { code: "WBD1", name: "Support wood pasture and parkland" },
];

export default function SfiActionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, fromCache: fieldsCached } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [agreementReference, setAgreementReference] = useState("");
  const [actionCode, setActionCode] = useState("");
  const [actionName, setActionName] = useState("");
  const [actionDate, setActionDate] = useState(today);
  const [fieldName, setFieldName] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [completedBy, setCompletedBy] = useState(user?.name || "");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [paymentRate, setPaymentRate] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [showActionPicker, setShowActionPicker] = useState(false);

  const selectAction = (code: string, name: string) => {
    setActionCode(code);
    setActionName(name);
    setShowActionPicker(false);
  };

  const handleGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  };

  const handleSave = async () => {
    if (!actionCode.trim() || !actionDate) {
      Alert.alert("Required Fields", "Please enter the action code and date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SfiAction = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      agreementReference: agreementReference.trim(),
      actionCode: actionCode.trim(),
      actionName: actionName.trim(),
      actionDate,
      fieldName: fieldName.trim(),
      areaHa: areaHa.trim(),
      completedBy: completedBy.trim(),
      evidenceNotes: evidenceNotes.trim(),
      photoTaken,
      paymentRate: paymentRate.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SFI_ACTIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "SFI action event saved offline and queued for sync.", [
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
            <Text style={styles.title}>SFI / ELMs Action Event</Text>
            <Text style={styles.subtitle}>Log a Sustainable Farming Incentive action</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {fieldsCached && (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color={colors.accent} />
              <Text style={styles.offlineText}>Offline — using cached field list</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Agreement</Text>
          <Input label="SFI Agreement Reference" value={agreementReference} onChangeText={setAgreementReference} placeholder="e.g. SFI-2024-12345" />

          <Text style={styles.sectionTitle}>Action</Text>
          <Input label="Action Code *" value={actionCode} onChangeText={setActionCode} placeholder="e.g. CSAM1" autoCapitalize="characters" />
          <Input label="Action Name" value={actionName} onChangeText={setActionName} placeholder="e.g. Assess soil, produce a soil management plan" />

          <Pressable onPress={() => setShowActionPicker(!showActionPicker)} style={styles.pickerToggle}>
            <Feather name={showActionPicker ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
            <Text style={styles.pickerToggleText}>Browse common SFI actions</Text>
          </Pressable>

          {showActionPicker && (
            <View style={styles.pickerList}>
              {COMMON_SFI_ACTIONS.map((a) => (
                <Pressable key={a.code} onPress={() => selectAction(a.code, a.name)} style={styles.pickerItem}>
                  <Text style={styles.pickerCode}>{a.code}</Text>
                  <Text style={styles.pickerName}>{a.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Location & Area</Text>
          <Input label="Field / Block Name" value={fieldName} onChangeText={setFieldName} placeholder="Field name" />
          <Input label="Area (ha)" value={areaHa} onChangeText={setAreaHa} placeholder="e.g. 3.5" keyboardType="decimal-pad" />

          <Pressable onPress={handleGps} style={styles.gpsButton}>
            <Feather name="map-pin" size={16} color={latitude ? colors.success : colors.primary} />
            <Text style={[styles.gpsText, latitude !== undefined ? { color: colors.success } : null]}>
              {latitude !== undefined ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : "Capture GPS Location"}
            </Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Completion</Text>
          <Input label="Date Completed *" value={actionDate} onChangeText={setActionDate} placeholder="YYYY-MM-DD" />
          <Input label="Completed By" value={completedBy} onChangeText={setCompletedBy} placeholder="Name" />
          <Input label="Payment Rate (£/ha or £/unit)" value={paymentRate} onChangeText={setPaymentRate} placeholder="e.g. 28.00" keyboardType="decimal-pad" />
          <Input label="Evidence / Compliance Notes" value={evidenceNotes} onChangeText={setEvidenceNotes} placeholder="Describe the work done and evidence gathered…" multiline numberOfLines={4} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Photo Evidence Taken</Text>
              <Text style={styles.switchSub}>Confirm a photo was captured as evidence</Text>
            </View>
            <Switch value={photoTaken} onValueChange={setPhotoTaken} trackColor={{ false: colors.border, true: colors.success }} thumbColor="#fff" />
          </View>

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional notes…" multiline numberOfLines={2} />

          <Button title={saving ? "Saving…" : "Save SFI Action"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
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
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.warningBg, padding: spacing.sm, borderRadius: radius.md },
  offlineText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.accent },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  pickerToggle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm },
  pickerToggleText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  pickerList: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  pickerItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  pickerCode: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },
  pickerName: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, marginTop: 2 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  gpsButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  gpsText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  saveButton: { marginTop: spacing.lg },
});
