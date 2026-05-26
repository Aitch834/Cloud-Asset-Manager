import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

type ChecklistMeta = {
  id: string;
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  category: "Arable" | "Livestock" | "General";
  itemCount: number;
};

const CHECKLISTS: ChecklistMeta[] = [
  { id: "rt-crop-protection",       title: "Crop Protection Store",      icon: "shield",       category: "Arable",    itemCount: 6 },
  { id: "rt-seed-treatment",        title: "Seed Treatment Records",     icon: "layers",       category: "Arable",    itemCount: 3 },
  { id: "rt-fertiliser",            title: "Fertiliser Application",     icon: "droplet",      category: "Arable",    itemCount: 4 },
  { id: "rt-harvest",               title: "Harvest Quality Checks",     icon: "check-square", category: "Arable",    itemCount: 4 },
  { id: "rt-biosecurity",           title: "Biosecurity Assessment",     icon: "lock",         category: "General",   itemCount: 6 },
  { id: "rt-waste",                 title: "Waste Management",           icon: "trash-2",      category: "General",   itemCount: 3 },
  { id: "rt-water",                 title: "Water Usage & Protection",   icon: "droplet",      category: "General",   itemCount: 3 },
  { id: "rt-health-safety",         title: "Health & Safety Review",     icon: "heart",        category: "General",   itemCount: 5 },
  { id: "rt-cleaning-disinfection", title: "Cleaning & Disinfection",   icon: "wind",         category: "General",   itemCount: 8 },
  { id: "rt-pest-control",          title: "Pest Control Check",         icon: "target",       category: "General",   itemCount: 7 },
  { id: "rt-water-test",            title: "Water Test Result",          icon: "droplet",      category: "General",   itemCount: 6 },
  { id: "rt-animal-welfare",        title: "Animal Welfare Assessment",  icon: "activity",     category: "Livestock", itemCount: 4 },
  { id: "rt-feed-storage",          title: "Feed Storage Inspection",    icon: "package",      category: "Livestock", itemCount: 3 },
  { id: "rt-medicine",              title: "Medicine Record Review",     icon: "thermometer",  category: "Livestock", itemCount: 4 },
  { id: "rt-medicine-administered", title: "Medicine Administered",      icon: "plus-circle",  category: "Livestock", itemCount: 8 },
  { id: "rt-livestock-movement",    title: "Livestock Movement Record",  icon: "arrow-right",  category: "Livestock", itemCount: 8 },
  { id: "rt-transport",             title: "Livestock Transport Check",  icon: "truck",        category: "Livestock", itemCount: 3 },
];

const CATEGORIES: Array<"Arable" | "General" | "Livestock"> = ["Arable", "General", "Livestock"];

const CATEGORY_COLOURS: Record<string, { bg: string; text: string }> = {
  Arable:    { bg: "#f0fdf4", text: "#15803d" },
  General:   { bg: "#eff6ff", text: "#1d4ed8" },
  Livestock: { bg: "#fef3c7", text: "#92400e" },
};

export default function ChecklistsScreen() {
  const insets = useSafeAreaInsets();

  const openChecklist = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/compliance-form", params: { templateId: id } });
  };

  type Section = { type: "header"; category: string } | { type: "item"; item: ChecklistMeta };
  const sections: Section[] = [];
  for (const cat of CATEGORIES) {
    const items = CHECKLISTS.filter(c => c.category === cat);
    if (items.length === 0) continue;
    sections.push({ type: "header", category: cat });
    items.forEach(item => sections.push({ type: "item", item }));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Checklists</Text>
        <Text style={styles.subtitle}>Quick-reference guides for walkrounds &amp; inspections</Text>
      </View>

      <View style={styles.hintBanner}>
        <Feather name="info" size={13} color="#1d4ed8" style={{ marginTop: 1 }} />
        <Text style={styles.hintText}>
          These are aide memoires only — tick items as you walk round, then record completed work in the relevant Farm Trac module.
        </Text>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(s, i) => s.type === "header" ? `hdr-${s.category}` : `item-${s.item.id}-${i}`}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        renderItem={({ item: s }) => {
          if (s.type === "header") {
            const col = CATEGORY_COLOURS[s.category];
            return (
              <View style={styles.sectionHeader}>
                <View style={[styles.categoryPill, { backgroundColor: col.bg }]}>
                  <Text style={[styles.categoryPillText, { color: col.text }]}>{s.category}</Text>
                </View>
              </View>
            );
          }
          const { item } = s;
          return (
            <Pressable
              onPress={() => openChecklist(item.id)}
              style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
            >
              <View style={styles.iconWrap}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.itemCount} check points</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          );
        }}
      />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
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
  hintBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: "#eff6ff",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  hintText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#1e40af",
    lineHeight: 16,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  categoryPillText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted + "22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  cardMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
