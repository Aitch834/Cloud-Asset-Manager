import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, getList, updateInList, STORAGE_KEYS } from "@/lib/storage";
import type { ComplianceForm } from "@/lib/types";

interface FormQuestion {
  id: string;
  question: string;
  type: "boolean" | "text";
  required: boolean;
}

const FORM_CONFIGS: Record<string, { title: string; questions: FormQuestion[] }> = {
  "rt-crop-protection": {
    title: "Crop Protection Product Store",
    questions: [
      { id: "q1", question: "Is the store locked and secure?", type: "boolean", required: true },
      { id: "q2", question: "Are all products stored in original containers?", type: "boolean", required: true },
      { id: "q3", question: "Is the store adequately ventilated?", type: "boolean", required: true },
      { id: "q4", question: "Are COSHH data sheets available?", type: "boolean", required: true },
      { id: "q5", question: "Is there a spill kit available?", type: "boolean", required: true },
      { id: "q6", question: "Are out-of-date products separated and labelled?", type: "boolean", required: true },
      { id: "q7", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-seed-treatment": {
    title: "Seed Treatment Records",
    questions: [
      { id: "q1", question: "Are seed treatment records complete and up to date?", type: "boolean", required: true },
      { id: "q2", question: "Are treated seeds stored separately from untreated?", type: "boolean", required: true },
      { id: "q3", question: "Is treated seed bag disposal documented?", type: "boolean", required: true },
      { id: "q4", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-fertiliser": {
    title: "Fertiliser Application",
    questions: [
      { id: "q1", question: "Is the nutrient management plan up to date?", type: "boolean", required: true },
      { id: "q2", question: "Are application records complete?", type: "boolean", required: true },
      { id: "q3", question: "Is fertiliser stored correctly?", type: "boolean", required: true },
      { id: "q4", question: "Are buffer zones maintained near watercourses?", type: "boolean", required: true },
      { id: "q5", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-harvest": {
    title: "Harvest Quality Checks",
    questions: [
      { id: "q1", question: "Has combine been cleaned before harvest?", type: "boolean", required: true },
      { id: "q2", question: "Are moisture readings being taken?", type: "boolean", required: true },
      { id: "q3", question: "Is grain stored in suitable conditions?", type: "boolean", required: true },
      { id: "q4", question: "Are quality test results recorded?", type: "boolean", required: true },
      { id: "q5", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-biosecurity": {
    title: "Biosecurity Assessment",
    questions: [
      { id: "q1", question: "Are farm entrance signs displayed?", type: "boolean", required: true },
      { id: "q2", question: "Is a visitor log maintained?", type: "boolean", required: true },
      { id: "q3", question: "Are boot dips / disinfection points available?", type: "boolean", required: true },
      { id: "q4", question: "Is vermin control in place?", type: "boolean", required: true },
      { id: "q5", question: "Are dead animals removed promptly?", type: "boolean", required: true },
      { id: "q6", question: "Is the isolation area available and suitable?", type: "boolean", required: true },
      { id: "q7", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-waste": {
    title: "Waste Management",
    questions: [
      { id: "q1", question: "Is waste segregated correctly?", type: "boolean", required: true },
      { id: "q2", question: "Are waste transfer notes available?", type: "boolean", required: true },
      { id: "q3", question: "Is hazardous waste stored securely?", type: "boolean", required: true },
      { id: "q4", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-water": {
    title: "Water Usage & Protection",
    questions: [
      { id: "q1", question: "Are water abstraction licences up to date?", type: "boolean", required: true },
      { id: "q2", question: "Are watercourse buffer zones maintained?", type: "boolean", required: true },
      { id: "q3", question: "Is there evidence of pollution prevention?", type: "boolean", required: true },
      { id: "q4", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-health-safety": {
    title: "Health & Safety Review",
    questions: [
      { id: "q1", question: "Is the risk assessment up to date?", type: "boolean", required: true },
      { id: "q2", question: "Is first aid kit stocked and accessible?", type: "boolean", required: true },
      { id: "q3", question: "Are emergency procedures displayed?", type: "boolean", required: true },
      { id: "q4", question: "Is PPE available and in good condition?", type: "boolean", required: true },
      { id: "q5", question: "Are accident records up to date?", type: "boolean", required: true },
      { id: "q6", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-animal-welfare": {
    title: "Animal Welfare Assessment",
    questions: [
      { id: "q1", question: "Is adequate feed and water available?", type: "boolean", required: true },
      { id: "q2", question: "Are housing conditions satisfactory?", type: "boolean", required: true },
      { id: "q3", question: "Is there a health plan in place?", type: "boolean", required: true },
      { id: "q4", question: "Are stock checks performed daily?", type: "boolean", required: true },
      { id: "q5", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-feed-storage": {
    title: "Feed Storage Inspection",
    questions: [
      { id: "q1", question: "Is feed stored in clean, dry conditions?", type: "boolean", required: true },
      { id: "q2", question: "Are feed bins free from contamination?", type: "boolean", required: true },
      { id: "q3", question: "Are feed labels and batch numbers recorded?", type: "boolean", required: true },
      { id: "q4", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-medicine": {
    title: "Medicine Record Review",
    questions: [
      { id: "q1", question: "Are medicine records complete and up to date?", type: "boolean", required: true },
      { id: "q2", question: "Is the medicine cabinet locked?", type: "boolean", required: true },
      { id: "q3", question: "Are withdrawal periods being observed?", type: "boolean", required: true },
      { id: "q4", question: "Is out-of-date medicine disposed of correctly?", type: "boolean", required: true },
      { id: "q5", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-transport": {
    title: "Livestock Transport Check",
    questions: [
      { id: "q1", question: "Is the vehicle suitable and clean?", type: "boolean", required: true },
      { id: "q2", question: "Are journey times within legal limits?", type: "boolean", required: true },
      { id: "q3", question: "Are movement documents complete?", type: "boolean", required: true },
      { id: "q4", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-medicine-administered": {
    title: "Medicine Administered",
    questions: [
      { id: "q1", question: "Animal ID / Tag number", type: "text", required: true },
      { id: "q2", question: "Medicine name and batch number", type: "text", required: true },
      { id: "q3", question: "Dosage administered", type: "text", required: true },
      { id: "q4", question: "Route of administration (oral/injection/topical)", type: "text", required: true },
      { id: "q5", question: "Was the medicine prescribed by a vet?", type: "boolean", required: true },
      { id: "q6", question: "Withdrawal period observed (days)", type: "text", required: true },
      { id: "q7", question: "Is the withdrawal end date recorded?", type: "boolean", required: true },
      { id: "q8", question: "Administered by (operator name)", type: "text", required: true },
      { id: "q9", question: "Additional notes", type: "text", required: false },
    ],
  },
  "rt-livestock-movement": {
    title: "Livestock Movement Record",
    questions: [
      { id: "q1", question: "Number of animals moved", type: "text", required: true },
      { id: "q2", question: "Species and breed", type: "text", required: true },
      { id: "q3", question: "Tag / Ear mark numbers", type: "text", required: true },
      { id: "q4", question: "Origin holding (CPH number)", type: "text", required: true },
      { id: "q5", question: "Destination holding (CPH number)", type: "text", required: true },
      { id: "q6", question: "Movement licence / permit reference", type: "text", required: true },
      { id: "q7", question: "Is standstill period applicable?", type: "boolean", required: true },
      { id: "q8", question: "Transport vehicle registration", type: "text", required: false },
      { id: "q9", question: "Additional notes", type: "text", required: false },
    ],
  },
  "rt-water-test": {
    title: "Water Test Result",
    questions: [
      { id: "q1", question: "Water source tested", type: "text", required: true },
      { id: "q2", question: "Is E. coli level within acceptable limits?", type: "boolean", required: true },
      { id: "q3", question: "Is coliform count within acceptable limits?", type: "boolean", required: true },
      { id: "q4", question: "pH level reading", type: "text", required: true },
      { id: "q5", question: "Nitrate level (mg/L)", type: "text", required: false },
      { id: "q6", question: "Is the water suitable for livestock consumption?", type: "boolean", required: true },
      { id: "q7", question: "Lab reference / certificate number", type: "text", required: false },
      { id: "q8", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-cleaning-disinfection": {
    title: "Cleaning & Disinfection Event",
    questions: [
      { id: "q1", question: "Area / building cleaned", type: "text", required: true },
      { id: "q2", question: "Was all organic matter removed before disinfection?", type: "boolean", required: true },
      { id: "q3", question: "Disinfectant product used", type: "text", required: true },
      { id: "q4", question: "Is the product DEFRA approved?", type: "boolean", required: true },
      { id: "q5", question: "Dilution rate used", type: "text", required: true },
      { id: "q6", question: "Contact time observed (minutes)", type: "text", required: true },
      { id: "q7", question: "Was the area allowed to dry before restocking?", type: "boolean", required: true },
      { id: "q8", question: "Cleaned by (operator name)", type: "text", required: true },
      { id: "q9", question: "Additional observations", type: "text", required: false },
    ],
  },
  "rt-pest-control": {
    title: "Pest Control Check",
    questions: [
      { id: "q1", question: "Are bait stations in place and numbered?", type: "boolean", required: true },
      { id: "q2", question: "Have all bait points been checked?", type: "boolean", required: true },
      { id: "q3", question: "Is there evidence of pest activity?", type: "boolean", required: true },
      { id: "q4", question: "Type of pest evidence found", type: "text", required: false },
      { id: "q5", question: "Has bait been replenished where needed?", type: "boolean", required: true },
      { id: "q6", question: "Are non-target species safeguards in place?", type: "boolean", required: true },
      { id: "q7", question: "Is the pest control contractor's report up to date?", type: "boolean", required: true },
      { id: "q8", question: "Additional observations", type: "text", required: false },
    ],
  },
};

const DEFAULT_CONFIG = {
  title: "Compliance Check",
  questions: [
    { id: "q1", question: "Does this area meet compliance standards?", type: "boolean" as const, required: true },
    { id: "q2", question: "Are records up to date?", type: "boolean" as const, required: true },
    { id: "q3", question: "Are all staff trained?", type: "boolean" as const, required: true },
    { id: "q4", question: "Is corrective action needed?", type: "boolean" as const, required: true },
    { id: "q5", question: "Additional observations", type: "text" as const, required: false },
  ],
};

function getConfig(templateId?: string, formType?: string) {
  if (templateId && FORM_CONFIGS[templateId]) return FORM_CONFIGS[templateId];
  if (formType && FORM_CONFIGS[formType]) return FORM_CONFIGS[formType];
  return DEFAULT_CONFIG;
}

export default function ComplianceFormScreen() {
  const insets = useSafeAreaInsets();
  const { templateId, formId } = useLocalSearchParams<{ templateId?: string; formId?: string }>();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState(getConfig(templateId));
  const [responses, setResponses] = useState<Record<string, string | boolean>>({});
  const [existingForm, setExistingForm] = useState<ComplianceForm | null>(null);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textModalQuestionId, setTextModalQuestionId] = useState("");
  const [textModalValue, setTextModalValue] = useState("");
  const [textModalTitle, setTextModalTitle] = useState("");

  useEffect(() => {
    if (formId) {
      (async () => {
        const forms = await getList<ComplianceForm>(STORAGE_KEYS.COMPLIANCE_FORMS);
        const found = forms.find((f) => f.id === formId);
        if (found) {
          setExistingForm(found);
          setResponses(found.responses);
          setConfig(getConfig(undefined, found.formType));
        }
      })();
    }
  }, [formId]);

  const setResponse = (qId: string, value: string | boolean) => {
    Haptics.selectionAsync();
    setResponses((prev) => ({ ...prev, [qId]: value }));
  };

  const openTextEditor = (qId: string, title: string) => {
    setTextModalQuestionId(qId);
    setTextModalTitle(title);
    setTextModalValue((responses[qId] as string) || "");
    setTextModalVisible(true);
  };

  const saveTextModal = () => {
    setResponse(textModalQuestionId, textModalValue);
    setTextModalVisible(false);
  };

  const completedCount = config.questions.filter(
    (q) => q.required && responses[q.id] !== undefined && responses[q.id] !== "",
  ).length;
  const requiredCount = config.questions.filter((q) => q.required).length;
  const progress = requiredCount > 0 ? (completedCount / requiredCount) * 100 : 0;

  const handleSave = async (status: "draft" | "completed") => {
    if (status === "completed") {
      const missing = config.questions.filter(
        (q) => q.required && (responses[q.id] === undefined || responses[q.id] === ""),
      );
      if (missing.length > 0) {
        Alert.alert("Incomplete", "Please answer all required questions before completing.");
        return;
      }
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (existingForm) {
      await updateInList<ComplianceForm>(STORAGE_KEYS.COMPLIANCE_FORMS, existingForm.id, {
        responses,
        status,
        completedBy: user?.name || "",
        completedAt: status === "completed" ? new Date().toISOString() : "",
        synced: false,
      });
    } else {
      const form: ComplianceForm = {
        id: generateId(),
        farmId: currentFarm?.id || "",
        formType: templateId || "general",
        formTitle: config.title,
        status,
        responses,
        completedBy: user?.name || "",
        completedAt: status === "completed" ? new Date().toISOString() : "",
        notes: "",
        photoIds: [],
        createdAt: new Date().toISOString(),
        synced: false,
      };
      await appendToList(STORAGE_KEYS.COMPLIANCE_FORMS, form);
    }

    await refreshPendingCount();
    setSaving(false);
    Alert.alert(
      status === "completed" ? "Form Completed" : "Draft Saved",
      status === "completed"
        ? "Compliance form has been completed and saved."
        : "Form saved as draft. You can continue later.",
      [{ text: "OK", onPress: () => router.back() }],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title} numberOfLines={1}>{config.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {completedCount} of {requiredCount} required
          </Text>
          <Badge
            text={`${Math.round(progress)}%`}
            variant={progress === 100 ? "success" : progress > 50 ? "warning" : "neutral"}
          />
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {config.questions.map((q, i) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{i + 1}</Text>
                {q.required && <Text style={styles.required}>Required</Text>}
              </View>
              <Text style={styles.questionText}>{q.question}</Text>

              {q.type === "boolean" ? (
                <View style={styles.booleanRow}>
                  <Pressable
                    onPress={() => setResponse(q.id, true)}
                    style={[
                      styles.booleanButton,
                      responses[q.id] === true && styles.booleanButtonYes,
                    ]}
                  >
                    <Feather
                      name="check"
                      size={16}
                      color={responses[q.id] === true ? colors.textInverse : colors.success}
                    />
                    <Text
                      style={[
                        styles.booleanText,
                        responses[q.id] === true && styles.booleanTextActive,
                      ]}
                    >
                      Yes
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setResponse(q.id, false)}
                    style={[
                      styles.booleanButton,
                      responses[q.id] === false && styles.booleanButtonNo,
                    ]}
                  >
                    <Feather
                      name="x"
                      size={16}
                      color={responses[q.id] === false ? colors.textInverse : colors.error}
                    />
                    <Text
                      style={[
                        styles.booleanText,
                        responses[q.id] === false && styles.booleanTextActive,
                      ]}
                    >
                      No
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.textInputWrapper}
                  onPress={() => openTextEditor(q.id, q.question)}
                >
                  <Text
                    style={[
                      styles.textInputText,
                      !responses[q.id] && styles.textInputPlaceholder,
                    ]}
                  >
                    {(responses[q.id] as string) || "Tap to add notes..."}
                  </Text>
                </Pressable>
              )}
            </View>
          ))}

          <View style={styles.actions}>
            <Button
              title="Save as Draft"
              onPress={() => handleSave("draft")}
              variant="outline"
              loading={saving}
              fullWidth
              icon="save"
            />
            <Button
              title="Complete Form"
              onPress={() => handleSave("completed")}
              loading={saving}
              fullWidth
              icon="check-circle"
              disabled={progress < 100}
            />
          </View>

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={textModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTextModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{textModalTitle}</Text>
              <Pressable onPress={() => setTextModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalTextInput}
              value={textModalValue}
              onChangeText={setTextModalValue}
              placeholder="Enter your notes..."
              placeholderTextColor={colors.textTertiary}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <Button
              title="Save Notes"
              onPress={saveTextModal}
              fullWidth
              icon="check"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  progressSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  questionNumber: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.primary,
    textTransform: "uppercase",
  },
  required: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.error,
  },
  questionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  booleanRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  booleanButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  booleanButtonYes: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  booleanButtonNo: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  booleanText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  booleanTextActive: {
    color: colors.textInverse,
  },
  textInputWrapper: {
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 60,
  },
  textInputText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  textInputPlaceholder: {
    color: colors.textTertiary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  modalTextInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 120,
    marginBottom: spacing.lg,
  },
});
