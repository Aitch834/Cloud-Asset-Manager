import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { kvGet } from "@/lib/database";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch {}
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      token = raw ? JSON.parse(raw) : null;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw);
      const slug = farm.tenantSlug || farm.slug || "";
      if (slug) headers["x-tenant-slug"] = slug;
    }
  } catch {}
  return headers;
}

type PATResult = "pass" | "fail" | "advisory";

const RESULT_OPTIONS: { key: PATResult; label: string; sub: string; colour: string; bg: string }[] = [
  { key: "pass",     label: "Pass",     sub: "Appliance is safe to use",              colour: "#16a34a", bg: "#dcfce7" },
  { key: "advisory", label: "Advisory", sub: "Safe but action recommended",           colour: "#d97706", bg: "#fef3c7" },
  { key: "fail",     label: "Fail",     sub: "Unsafe — remove from service",          colour: "#dc2626", bg: "#fee2e2" },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextYearStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

interface PatEquipmentDetail {
  id: number;
  itemName: string;
  assetNumber: string | null;
  make: string | null;
  model: string | null;
  serialNumber: string | null;
  location: string | null;
  buildingName: string | null;
  subLocation: string | null;
  nextTestDue: string | null;
  lastTestDate: string | null;
  status: string;
}

export default function PatTestScanScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const params = useLocalSearchParams<{ equipmentId: string; equipmentName: string }>();

  const equipmentId = params.equipmentId ? parseInt(params.equipmentId) : null;
  const equipmentNameParam = params.equipmentName ?? "PAT Appliance";

  const [equipment, setEquipment] = useState<PatEquipmentDetail | null>(null);
  const [loadingEq, setLoadingEq] = useState(true);

  const [testDate, setTestDate] = useState(todayStr());
  const [testerName, setTesterName] = useState("");
  const [testerCompany, setTesterCompany] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [result, setResult] = useState<PATResult>("pass");
  const [nextDueDate, setNextDueDate] = useState(nextYearStr());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentFarm || !equipmentId) { setLoadingEq(false); return; }
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
        const res = await fetch(
          `https://${apiDomain}/api/farms/${currentFarm.id}/workshop/pat-equipment/single/${equipmentId}`,
          { headers }
        );
        if (res.ok) {
          const data = await res.json();
          setEquipment(data);
        }
      } catch {
        // non-blocking; we still show the form using the name from params
      } finally {
        setLoadingEq(false);
      }
    })();
  }, [currentFarm, equipmentId]);

  async function handleSave() {
    if (!testDate.trim()) {
      Alert.alert("Required", "Please enter the test date.");
      return;
    }
    if (!testerName.trim()) {
      Alert.alert("Required", "Please enter the tester's name.");
      return;
    }
    if (!result) {
      Alert.alert("Required", "Please select a test result.");
      return;
    }
    if (!currentFarm || !equipmentId) {
      Alert.alert("Error", "Farm or equipment context is missing. Please go back and try again.");
      return;
    }

    setSaving(true);
    try {
      const headers = await getAuthHeaders();
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      const res = await fetch(
        `https://${apiDomain}/api/farms/${currentFarm.id}/workshop/pat-equipment/${equipmentId}/tests`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            testDate,
            testerName: testerName.trim() || null,
            testerCompany: testerCompany.trim() || null,
            certificateNumber: certificateNumber.trim() || null,
            result,
            nextDueDate: nextDueDate.trim() || null,
            notes: notes.trim() || null,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Server error");
      }
      Alert.alert(
        "Test Recorded",
        `PAT test result (${RESULT_OPTIONS.find(o => o.key === result)?.label}) saved for ${equipment?.itemName ?? equipmentNameParam}.`,
        [{ text: "Done", onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert("Save Failed", e instanceof Error ? e.message : "Could not save the test record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const selectedResult = RESULT_OPTIONS.find(o => o.key === result)!;
  const displayName = equipment?.itemName ?? equipmentNameParam;
  const assetNumber = equipment?.assetNumber ?? null;
  const subtitle = [equipment?.make, equipment?.model].filter(Boolean).join(" ") || null;
  const location = equipment?.buildingName
    ? equipment.subLocation ? `${equipment.buildingName} — ${equipment.subLocation}` : equipment.buildingName
    : equipment?.location ?? null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Record PAT Test</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Equipment card */}
          <View style={[styles.eqCard, { borderTopColor: "#7c3aed" }]}>
            {loadingEq ? (
              <ActivityIndicator color="#7c3aed" />
            ) : (
              <>
                <View style={styles.eqCardRow}>
                  <View style={styles.eqIconBox}>
                    <Feather name="zap" size={20} color="#7c3aed" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eqLabel}>PAT Equipment</Text>
                    <Text style={styles.eqName}>{displayName}</Text>
                    {subtitle && <Text style={styles.eqSub}>{subtitle}</Text>}
                    {location && <Text style={styles.eqSub}>{location}</Text>}
                  </View>
                </View>
                {assetNumber && (
                  <View style={styles.assetPill}>
                    <Feather name="hash" size={11} color="#7c3aed" />
                    <Text style={styles.assetText}>{assetNumber}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Test result selector */}
          <Text style={styles.sectionLabel}>Test Result</Text>
          <View style={styles.resultRow}>
            {RESULT_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => setResult(opt.key)}
                style={[
                  styles.resultCard,
                  result === opt.key && { borderColor: opt.colour, backgroundColor: opt.bg },
                ]}
              >
                <Text style={[styles.resultLabel, result === opt.key && { color: opt.colour }]}>{opt.label}</Text>
                <Text style={styles.resultSub}>{opt.sub}</Text>
              </Pressable>
            ))}
          </View>
          {result === "fail" && (
            <View style={styles.failWarning}>
              <Feather name="alert-triangle" size={14} color="#dc2626" />
              <Text style={styles.failWarningText}>A failed appliance must be taken out of service immediately and tagged accordingly.</Text>
            </View>
          )}

          {/* Form fields */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Test Details</Text>

            <Text style={styles.fieldLabel}>Test Date <Text style={styles.req}>*</Text></Text>
            <Input
              value={testDate}
              onChangeText={setTestDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Next Due Date</Text>
            <Input
              value={nextDueDate}
              onChangeText={setNextDueDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
            <Text style={styles.fieldHint}>Defaults to 12 months from today. Adjust if the engineer recommends a shorter interval.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tester / Engineer</Text>

            <Text style={styles.fieldLabel}>Tester Name <Text style={styles.req}>*</Text></Text>
            <Input
              value={testerName}
              onChangeText={setTesterName}
              placeholder="e.g. John Smith"
            />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Tester / Company</Text>
            <Input
              value={testerCompany}
              onChangeText={setTesterCompany}
              placeholder="e.g. ABC PAT Testing Ltd"
            />

            <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Certificate Number</Text>
            <Input
              value={certificateNumber}
              onChangeText={setCertificateNumber}
              placeholder="e.g. PAT-2024-00123"
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Additional Notes</Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Any observations, advisory actions required, etc."
              multiline
              numberOfLines={3}
              style={{ minHeight: 72, textAlignVertical: "top" }}
            />
          </View>

          {/* Result summary */}
          <View style={[styles.summaryBox, { borderColor: selectedResult.colour, backgroundColor: selectedResult.bg }]}>
            <Feather name="check-circle" size={16} color={selectedResult.colour} />
            <Text style={[styles.summaryText, { color: selectedResult.colour }]}>
              Submitting as <Text style={{ fontFamily: fonts.bold }}>{selectedResult.label}</Text> — {selectedResult.sub}
            </Text>
          </View>

          <Button
            title={saving ? "Saving…" : "Save PAT Test Record"}
            onPress={handleSave}
            disabled={saving}
            style={{ marginHorizontal: 0, marginTop: spacing.sm }}
          />
          <Pressable onPress={() => router.back()} style={{ alignItems: "center", marginTop: spacing.md }}>
            <Text style={styles.cancelLink}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: "#1e1e2e",
  },
  backBtn: { padding: spacing.xs, borderRadius: radius.sm },
  headerTitle: { color: "#fff", fontSize: fontSize.md, fontFamily: fonts.semiBold },

  content: { padding: spacing.lg, gap: spacing.md },

  eqCard: {
    backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md,
    borderTopWidth: 3, borderTopColor: "#7c3aed",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  eqCardRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  eqIconBox: {
    width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center",
    backgroundColor: "#ede9fe",
  },
  eqLabel: { fontSize: fontSize.xs, fontFamily: fonts.semiBold, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  eqName: { fontSize: fontSize.md, fontFamily: fonts.semiBold, color: colors.text },
  eqSub: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 1 },
  assetPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#ede9fe", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, marginTop: spacing.sm,
  },
  assetText: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: "#7c3aed", letterSpacing: 1 },

  sectionLabel: {
    fontSize: fontSize.xs, fontFamily: fonts.semiBold, color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm,
  },

  resultRow: { gap: spacing.sm },
  resultCard: {
    backgroundColor: "#fff", borderRadius: radius.md, padding: spacing.md,
    borderWidth: 2, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  resultLabel: { fontSize: fontSize.md, fontFamily: fonts.semiBold, color: colors.text, marginBottom: 2 },
  resultSub: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary },

  failWarning: {
    flexDirection: "row", alignItems: "flex-start", gap: spacing.xs,
    backgroundColor: "#fee2e2", borderRadius: radius.md, padding: spacing.sm,
  },
  failWarningText: { flex: 1, fontSize: fontSize.xs, fontFamily: fonts.regular, color: "#dc2626" },

  section: { gap: spacing.xs },
  fieldLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text },
  fieldHint: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 2 },
  req: { color: colors.error },

  summaryBox: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    borderWidth: 1.5, borderRadius: radius.md, padding: spacing.md,
  },
  summaryText: { flex: 1, fontSize: fontSize.sm, fontFamily: fonts.regular },

  cancelLink: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
});
