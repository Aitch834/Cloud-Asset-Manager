import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { Input } from "@/components/ui/Input";
import { SprayProductPicker } from "@/components/ui/SprayProductPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFields, type ApiField } from "@/lib/hooks/useApiFields";
import { useApiSprayProducts, type ApiSprayProduct } from "@/lib/hooks/useApiSprayProducts";
import { useApiStaff } from "@/lib/hooks/useApiStaff";
import { kvGet } from "@/lib/database";

const CRD_STEPS = [
  { value: "1", label: "Step 1", desc: "Notify only — product registrant notified; no buffer reduction required" },
  { value: "2", label: "Step 2", desc: "Standard label buffer maintained — no reduction sought" },
  { value: "3", label: "Step 3", desc: "Full LERAP assessment performed — buffer reduction possible" },
];

const OUTCOMES = [
  { value: "pending", label: "Pending review" },
  { value: "full_buffer_maintained", label: "Full standard buffer maintained" },
  { value: "reduced_buffer", label: "Reduced buffer achieved via LERAP" },
  { value: "no_spray", label: "No spray — risk too high" },
];

function StepPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.stepRow}>
      {CRD_STEPS.map((s) => {
        const active = value === s.value;
        return (
          <Pressable
            key={s.value}
            style={[styles.stepBtn, active && styles.stepBtnActive]}
            onPress={() => onChange(s.value)}
          >
            <Text style={[styles.stepBtnLabel, active && styles.stepBtnLabelActive]}>{s.label}</Text>
            <Text style={[styles.stepBtnDesc, active && styles.stepBtnDescActive]} numberOfLines={3}>
              {s.desc}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SelectRow({ options, value, onChange }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.selectGrid}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            style={[styles.selectOpt, active && styles.selectOptActive]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[styles.selectOptText, active && styles.selectOptTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function LerapAssessmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const { products, loading: productsLoading } = useApiSprayProducts(currentFarm?.id);
  const { staff, loading: staffLoading } = useApiStaff(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [assessmentDate, setAssessmentDate] = useState(today);
  const [step, setStep] = useState("3");
  const [fieldName, setFieldName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ApiSprayProduct | null>(null);
  const [manualProductName, setManualProductName] = useState("");
  const [watercourseDescription, setWatercourseDescription] = useState("");
  const [standardBufferM, setStandardBufferM] = useState("");
  const [bufferAutoFilled, setBufferAutoFilled] = useState(false);
  const [lerapBufferM, setLerapBufferM] = useState("");
  const [outcome, setOutcome] = useState("pending");
  const [assessorName, setAssessorName] = useState("");
  const [pendingReviewByMemberId, setPendingReviewByMemberId] = useState<number | null>(null);
  const [pendingReviewBy, setPendingReviewBy] = useState("");
  const [notes, setNotes] = useState("");
  const [reductionJustification, setReductionJustification] = useState("");

  useEffect(() => {
    if (selectedProduct?.lerapStandardBufferM) {
      setStandardBufferM(String(selectedProduct.lerapStandardBufferM));
      setBufferAutoFilled(true);
    }
  }, [selectedProduct]);

  const reviewableStaff = staff.filter((s) => s.memberId != null);

  const handleFieldSelect = (_field: ApiField) => {};

  async function handleSave() {
    if (!assessmentDate) {
      Alert.alert("Required", "Please enter an assessment date.");
      return;
    }
    if (staff.length === 0) {
      Alert.alert("No Staff Records", "LERAP assessors must be recorded as staff members before an assessment can be saved. Add staff in the dashboard under Staff & Training.");
      return;
    }
    if (!assessorName) {
      Alert.alert("Assessor Required", "Please select the assessor who performed this LERAP assessment.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
      const token = await kvGet("bde_auth_token");
      const tenantId = await kvGet("bde_current_farm");

      const body: Record<string, unknown> = {
        assessmentDate,
        step,
        watercourseDescription: watercourseDescription || null,
        standardBufferM: standardBufferM || null,
        lerapBufferM: lerapBufferM || null,
        outcome,
        assessorName,
        notes: notes || null,
        reductionJustification: reductionJustification || null,
        pendingReviewBy: pendingReviewBy || null,
        pendingReviewByMemberId,
      };

      if (selectedProduct?.id) body.productId = selectedProduct.id;
      if (fieldName) {
        const match = fields.find((f) => f.name === fieldName);
        if (match) body.fieldId = match.id;
      }

      const res = await fetch(`${domain}/api/farms/${currentFarm?.id}/lerap-assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenantId || "",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", (err as { error?: string }).error || "Could not save assessment.");
        setSaving(false);
        return;
      }

      const data = await res.json();
      const docRef = `LERAP-${data.record?.id ?? ""}`;

      Alert.alert(
        "Assessment Saved",
        `Your LERAP assessment has been recorded.\n\nDocument reference: ${docRef}\n\nKeep this reference for your compliance records.`,
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert("Error", "Failed to save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>LERAP Assessment</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoBannerText}>
              LERAP (Local Environmental Risk Assessment for Pesticides) is required when using Category B products near surface water. Complete this before or immediately after application.
            </Text>
          </View>

          {/* ── Date & Step ── */}
          <View style={styles.sectionLabel}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Assessment Details</Text>
          </View>

          <Input
            label="Assessment Date *"
            value={assessmentDate}
            onChangeText={setAssessmentDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.fieldLabel}>CRD Assessment Step *</Text>
          <Text style={styles.fieldHint}>Steps 1–3 are the CRD LERAP scheme levels — select the one that describes this assessment.</Text>
          <StepPicker value={step} onChange={setStep} />

          {/* ── Field & Product ── */}
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Location & Product</Text>
          </View>

          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            onChangeField={handleFieldSelect}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <SprayProductPicker
            label="Product"
            selected={selectedProduct}
            manualName={manualProductName}
            onSelect={(p) => { setSelectedProduct(p); setManualProductName(""); }}
            onManual={(name) => { setManualProductName(name); setSelectedProduct(null); }}
            onClear={() => { setSelectedProduct(null); setManualProductName(""); setBufferAutoFilled(false); setStandardBufferM(""); }}
            products={products}
            loading={productsLoading}
          />

          {/* ── Watercourse ── */}
          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Watercourse & Buffers</Text>
          </View>

          <Input
            label="Watercourse Description"
            placeholder="e.g. River Severn (main channel), drainage ditch on eastern boundary"
            value={watercourseDescription}
            onChangeText={setWatercourseDescription}
            multiline
            numberOfLines={2}
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Standard Buffer (m)</Text>
                {bufferAutoFilled && (
                  <View style={styles.autoBadge}><Text style={styles.autoBadgeText}>Auto</Text></View>
                )}
              </View>
              <Input
                placeholder="From product label"
                value={standardBufferM}
                onChangeText={(t) => { setStandardBufferM(t); setBufferAutoFilled(false); }}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>LERAP Buffer Achieved (m)</Text>
              <Input
                placeholder="After assessment"
                value={lerapBufferM}
                onChangeText={setLerapBufferM}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {bufferAutoFilled && (
            <Text style={styles.autoHint}>Standard buffer auto-filled from product label data.</Text>
          )}

          {/* ── Outcome ── */}
          <View style={styles.sectionLabel}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Outcome</Text>
          </View>

          <Text style={styles.fieldLabel}>Assessment Outcome *</Text>
          <SelectRow options={OUTCOMES} value={outcome} onChange={setOutcome} />

          {outcome === "reduced_buffer" && (
            <Input
              label="Reduction Justification"
              placeholder="Equipment type, weather conditions, field characteristics…"
              value={reductionJustification}
              onChangeText={setReductionJustification}
              multiline
              numberOfLines={3}
            />
          )}

          {outcome === "pending" && (
            <>
              <Text style={styles.fieldLabel}>Pending Review By</Text>
              {reviewableStaff.length > 0 ? (
                <SelectRow
                  options={[
                    { value: "", label: "— Not assigned" },
                    ...reviewableStaff.map((s) => ({ value: String(s.memberId), label: s.name + (s.qualifications ? ` — ${s.qualifications}` : "") })),
                  ]}
                  value={pendingReviewByMemberId ? String(pendingReviewByMemberId) : ""}
                  onChange={(v) => {
                    if (!v) { setPendingReviewByMemberId(null); setPendingReviewBy(""); return; }
                    const m = reviewableStaff.find((s) => String(s.memberId) === v);
                    if (m) { setPendingReviewByMemberId(m.memberId); setPendingReviewBy(m.name); }
                  }}
                />
              ) : (
                <View style={styles.warnPanel}>
                  <Feather name="alert-triangle" size={14} color="#D97706" />
                  <Text style={styles.warnPanelText}>No staff members available to assign. Add farm members in the dashboard to assign a reviewer — they will be emailed when assigned.</Text>
                </View>
              )}
              <Text style={styles.fieldHint}>The assigned person will receive an email with the assessment reference.</Text>
            </>
          )}

          {/* ── Assessor ── */}
          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Assessor</Text>
          </View>

          <Text style={styles.fieldLabel}>Assessor Name *</Text>
          {staffLoading ? (
            <Text style={styles.fieldHint}>Loading staff…</Text>
          ) : staff.length === 0 ? (
            <View style={styles.errorPanel}>
              <Feather name="alert-circle" size={15} color={colors.error} />
              <Text style={styles.errorPanelText}>
                <Text style={{ fontFamily: fonts.semiBold }}>No staff records found. </Text>
                LERAP assessors must hold PA1 plus the relevant extension certificate (PA2 for boom sprayers, PA6 for hand-held). Add staff members in the dashboard under Staff &amp; Training before recording an assessment.
              </Text>
            </View>
          ) : (
            <>
              <SelectRow
                options={[
                  { value: "", label: "— Select assessor" },
                  ...staff.map((s) => ({ value: s.name, label: s.name + (s.qualifications ? ` — ${s.qualifications}` : "") })),
                ]}
                value={assessorName}
                onChange={setAssessorName}
              />
              <Text style={styles.fieldHint}>Only staff listed here may be selected. Must hold PA1 + relevant certificate (PA2, PA6 etc.).</Text>
            </>
          )}

          {/* ── Notes ── */}
          <Input
            label="Notes"
            placeholder="Any additional notes…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save LERAP Assessment"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="shield"
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.info,
    lineHeight: 20,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  row: { flexDirection: "row", gap: spacing.sm },
  labelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  autoBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  autoBadgeText: { fontFamily: fonts.semiBold, fontSize: 10, color: "#15803D" },
  autoHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#15803D",
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  stepRow: { gap: spacing.sm, marginBottom: spacing.md },
  stepBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  stepBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },
  stepBtnLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  stepBtnLabelActive: { color: colors.primary },
  stepBtnDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  stepBtnDescActive: { color: "#1D4ED8" },
  selectGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  selectOpt: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  selectOptActive: { borderColor: colors.primary, backgroundColor: "#EFF6FF" },
  selectOptText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  selectOptTextActive: { color: colors.primary },
  warnPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  warnPanelText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#92400E",
    lineHeight: 18,
  },
  errorPanel: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  errorPanelText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#B91C1C",
    lineHeight: 18,
  },
});
