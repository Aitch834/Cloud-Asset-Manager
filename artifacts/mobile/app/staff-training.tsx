import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
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

import { StaffMemberPicker } from "@/components/StaffMemberPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmMembers, memberFullName, type ApiFarmMember } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { kvGet } from "@/lib/database";
import type { StaffTrainingRecord } from "@/lib/types";

type TrainingType = StaffTrainingRecord["trainingType"];
type AssessmentResult = StaffTrainingRecord["assessmentResult"];

const TRAINING_TYPES: { key: TrainingType; label: string; hasExpiry: boolean }[] = [
  { key: "induction", label: "Farm Induction", hasExpiry: false },
  { key: "refresher", label: "Refresher Training", hasExpiry: false },
  { key: "first_aid", label: "First Aid", hasExpiry: true },
  { key: "fork_lift", label: "Fork Lift / Telehandler", hasExpiry: true },
  { key: "pesticide_pa1", label: "PA1 — Foundation (Pesticides)", hasExpiry: true },
  { key: "pesticide_pa2", label: "PA2 — Mounted Boom Sprayer", hasExpiry: true },
  { key: "pesticide_pa6", label: "PA6 — Handheld Applicator", hasExpiry: true },
  { key: "chainsaw", label: "Chainsaw / NPTC", hasExpiry: true },
  { key: "manual_handling", label: "Manual Handling", hasExpiry: false },
  { key: "fire_safety", label: "Fire Safety & Evacuation", hasExpiry: false },
  { key: "coshh", label: "COSHH Awareness", hasExpiry: false },
  { key: "other", label: "Other", hasExpiry: false },
];

const ASSESSMENT_RESULTS: { key: AssessmentResult; label: string; color: string }[] = [
  { key: "pass", label: "Pass", color: colors.success },
  { key: "in_progress", label: "In Progress", color: colors.primary },
  { key: "no_assessment", label: "No Formal Assessment", color: colors.textSecondary },
  { key: "fail", label: "Fail / Not Yet Competent", color: colors.error },
];

