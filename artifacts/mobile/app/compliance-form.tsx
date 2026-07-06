import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

interface ChecklistItem {
  id: string;
  text: string;
  note?: string;
}

const CHECKLISTS: Record<string, { title: string; items: ChecklistItem[] }> = {
  "rt-crop-protection": {
    title: "Crop Protection Store",
    items: [
      { id: "1", text: "Store is locked and secure" },
      { id: "2", text: "All products stored in original containers" },
      { id: "3", text: "Store is adequately ventilated" },
      { id: "4", text: "COSHH data sheets are available and accessible" },
      { id: "5", text: "Spill kit is present and in good order" },
      { id: "6", text: "Out-of-date products are separated and labelled for disposal" },
    ],
  },
  "rt-seed-treatment": {
    title: "Seed Treatment Records",
    items: [
      { id: "1", text: "Seed treatment records are complete and up to date" },
      { id: "2", text: "Treated seed is segregated from stored grain (rigid barrier or 3m distance) — CR.ST.19" },
      { id: "3", text: "Treated seed is never stored loose in the grain store — CR.ST.19" },
      { id: "4", text: "Treated seed bag disposal is documented" },
    ],
  },
  "rt-fertiliser": {
    title: "Fertiliser Application",
    items: [
      { id: "1", text: "Nutrient management plan is current and up to date" },
      { id: "2", text: "Application records are complete for all fields" },
      { id: "3", text: "Fertiliser is stored correctly away from watercourses" },
      { id: "4", text: "Buffer zones are maintained near all watercourses" },
    ],
  },
  "rt-harvest": {
    title: "Harvest Quality Checks",
    items: [
      { id: "1", text: "Combine has been cleaned before this harvest" },
      { id: "2", text: "Moisture readings are being taken and recorded" },
      { id: "3", text: "Grain is stored in suitable, dry conditions" },
      { id: "4", text: "Quality test results are recorded" },
    ],
  },
  "rt-biosecurity": {
    title: "Biosecurity Assessment",
    items: [
      { id: "1", text: "Farm entrance signs are displayed" },
      { id: "2", text: "Visitor log is maintained" },
      { id: "3", text: "Boot dips / disinfection points are available and charged" },
      { id: "4", text: "Vermin control is in place and monitored" },
      { id: "5", text: "Dead animals are removed promptly" },
      { id: "6", text: "Isolation area is available and suitable for use" },
    ],
  },
  "rt-waste": {
    title: "Waste Management",
    items: [
      { id: "1", text: "Waste is segregated correctly at point of generation" },
      { id: "2", text: "Waste transfer notes are available for all waste movements" },
      { id: "3", text: "Hazardous waste is stored securely away from drains" },
    ],
  },
  "rt-water": {
    title: "Water Usage & Protection",
    items: [
      { id: "1", text: "Water abstraction licences are current" },
      { id: "2", text: "Watercourse buffer zones are maintained across all fields" },
      { id: "3", text: "Evidence of pollution prevention measures is in place" },
    ],
  },
  "rt-health-safety": {
    title: "Health & Safety Review",
    items: [
      { id: "1", text: "Risk assessments are up to date" },
      { id: "2", text: "First aid kit is fully stocked and accessible" },
      { id: "3", text: "Emergency procedures are displayed in a prominent location" },
      { id: "4", text: "PPE is available and in good condition for all tasks" },
      { id: "5", text: "Accident and near-miss records are up to date" },
    ],
  },
  "rt-cleaning-disinfection": {
    title: "Cleaning & Disinfection",
    items: [
      { id: "1", text: "Area / building to be cleaned has been identified" },
      { id: "2", text: "All organic matter removed before disinfection applied" },
      { id: "3", text: "Correct DEFRA-approved disinfectant product is being used" },
      { id: "4", text: "Dilution rate matches product label instructions" },
      { id: "5", text: "Required contact time is being observed" },
      { id: "6", text: "Area is allowed to dry fully before restocking" },
      { id: "7", text: "Operator name is noted for record" },
      { id: "8", text: "Record logged in Cleaning & Disinfection module", note: "Record in Farm Trac to maintain compliance trail" },
    ],
  },
  "rt-pest-control": {
    title: "Pest Control Check",
    items: [
      { id: "1", text: "All bait stations are in place and numbered on plan" },
      { id: "2", text: "All bait points have been checked on this visit" },
      { id: "3", text: "Any evidence of pest activity has been noted" },
      { id: "4", text: "Bait replenished where required" },
      { id: "5", text: "Non-target species safeguards are in place" },
      { id: "6", text: "Pest control contractor's report is current" },
      { id: "7", text: "Visit logged in Pest Control module", note: "Record in Farm Trac to maintain compliance trail" },
    ],
  },
  "rt-water-test": {
    title: "Water Test Result",
    items: [
      { id: "1", text: "Water source has been identified and recorded" },
      { id: "2", text: "E. coli level is within acceptable limits" },
      { id: "3", text: "Coliform count is within acceptable limits" },
      { id: "4", text: "pH reading has been taken and recorded" },
      { id: "5", text: "Water is confirmed suitable for livestock consumption" },
      { id: "6", text: "Lab reference / certificate number noted for records" },
    ],
  },
  "rt-animal-welfare": {
    title: "Animal Welfare Assessment",
    items: [
      { id: "1", text: "Adequate feed and clean water is available to all stock" },
      { id: "2", text: "Housing conditions are satisfactory — space, ventilation, bedding" },
      { id: "3", text: "A current health plan is in place with the vet" },
      { id: "4", text: "Daily stock checks are being performed and any issues noted" },
    ],
  },
  "rt-feed-storage": {
    title: "Feed Storage Inspection",
    items: [
      { id: "1", text: "Feed is stored in clean, dry conditions" },
      { id: "2", text: "Feed bins are free from contamination and vermin access" },
      { id: "3", text: "Feed labels and batch numbers are recorded" },
    ],
  },
  "rt-medicine": {
    title: "Medicine Record Review",
    items: [
      { id: "1", text: "Medicine records are complete and up to date" },
      { id: "2", text: "Medicine cabinet is locked and secure" },
      { id: "3", text: "Withdrawal periods are being observed for all animals" },
      { id: "4", text: "Out-of-date medicines are disposed of correctly and documented" },
    ],
  },
  "rt-medicine-administered": {
    title: "Medicine Administered",
    items: [
      { id: "1", text: "Animal ID / tag number is recorded" },
      { id: "2", text: "Medicine name and batch number are noted" },
      { id: "3", text: "Correct dosage has been administered" },
      { id: "4", text: "Route of administration is recorded (oral / injection / topical)" },
      { id: "5", text: "Medicine is vet-prescribed where required" },
      { id: "6", text: "Withdrawal period (days) is recorded" },
      { id: "7", text: "Withdrawal end date is noted and flagged on stock records" },
      { id: "8", text: "Administered by name is recorded" },
    ],
  },
  "rt-livestock-movement": {
    title: "Livestock Movement Record",
    items: [
      { id: "1", text: "Number of animals moved is confirmed" },
      { id: "2", text: "Species and breed are recorded" },
      { id: "3", text: "All tag / ear mark numbers are documented" },
      { id: "4", text: "Origin holding CPH number is recorded" },
      { id: "5", text: "Destination holding CPH number is recorded" },
      { id: "6", text: "Movement licence / permit reference is obtained" },
      { id: "7", text: "Standstill period applicability has been checked" },
      { id: "8", text: "Transport vehicle registration is noted if applicable" },
    ],
  },
  "rt-transport": {
    title: "Livestock Transport Check",
    items: [
      { id: "1", text: "Vehicle is suitable, clean and disinfected" },
      { id: "2", text: "Journey times are within legal limits" },
      { id: "3", text: "All movement documents are complete and carried" },
    ],
  },
};

