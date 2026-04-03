import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
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
import { useApiSires, type ApiSire } from "@/lib/hooks/useApiSires";

const SPECIES_OPTIONS = ["Cattle", "Sheep", "Pig", "Goat", "Other"];
const OWNERSHIP_OPTIONS = [
  { key: "owned", label: "Owned — permanently on farm" },
  { key: "hired_in", label: "Hired In — seasonal" },
  { key: "loaned", label: "Loaned — temporary" },
];
const BVD_OPTIONS = ["Tested Negative", "Vaccinated", "Not Tested"];

type FormState = {
  name: string;
  species: string;
  breed: string;
  tagNumber: string;
  passportNumber: string;
  dateOfBirth: string;
  ownershipType: string;
  supplierName: string;
  supplierContact: string;
  hireStartDate: string;
  hireEndDate: string;
  bvdStatus: string;
  scrapieGenotype: string;
  fertilityTestDate: string;
  fertilityTestResult: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "", species: "Cattle", breed: "", tagNumber: "", passportNumber: "",
  dateOfBirth: "", ownershipType: "owned",
  supplierName: "", supplierContact: "", hireStartDate: "", hireEndDate: "",
  bvdStatus: "", scrapieGenotype: "", fertilityTestDate: "", fertilityTestResult: "", notes: "",
};