interface ApiCertRecord {
  id: number;
  userId: string;
  certificateType: string;
  certificateNumber: string | null;
  documentPath: string | null;
  documentName: string | null;
  expiryDate: string | null;
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const t = await SecureStore.getItemAsync("auth_session_token");
      if (t) return t;
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return "";
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

async function uploadPhotoToStorage(photoUri: string, apiBase: string): Promise<string | null> {
  const presignRes = await fetch(`${apiBase}/api/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "cert-scan.jpg", size: 0, contentType: "image/jpeg" }),
  });
  if (!presignRes.ok) return null;
  const { uploadURL, objectPath } = await presignRes.json();
  const fileRes = await fetch(photoUri);
  const blob = await fileRes.blob();
  const putRes = await fetch(uploadURL, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": blob.type || "image/jpeg" },
  });
  if (!putRes.ok) return null;
  return objectPath;
}

function CertificateScanRow({ cert, farmId }: { cert: ApiCertRecord; farmId: string }) {
  const [uploading, setUploading] = useState(false);
  const [hasScan, setHasScan] = useState(!!cert.documentPath);

  const attachScan = useCallback(() => {
    Alert.alert("Attach Certificate Scan", "Take a photo of the certificate or choose from your library.", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") { Alert.alert("Permission Required", "Camera access is needed."); return; }
          const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
          if (!result.canceled && result.assets[0]) doUpload(result.assets[0].uri);
        },
      },
      {
        text: "Photo Library",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") { Alert.alert("Permission Required", "Photo library access is needed."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
          if (!result.canceled && result.assets[0]) doUpload(result.assets[0].uri);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, []);

  const doUpload = async (photoUri: string) => {
    const apiBase = getApiBase();
    if (!apiBase) { Alert.alert("No Connection", "An internet connection is required to attach scans."); return; }
    setUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const [token, tenantSlug, objectPath] = await Promise.all([
        getAuthToken(),
        getTenantSlug(),
        uploadPhotoToStorage(photoUri, apiBase),
      ]);
      if (!objectPath || !token) throw new Error("Upload failed");
      const patchRes = await fetch(`${apiBase}/api/farms/${farmId}/certificates/${cert.id}/document`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-tenant-slug": tenantSlug, "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ documentPath: objectPath, documentName: "cert-scan.jpg" }),
      });
      if (!patchRes.ok) throw new Error("Attach failed");
      setHasScan(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Scan Attached", `Certificate scan for "${cert.certificateType}" saved successfully.`);
    } catch (e) {
      Alert.alert("Upload Failed", "Could not upload the scan. Please try again or attach via the web dashboard.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={certStyles.row}>
      <View style={certStyles.certInfo}>
        <Text style={certStyles.certType} numberOfLines={1}>{cert.certificateType}</Text>
        <Text style={certStyles.certSub}>{cert.userId || "—"}{cert.certificateNumber ? ` · ${cert.certificateNumber}` : ""}</Text>
      </View>
      <Pressable
        onPress={hasScan ? undefined : attachScan}
        style={[certStyles.scanBtn, hasScan ? certStyles.scanBtnDone : null, uploading ? certStyles.scanBtnLoading : null]}
        disabled={uploading || hasScan}
      >
        <Feather
          name={hasScan ? "check-circle" : uploading ? "loader" : "camera"}
          size={16}
          color={hasScan ? colors.success : uploading ? colors.textSecondary : colors.primary}
        />
        <Text style={[certStyles.scanBtnText, hasScan ? certStyles.scanBtnTextDone : null]}>
          {hasScan ? "Scan saved" : uploading ? "Uploading…" : "Scan"}
        </Text>
      </Pressable>
    </View>
  );
}

const certStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.sm },
  certInfo: { flex: 1 },
  certType: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  certSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primary + "08" },
  scanBtnDone: { borderColor: colors.success, backgroundColor: colors.success + "10" },
  scanBtnLoading: { borderColor: colors.border, backgroundColor: colors.surface },
  scanBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
  scanBtnTextDone: { color: colors.success },
});

export default function StaffTrainingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members, loading: membersLoading, error: membersError } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [selectedMember, setSelectedMember] = useState<ApiFarmMember | null>(null);
  const [manualName, setManualName] = useState("");
  const [trainingDate, setTrainingDate] = useState(today);
  const [trainingType, setTrainingType] = useState<TrainingType>("induction");
  const [courseName, setCourseName] = useState("");
  const [trainingProvider, setTrainingProvider] = useState("");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult>("pass");
  const [supervisor, setSupervisor] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const [certs, setCerts] = useState<ApiCertRecord[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);

  useEffect(() => {
    const farmId = currentFarm?.id;
    if (!farmId) return;
    const apiBase = getApiBase();
    if (!apiBase) return;

    let cancelled = false;
    setCertsLoading(true);
    (async () => {
      try {
        const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
        const res = await fetch(`${apiBase}/api/farms/${farmId}/certificates`, {
          headers: token ? { "Authorization": `Bearer ${token}`, "x-tenant-slug": tenantSlug } : {},
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setCerts(data.records ?? []);
      } catch {}
      if (!cancelled) setCertsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [currentFarm?.id]);

  const selectedType = TRAINING_TYPES.find((t) => t.key === trainingType);
  const noMembersLoaded = !membersLoading && members.length === 0;

  const resolvedStaffName = selectedMember
    ? memberFullName(selectedMember)
    : manualName.trim();

  const handleSave = async () => {
    if (!resolvedStaffName || !trainingDate) {
      Alert.alert("Required Fields", "Please select a staff member and enter the training date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: StaffTrainingRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      staffName: resolvedStaffName,
      trainingDate,
      trainingType,
      courseName: courseName.trim(),
      trainingProvider: trainingProvider.trim(),
      certificationNumber: certificationNumber.trim(),
      expiryDate: expiryDate.trim(),
      assessmentResult,
      supervisor: supervisor.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.STAFF_TRAINING_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Staff training record saved offline and queued for sync.", [
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
            <Text style={styles.title}>Staff Training Record</Text>
            <Text style={styles.subtitle}>Certifications, inductions & competency records</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Staff Member</Text>

          <StaffMemberPicker
            selected={selectedMember}
            onSelect={setSelectedMember}
            members={members}
            loading={membersLoading}
            error={membersError}
          />

          {noMembersLoaded && (
            <Input
              label="Staff Name (manual entry) *"
              value={manualName}
              onChangeText={setManualName}
              placeholder="Full name — e.g. John Smith"
            />
          )}

          {selectedMember && (
            <Pressable onPress={() => setSelectedMember(null)} style={styles.clearMember}>
              <Feather name="x" size={12} color={colors.textSecondary} />
              <Text style={styles.clearMemberText}>Clear selection</Text>
            </Pressable>
          )}

          <Input label="Training Date *" value={trainingDate} onChangeText={setTrainingDate} placeholder="YYYY-MM-DD" maxDate="today" />

          <Text style={styles.sectionTitle}>Training Type</Text>
          <View style={styles.chipRow}>
            {TRAINING_TYPES.map((t) => (
              <Pressable key={t.key} onPress={() => setTrainingType(t.key)} style={[styles.chip, trainingType === t.key ? styles.chipActive : null]}>
                {t.hasExpiry && <Feather name="clock" size={11} color={trainingType === t.key ? colors.primary : colors.textSecondary} />}
                <Text style={[styles.chipText, trainingType === t.key ? styles.chipTextActive : null]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {selectedType?.hasExpiry && (
            <View style={styles.expiryNote}>
              <Feather name="info" size={12} color={colors.primary} />
              <Text style={styles.expiryNoteText}>This training type typically has an expiry date — please enter it below.</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Course Details</Text>
          <Input label="Course / Training Name" value={courseName} onChangeText={setCourseName} placeholder="e.g. LANTRA First Aid at Work" />
          <Input label="Training Provider" value={trainingProvider} onChangeText={setTrainingProvider} placeholder="e.g. LANTRA, NPTC, St John Ambulance" />
          <Input label="Certificate / Registration Number" value={certificationNumber} onChangeText={setCertificationNumber} placeholder="Certificate reference" />
          {selectedType?.hasExpiry && (
            <Input label="Certificate Expiry Date" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
          )}

          <Text style={styles.sectionTitle}>Assessment Result</Text>
          <View style={styles.chipRow}>
            {ASSESSMENT_RESULTS.map((r) => (
              <Pressable key={r.key} onPress={() => setAssessmentResult(r.key)} style={[styles.chip, assessmentResult === r.key ? { borderColor: r.color, backgroundColor: r.color + "18" } : null]}>
                <Text style={[styles.chipText, assessmentResult === r.key ? { color: r.color, fontFamily: fonts.semiBold } : null]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Supervisor / Authorising Manager" value={supervisor} onChangeText={setSupervisor} placeholder="Name of authorising person" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional details or observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Training Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />

          <View style={styles.certScanSection}>
            <Text style={styles.sectionTitle}>Certificate Scans</Text>
            <Text style={styles.certScanHelp}>
              Attach a photo of each operator certificate for your compliance records. Requires an internet connection.
            </Text>
            {certsLoading ? (
              <Text style={styles.certsEmpty}>Loading certificates…</Text>
            ) : certs.length === 0 ? (
              <Text style={styles.certsEmpty}>
                No certificates found. Add certificates via the web dashboard, then return here to attach scans.
              </Text>
            ) : (
              certs.map((cert) => (
                <CertificateScanRow key={cert.id} cert={cert} farmId={currentFarm?.id || ""} />
              ))
            )}
          </View>

          <View style={{ height: spacing.xxl }} />
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
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  expiryNote: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.primary + "10", padding: spacing.sm, borderRadius: radius.sm },
  expiryNoteText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.primary, lineHeight: 16 },
  saveButton: { marginTop: spacing.lg },
  clearMember: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingVertical: 2, paddingHorizontal: spacing.sm },
  clearMemberText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  certScanSection: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight },
  certScanHelp: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18, marginBottom: spacing.md },
  certsEmpty: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, fontStyle: "italic", lineHeight: 18 },
});
