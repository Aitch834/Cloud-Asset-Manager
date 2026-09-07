import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch, isAbortError } from "@/lib/apiFetch";

// ── Soil type options ─────────────────────────────────────────────────────────
/** Seven MAFF/AHDB texture classes — same set as the dashboard Field dialog */
const SOIL_TYPE_OPTIONS: { value: string; label: string; awcMm: number }[] = [
  { value: "light_sandy", label: "Light Sandy", awcMm: 90 },
  { value: "sandy_loam",  label: "Sandy Loam",  awcMm: 120 },
  { value: "medium_loam", label: "Medium Loam", awcMm: 150 },
  { value: "silty_loam",  label: "Silty Loam",  awcMm: 155 },
  { value: "clay_loam",   label: "Clay Loam",   awcMm: 160 },
  { value: "heavy_clay",  label: "Heavy Clay",  awcMm: 175 },
  { value: "peat",        label: "Peat",        awcMm: 200 },
];

interface ApiField {
  id: number;
  name: string;
  soilType?: string | null;
  areaHectares?: string | number | null;
  computedFarmableAreaHa?: string | number | null;
  isActive?: boolean;
}

function soilLabel(value?: string | null): string {
  if (!value) return "Not set";
  const match = SOIL_TYPE_OPTIONS.find(o => o.value === value);
  return match ? match.label : value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function areaDisplay(field: ApiField): string | null {
  const ha =
    field.computedFarmableAreaHa != null
      ? Number(field.computedFarmableAreaHa)
      : field.areaHectares != null
      ? Number(field.areaHectares)
      : null;
  if (ha == null || isNaN(ha)) return null;
  return `${ha.toFixed(2)} ha`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FieldEditScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;
  const { fieldId: fieldIdParam } = useLocalSearchParams<{ fieldId?: string }>();

  const [fields, setFields] = useState<ApiField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expand / edit state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedSoilType, setSelectedSoilType] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // ── Load fields ────────────────────────────────────────────────────────────
  const loadFields = useCallback(async (signal?: AbortSignal) => {
    if (!farmId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/fields`, { signal });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json() as { records?: ApiField[]; fields?: ApiField[] };
      const raw: ApiField[] = (data.records ?? data.fields ?? []) as ApiField[];
      setFields(raw.filter(f => f.isActive !== false));
    } catch (e: unknown) {
      if (!isAbortError(e)) {
        setError(e instanceof Error ? e.message : "Could not load fields");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    const controller = new AbortController();
    void loadFields(controller.signal);
    return () => controller.abort();
  }, [loadFields]);

  // ── Auto-expand field from route param (one-shot per param value) ──────────
  // Track which fieldId param value we have already consumed so that subsequent
  // `fields` updates (e.g. from setFields inside saveSoilType) do not re-open
  // a row the user or a save just intentionally closed.
  const autoExpandedForParam = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!fieldIdParam || fields.length === 0) return;
    // Already handled this param value — don't re-expand on local field updates
    if (autoExpandedForParam.current === fieldIdParam) return;
    const targetId = Number(fieldIdParam);
    if (isNaN(targetId)) return;
    const match = fields.find(f => f.id === targetId);
    if (match) {
      autoExpandedForParam.current = fieldIdParam;
      setExpandedId(targetId);
      setSelectedSoilType(match.soilType ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldIdParam, fields]);

  // ── Expand a field row ─────────────────────────────────────────────────────
  const toggleExpand = (field: ApiField) => {
    Haptics.selectionAsync();
    if (expandedId === field.id) {
      setExpandedId(null);
    } else {
      setExpandedId(field.id);
      setSelectedSoilType(field.soilType ?? "");
    }
  };

  // ── Save soil type ─────────────────────────────────────────────────────────
  const saveSoilType = async (field: ApiField) => {
    if (!farmId) return;
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soilType: selectedSoilType || null }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Server returned ${res.status}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Update local list
      setFields(prev => prev.map(f =>
        f.id === field.id ? { ...f, soilType: selectedSoilType || null } : f
      ));
      setExpandedId(null);
    } catch (e: unknown) {
      Alert.alert("Save Failed", e instanceof Error ? e.message : "Could not save soil type. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Field Register</Text>
          <Text style={styles.subtitle}>Set soil type for each field</Text>
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centreText}>Loading fields…</Text>
        </View>
      ) : error ? (
        <View style={styles.centre}>
          <Feather name="wifi-off" size={40} color={colors.border} />
          <Text style={styles.centreTitle}>Could not load fields</Text>
          <Text style={styles.centreText}>{error}</Text>
          <Pressable onPress={() => { void loadFields(); }} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : fields.length === 0 ? (
        <View style={styles.centre}>
          <Feather name="map" size={40} color={colors.border} />
          <Text style={styles.centreTitle}>No fields found</Text>
          <Text style={styles.centreText}>
            Add fields in the web dashboard or by recording boundaries on the Map tab.
          </Text>
        </View>
      ) : (
        <FlatList
          data={fields}
          keyExtractor={f => String(f.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const expanded = expandedId === item.id;
            const area = areaDisplay(item);
            return (
              <View
                testID={`field-register-card-${item.id}`}
                accessibilityState={{ expanded }}
                style={[styles.fieldCard, expanded && styles.fieldCardExpanded]}
              >
                {/* Row header — tap to expand */}
                <Pressable style={styles.fieldRow} onPress={() => toggleExpand(item)}>
                  <View style={styles.fieldIcon}>
                    <Feather name="map-pin" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldName}>{item.name}</Text>
                    <Text style={styles.fieldMeta}>
                      {soilLabel(item.soilType)}
                      {area ? ` · ${area}` : ""}
                    </Text>
                  </View>
                  <Feather
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>

                {/* Expanded edit panel */}
                {expanded && (
                  <View style={styles.editPanel}>
                    <Text style={styles.soilPickerLabel}>Soil Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soilScrollRow} contentContainerStyle={styles.soilScrollContent}>
                      {SOIL_TYPE_OPTIONS.map(opt => (
                        <Pressable
                          key={opt.value}
                          testID={`field-register-soil-chip-${opt.value}`}
                          accessibilityState={{ selected: selectedSoilType === opt.value }}
                          style={[styles.soilChip, selectedSoilType === opt.value && styles.soilChipSelected]}
                          onPress={() => {
                            Haptics.selectionAsync();
                            setSelectedSoilType(v => v === opt.value ? "" : opt.value);
                          }}
                        >
                          <Text style={[styles.soilChipText, selectedSoilType === opt.value && styles.soilChipTextSelected]}>
                            {opt.label}
                          </Text>
                          <Text style={[styles.soilChipMeta, selectedSoilType === opt.value && styles.soilChipMetaSelected]}>
                            {opt.awcMm} mm
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                    {(() => {
                      const sel = SOIL_TYPE_OPTIONS.find(o => o.value === selectedSoilType);
                      return sel ? (
                        <Text style={styles.awcHint}>Holds ~{sel.awcMm} mm available water</Text>
                      ) : null;
                    })()}
                    <View style={styles.editActions}>
                      <Button
                        title="Cancel"
                        variant="outline"
                        onPress={() => setExpandedId(null)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        title={saving ? "Saving…" : "Save"}
                        icon="check"
                        onPress={() => saveSoilType(item)}
                        style={{ flex: 1 }}
                        disabled={saving}
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  centreTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: "center",
  },
  centreText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  fieldCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  fieldCardExpanded: {
    borderColor: colors.primary,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  fieldMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  soilPickerLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  soilScrollRow: {
    marginBottom: spacing.md,
  },
  soilScrollContent: {
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  soilChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  soilChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  soilChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  soilChipTextSelected: {
    color: colors.primary,
  },
  soilChipMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  soilChipMetaSelected: {
    color: colors.primary + "cc",
  },
  awcHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  editActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
