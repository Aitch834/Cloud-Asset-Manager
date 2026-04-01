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
import { useFarm } from "@/lib/context/FarmContext";
import { useApiModules } from "@/lib/hooks/useApiModules";

type FarmSector = "arable" | "beef" | "dairy" | "pigs" | "poultry" | "livestock";

interface RecordOption {
  id: string;
  title: string;
  description: string;
  icon?: string;
  IconComponent?: React.ComponentType<{ size: number; color: string }>;
  color: string;
  bgColor: string;
  route: string;
  moduleKeys?: string[];
  requiresSectors?: FarmSector[];
}

const recordOptions: RecordOption[] = [
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
    id: "scan-asset",
    title: "Scan QR Code",
    description: "Scan any BDE Farm Trac QR label — fields, animals, equipment or storage — to pull up the record and log quickly",
    icon: "maximize",
    color: "#0f766e",
    bgColor: "#CCFBF1",
    route: "/scan-asset",
  },
  {
    id: "accident-report",
    title: "Accident / Incident Report",
    description: "Report a workplace accident, near miss, dangerous occurrence or occupational disease — captures GPS, photo evidence and RIDDOR flag",
    icon: "alert-triangle",
    color: colors.error,
    bgColor: colors.errorBg,
    route: "/accident-report",
  },
  {
    id: "right-to-work",
    title: "Right to Work Check",
    description: "Record a pre-employment RTW check — document type, reference, expiry and who carried out the check",
    icon: "user-check",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    route: "/right-to-work",
    moduleKeys: ["staff-training"],
  },
  {
    id: "spray",
    title: "Spray Record",
    description: "Log pesticide, herbicide, or fungicide applications with GPS coordinates",
    icon: "droplet",
    color: colors.info,
    bgColor: colors.infoBg,
    route: "/spray-record",
    moduleKeys: ["sprays-inputs"],
  },
  {
    id: "nvz",
    title: "NVZ Fertiliser Application",
    description: "Log organic and synthetic fertiliser applications in Nitrate Vulnerable Zones",
    icon: "zap",
    color: colors.accent,
    bgColor: colors.warningBg,
    route: "/nvz-application",
    moduleKeys: ["sprays-inputs"],
  },
  {
    id: "weather",
    title: "Weather Entry",
    description: "Record daily weather observations for compliance records",
    icon: "cloud",
    color: colors.accent,
    bgColor: colors.warningBg,
    route: "/weather-entry",
    moduleKeys: ["weather-tracking"],
  },
  {
    id: "crop",
    title: "Crop Event",
    description: "Record drilling, harvesting, cultivation, and field inspections",
    icon: "layers",
    color: colors.fieldGreen,
    bgColor: colors.successBg,
    route: "/crop-event",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "soil",
    title: "Soil Sample",
    description: "Log soil sampling data with GPS location and analysis results",
    icon: "thermometer",
    color: colors.fieldBrown,
    bgColor: "#FEF3C7",
    route: "/soil-sample",
    moduleKeys: ["soil-management"],
  },
  {
    id: "soil-sensor",
    title: "Soil Sensor Reading",
    description: "Log a timestamped moisture, temperature, or EC reading from a registered continuous monitoring probe",
    icon: "activity",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    route: "/soil-sensor-reading",
    moduleKeys: ["soil-management"],
  },
  {
    id: "harvest",
    title: "Harvest Record — Combine",
    description: "Combine operator: log the field, crop, yield, moisture and timing for a harvest session",
    IconComponent: CombineIcon,
    color: colors.fieldGold,
    bgColor: "#FEF3C7",
    route: "/harvest-record",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "transport-run",
    title: "Transport Run — Driver",
    description: "Driver: log each trailer load — select today's harvest session, vehicle, storage destination",
    icon: "truck",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    route: "/transport-run",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "haulage-confirm",
    title: "Confirm Grain Delivery",
    description: "Confirm a grain lorry collection — haulier, vehicle reg, commodity, quantity, delivery photos and sign-off",
    icon: "check-circle",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    route: "/haulage-confirm",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "seed-drilling",
    title: "Seed Drilling Record",
    description: "Record crop drilling — field, crop variety, seed lot, seed rate, treatment and area drilled",
    icon: "wind",
    color: colors.fieldGreen,
    bgColor: colors.successBg,
    route: "/seed-drilling",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "field-operation",
    title: "Field Operation",
    description: "Log cultivation, tillage, lime spreading, rolling, cover crops and drainage — with depth, passes and implement",
    icon: "layers",
    color: colors.fieldBrown,
    bgColor: "#FEF3C7",
    route: "/field-operation",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "field-inspection",
    title: "Field Crop Inspection",
    description: "Crop walking notes — pest and disease observations, growth stage and action flags",
    icon: "search",
    color: colors.primary,
    bgColor: colors.successBg,
    route: "/field-inspection",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "crop-trials-gps",
    title: "Crop Trials GPS Plot",
    description: "Walk to a trial plot and capture your live GPS coordinates — updates the plot location on the dashboard instantly",
    icon: "map-pin",
    color: "#65a30d",
    bgColor: "#f7fee7",
    route: "/crop-trials",
    moduleKeys: ["crop-trials"],
  },
  {
    id: "medicine",
    title: "Medicine Record",
    description: "Log veterinary medicines, dosage, withdrawal periods and batch numbers",
    icon: "package",
    color: colors.error,
    bgColor: colors.errorBg,
    route: "/medicine-record",
    moduleKeys: ["livestock-management"],
    requiresSectors: ["livestock"],
  },
  {
    id: "livestock-check",
    title: "Livestock Health Check",
    description: "Daily welfare inspection — condition score, mortalities, feed and water",
    icon: "heart",
    color: colors.fieldGreen,
    bgColor: colors.successBg,
    route: "/livestock-check",
    moduleKeys: ["livestock-management"],
    requiresSectors: ["livestock"],
  },
  {
    id: "livestock-movement",
    title: "Livestock Movement",
    description: "Record on-farm, off-farm and between-holding animal movements with CPH details",
    icon: "repeat",
    color: colors.info,
    bgColor: colors.infoBg,
    route: "/livestock-movement",
    moduleKeys: ["livestock-management"],
    requiresSectors: ["livestock"],
  },
  {
    id: "mortality-record",
    title: "Animal Mortality Record",
    description: "Log individual animal deaths — cause, disposal method, BCMS notification and vet attendance",
    icon: "alert-triangle",
    color: colors.error,
    bgColor: colors.errorBg,
    route: "/mortality-record",
    moduleKeys: ["livestock-management"],
    requiresSectors: ["livestock"],
  },
  {
    id: "feed-record",
    title: "Feed Record",
    description: "Log feed deliveries with supplier, batch number and quantity for Red Tractor traceability",
    icon: "package",
    color: "#059669",
    bgColor: "#D1FAE5",
    route: "/feed-record",
    moduleKeys: ["livestock-management"],
    requiresSectors: ["livestock"],
  },
  {
    id: "water-quality",
    title: "Water Quality Record",
    description: "Log water source and annual test results — required for pigs, poultry and non-mains supplies",
    icon: "droplet",
    color: colors.info,
    bgColor: colors.infoBg,
    route: "/water-quality",
    moduleKeys: ["livestock-management"],
    requiresSectors: ["livestock"],
  },
  {
    id: "calving-record",
    title: "Calving Record",
    description: "Record birth details, calf outcome, calving ease score, and colostrum management",
    icon: "heart",
    color: "#16a34a",
    bgColor: "#d1fae5",
    route: "/calving-record",
    moduleKeys: ["dairy-management"],
    requiresSectors: ["dairy"],
  },
  {
    id: "mastitis-record",
    title: "Mastitis Record",
    description: "Log clinical mastitis cases — quarters affected, clinical grade, and treatment",
    icon: "alert-circle",
    color: "#dc2626",
    bgColor: "#fee2e2",
    route: "/mastitis-record",
    moduleKeys: ["dairy-management"],
    requiresSectors: ["dairy"],
  },
  {
    id: "body-condition-score",
    title: "Body Condition Score",
    description: "Record BCS assessments per cow or group on the 1–5 scale with action tracking",
    icon: "bar-chart-2",
    color: "#2563eb",
    bgColor: "#dbeafe",
    route: "/body-condition-score",
    moduleKeys: ["dairy-management"],
    requiresSectors: ["dairy"],
  },
  {
    id: "mobility-scoring",
    title: "Mobility Scoring",
    description: "Herd-wide lameness assessment using the AHDB 0–3 scale with automatic prevalence calculation",
    icon: "trending-up",
    color: "#059669",
    bgColor: "#D1FAE5",
    route: "/mobility-scoring",
    moduleKeys: ["dairy-management"],
    requiresSectors: ["dairy"],
  },
  {
    id: "pig-red-tractor",
    title: "Pig Red Tractor Assessment",
    description: "19-point Red Tractor compliance checklist — welfare plan, medicines, movements, biosecurity, enrichment, welfare and facilities",
    icon: "shield",
    color: "#db2777",
    bgColor: "#fce7f3",
    route: "/pig-red-tractor",
    moduleKeys: ["pig-production"],
    requiresSectors: ["pigs"],
  },
  {
    id: "pig-welfare-check",
    title: "Pig Welfare Check",
    description: "Red Tractor daily pen inspection — behaviour, bedding, tail biting, feed, water and welfare outcome",
    icon: "shield",
    color: "#db2777",
    bgColor: "#fce7f3",
    route: "/pig-welfare-check",
    moduleKeys: ["pig-production"],
    requiresSectors: ["pigs"],
  },
  {
    id: "pig-farrowing",
    title: "Pig Farrowing Record",
    description: "Record litter size, born alive, stillborn, mummified, birth weights, farrowing ease and colostrum management",
    icon: "heart",
    color: "#db2777",
    bgColor: "#fce7f3",
    route: "/pig-farrowing",
    moduleKeys: ["pig-production"],
    requiresSectors: ["pigs"],
  },
  {
    id: "poultry-biosecurity-cleanout",
    title: "Poultry Cleanout Biosecurity",
    description: "Step-by-step biosecurity checklist for whole-house cleanout — litter, washing, disinfection, fumigation, vermin, water and footbaths",
    icon: "check-square",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/poultry-biosecurity-cleanout",
    moduleKeys: ["poultry-production"],
    requiresSectors: ["poultry"],
  },
  {
    id: "poultry-welfare-check",
    title: "Poultry Welfare Check",
    description: "Red Tractor daily house inspection — temperature, litter, ammonia, mortalities and bird behaviour",
    icon: "feather",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/poultry-welfare-check",
    moduleKeys: ["poultry-production"],
    requiresSectors: ["poultry"],
  },
  {
    id: "poultry-thinning",
    title: "Poultry Thinning Record",
    description: "Log thinning event — birds removed, live weights, catching times, vehicle reg and DOAs at loading",
    icon: "feather",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/poultry-thinning",
    moduleKeys: ["poultry-production"],
    requiresSectors: ["poultry"],
  },
  {
    id: "visitor",
    title: "Visitor Log",
    description: "Quick-log farm visitors with biosecurity compliance checks",
    icon: "users",
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    route: "/visitor-log",
    moduleKeys: ["biosecurity"],
  },
  {
    id: "pest-control",
    title: "Pest Control Visit",
    description: "Log bait stations, trap checks, pest activity and control actions",
    icon: "alert-circle",
    color: colors.fieldBrown,
    bgColor: "#FEF3C7",
    route: "/pest-control-visit",
    moduleKeys: ["biosecurity"],
  },
  {
    id: "cleaning",
    title: "Cleaning & Disinfection",
    description: "Record cleaning and disinfection of livestock buildings, vehicles and equipment",
    icon: "wind",
    color: "#0891b2",
    bgColor: "#e0f2fe",
    route: "/cleaning-record",
    moduleKeys: ["biosecurity"],
  },
  {
    id: "add-farm-location",
    title: "Add Farm Location",
    description: "Register a new building or storage area on site — GPS coordinates captured automatically for the Farm Map",
    icon: "map-pin",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    route: "/add-farm-location",
    moduleKeys: ["biosecurity"],
  },
  {
    id: "fly-tipping",
    title: "Fly-Tipping Incident Report",
    description: "Record illegal waste dumping on your land — location, waste types, hazard assessment and authority reporting",
    icon: "alert-triangle",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    route: "/fly-tipping",
    moduleKeys: ["risk-waste"],
  },
  {
    id: "encampments",
    title: "Unauthorized Encampment",
    description: "Log a trespass encampment — vehicle & person count, police / council notification, legal action and remediation",
    icon: "home",
    color: "#B45309",
    bgColor: "#FEF3C7",
    route: "/encampments",
    moduleKeys: ["risk-waste"],
  },
  {
    id: "waste-disposal",
    title: "Waste Disposal Record",
    description: "Log farm waste collections — waste type, carrier licence, transfer note number and disposal site",
    icon: "trash-2",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    route: "/waste-disposal",
    moduleKeys: ["risk-waste"],
  },
  {
    id: "equipment-defect",
    title: "Equipment Defect Report",
    description: "Report machinery faults, flag unsafe equipment and record corrective actions",
    icon: "tool",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    route: "/equipment-defect",
    moduleKeys: ["equipment-management"],
  },
  {
    id: "environmental-event",
    title: "Environmental Management Event",
    description: "Log hedge trimming, pond clearance, mowing, scrub clearance and other habitat management activities",
    icon: "feather",
    color: "#16a34a",
    bgColor: "#dcfce7",
    route: "/environmental-event",
    moduleKeys: ["environmental"],
  },
  {
    id: "land-eligibility",
    title: "Land Eligibility Declaration",
    description: "RTFO/ISCC field land-use declaration — confirm no peatland, wetland or forest conversion after 2008",
    icon: "map",
    color: "#16a34a",
    bgColor: "#dcfce7",
    route: "/land-eligibility",
    moduleKeys: ["biofuel-rtfo"],
  },
  {
    id: "biofuel-delivery",
    title: "Biofuel Crop Delivery",
    description: "Log biofuel crop consignment — buyer, RTFO ref, quantity and sustainability scheme",
    icon: "truck",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/biofuel-delivery",
    moduleKeys: ["biofuel-rtfo"],
  },
  {
    id: "irrigation-meter",
    title: "Irrigation Meter Reading",
    description: "Log abstraction meter readings with usage calculation, pump condition check and GPS location",
    icon: "droplet",
    color: "#0891b2",
    bgColor: "#cffafe",
    route: "/irrigation-meter",
    moduleKeys: ["water-irrigation"],
  },
  {
    id: "ai-reproduction",
    title: "AI & Reproduction Record",
    description: "Log artificial insemination, natural service or embryo transfer events and pregnancy check results",
    icon: "activity",
    color: "#16a34a",
    bgColor: "#dcfce7",
    route: "/ai-reproduction",
    moduleKeys: ["livestock-management", "dairy-management"],
  },
  {
    id: "vet-prescription",
    title: "Veterinary Prescription",
    description: "Record a vet-written prescription for the audit trail — drug, dose, withdrawal periods and RCVS details",
    icon: "file-text",
    color: "#dc2626",
    bgColor: "#fee2e2",
    route: "/vet-prescription",
    moduleKeys: ["livestock-management", "dairy-management", "pig-production", "poultry-production"],
  },
  {
    id: "grain-quality-test",
    title: "Grain Quality Test",
    description: "Record moisture, protein, specific weight, Hagberg and mycotoxin results for grain in store",
    icon: "bar-chart-2",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/grain-quality-test",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "grain-temperature",
    title: "Grain Temperature Reading",
    description: "Monitor stored grain temperature at multiple sensor positions and log corrective actions",
    icon: "thermometer",
    color: "#f59e0b",
    bgColor: "#fef9c3",
    route: "/grain-temperature",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "egg-production",
    title: "Egg Production Record",
    description: "Daily egg collection, lay rate calculation, grading totals and packing records",
    icon: "circle",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    route: "/egg-production",
    moduleKeys: ["poultry-production"],
    requiresSectors: ["poultry"],
  },
  {
    id: "slurry-event",
    title: "Slurry & Manure Event",
    description: "Record spreading events, store fills/empties, slurry analysis and NVZ compliance checks",
    icon: "droplet",
    color: "#92400e",
    bgColor: "#fef3c7",
    route: "/slurry-event",
    moduleKeys: ["environmental"],
  },
  {
    id: "sfi-action",
    title: "SFI / ELMs Action Event",
    description: "Log a Sustainable Farming Incentive action with area, evidence notes and GPS location",
    icon: "sun",
    color: "#059669",
    bgColor: "#d1fae5",
    route: "/sfi-action",
    moduleKeys: ["environmental"],
  },
  {
    id: "sprayer-calibration",
    title: "Sprayer Calibration Record",
    description: "Record nozzle checks, output volumes, pressure, speed and NSTS certification details",
    icon: "wind",
    color: "#0891b2",
    bgColor: "#cffafe",
    route: "/sprayer-calibration",
    moduleKeys: ["equipment-management", "sprays-inputs"],
  },
  {
    id: "maintenance-log",
    title: "Maintenance / Service Log",
    description: "Log repairs, services and inspections for any farm asset — hours, parts, labour and next service",
    icon: "tool",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    route: "/maintenance-log",
    moduleKeys: ["equipment-management"],
  },
  {
    id: "horticulture-record",
    title: "Horticulture Activity Record",
    description: "Planting, transplanting, harvesting, thinning or soil prep — with seed lot, density and GPS",
    icon: "layers",
    color: "#16a34a",
    bgColor: "#dcfce7",
    route: "/horticulture-record",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "horticulture-harvest-grade",
    title: "Harvest Grade & Quality",
    description: "Class 1/2 split, rejection rates, pack-out, lot traceability and cold store allocation",
    icon: "package",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/horticulture-harvest-grade",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "cold-store-temp",
    title: "Cold Store Temperature Log",
    description: "Daily cold store and blast chiller temperature readings with out-of-range alerts and corrective action",
    icon: "thermometer",
    color: "#0891b2",
    bgColor: "#cffafe",
    route: "/cold-store-temp",
    moduleKeys: ["field-crop-management"],
  },
  {
    id: "carbon-entry",
    title: "Carbon & Sustainability Entry",
    description: "Record emission sources and offsets for your annual farm carbon footprint — fuels, fertilisers, livestock and renewables",
    icon: "sun",
    color: "#059669",
    bgColor: "#d1fae5",
    route: "/carbon-entry",
    moduleKeys: ["environmental"],
  },
  {
    id: "diversification-record",
    title: "Farm Diversification Record",
    description: "Bookings, check-ins, income, inspections and visitor records for farm stays, events, shops and other enterprises",
    icon: "home",
    color: "#db2777",
    bgColor: "#fce7f3",
    route: "/diversification-record",
    moduleKeys: ["farm-diversification"],
  },
  {
    id: "staff-training",
    title: "Staff Training Record",
    description: "Certifications, inductions and competency records — PA1/2/6, first aid, NPTC chainsaw and more",
    icon: "award",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    route: "/staff-training",
    moduleKeys: ["staff-training"],
  },
  {
    id: "coshh-assessment",
    title: "COSHH Assessment",
    description: "Structured COSHH risk assessment — hazard classification, exposure risk, PPE, storage, disposal and emergency procedures",
    icon: "shield",
    color: "#dc2626",
    bgColor: "#fee2e2",
    route: "/coshh-assessment",
    moduleKeys: ["staff-training"],
  },
  {
    id: "grain-sale",
    title: "Grain Sale",
    description: "Record a grain sale — commodity, buyer, tonnage, price, moisture and quality results",
    icon: "bar-chart-2",
    color: "#d97706",
    bgColor: "#fef3c7",
    route: "/grain-sale",
    moduleKeys: ["financial-records"],
  },
  {
    id: "livestock-sale",
    title: "Livestock Sale",
    description: "Record a deadweight kill sheet or mart auction sale — species, head count, grade and payment",
    icon: "package",
    color: "#15803d",
    bgColor: "#dcfce7",
    route: "/livestock-sale",
    moduleKeys: ["financial-records"],
  },
  {
    id: "direct-sale",
    title: "Direct / Farm Gate Sale",
    description: "Log a farm shop, box scheme, farmers market or wholesale sale — product, quantity, price and payment status",
    icon: "shopping-bag",
    color: "#0891b2",
    bgColor: "#cffafe",
    route: "/direct-sale",
    moduleKeys: ["financial-records"],
  },
  {
    id: "milk-statement",
    title: "Milk Statement",
    description: "Record monthly milk statement — litres supplied, pence per litre, butterfat, protein, SCC and net payment",
    icon: "droplet",
    color: "#1d4ed8",
    bgColor: "#dbeafe",
    route: "/milk-statement",
    moduleKeys: ["financial-records"],
    requiresSectors: ["dairy"],
  },
];

