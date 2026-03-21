import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { CombineIcon } from "@/components/ui/CombineIcon";

interface RecordOption {
  id: string;
  title: string;
  description: string;
  icon?: string;
  IconComponent?: React.ComponentType<{ size: number; color: string }>;
  color: string;
  bgColor: string;
  route: string;
}

const recordOptions: RecordOption[] = [
  {
    id: "spray",
    title: "Spray Record",
    description: "Log pesticide, herbicide, or fungicide applications with GPS coordinates",
    icon: "droplet",
    color: colors.info,
    bgColor: colors.infoBg,
    route: "/spray-record",
  },
  {
    id: "weather",
    title: "Weather Entry",
    description: "Record daily weather observations for compliance records",
    icon: "cloud",
    color: colors.accent,
    bgColor: colors.warningBg,
    route: "/weather-entry",
  },
  {
    id: "visitor",
    title: "Visitor Log",
    description: "Quick-log farm visitors with biosecurity compliance checks",
    icon: "users",
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    route: "/visitor-log",
  },
  {
    id: "crop",
    title: "Crop Event",
    description: "Record drilling, harvesting, cultivation, and field inspections",
    icon: "layers",
    color: colors.fieldGreen,
    bgColor: colors.successBg,
    route: "/crop-event",
  },
  {
    id: "soil",
    title: "Soil Sample",
    description: "Log soil sampling data with GPS location and analysis results",
    icon: "thermometer",
    color: colors.fieldBrown,
    bgColor: "#FEF3C7",
    route: "/soil-sample",
  },
  {
    id: "photo",
    title: "Photo Capture",
    description: "Take geotagged photos for evidence and compliance documentation",
    icon: "camera",
    color: colors.textSecondary,
    bgColor: colors.borderLight,
    route: "/photo-capture",
  },
  {
    id: "medicine",
    title: "Medicine Record",
    description: "Log veterinary medicines, dosage, withdrawal periods and batch numbers",
    icon: "package",
    color: colors.error,
    bgColor: colors.errorBg,
    route: "/medicine-record",
  },
  {
    id: "livestock-check",
    title: "Livestock Health Check",
    description: "Daily welfare inspection — condition score, mortalities, feed and water",
    icon: "heart",
    color: colors.fieldGreen,
    bgColor: colors.successBg,
    route: "/livestock-check",
  },
  {
    id: "livestock-movement",
    title: "Livestock Movement",
    description: "Record on-farm, off-farm and between-holding animal movements with CPH details",
    icon: "repeat",
    color: colors.info,
    bgColor: colors.infoBg,
    route: "/livestock-movement",
  },
  {
    id: "mortality-record",
    title: "Animal Mortality Record",
    description: "Log individual animal deaths — cause, disposal method, BCMS notification and vet attendance",
    icon: "alert-triangle",
    color: colors.error,
    bgColor: colors.errorBg,
    route: "/mortality-record",
  },
  {
    id: "feed-record",
    title: "Feed Record",
    description: "Log feed deliveries with supplier, batch number and quantity for Red Tractor traceability",
    icon: "package",
    color: "#059669",
    bgColor: "#D1FAE5",
    route: "/feed-record",
  },
  {
    id: "water-quality",
    title: "Water Quality Record",
    description: "Log water source and annual test results — required for pigs, poultry and non-mains supplies",
    icon: "droplet",
    color: colors.info,
    bgColor: colors.infoBg,
    route: "/water-quality",
  },
  {
    id: "harvest",
    title: "Harvest Record — Combine",
    description: "Combine operator: log the field, crop, yield, moisture and timing for a harvest session",
    IconComponent: CombineIcon,
    color: colors.fieldGold,
    bgColor: "#FEF3C7",
    route: "/harvest-record",
  },
  {
    id: "transport-run",
    title: "Transport Run — Driver",
    description: "Driver: log each trailer load — select today's harvest session, vehicle, storage destination",
    icon: "truck",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    route: "/transport-run",
  },
  {
    id: "nvz",
    title: "NVZ Fertiliser Application",
    description: "Log organic and synthetic fertiliser applications in Nitrate Vulnerable Zones",
    icon: "zap",
    color: colors.accent,
    bgColor: colors.warningBg,
    route: "/nvz-application",
  },
  {
    id: "waste-disposal",
    title: "Waste Disposal Record",
    description: "Log farm waste collections — waste type, carrier licence, transfer note number and disposal site",
    icon: "trash-2",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    route: "/waste-disposal",
  },
  {
    id: "equipment-defect",
    title: "Equipment Defect Report",
    description: "Report machinery faults, flag unsafe equipment and record corrective actions",
    icon: "tool",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    route: "/equipment-defect",
  },
  {
    id: "pest-control",
    title: "Pest Control Visit",
    description: "Log bait stations, trap checks, pest activity and control actions",
    icon: "alert-circle",
    color: colors.fieldBrown,
    bgColor: "#FEF3C7",
    route: "/pest-control-visit",
  },
  {
    id: "cleaning",
    title: "Cleaning & Disinfection",
    description: "Record cleaning and disinfection of livestock buildings, vehicles and equipment",
    icon: "wind",
    color: "#0891b2",
    bgColor: "#e0f2fe",
    route: "/cleaning-record",
  },
  {
    id: "seed-drilling",
    title: "Seed Drilling Record",
    description: "Record crop drilling — field, crop variety, seed lot, seed rate, treatment and area drilled",
    icon: "wind",
    color: colors.fieldGreen,
    bgColor: colors.successBg,
    route: "/seed-drilling",
  },
  {
    id: "field-operation",
    title: "Field Operation",
    description: "Log cultivation, tillage, lime spreading, rolling, cover crops and drainage — with depth, passes and implement",
    icon: "layers",
    color: colors.fieldBrown,
    bgColor: "#FEF3C7",
    route: "/field-operation",
  },
  {
    id: "field-inspection",
    title: "Field Crop Inspection",
    description: "Crop walking notes — pest and disease observations, growth stage and action flags",
    icon: "search",
    color: colors.primary,
    bgColor: colors.successBg,
    route: "/field-inspection",
  },
  {
    id: "land-eligibility",
    title: "Land Eligibility Declaration",
    description: "RTFO/ISCC field land-use declaration — confirm no peatland, wetland or forest conversion after 2008",
    icon: "map",
    color: "#16a34a",
    bgColor: "#dcfce7",
    route: "/land-eligibility",
  },
  {
    id: "biofuel-delivery",
    title: "Biofuel Crop Delivery",
    description: "Log biofuel crop consignment — buyer, RTFO ref, quantity and sustainability scheme",
    icon: "truck",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/biofuel-delivery",
  },
  {
    id: "environmental-event",
    title: "Environmental Management Event",
    description: "Log hedge trimming, pond clearance, mowing, scrub clearance and other habitat management activities",
    icon: "feather",
    color: "#16a34a",
    bgColor: "#dcfce7",
    route: "/environmental-event",
  },
];

export default function RecordScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>New Record</Text>
        <Text style={styles.subtitle}>Select the type of record to create</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        {recordOptions.map((option) => (
          <RecordOptionCard key={option.id} option={option} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function RecordOptionCard({ option }: { option: RecordOption }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(option.route as never);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: option.bgColor }]}>
        {option.IconComponent ? (
          <option.IconComponent size={24} color={option.color} />
        ) : (
          <Feather name={option.icon as keyof typeof Feather.glyphMap} size={24} color={option.color} />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text style={styles.cardDescription}>{option.description}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textTertiary} />
    </Pressable>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  cardDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
});
