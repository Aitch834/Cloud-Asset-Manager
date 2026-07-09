import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { CarbonReductionAction } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const CATEGORIES = [
  { label: "Renewable Energy",   icon: "sun",          color: "#f59e0b" },
  { label: "Energy Efficiency",  icon: "zap",          color: "#d97706" },
  { label: "Fertiliser Reduction", icon: "activity",   color: "#0891b2" },
  { label: "Livestock Feed",     icon: "package",      color: "#7c3aed" },
  { label: "Woodland Planting",  icon: "wind",         color: "#16a34a" },
  { label: "Wetland Restoration", icon: "droplet",     color: "#0369a1" },
  { label: "Transport Efficiency", icon: "truck",      color: "#dc2626" },
  { label: "Equipment Upgrade",  icon: "tool",         color: "#6b7280" },
  { label: "Soil Management",    icon: "layers",       color: "#92400e" },
  { label: "Waste Reduction",    icon: "trash-2",      color: "#475569" },
  { label: "Other",              icon: "more-horizontal", color: "#9ca3af" },
];

const STATUSES = [
  { v: "planned",     l: "Planned",     color: "#0369a1" },
  { v: "in-progress", l: "In Progress", color: "#d97706" },
  { v: "completed",   l: "Completed",   color: "#16a34a" },
  { v: "cancelled",   l: "Cancelled",   color: "#dc2626" },
];

const TARGET_SOURCES = [
  "Carbon audit report",
  "Scheme requirement document",
  "Internal target",
  "Advisor recommendation",
  "Other",
];

const FUNDING_TYPES = [
  "Own farm funds",
  "Government grant",
  "Agri-environment scheme",
  "Third-party / charity funding",
  "Loan / finance",
];

const CONTRACTOR_TYPES = [
  "External contractor / firm",
  "Internal staff member",
  "Not yet confirmed",
];

const YEARS = Array.from({ length: new Date().getFullYear() - 2014 + 6 }, (_, i) =>
  String(new Date().getFullYear() + 5 - i)
);

