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
import type { CarbonAuditRecord } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const AUDIT_TOOLS = [
  "Agrecalc", "Cool Farm Tool", "Farm Carbon Toolkit",
  "AHDB Carbon Calculator", "SAC Carbon Calculator",
  "Carbon Footprint Ltd", "Arla Carbon Check",
  "Soil Association / OF&G calculator", "Bespoke consultant methodology", "Other",
];

const VERIFICATION_STATUSES = [
  "Self-assessed / unverified",
  "Internal review completed",
  "Third-party verified",
  "Certified (e.g. PAS 2060)",
];

const AUDITOR_TYPES = [
  "Internal staff member",
  "External auditor / consultant",
  "Not yet confirmed",
];

const SC_CUSTOMERS = [
  "Tesco", "Sainsbury's", "ASDA / Walmart", "M&S (Marks & Spencer)",
  "Waitrose / John Lewis Partnership", "Co-op", "Morrisons", "Aldi UK", "Lidl GB",
  "McDonald's UK", "ABP Food Group", "Cargill UK", "Müller UK", "Arla Foods UK",
  "Saputo Dairy UK", "AHDB Benchmarking", "Red Tractor Assurance",
  "LEAF (Linking Environment And Farming)", "Other",
];

const YEARS = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) =>
  String(new Date().getFullYear() + 1 - i)
);

