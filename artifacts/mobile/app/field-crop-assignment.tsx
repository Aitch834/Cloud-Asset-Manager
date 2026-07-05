import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Platform } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet } from "@/lib/database";
import { useApiFields } from "@/lib/hooks/useApiFields";

interface AssignmentRec {
  id: number;
  fieldId: number;
  cropName?: string | null;
  variety?: string | null;
  year: number | null;
  season?: string | null;
  notes?: string | null;
  reasonTags?: string[] | null;
}

const REASON_TAG_OPTIONS = [
  "Disease/pest break",
  "Blackgrass/weed control",
  "Soil health/organic matter",
  "Market price",
  "Agronomist recommendation",
  "Rotation requirement",
  "Contract/quota commitment",
  "Other",
];

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("auth_session_token");
      if (token) return token;
    } else {
      try {
        const token = localStorage.getItem("auth_session_token");
        if (token) return token;
      } catch { }
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch { }
  return "";
}

async function authedFetch(path: string, options: RequestInit = {}) {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-tenant-slug": tenantSlug,
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`https://${apiDomain}${path}`, { ...options, headers });
}

export default function FieldCropAssignmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;
  const { fields, loading: fieldsLoading } = useApiFields(farmId);

  const currentYear = new Date().getFullYear();
  const YEARS = useMemo(() => Array.from({ length: 9 }, (_, i) => currentYear - 4 + i), [currentYear]);

  const [fieldName, setFieldName] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [assignments, setAssignments] = useState<AssignmentRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [reasonTags, setReasonTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const res = await authedFetch(`/api/farms/${farmId}/field-crops`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAssignments((data.records ?? []) as AssignmentRec[]);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedField = fields.find((f) => f.name === fieldName);
  const currentAssignment = selectedField
    ? assignments.find((a) => a.fieldId === selectedField.id && a.year === selectedYear)
    : undefined;

  useEffect(() => {
    setNotes(currentAssignment?.notes ?? "");
    setReasonTags(currentAssignment?.reasonTags ?? []);
  }, [currentAssignment?.id]);

  const toggleTag = (tag: string) => {
    Haptics.selectionAsync();
    setReasonTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = async () => {
    if (!farmId || !currentAssignment) return;
    setSaving(true);
    try {
      const res = await authedFetch(`/api/farms/${farmId}/field-crops/${currentAssignment.id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes, reasonTags }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await load();
    } catch {
      Alert.alert("Failed to save", "Could not save your changes. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Crop Rotation Notes</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Field &amp; Year</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Field</Text>
              <FieldPicker fields={fields} loading={fieldsLoading} value={fieldName} onChange={setFieldName} error={null} label="Field" allowScan={false} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Year</Text>
              <View style={styles.chipWrap}>
                {YEARS.map((y) => (
                  <Pressable
                    key={y}
                    style={[styles.chip, selectedYear === y && styles.chipSelected]}
                    onPress={() => setSelectedYear(y)}
                  >
                    <Text style={[styles.chipText, selectedYear === y && styles.chipTextSelected]}>{y}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {loading ? (
            <View style={styles.centerFill}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : !selectedField ? (
            <View style={styles.placeholderCard}>
              <Feather name="map-pin" size={20} color={colors.textTertiary} />
              <Text style={styles.placeholderText}>Select a field to view its rotation plan</Text>
            </View>
          ) : !currentAssignment ? (
            <View style={styles.placeholderCard}>
              <Feather name="info" size={20} color={colors.textTertiary} />
              <Text style={styles.placeholderText}>
                No crop assigned to {fieldName} for {selectedYear}. Assign a crop from the dashboard's Crop
                Rotation Planner first — notes and reason tags can then be added here.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.cropCard}>
                <Text style={styles.cropCardCrop}>
                  {currentAssignment.cropName}
                  {currentAssignment.variety ? ` — ${currentAssignment.variety}` : ""}
                </Text>
                {currentAssignment.season ? <Text style={styles.cropCardSeason}>{currentAssignment.season}</Text> : null}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rotation Reason</Text>
                <Text style={styles.hint}>Why was this crop chosen for this field this year?</Text>
                <View style={styles.chipWrap}>
                  {REASON_TAG_OPTIONS.map((tag) => {
                    const active = reasonTags.includes(tag);
                    return (
                      <Pressable
                        key={tag}
                        style={[styles.chip, active && styles.chipSelected]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextSelected]}>{tag}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Input
                  placeholder="Any additional rotation notes…"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Button title="Save Changes" onPress={handleSave} loading={saving} />
            </>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  field: { gap: spacing.xs },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
  centerFill: { alignItems: "center", justifyContent: "center", padding: spacing.lg },
  placeholderCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  placeholderText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, textAlign: "center" },
  cropCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  cropCardCrop: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: "#166534" },
  cropCardSeason: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#166534", marginTop: 2 },
});