export default function CarbonReductionActionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [actionTitle, setActionTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("planned");
  const [targetSourceType, setTargetSourceType] = useState("");
  const [targetReductionPct, setTargetReductionPct] = useState("");
  const [targetYear, setTargetYear] = useState(String(new Date().getFullYear() + 1));
  const [fundingType, setFundingType] = useState("Own farm funds");
  const [fundingGrantName, setFundingGrantName] = useState("");
  const [fundingGrantReference, setFundingGrantReference] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [contractorType, setContractorType] = useState("");
  const [contractorName, setContractorName] = useState("");
  const [contractorCompany, setContractorCompany] = useState("");
  const [notes, setNotes] = useState("");

  const showGrantFields = fundingType !== "Own farm funds" && fundingType !== "Loan / finance";
  const isExternalContractor = contractorType === "External contractor / firm";

  const handleSave = async () => {
    if (!actionTitle.trim()) { Alert.alert("Required", "Please enter an action title."); return; }
    if (!category) { Alert.alert("Required", "Please select a category."); return; }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const record: CarbonReductionAction = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      actionTitle: actionTitle.trim(),
      category,
      status,
      targetSourceType,
      targetReductionPct: targetReductionPct.trim(),
      targetYear,
      fundingType,
      fundingGrantName: fundingGrantName.trim(),
      fundingGrantReference: fundingGrantReference.trim(),
      responsiblePerson: responsiblePerson.trim(),
      contractorType,
      contractorName: contractorName.trim(),
      contractorCompany: contractorCompany.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.CARBON_REDUCTION_ACTIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Reduction action saved and queued for sync.", [
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
            <Text style={styles.title}>Carbon Reduction Action</Text>
            <Text style={styles.subtitle}>Log a planned or in-progress reduction measure</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ── Action details ── */}
          <Input label="Action Title *" value={actionTitle} onChangeText={setActionTitle} placeholder="e.g. Install solar PV — 50 kW system" />

          <Text style={styles.sectionTitle}>Category *</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(c => (
              <Pressable
                key={c.label}
                onPress={() => setCategory(c.label)}
                style={[styles.categoryCard, category === c.label && { borderColor: c.color, backgroundColor: c.color + "15" }]}
              >
                <Feather name={c.icon as any} size={16} color={category === c.label ? c.color : colors.textSecondary} />
                <Text style={[styles.categoryLabel, category === c.label && { color: c.color, fontFamily: fonts.semiBold }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.chipRow}>
            {STATUSES.map(s => (
              <Pressable
                key={s.v}
                onPress={() => setStatus(s.v)}
                style={[styles.chip, status === s.v && { borderColor: s.color, backgroundColor: s.color + "15" }]}
              >
                <Text style={[styles.chipText, status === s.v && { color: s.color, fontFamily: fonts.semiBold }]}>{s.l}</Text>
              </Pressable>
            ))}
          </View>

          {/* ── Target ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Target</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Reduction Target (%)" value={targetReductionPct} onChangeText={setTargetReductionPct} keyboardType="decimal-pad" placeholder="e.g. 20" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Target Year</Text>
              <View style={styles.chipRowSmall}>
                {YEARS.slice(0, 6).map(y => (
                  <Pressable key={y} onPress={() => setTargetYear(y)} style={[styles.chipSmall, targetYear === y && styles.chipSmallActive]}>
                    <Text style={[styles.chipTextSmall, targetYear === y && styles.chipTextSmallActive]}>{y}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Target Source</Text>
          <View style={styles.chipRow}>
            {TARGET_SOURCES.map(s => (
              <Pressable key={s} onPress={() => setTargetSourceType(s)} style={[styles.chip, targetSourceType === s && styles.chipActive]}>
                <Text style={[styles.chipText, targetSourceType === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          {/* ── Funding ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Funding</Text>
          <View style={styles.chipRow}>
            {FUNDING_TYPES.map(f => (
              <Pressable key={f} onPress={() => setFundingType(f)} style={[styles.chip, fundingType === f && styles.chipActive]}>
                <Text style={[styles.chipText, fundingType === f && styles.chipTextActive]}>{f}</Text>
              </Pressable>
            ))}
          </View>
          {showGrantFields && (
            <>
              <Input label="Grant / Scheme Name" value={fundingGrantName} onChangeText={setFundingGrantName} placeholder="e.g. Farming Investment Fund" />
              <Input label="Grant Reference" value={fundingGrantReference} onChangeText={setFundingGrantReference} placeholder="e.g. FIF-2024-XXXXX" />
            </>
          )}

          {/* ── People & Contractor ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Responsible Person</Text>
          <LookupPicker label="Name" options={staffOptions} value={responsiblePerson} onSelect={(_id, l) => setResponsiblePerson(l)} allowFreeText />

          <Text style={styles.sectionTitle}>Contractor</Text>
          <View style={styles.chipRow}>
            {CONTRACTOR_TYPES.map(t => (
              <Pressable key={t} onPress={() => setContractorType(t)} style={[styles.chip, contractorType === t && styles.chipActive]}>
                <Text style={[styles.chipText, contractorType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
          {isExternalContractor && (
            <>
              <Input label="Contractor Name" value={contractorName} onChangeText={setContractorName} placeholder="Individual contact name" />
              <Input label="Company / Organisation" value={contractorCompany} onChangeText={setContractorCompany} placeholder="Company name" />
            </>
          )}

          {/* ── Notes ── */}
          <View style={styles.divider} />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Context, assumptions, linked documents…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Reduction Action"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryCard: { width: "31%", alignItems: "center", gap: 3, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.text, textAlign: "center" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  chipRowSmall: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chipSmall: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSmallActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipTextSmall: { fontFamily: fonts.medium, fontSize: 11, color: colors.text },
  chipTextSmallActive: { color: colors.primary },
  row: { flexDirection: "row", gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  saveButton: { marginTop: spacing.lg },
});