function ChipRow<T extends string>({ options, value, onChange, labelMap }: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labelMap?: Record<string, string>;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map(o => (
        <Pressable key={o} onPress={() => onChange(o)} style={[styles.chip, value === o && styles.chipActive]}>
          <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{labelMap?.[o] ?? o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function SireRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { sires, loading, fromCache, error } = useApiSires(currentFarm?.id ? String(currentFarm.id) : undefined);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const isHiredOrLoaned = form.ownershipType === "hired_in" || form.ownershipType === "loaned";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter a name for the sire.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!apiDomain || !currentFarm?.id) throw new Error("Not connected");
      const body: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(form)) body[k] = v.trim() || null;
      const res = await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/sires`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Alert.alert("Saved", `${form.name} has been added to the sire register.`, [
        { text: "Add Another", onPress: () => setForm(EMPTY_FORM) },
        { text: "Done", onPress: () => setShowForm(false) },
      ]);
    } catch (err) {
      Alert.alert("Error", "Could not save to server. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const ownershipLabel: Record<string, string> = { owned: "Owned", hired_in: "Hired In", loaned: "Loaned" };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Sires &amp; Rams Register</Text>
            <Text style={styles.subtitle}>Bulls, rams, and hired-in sires</Text>
          </View>
          {!showForm && (
            <Button title="Add Sire" onPress={() => { setForm(EMPTY_FORM); setShowForm(true); }} />
          )}
        </View>

        {showForm ? (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionTitle}>Identity</Text>
            <Input label="Name *" value={form.name} onChangeText={v => setField("name", v)} placeholder="e.g. Oakfield Commander" />

            <Text style={styles.label}>Species *</Text>
            <ChipRow options={SPECIES_OPTIONS as (typeof SPECIES_OPTIONS)[number][]} value={form.species} onChange={v => setField("species", v)} />

            <Input label="Breed" value={form.breed} onChangeText={v => setField("breed", v)} placeholder={({ Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" } as Record<string, string>)[form.species] ?? "e.g. enter breed"} />
            <Input label="Ear Tag Number" value={form.tagNumber} onChangeText={v => setField("tagNumber", v)} placeholder="e.g. UK141092 12345" />
            <Input label="Passport Number" value={form.passportNumber} onChangeText={v => setField("passportNumber", v)} placeholder="Cattle passport / flock no." />
            <Input label="Date of Birth" value={form.dateOfBirth} onChangeText={v => setField("dateOfBirth", v)} placeholder="YYYY-MM-DD" />

            <Text style={styles.sectionTitle}>Ownership</Text>
            <View style={styles.chipRow}>
              {OWNERSHIP_OPTIONS.map(o => (
                <Pressable key={o.key} onPress={() => setField("ownershipType", o.key)} style={[styles.chip, form.ownershipType === o.key && styles.chipActive]}>
                  <Text style={[styles.chipText, form.ownershipType === o.key && styles.chipTextActive]}>{o.label}</Text>
                </Pressable>
              ))}
            </View>

            {isHiredOrLoaned && (
              <>
                <Input label="Supplier / Owner Name" value={form.supplierName} onChangeText={v => setField("supplierName", v)} placeholder="Farm or stud name" />
                <Input label="Supplier Contact" value={form.supplierContact} onChangeText={v => setField("supplierContact", v)} placeholder="Phone or email" />
                <Input label="Arrived on Farm" value={form.hireStartDate} onChangeText={v => setField("hireStartDate", v)} placeholder="YYYY-MM-DD" />
                <Input label="Expected Return Date" value={form.hireEndDate} onChangeText={v => setField("hireEndDate", v)} placeholder="YYYY-MM-DD" />
              </>
            )}

            <Text style={styles.sectionTitle}>Health Status</Text>
            {form.species === "Cattle" && (
              <>
                <Text style={styles.label}>BVD Status</Text>
                <ChipRow options={BVD_OPTIONS as (typeof BVD_OPTIONS)[number][]} value={form.bvdStatus} onChange={v => setField("bvdStatus", v)} />
              </>
            )}
            {form.species === "Sheep" && (
              <Input label="Scrapie Genotype" value={form.scrapieGenotype} onChangeText={v => setField("scrapieGenotype", v)} placeholder="e.g. ARR/ARR" />
            )}
            <Input label="Fertility Test Date" value={form.fertilityTestDate} onChangeText={v => setField("fertilityTestDate", v)} placeholder="YYYY-MM-DD" />
            <Input label="Fertility Test Result" value={form.fertilityTestResult} onChangeText={v => setField("fertilityTestResult", v)} placeholder="e.g. Satisfactory" />

            <Input label="Notes" value={form.notes} onChangeText={v => setField("notes", v)} placeholder="Any additional notes…" multiline numberOfLines={3} />

            <View style={styles.formButtons}>
              <Button title="Cancel" onPress={() => setShowForm(false)} variant="secondary" style={{ flex: 1 }} />
              <Button title={saving ? "Saving…" : "Save Sire"} onPress={handleSave} disabled={saving || !form.name.trim()} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={loading} tintColor={colors.primary} onRefresh={() => {}} />}
          >
            {fromCache && (
              <View style={styles.offlineBanner}>
                <Feather name="wifi-off" size={14} color={colors.accent} />
                <Text style={styles.offlineText}>Offline — showing cached data</Text>
              </View>
            )}
            {error && (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={styles.errorText}>Could not load register — {error}</Text>
              </View>
            )}

            {sires.length === 0 && !loading ? (
              <View style={styles.empty}>
                <Feather name="target" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>No sires registered</Text>
                <Text style={styles.emptyText}>Tap "Add Sire" to register your first bull or ram.</Text>
              </View>
            ) : (
              sires.map(s => (
                <View key={s.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardIcon}>
                      <Feather name="target" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName}>{s.name}</Text>
                      <Text style={styles.cardMeta}>{[s.species, s.breed].filter(Boolean).join(" · ")}</Text>
                    </View>
                    <View style={[styles.badge, s.ownershipType === "owned" ? styles.badgeGreen : s.ownershipType === "hired_in" ? styles.badgeBlue : styles.badgeYellow]}>
                      <Text style={[styles.badgeText, s.ownershipType === "owned" ? styles.badgeTextGreen : s.ownershipType === "hired_in" ? styles.badgeTextBlue : styles.badgeTextYellow]}>
                        {ownershipLabel[s.ownershipType] ?? s.ownershipType}
                      </Text>
                    </View>
                  </View>
                  {(s.tagNumber || s.passportNumber) && (
                    <Text style={styles.cardDetail}>Tag: {s.tagNumber ?? "—"}{s.passportNumber ? ` · Passport: ${s.passportNumber}` : ""}</Text>
                  )}
                  {s.species === "Cattle" && s.bvdStatus && (
                    <Text style={styles.cardDetail}>BVD: {s.bvdStatus}</Text>
                  )}
                  {s.species === "Sheep" && s.scrapieGenotype && (
                    <Text style={styles.cardDetail}>Scrapie: {s.scrapieGenotype}</Text>
                  )}
                  {s.supplierName && (
                    <Text style={styles.cardDetail}>From: {s.supplierName}</Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        )}
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
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  formButtons: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.warningBg, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  offlineText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.accent },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.errorBg ?? "#fff1f2", padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.error },
  empty: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.xs },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primaryMuted + "20", alignItems: "center", justifyContent: "center" },
  cardName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  cardMeta: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  cardDetail: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeBlue: { backgroundColor: "#dbeafe" },
  badgeYellow: { backgroundColor: "#fef9c3" },
  badgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  badgeTextGreen: { color: "#166534" },
  badgeTextBlue: { color: "#1e40af" },
  badgeTextYellow: { color: "#854d0e" },
});
