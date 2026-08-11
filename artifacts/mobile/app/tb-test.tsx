import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { RFIDTagInput } from "@/components/ui/RFIDTagInput";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, getList, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase, uploadPhotoToStorage } from "@/lib/uploadPhoto";
import type { TbTestRecord } from "@/lib/types";

type TestType = TbTestRecord["testType"];
type TestResult = TbTestRecord["result"];

const TEST_TYPES: { key: TestType; label: string }[] = [
  { key: "routine", label: "Routine / Scheduled" },
  { key: "pre_movement", label: "Pre-Movement Test" },
  { key: "contiguous", label: "Contiguous Herd Test" },
  { key: "gamma_ifn", label: "Gamma Interferon Test" },
  { key: "check_test", label: "Check Test" },
  { key: "other", label: "Other" },
];

const RESULTS: { key: TestResult; label: string; color: string }[] = [
  { key: "clear", label: "Clear — No Reactors", color: colors.success },
  { key: "inconclusive", label: "Inconclusive", color: colors.warning ?? colors.primary },
  { key: "failed_reactors", label: "Failed — Reactors Found", color: colors.error },
];

const SPECIES_OPTIONS = ["Cattle", "Buffalo", "Deer"];

export default function TbTestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { herds, loading: herdsLoading } = useApiHerds(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("tb-test", farmId);
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const today = new Date().toISOString().split("T")[0];

  const [testDate, setTestDate] = useState(today);

  const [herdId, setHerdId] = useState<number | null>(null);
  const [herdOrFlockNumber, setHerdOrFlockNumber] = useState("");
  const [herdPickerVisible, setHerdPickerVisible] = useState(false);

  const [species, setSpecies] = useState("Cattle");
  const [testType, setTestType] = useState<TestType>("routine");

  const [vetName, setVetName] = useState("");
  const [vetAddress, setVetAddress] = useState("");
  const [recentVets, setRecentVets] = useState<string[]>([]);
  const [showVetSuggestions, setShowVetSuggestions] = useState(false);

  const [earTags, setEarTags] = useState<string[]>([]);
  const [rfidInput, setRfidInput] = useState("");
  const [manualAnimalsTested, setManualAnimalsTested] = useState("");

  const [reactors, setReactors] = useState("0");
  const [inconclusives, setInconclusives] = useState("0");
  const [result, setResult] = useState<TestResult>("clear");
  const [restrictionsLifted, setRestrictionsLifted] = useState(false);
  const [retestDueDate, setRetestDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const animalsTested = earTags.length > 0 ? String(earTags.length) : manualAnimalsTested;

  useEffect(() => {
    getList<TbTestRecord>(STORAGE_KEYS.TB_TEST_RECORDS).then((records) => {
      const vets = [...new Set(records.map((r) => r.vetName).filter((v) => !!v.trim()))];
      setRecentVets(vets);
    });
  }, []);

  function handleTagScanned(tag: string) {
    const cleaned = tag.trim().toUpperCase();
    if (!cleaned || earTags.includes(cleaned)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEarTags((prev) => [...prev, cleaned]);
    setRfidInput("");
  }

  function addManualTag() {
    const cleaned = rfidInput.trim().toUpperCase();
    if (!cleaned || earTags.includes(cleaned)) { setRfidInput(""); return; }
    setEarTags((prev) => [...prev, cleaned]);
    setRfidInput("");
  }

  function removeTag(tag: string) {
    setEarTags((prev) => prev.filter((t) => t !== tag));
  }

  function selectHerd(herd: { id: number; name: string; herdNumber?: string | null }) {
    setHerdId(herd.id);
    setHerdOrFlockNumber(herd.herdNumber || herd.name);
    setHerdPickerVisible(false);
  }

  const filteredVets = vetName.trim().length >= 2
    ? recentVets.filter((v) => v.toLowerCase().includes(vetName.toLowerCase()))
    : [];

  const handleSave = async () => {
    if (!testDate || !vetName.trim() || !animalsTested.trim()) {
      Alert.alert("Required Fields", "Please enter the test date, vet name and number of animals tested.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentPath: string | null = null;
    let documentName: string | null = null;
    if (photoUri) {
      try {
        const path = await uploadPhotoToStorage(photoUri, getApiBase(), "tb-test-doc.jpg");
        if (path) { documentPath = path; documentName = "tb-test-doc.jpg"; }
      } catch (_) {}
    }

    const record: TbTestRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      testDate,
      herdOrFlockNumber: herdOrFlockNumber.trim(),
      herdId,
      species,
      testType,
      vetName: vetName.trim(),
      vetAddress: vetAddress.trim(),
      animalsTested: animalsTested.trim(),
      animalEarTags: earTags.length > 0 ? JSON.stringify(earTags) : null,
      reactors: reactors.trim(),
      inconclusives: inconclusives.trim(),
      result,
      restrictionsLifted,
      retestDueDate: retestDueDate.trim(),
      notes: notes.trim(),
      documentPath,
      documentName,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.TB_TEST_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "TB test record saved offline and queued for sync.", [
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
            <Text style={styles.title}>TB Test Record</Text>
            <Text style={styles.subtitle}>Tuberculin skin test results & reactor log</Text>
          </View>
        </View>

        {justSaved && !missingIdentifiers && !identifiersLoading && (
          <Pressable onPress={clearJustSaved} style={[styles.identifierBanner, styles.identifierBannerSaved]}>
            <Feather name="check-circle" size={15} color="#166534" />
            <Text style={[styles.identifierBannerText, styles.identifierBannerSavedText]}>
              Identifiers saved successfully. Tap to dismiss.
            </Text>
          </Pressable>
        )}

        {missingIdentifiers && !bannerDismissed && (
          <Pressable
            onPress={() => router.push("/(tabs)/more")}
            style={styles.identifierBanner}
          >
            <Feather name="alert-triangle" size={15} color="#92400e" />
            <Text style={styles.identifierBannerText}>
              {!cphNumber && !sbiNumber
                ? "CPH and SBI are missing from your farm profile — required for TB test records."
                : !cphNumber
                ? "CPH number is missing from your farm profile — required for TB test records."
                : "SBI number is missing from your farm profile — required for TB test records."}
              {" "}Tap to go to Settings.
            </Text>
            <Pressable
              onPress={(e) => { e.stopPropagation(); dismissBanner(); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Dismiss warning"
            >
              <Feather name="x" size={15} color="#92400e" />
            </Pressable>
          </Pressable>
        )}

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Test Details</Text>
          <Input
            label="Test Date *"
            maxDate="today"
            value={testDate}
            onChangeText={setTestDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.fieldLabel}>Herd / Flock</Text>
          <Pressable
            style={styles.pickerRow}
            onPress={() => setHerdPickerVisible(true)}
          >
            <Text style={herdOrFlockNumber ? styles.pickerValue : styles.pickerPlaceholder}>
              {herdOrFlockNumber || (herdsLoading ? "Loading herds…" : "Select from herd register…")}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.textSecondary} />
          </Pressable>
          {herdId === null && (
            <Input
              value={herdOrFlockNumber}
              onChangeText={setHerdOrFlockNumber}
              placeholder="Or type CPH / herd number manually"
              containerStyle={{ marginTop: spacing.xs }}
            />
          )}

          <Text style={styles.fieldLabel}>Species</Text>
          <View style={styles.chipRow}>
            {SPECIES_OPTIONS.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, species === s && styles.chipActive]}
                onPress={() => setSpecies(s)}
              >
                <Text style={[styles.chipText, species === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Test Type *</Text>
          <View style={styles.chipRow}>
            {TEST_TYPES.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.chip, testType === t.key && styles.chipActive]}
                onPress={() => setTestType(t.key)}
              >
                <Text style={[styles.chipText, testType === t.key && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          {testType === "pre_movement" && (
            <View style={{ backgroundColor: "#eff6ff", borderRadius: 8, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: "#2563eb" }}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#1e40af", marginBottom: 4 }}>Movement Record Required</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#1e40af" }}>
                Pre- and post-movement tests must be linked to the corresponding livestock movement record. After this test syncs to the dashboard, open the TB Test Register, edit this entry, and use the "Link to Livestock Movement Record" dropdown to connect it to the off-farm movement. This creates the APHA-required audit trail from test certificate to BCMS movement notification.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Veterinarian</Text>
          <Input
            label="Vet Name *"
            value={vetName}
            onChangeText={(v) => { setVetName(v); setShowVetSuggestions(true); }}
            onFocus={() => setShowVetSuggestions(true)}
            onBlur={() => setTimeout(() => setShowVetSuggestions(false), 150)}
            placeholder="e.g. Dr A. Smith"
          />
          {showVetSuggestions && filteredVets.length > 0 && (
            <View style={styles.suggestionBox}>
              {filteredVets.map((v) => (
                <Pressable key={v} style={styles.suggestionRow} onPress={() => { setVetName(v); setShowVetSuggestions(false); }}>
                  <Feather name="user" size={13} color={colors.textSecondary} style={{ marginRight: spacing.xs }} />
                  <Text style={styles.suggestionText}>{v}</Text>
                </Pressable>
              ))}
            </View>
          )}
          <Input
            label="Vet Practice / Address"
            value={vetAddress}
            onChangeText={setVetAddress}
            placeholder="e.g. Valley Farm Vets, Shrewsbury"
          />

          <Text style={styles.sectionTitle}>Animals Tested</Text>
          <Text style={styles.fieldLabel}>Scan Ear Tags with Bluetooth Wand</Text>
          <RFIDTagInput
            label={earTags.length > 0 ? `Scan next tag (${earTags.length} scanned)` : "Scan ear tag"}
            value={rfidInput}
            onChangeText={setRfidInput}
            onTagScanned={handleTagScanned}
            placeholder="Hold wand to ear tag…"
          />
          {rfidInput.trim().length > 0 && (
            <Pressable style={styles.addTagBtn} onPress={addManualTag}>
              <Feather name="plus" size={14} color={colors.primary} />
              <Text style={styles.addTagText}>Add "{rfidInput.trim().toUpperCase()}"</Text>
            </Pressable>
          )}

          {earTags.length > 0 && (
            <View style={styles.tagList}>
              <Text style={styles.tagListHeader}>{earTags.length} ear tag{earTags.length !== 1 ? "s" : ""} recorded</Text>
              {earTags.map((tag, i) => (
                <View key={tag} style={styles.tagRow}>
                  <Text style={styles.tagIndex}>{i + 1}</Text>
                  <Text style={styles.tagValue}>{tag}</Text>
                  <Pressable onPress={() => removeTag(tag)} style={styles.tagRemove}>
                    <Feather name="x" size={14} color={colors.error} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {earTags.length === 0 && (
            <Input
              label="Animals Tested *"
              value={manualAnimalsTested}
              onChangeText={setManualAnimalsTested}
              placeholder="Number of animals"
              keyboardType="numeric"
            />
          )}
          {earTags.length > 0 && (
            <View style={styles.autoCountRow}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={styles.autoCountText}>Animals tested auto-set to {earTags.length} from scanned tags</Text>
            </View>
          )}

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="Reactors"
                value={reactors}
                onChangeText={setReactors}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Inconclusives"
                value={inconclusives}
                onChangeText={setInconclusives}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Test Result *</Text>
          {RESULTS.map((r) => (
            <Pressable
              key={r.key}
              style={[styles.resultOption, result === r.key && { borderColor: r.color, backgroundColor: r.color + "15" }]}
              onPress={() => setResult(r.key)}
            >
              <View style={[styles.radioOuter, result === r.key && { borderColor: r.color }]}>
                {result === r.key && <View style={[styles.radioInner, { backgroundColor: r.color }]} />}
              </View>
              <Text style={[styles.resultLabel, result === r.key && { color: r.color }]}>{r.label}</Text>
            </Pressable>
          ))}

          {(result === "inconclusive" || result === "failed_reactors") && (
            <Input
              label="Retest Due Date"
              minDate="today"
              value={retestDueDate}
              onChangeText={setRetestDueDate}
              placeholder="YYYY-MM-DD"
            />
          )}

          <Pressable
            style={styles.toggleRow}
            onPress={() => setRestrictionsLifted(!restrictionsLifted)}
          >
            <View style={[styles.checkbox, restrictionsLifted && styles.checkboxChecked]}>
              {restrictionsLifted && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.toggleLabel}>Movement restrictions lifted</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Document</Text>
          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach TB2 / Test Certificate"
            promptTitle="Attach TB Test Document"
          />

          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            label="Additional Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save TB Test Record"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </View>

      <Modal visible={herdPickerVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setHerdPickerVisible(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Herd / Flock</Text>
            <Pressable onPress={() => setHerdPickerVisible(false)} style={styles.modalClose}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>
          {herds.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{herdsLoading ? "Loading…" : "No herds found in register."}</Text>
              <Pressable style={styles.manualEntry} onPress={() => { setHerdId(null); setHerdPickerVisible(false); }}>
                <Text style={styles.manualEntryText}>Enter manually instead</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={herds}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: spacing.md }}
              renderItem={({ item }) => (
                <Pressable style={styles.herdRow} onPress={() => selectHerd(item)}>
                  <View style={styles.herdIcon}>
                    <Text style={styles.herdIconText}>{item.type === "sheep" ? "🐑" : item.type === "pig" ? "🐷" : "🐄"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.herdName}>{item.name}</Text>
                    {item.herdNumber && <Text style={styles.herdNumber}>{item.herdNumber}</Text>}
                    <Text style={styles.herdType}>{item.type}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={() => (
                <Pressable style={[styles.herdRow, { marginTop: spacing.sm }]} onPress={() => { setHerdId(null); setHerdOrFlockNumber(""); setHerdPickerVisible(false); }}>
                  <View style={[styles.herdIcon, { backgroundColor: colors.border }]}>
                    <Feather name="edit-2" size={14} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.herdName, { color: colors.textSecondary }]}>Enter manually…</Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>
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
  identifierBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  identifierBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  identifierBannerSaved: {
    backgroundColor: colors.successBg,
    borderColor: "#86EFAC",
  },
  identifierBannerSavedText: {
    color: "#166534",
  },
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
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  pickerValue: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  pickerPlaceholder: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  suggestionBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  addTagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addTagText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  tagList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  tagListHeader: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tagIndex: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, width: 24 },
  tagValue: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  tagRemove: { padding: spacing.xs },
  autoCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  autoCountText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.success },
  row: { flexDirection: "row" },
  resultOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
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
  radioInner: { width: 8, height: 8, borderRadius: 4 },
  resultLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  modalClose: { padding: spacing.xs },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  manualEntry: { marginTop: spacing.md },
  manualEntryText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  herdRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  herdIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  herdIconText: { fontSize: 18 },
  herdName: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  herdNumber: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  herdType: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, textTransform: "capitalize" },
  separator: { height: 1, backgroundColor: colors.border },
});