function hasSector(farm: { sectorArable?: boolean; sectorBeef?: boolean; sectorDairy?: boolean; sectorPigs?: boolean; sectorPoultry?: boolean } | null, sectors: FarmSector[]): boolean {
  if (!farm) return true;
  return sectors.some((s) => {
    if (s === "livestock") return !!(farm.sectorBeef || farm.sectorDairy || farm.sectorPigs || farm.sectorPoultry);
    if (s === "arable") return !!farm.sectorArable;
    if (s === "beef") return !!farm.sectorBeef;
    if (s === "dairy") return !!farm.sectorDairy;
    if (s === "pigs") return !!farm.sectorPigs;
    if (s === "poultry") return !!farm.sectorPoultry;
    return true;
  });
}

export default function RecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { activeModuleKeys } = useApiModules(currentFarm?.id);

  const moduleSet = new Set(activeModuleKeys);
  const modulesLoaded = activeModuleKeys.length > 0;

  const visibleOptions = recordOptions.filter((option) => {
    if (option.requiresSectors && !hasSector(currentFarm, option.requiresSectors)) {
      return false;
    }
    if (option.moduleKeys && modulesLoaded) {
      return option.moduleKeys.some((k) => moduleSet.has(k));
    }
    return true;
  });

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
        {visibleOptions.map((option) => (
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