const DEFAULT_CHECKLIST: { title: string; items: ChecklistItem[] } = {
  title: "Compliance Check",
  items: [
    { id: "1", text: "Compliance standards are met in this area" },
    { id: "2", text: "Records are up to date" },
    { id: "3", text: "All relevant staff are trained" },
  ],
};

export default function ChecklistScreen() {
  const insets = useSafeAreaInsets();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();

  const config = (templateId && CHECKLISTS[templateId]) ? CHECKLISTS[templateId] : DEFAULT_CHECKLIST;
  const [ticked, setTicked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    setTicked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tickedCount = ticked.size;
  const total = config.items.length;
  const allDone = tickedCount === total;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{config.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: total > 0 ? `${(tickedCount / total) * 100}%` : "0%" as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {tickedCount} of {total} checked
          </Text>
          {allDone && (
            <View style={styles.allDonePill}>
              <Feather name="check-circle" size={12} color="#15803d" />
              <Text style={styles.allDoneText}>All checked</Text>
            </View>
          )}
        </View>

        {config.items.map((item) => {
          const checked = ticked.has(item.id);
          return (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              style={({ pressed }) => [
                styles.itemRow,
                checked && styles.itemRowChecked,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Feather name="check" size={13} color="#fff" />}
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemText, checked && styles.itemTextChecked]}>
                  {item.text}
                </Text>
                {item.note && (
                  <Text style={styles.itemNote}>{item.note}</Text>
                )}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.disclaimer}>
          <Feather name="info" size={12} color={colors.textTertiary} style={{ marginTop: 1 }} />
          <Text style={styles.disclaimerText}>
            Ticks clear when you leave this screen. To maintain a compliance record, log completed actions in the relevant Farm Trac module.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  countText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  allDonePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  allDoneText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#15803d",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  itemRowChecked: {
    backgroundColor: "#f0fdf4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  itemTextChecked: {
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  itemNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 3,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  disclaimerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    lineHeight: 16,
  },
});
