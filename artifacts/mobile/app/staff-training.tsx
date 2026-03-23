import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useApiFarmMembers, memberFullName, type ApiFarmMember } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
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

function StaffMemberPicker({
  selected,
  onSelect,
  members,
  loading,
  error,
}: {
  selected: ApiFarmMember | null;
  onSelect: (m: ApiFarmMember | null) => void;
  members: ApiFarmMember[];
  loading: boolean;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = members.filter((m) =>
    memberFullName(m).toLowerCase().includes(search.toLowerCase()) ||
    (m.jobTitle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Pressable
        onPress={() => { setSearch(""); setOpen(true); }}
        style={[styles.pickerButton, error !== null ? styles.pickerButtonError : null]}
      >
        <Feather name="user" size={16} color={selected ? colors.primary : colors.textSecondary} />
        <Text style={[styles.pickerText, selected ? null : styles.pickerPlaceholder]}>
          {loading
            ? "Loading staff…"
            : selected
            ? memberFullName(selected) + (selected.jobTitle ? ` · ${selected.jobTitle}` : "")
            : members.length === 0
            ? "No staff recorded — type a name below"
            : "Select staff member…"}
        </Text>
        <Feather name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>

      {error !== null && (
        <Text style={styles.pickerErrorText}>Could not load staff list. Please type the name below.</Text>
      )}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Staff Member</Text>
            <Pressable onPress={() => setOpen(false)} style={styles.modalClose}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or job title…"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x-circle" size={15} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No staff recorded</Text>
              <Text style={styles.emptySubtitle}>
                Add staff members in the dashboard first, or type a name manually in the field below.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.memberRow, selected?.id === item.id ? styles.memberRowActive : null]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {item.firstName[0]}{item.lastName[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{memberFullName(item)}</Text>
                    {item.jobTitle ? (
                      <Text style={styles.memberRole}>{item.jobTitle}</Text>
                    ) : item.farmRole ? (
                      <Text style={styles.memberRole}>{item.farmRole}</Text>
                    ) : null}
                  </View>
                  {selected?.id === item.id && (
                    <Feather name="check-circle" size={18} color={colors.primary} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: colors.textSecondary, padding: spacing.lg }}>
                  No results for "{search}"
                </Text>
              }
            />
          )}
        </View>
      </Modal>
    </>
  );
}

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

          <Input label="Training Date *" value={trainingDate} onChangeText={setTrainingDate} placeholder="YYYY-MM-DD" />

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
  pickerButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 13 },
  pickerButtonError: { borderColor: colors.error },
  pickerText: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pickerPlaceholder: { color: colors.textTertiary },
  pickerErrorText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.error, marginTop: 4 },
  clearMember: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingVertical: 2, paddingHorizontal: spacing.sm },
  clearMemberText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  modalClose: { padding: spacing.xs },
  searchRow: { flexDirection: "row", alignItems: "center", margin: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  emptyState: { alignItems: "center", padding: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  memberRowActive: { backgroundColor: colors.primary + "08" },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },
  memberName: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  memberRole: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
