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
import type { PpeIssueRecord } from "@/lib/types";

const PPE_TYPES = [
  "Safety Helmet / Hard Hat",
  "Hi-Vis Vest / Jacket",
  "Safety Boots / Footwear",
  "Chemical Resistant Gloves",
  "Nitrile Gloves",
  "Cut-Resistant Gloves",
  "Safety Glasses / Goggles",
  "Face Shield",
  "FFP2 / FFP3 Respirator",
  "Half-Face Respirator",
  "Full-Face Respirator",
  "Ear Defenders / Plugs",
  "Chainsaw Trousers / Chaps",
  "Chemical Resistant Overalls",
  "Wellingtons",
  "Harness / Fall Arrest",
  "Other",
];

const CONDITION_OPTIONS = ["Good — fit for purpose", "Acceptable — minor wear", "Needs Replacement", "Condemned — taken out of use"];

export default function PpeIssueScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members, loading: membersLoading, error: membersError } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [selectedMember, setSelectedMember] = useState<ApiFarmMember | null>(null);
  const [manualName, setManualName] = useState("");
  const [dateIssued, setDateIssued] = useState(today);
  const [ppeType, setPpeType] = useState(PPE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("");
  const [supplier, setSupplier] = useState("");
  const [conditionAtCheck, setConditionAtCheck] = useState("");
  const [notes, setNotes] = useState("");
  const [fitCheckConfirmed, setFitCheckConfirmed] = useState(false);
  const [fitCheckBy, setFitCheckBy] = useState("");
  const [fitCheckNotes, setFitCheckNotes] = useState("");
  const [trainingProvided, setTrainingProvided] = useState(false);
  const [trainingNotes, setTrainingNotes] = useState("");

  const noMembersLoaded = !membersLoading && members.length === 0;
  const resolvedStaffName = selectedMember ? memberFullName(selectedMember) : manualName.trim();

  const handleSave = async () => {
    if (!resolvedStaffName || !dateIssued || !ppeType) {
      Alert.alert("Required Fields", "Please select a staff member, enter the issue date and PPE type.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PpeIssueRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      staffName: resolvedStaffName,
      ppeType,
      description: description.trim(),
      size: size.trim(),
      supplier: supplier.trim(),
      dateIssued,
      conditionAtCheck: conditionAtCheck.trim(),
      notes: notes.trim(),
      fitCheckConfirmed,
      fitCheckBy: fitCheckBy.trim(),
      fitCheckNotes: fitCheckNotes.trim(),
      trainingProvided,
      trainingNotes: trainingNotes.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PPE_ISSUE_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "PPE issue record saved and queued for sync.", [
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
            <Text style={styles.title}>PPE Issue Record</Text>
            <Text style={styles.subtitle}>Personal protective equipment issue register</Text>
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

          <Text style={styles.sectionTitle}>Issue Details</Text>
          <Input
            label="Date Issued *"
            maxDate="today"
            value={dateIssued}
            onChangeText={setDateIssued}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.fieldLabel}>PPE Type *</Text>
          <View style={styles.ppeList}>
            {PPE_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[styles.ppeOption, ppeType === t && styles.ppeOptionActive]}
                onPress={() => setPpeType(t)}
              >
                <View style={[styles.radioOuter, ppeType === t && { borderColor: colors.primary }]}>
                  {ppeType === t && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.ppeOptionText, ppeType === t && { color: colors.primary }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Equipment Details</Text>
          <Input
            label="Description / Model / Spec"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. JSP EVO2 Type 1, EN ISO 20345 S3"
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="Size"
                value={size}
                onChangeText={setSize}
                placeholder="e.g. M / UK9"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Supplier / Brand"
                value={supplier}
                onChangeText={setSupplier}
                placeholder="e.g. Portwest, 3M"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Condition at Issue</Text>
          <View style={styles.ppeList}>
            {CONDITION_OPTIONS.map((c) => (
              <Pressable
                key={c}
                style={[styles.ppeOption, conditionAtCheck === c && styles.ppeOptionActive]}
                onPress={() => setConditionAtCheck(conditionAtCheck === c ? "" : c)}
              >
                <View style={[styles.radioOuter, conditionAtCheck === c && { borderColor: colors.primary }]}>
                  {conditionAtCheck === c && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.ppeOptionText, conditionAtCheck === c && { color: colors.primary }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Individual Fit Check</Text>
          <Pressable
            style={[styles.checkRow, fitCheckConfirmed && styles.checkRowActive]}
            onPress={() => setFitCheckConfirmed((v) => !v)}
          >
            <View style={[styles.checkbox, fitCheckConfirmed && styles.checkboxActive]}>
              {fitCheckConfirmed && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, fitCheckConfirmed && { color: colors.primary }]}>
              Individual fit check carried out and confirmed
            </Text>
          </Pressable>
          {fitCheckConfirmed && (
            <>
              <Input
                label="Fit Check Carried Out By"
                value={fitCheckBy}
                onChangeText={setFitCheckBy}
                placeholder="Name of person who carried out the fit check"
              />
              <Input
                label="Fit Check Notes"
                value={fitCheckNotes}
                onChangeText={setFitCheckNotes}
                placeholder="Any notes about the fit check"
                multiline
                numberOfLines={2}
              />
            </>
          )}

          <Text style={styles.sectionTitle}>PPE Training</Text>
          <Pressable
            style={[styles.checkRow, trainingProvided && styles.checkRowActive]}
            onPress={() => setTrainingProvided((v) => !v)}
          >
            <View style={[styles.checkbox, trainingProvided && styles.checkboxActive]}>
              {trainingProvided && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, trainingProvided && { color: colors.primary }]}>
              PPE training provided to staff member
            </Text>
          </Pressable>
          {trainingProvided && (
            <Input
              label="Training Notes"
              value={trainingNotes}
              onChangeText={setTrainingNotes}
              placeholder="Topics covered, trainer name, etc."
              multiline
              numberOfLines={2}
            />
          )}

          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            label="Additional Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details about this issue"
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save PPE Issue Record"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { marginRight: spacing.sm, padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.sm },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row" },
  ppeList: { gap: spacing.xs, marginBottom: spacing.sm },
  ppeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ppeOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary + "10" },
  ppeOptionText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  clearMember: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.xs },
  clearMemberText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  checkRowActive: { borderColor: colors.primary, backgroundColor: colors.primary + "10" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  checkLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
});