export default function CarbonAuditScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [auditYear, setAuditYear] = useState(String(new Date().getFullYear()));
  const [auditDate, setAuditDate] = useState("");
  const [auditorType, setAuditorType] = useState("");
  const [conductedBy, setConductedBy] = useState("");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [auditorCompany, setAuditorCompany] = useState("");
  const [auditTool, setAuditTool] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [supplyChainRequirement, setSupplyChainRequirement] = useState("");
  const [certificationBody, setCertificationBody] = useState("");
  const [scope1, setScope1] = useState("");
  const [scope2, setScope2] = useState("");
  const [scope3, setScope3] = useState("");
  const [totalTonnes, setTotalTonnes] = useState("");
  const [sequestration, setSequestration] = useState("");
  const [netTonnes, setNetTonnes] = useState("");
  const [reductionTargetPct, setReductionTargetPct] = useState("");
  const [notes, setNotes] = useState("");

  const isExternal = auditorType === "External auditor / consultant";

  const calcTotal = () => {
    const s1 = parseFloat(scope1) || 0;
    const s2 = parseFloat(scope2) || 0;
    const s3 = parseFloat(scope3) || 0;
    const t = s1 + s2 + s3;
    if (t > 0) {
      setTotalTonnes(t.toFixed(3));
      const seq = parseFloat(sequestration) || 0;
      setNetTonnes((t - seq).toFixed(3));
    }
  };

  const handleSave = async () => {
    if (!auditYear) { Alert.alert("Required", "Please select the audit year."); return; }
    if (!conductedBy.trim()) { Alert.alert("Required", "Please enter who conducted the audit."); return; }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const record: CarbonAuditRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      auditYear,
      auditDate: auditDate.trim(),
      conductedBy: conductedBy.trim(),
      auditorType,
      auditorCompany: auditorCompany.trim(),
      auditTool,
      verificationStatus,
      supplyChainRequirement,
      certificationBody: certificationBody.trim(),
      totalScope1TonnesCo2e: scope1.trim(),
      totalScope2TonnesCo2e: scope2.trim(),
      totalScope3TonnesCo2e: scope3.trim(),
      totalTonnesCo2e: totalTonnes.trim(),
      sequestrationTonnesCo2e: sequestration.trim(),
      netTonnesCo2e: netTonnes.trim(),
      reductionTargetPct: reductionTargetPct.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.CARBON_AUDIT_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Carbon audit record saved and queued for sync.", [
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
            <Text style={styles.title}>Carbon Audit Record</Text>
            <Text style={styles.subtitle}>Annual farm carbon audit — auditor, tool & figures</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ── Audit overview ── */}
          <Text style={styles.sectionTitle}>Audit Year *</Text>
          <View style={styles.chipRow}>
            {YEARS.slice(0, 8).map(y => (
              <Pressable key={y} onPress={() => setAuditYear(y)} style={[styles.chip, auditYear === y && styles.chipActive]}>
                <Text style={[styles.chipText, auditYear === y && styles.chipTextActive]}>{y}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Audit Date" value={auditDate} onChangeText={setAuditDate} placeholder="DD/MM/YYYY" />

          <Text style={styles.sectionTitle}>Audit Tool / Methodology</Text>
          <View style={styles.chipRow}>
            {AUDIT_TOOLS.map(t => (
              <Pressable key={t} onPress={() => setAuditTool(t)} style={[styles.chip, auditTool === t && styles.chipActive]}>
                <Text style={[styles.chipText, auditTool === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Verification Status</Text>
          <View style={styles.chipRow}>
            {VERIFICATION_STATUSES.map(s => (
              <Pressable key={s} onPress={() => setVerificationStatus(s)} style={[styles.chip, verificationStatus === s && styles.chipActive]}>
                <Text style={[styles.chipText, verificationStatus === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Supply Chain Customer</Text>
          <View style={styles.chipRow}>
            {SC_CUSTOMERS.map(c => (
              <Pressable key={c} onPress={() => setSupplyChainRequirement(c)} style={[styles.chip, supplyChainRequirement === c && styles.chipActive]}>
                <Text style={[styles.chipText, supplyChainRequirement === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Certification Body" value={certificationBody} onChangeText={setCertificationBody} placeholder="e.g. Carbon Trust, Soil Association" />

          {/* ── Auditor ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Auditor</Text>

          <Text style={styles.fieldLabel}>Auditor Type</Text>
          <View style={styles.chipRow}>
            {AUDITOR_TYPES.map(t => (
              <Pressable key={t} onPress={() => setAuditorType(t)} style={[styles.chip, auditorType === t && styles.chipActive]}>
                <Text style={[styles.chipText, auditorType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <LookupPicker label="Conducted By" options={staffOptions} value={conductedBy} onSelect={(_id, l) => setConductedBy(l)} allowFreeText />

          {isExternal && (
            <Input label="Auditor Company / Organisation" value={auditorCompany} onChangeText={setAuditorCompany} placeholder="Company name" />
          )}

          {/* ── Emissions figures ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Emissions Figures (tCO₂e)</Text>
          <View style={styles.figuresGrid}>
            {[
              { label: "Scope 1", val: scope1, set: setScope1 },
              { label: "Scope 2", val: scope2, set: setScope2 },
              { label: "Scope 3", val: scope3, set: setScope3 },
            ].map(f => (
              <View key={f.label} style={styles.figureCell}>
                <Text style={styles.figureLabel}>{f.label}</Text>
                <Input
                  value={f.val}
                  onChangeText={v => { f.set(v); }}
                  onBlur={calcTotal}
                  keyboardType="decimal-pad"
                  placeholder="0.000"
                />
              </View>
            ))}
          </View>

          <View style={styles.calcHint}>
            <Feather name="info" size={12} color={colors.textSecondary} />
            <Text style={styles.calcHintText}>Tap outside a scope field to auto-sum Total and Net.</Text>
          </View>

          <View style={styles.figuresGrid}>
            {[
              { label: "Gross Total", val: totalTonnes, set: setTotalTonnes },
              { label: "Sequestration", val: sequestration, set: setSequestration },
              { label: "Net Total", val: netTonnes, set: setNetTonnes },
            ].map(f => (
              <View key={f.label} style={styles.figureCell}>
                <Text style={styles.figureLabel}>{f.label}</Text>
                <Input
                  value={f.val}
                  onChangeText={f.set}
                  keyboardType="decimal-pad"
                  placeholder="0.000"
                />
              </View>
            ))}
          </View>

          <Input label="Reduction Target (%)" value={reductionTargetPct} onChangeText={setReductionTargetPct} keyboardType="decimal-pad" placeholder="e.g. 20" />

          {/* ── Notes ── */}
          <View style={styles.divider} />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Methodology caveats, boundary assumptions…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Carbon Audit"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  figuresGrid: { flexDirection: "row", gap: spacing.sm },
  figureCell: { flex: 1 },
  figureLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  calcHint: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  calcHintText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  saveButton: { marginTop: spacing.lg },
});
