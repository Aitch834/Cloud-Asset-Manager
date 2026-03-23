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

export default function RightToWorkScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members, loading: membersLoading, error: membersError } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

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
      synced: false,
    };

    await appendToList(STORAGE_KEYS.RIGHT_TO_WORK_CHECKS, record, currentFarm?.id);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Check Recorded",
      `Right to Work check for ${workerName} saved. Retain a copy of the original document in your files.`,
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
            <Button
              title={saving ? "Saving…" : "Save RTW Check"}
              onPress={handleSave}
              disabled={saving}
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
});
