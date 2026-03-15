import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { getList, STORAGE_KEYS } from "@/lib/storage";
import type { ComplianceForm } from "@/lib/types";

const FORM_TEMPLATES = [
  { id: "rt-crop-protection", title: "Crop Protection Product Store", icon: "shield" as const, category: "Arable" },
  { id: "rt-seed-treatment", title: "Seed Treatment Records", icon: "layers" as const, category: "Arable" },
  { id: "rt-fertiliser", title: "Fertiliser Application", icon: "droplet" as const, category: "Arable" },
  { id: "rt-harvest", title: "Harvest Quality Checks", icon: "check-square" as const, category: "Arable" },
  { id: "rt-biosecurity", title: "Biosecurity Assessment", icon: "lock" as const, category: "General" },
  { id: "rt-waste", title: "Waste Management", icon: "trash-2" as const, category: "General" },
  { id: "rt-water", title: "Water Usage & Protection", icon: "droplet" as const, category: "General" },
  { id: "rt-health-safety", title: "Health & Safety Review", icon: "heart" as const, category: "General" },
  { id: "rt-cleaning-disinfection", title: "Cleaning & Disinfection", icon: "wind" as const, category: "General" },
  { id: "rt-pest-control", title: "Pest Control Check", icon: "target" as const, category: "General" },
  { id: "rt-animal-welfare", title: "Animal Welfare Assessment", icon: "activity" as const, category: "Livestock" },
  { id: "rt-feed-storage", title: "Feed Storage Inspection", icon: "package" as const, category: "Livestock" },
  { id: "rt-medicine", title: "Medicine Record Review", icon: "thermometer" as const, category: "Livestock" },
  { id: "rt-medicine-administered", title: "Medicine Administered", icon: "plus-circle" as const, category: "Livestock" },
  { id: "rt-livestock-movement", title: "Livestock Movement Record", icon: "arrow-right" as const, category: "Livestock" },
  { id: "rt-transport", title: "Livestock Transport Check", icon: "truck" as const, category: "Livestock" },
  { id: "rt-water-test", title: "Water Test Result", icon: "droplet" as const, category: "General" },
];

type FilterTab = "all" | "draft" | "completed" | "templates";

export default function FormsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [forms, setForms] = useState<ComplianceForm[]>([]);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadForms = useCallback(async () => {
    const farmForms = await getList<ComplianceForm>(STORAGE_KEYS.COMPLIANCE_FORMS, currentFarm?.id);
    setForms(farmForms);
  }, [currentFarm?.id]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadForms();
    setRefreshing(false);
  }, [loadForms]);

  const filteredForms =
    filter === "draft"
      ? forms.filter((f) => f.status === "draft")
      : filter === "completed"
        ? forms.filter((f) => f.status === "completed" || f.status === "submitted")
        : forms;

  const startForm = (templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/compliance-form", params: { templateId } });
  };

  const filters: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Drafts" },
    { key: "completed", label: "Completed" },
    { key: "templates", label: "Templates" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Compliance Forms</Text>
        <Text style={styles.subtitle}>Red Tractor scheme documentation</Text>
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filter === "templates" ? (
        <FlatList
          data={FORM_TEMPLATES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => startForm(item.id)}
              style={({ pressed }) => [
                styles.templateCard,
                { opacity: pressed ? 0.95 : 1 },
              ]}
            >
              <View style={styles.templateIcon}>
                <Feather name={item.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.templateContent}>
                <Text style={styles.templateTitle}>{item.title}</Text>
                <Text style={styles.templateCategory}>{item.category}</Text>
              </View>
              <Feather name="plus" size={18} color={colors.primary} />
            </Pressable>
          )}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      ) : (
        <FlatList
          data={filteredForms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: "/compliance-form", params: { formId: item.id } })}
              style={({ pressed }) => [
                styles.formCard,
                { opacity: pressed ? 0.95 : 1 },
              ]}
            >
              <View style={styles.formCardHeader}>
                <Text style={styles.formTitle}>{item.formTitle}</Text>
                <Badge
                  text={item.status}
                  variant={
                    item.status === "completed" || item.status === "submitted"
                      ? "success"
                      : item.status === "draft"
                        ? "warning"
                        : "neutral"
                  }
                />
              </View>
              <Text style={styles.formMeta}>
                {item.completedBy ? `By ${item.completedBy}` : "Not started"} {"\u00B7"}{" "}
                {new Date(item.createdAt).toLocaleDateString("en-GB")}
              </Text>
              {!item.synced && (
                <View style={styles.unsyncedRow}>
                  <View style={styles.unsyncedDot} />
                  <Text style={styles.unsyncedText}>Not synced</Text>
                </View>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="file-text"
              title="No Forms Yet"
              message="Start a compliance form from the templates to begin documenting your Red Tractor compliance."
              actionTitle="View Templates"
              onAction={() => setFilter("templates")}
            />
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.textInverse,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  templateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted + "33",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  templateCategory: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  formCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  formTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  formMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  unsyncedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  unsyncedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  unsyncedText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
});
