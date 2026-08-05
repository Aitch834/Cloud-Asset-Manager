import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
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

import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { kvGet } from "@/lib/database";
import type { RightToWorkCheck } from "@/lib/types";

const LIST_A_DOCS = [
  "UK passport (current or expired)",
  "Irish passport or passport card",
  "UK birth/adoption certificate + NI evidence",
  "Certificate of registration/naturalisation as British citizen",
  "Indefinite Leave to Enter/Remain — biometric residence permit",
  "EU Settlement Scheme — settled status (Home Office online check)",
];

const LIST_B_DOCS = [
  "Current passport with time-limited leave vignette",
  "Biometric Residence Permit (limited leave)",
  "EU Settlement Scheme — pre-settled status",
  "Home Office Positive Verification Notice",
  "Certificate of Application",
];

type DocList = "A" | "B";

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
    body: JSON.stringify({ name: "rtw-document.jpg", size: 0, contentType: "image/jpeg" }),
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

export default function RightToWorkScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members, loading: membersLoading, error: membersError } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [selectedWorker, setSelectedWorker] = useState<ApiFarmMember | null>(null);
  const [manualWorkerName, setManualWorkerName] = useState("");
  const workerName = selectedWorker ? memberFullName(selectedWorker) : manualWorkerName;
  const [documentList, setDocumentList] = useState<DocList>("A");
  const [documentType, setDocumentType] = useState("");
  const [documentReference, setDocumentReference] = useState("");
  const [checkDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkedBy, setCheckedBy] = useState(user?.name || "");
  const [expiryDate, setExpiryDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");

  const docOptions = documentList === "A" ? LIST_A_DOCS : LIST_B_DOCS;

  const takeOrPickPhoto = () => {
    Alert.alert("Attach Document Photo", "Take a photo of the identity document or choose from your library.", [
      {
        text: "Camera",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") { Alert.alert("Permission Required", "Camera access is needed."); return; }
          const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
          if (!result.canceled && result.assets[0]) { setPhotoUri(result.assets[0].uri); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
        },
      },
      {
        text: "Photo Library",
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") { Alert.alert("Permission Required", "Photo library access is needed."); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
          if (!result.canceled && result.assets[0]) { setPhotoUri(result.assets[0].uri); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    if (!workerName.trim()) {
      Alert.alert("Required", "Please enter the worker's name.");
      return;
    }
    if (!documentType) {
      Alert.alert("Required", "Please select a document type.");
      return;
    }
    if (documentList === "B" && !expiryDate.trim()) {
      Alert.alert("Required", "List B documents require an expiry date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const apiBase = getApiBase();
    let savedOnline = false;

    if (photoUri && apiBase) {
      setUploading(true);
      try {
        const [token, tenantSlug, objectPath] = await Promise.all([
          getAuthToken(),
          getTenantSlug(),
          uploadPhotoToStorage(photoUri, apiBase),
        ]);

        if (objectPath && token) {
          const authHeaders: Record<string, string> = {
            "Content-Type": "application/json",
            "x-tenant-slug": tenantSlug,
            "Authorization": `Bearer ${token}`,
          };

          const rtwBody = {
            staffName: workerName.trim(),
            documentList,
            documentType,
            documentReference: documentReference.trim(),
            checkDate,
            checkedBy: checkedBy.trim(),
            expiryDate: documentList === "B" ? expiryDate.trim() : null,
            followUpDate: followUpDate.trim() || null,
            notes: notes.trim() || null,
          };

          const farmId = currentFarm?.id;
          const rtwRes = await fetch(`${apiBase}/api/farms/${farmId}/right-to-work`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify(rtwBody),
          });

          if (rtwRes.ok) {
            const { record } = await rtwRes.json();
            if (record?.id) {
              await fetch(`${apiBase}/api/farms/${farmId}/right-to-work/${record.id}/documents`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({
                  fileName: "rtw-document.jpg",
                  objectPath,
                }),
              }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
            }
            savedOnline = true;
          }
        }
      } catch (e) {
        console.warn("Online RTW save failed, falling back to local:", e);
      } finally {
        setUploading(false);
      }
    }

    const record: RightToWorkCheck = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      workerName: workerName.trim(),
      documentList,
      documentType,
      documentReference: documentReference.trim(),
      checkDate,
      checkedBy: checkedBy.trim(),
      expiryDate: documentList === "B" ? expiryDate.trim() : "",
      followUpDate: followUpDate.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: savedOnline,
    };

    await appendToList(STORAGE_KEYS.RIGHT_TO_WORK_CHECKS, record);
    if (!savedOnline) await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Check Recorded",
      savedOnline
        ? `RTW check for ${workerName} saved with document photo attached.`
        : `Right to Work check for ${workerName} saved. Retain a copy of the original document in your files.`,
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
          <Text style={styles.title}>Right to Work Check</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.legalBanner}>
            <Feather name="alert-triangle" size={16} color="#b45309" />
            <Text style={styles.legalText}>
              Checks must be carried out <Text style={{ fontFamily: fonts.bold }}>before employment begins</Text>. Retain a copy of original documents. Civil penalty: up to £60,000 per illegal worker.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Worker Details</Text>
            <Text style={styles.fieldLabel}>Worker *</Text>
            <StaffMemberPicker
              selected={selectedWorker}
              onSelect={(m) => { setSelectedWorker(m); if (m) setManualWorkerName(""); }}
              members={members}
              loading={membersLoading}
              error={membersError}
            />
            <Input
              label={members.length === 0 ? "Full Name *" : "Or enter name manually *"}
              value={manualWorkerName}
              onChangeText={(t) => { setManualWorkerName(t); if (t) setSelectedWorker(null); }}
              placeholder="Worker's full legal name"
              autoCapitalize="words"
              editable={!selectedWorker}
            />
            <Input
              label="Check Carried Out By"
              value={checkedBy}
              onChangeText={setCheckedBy}
              placeholder="Name of person who carried out check"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document List</Text>
            <Text style={styles.helpText}>List A — no repeat check required. List B — time-limited, must recheck before expiry.</Text>
            <View style={styles.toggleRow}>
              {(["A", "B"] as DocList[]).map((list) => (
                <Pressable
                  key={list}
                  onPress={() => { setDocumentList(list); setDocumentType(""); }}
                  style={[styles.toggleOption, documentList === list && styles.toggleOptionActive]}
                >
                  <Text style={[styles.toggleLabel, documentList === list && styles.toggleLabelActive]}>
                    List {list}{list === "A" ? " — Indefinite" : " — Time-limited"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Type</Text>
            {docOptions.map((doc) => (
              <Pressable
                key={doc}
                onPress={() => setDocumentType(doc)}
                style={[styles.docOption, documentType === doc && styles.docOptionActive]}
              >
                <View style={[styles.docRadio, documentType === doc && styles.docRadioActive]}>
                  {documentType === doc && <View style={styles.docRadioInner} />}
                </View>
                <Text style={[styles.docOptionLabel, documentType === doc && styles.docOptionLabelActive]}>
                  {doc}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Details</Text>
            <Input
              label="Document Reference / Share Code"
              value={documentReference}
              onChangeText={setDocumentReference}
              placeholder={documentList === "B" ? "Passport no. or Home Office share code" : "Passport/certificate number"}
              autoCapitalize="characters"
            />
            <Input
              label="Check Date"
              value={checkDate}
              editable={false}
              placeholder="YYYY-MM-DD"
            />
            {documentList === "B" && (
              <Input
                label="Document Expiry Date *"
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            )}
            {documentList === "B" && (
              <Input
                label="Follow-up / Repeat Check Date"
                minDate="today"
                value={followUpDate}
                onChangeText={setFollowUpDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
              />
            )}
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Agency / GLAA licence, document filing location, seasonal worker details…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Photo</Text>
            <Text style={styles.helpText}>
              Attach a photo of the identity document. Requires a network connection to upload.
            </Text>
            {photoUri ? (
              <View style={styles.photoAttached}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={styles.photoAttachedText}>Photo attached — will upload with record</Text>
                <Pressable onPress={() => setPhotoUri(null)} style={styles.removePhoto}>
                  <Feather name="x" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.photoButton} onPress={takeOrPickPhoto}>
                <Feather name="camera" size={18} color={colors.primary} />
                <Text style={styles.photoButtonText}>Attach Document Photo</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.section}>
            <Button
              title={uploading ? "Uploading photo…" : saving ? "Saving…" : "Save RTW Check"}
              onPress={handleSave}
              disabled={saving || uploading}
            />
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  legalBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#fef3c7",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  legalText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#92400e",
    lineHeight: 18,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  toggleRow: { gap: spacing.sm },
  toggleOption: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted + "22",
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  toggleLabelActive: { color: colors.primary },
  docOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  docOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted + "22",
  },
  docRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  docRadioActive: { borderColor: colors.primary },
  docRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  docOptionLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  docOptionLabelActive: { color: colors.text },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
    justifyContent: "center",
  },
  photoButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  photoAttached: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.success + "10",
  },
  photoAttachedText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  removePhoto: { padding: 4 },
});
