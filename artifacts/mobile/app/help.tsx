import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

interface Article {
  title: string;
  summary: string;
}

interface Category {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
  articles: Article[];
}

const CATEGORIES: Category[] = [
  {
    title: "Getting Started",
    icon: "play-circle",
    color: "#2563eb",
    bgColor: "#eff6ff",
    articles: [
      {
        title: "Setting up your farm — business details, CPH, sectors and modules",
        summary: "The four-step setup wizard walks you through business details, farm details (CPH number, address, farm type), module selection, and subscription. Complete all steps before recording begins — some record types are locked until the relevant module is activated.",
      },
      {
        title: "Adding fields to the Field Register",
        summary: "Register each field with name, OS parcel reference, area (ha), NVZ designation, and soil type before recording crops or sprays. Fields feed into spray records, field operations, carbon calculations, and SFI action logging.",
      },
      {
        title: "Staff Auto-Populate — operator and assessor fields pre-fill from your login",
        summary: "Operator, assessor, and recorded-by fields across the platform pre-fill from the logged-in user's name — no typing required on same-day records. Changing the value overrides it for that record only.",
      },
      {
        title: "Smart Date Validation — how date fields work across the platform",
        summary: "Dates default to today on new records. Future dates are blocked on most record types. Treatment withdrawal dates calculate forward automatically from the application date and product withholding period.",
      },
    ],
  },
  {
    title: "Carbon & Sustainability",
    icon: "wind",
    color: "#0d9488",
    bgColor: "#f0fdfa",
    articles: [
      {
        title: "Carbon Auto-Calculator — DEFRA 2023 emission factors",
        summary: "Select a year and tap Pre-fill from Farm Records. The platform reads fuel deliveries, fertiliser applications, livestock herd numbers, and grid electricity and applies DEFRA 2023 emission factors to return Scope 1 and Scope 2 tCO₂e totals with source badges.",
      },
      {
        title: "Use these figures → Create Carbon Audit",
        summary: "After the Auto-Calculator returns prefilled totals, tap 'Use these figures → Create Carbon Audit' to open a new audit record with the tCO₂e values already populated. Review and adjust individual line items before saving.",
      },
      {
        title: "Sustainability Reports — certifying body register and PO tracking",
        summary: "The Sustainability Reports tab tracks every report submitted to supply chain customers. Each record captures the certifying body (searchable list including Carbon Trust, BSI PAS 2060, Agrecalc, and more), submission status, PO reference, and invoice reference.",
      },
      {
        title: "Carbon audit records — Scope 1, 2 and 3 tCO₂e",
        summary: "Log annual farm carbon audits with gross emissions by category (enteric fermentation, manure, fuel, fertiliser, purchased feed, purchased electricity), sequestration credits, and net tCO₂e. Year-on-year bar chart shows progress against your baseline.",
      },
      {
        title: "Carbon Sequestration Auto-Calculator — Woodland Carbon Code and Peatland Code factors",
        summary: "Select a year and the platform reads your Environmental Features register and Field Season Land Use records to calculate indicative annual sequestration by feature type and area using Woodland Carbon Code, Peatland Code, and DEFRA agri-environment factors.",
      },
      {
        title: "Biodiversity Net Gain — Defra Metric 4.0 unit calculations",
        summary: "Log habitat creation records with area, habitat type, and condition score (Distinctly sub-optimal to Excellent on the statutory BNG metric scale). Estimated biodiversity units are calculated automatically.",
      },
    ],
  },
  {
    title: "Sprays & Inputs",
    icon: "droplet",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    articles: [
      {
        title: "Recording spray applications — product, dose, operator and field",
        summary: "Log each spray event with date, product, dose, area, operator (PA certificate auto-filled), and target pest or weed. LERAP buffer and withholding period are calculated automatically from product data.",
      },
      {
        title: "IPM Plan — integrated pest management compliance record",
        summary: "The five-section IPM Plan is a structured written document required by Red Tractor. Spray records link back to the plan via the Spray Rationale field for a complete monitoring-to-application audit trail.",
      },
      {
        title: "LERAP Assessments — recording assessments for sprays near watercourses",
        summary: "For Category A/B products adjacent to a watercourse, record the CRD Assessment Step (1–4), standard buffer distance, and LERAP-reduced buffer. The assessor must hold PA1 + PA2/PA6 certificates. Attach a photo or map screenshot of the watercourse as evidence directly from the form.",
      },
      {
        title: "Spray Store Stocktake — recording a physical stock count on mobile",
        summary: "Tap 'Spray Store Stocktake' in the Record tab. Select the spray product — the system quantity auto-fills. Enter the physical quantity you counted. A live variance badge shows the difference (green = zero, amber = surplus, red = shortfall). Records save offline and sync automatically.",
      },
    ],
  },
  {
    title: "Grain & Crop Storage",
    icon: "package",
    color: "#b45309",
    bgColor: "#fffbeb",
    articles: [
      {
        title: "Grain Store Stocktake — recording a physical probe or weighbridge measurement",
        summary: "Tap 'Grain Store Stocktake' in the Record tab. Select the storage bin or location, enter the physical quantity in tonnes (probe reading, auger sample, weighbridge, or visual estimate), and the measurement method. A live variance badge compares against the system quantity.",
      },
      {
        title: "Crop stock stocktake history — viewing records on the dashboard",
        summary: "Stocktake records captured on mobile sync to the dashboard. Open the Grain Store (Crop Stock) page and select the Stocktakes tab to view all historical entries with variance badges, measurement methods, system quantities, physical quantities, and conducted-by attribution.",
      },
      {
        title: "Stock movements — recording intakes, dispatches, and transfers",
        summary: "Grain and crop stock movements (intake, dispatch, on-farm transfer, sample withdrawal, drying loss, and manual adjustment) are recorded on the dashboard Grain Store page. Each movement can be linked to a haulage record, grain sale, or harvest record.",
      },
    ],
  },
  {
    title: "Livestock & Feed",
    icon: "heart",
    color: "#dc2626",
    bgColor: "#fef2f2",
    articles: [
      {
        title: "Recording livestock movements — on-farm, off-farm and BCMS submission",
        summary: "Log every cattle, sheep, goat, or deer movement with date, animals, and destination. One-click BCMS submission for cattle (CTS Web Services) and LIS submission for sheep, goats, and deer directly from the movement record.",
      },
      {
        title: "Medicine records — withdrawal period calculation and AMTRA compliance",
        summary: "Log veterinary medicines with product name, batch number, route, dose, prescribing vet, and withdrawal period. Clearance date is auto-calculated. AMTRA SQP compliance fields are included for registered dispensers.",
      },
      {
        title: "Vet Health Plans — recording action completion and manager sign-off",
        summary: "Annual vet-signed health plans with review date tracking. Action completion is recorded against individual plan items with sign-off by a named farm manager.",
      },
      {
        title: "Welfare Outcome Assessments — assessor type, species measures and walkthrough tally",
        summary: "Select Staff Member or External Assessor. Measures adapt to the selected species (cattle, sheep, pig, poultry). Use the Walkthrough Tally to count animals per category during the walk — tallies feed the outcome scores. Attach a photo as supporting evidence. Records save offline.",
      },
      {
        title: "Pig Welfare Check — daily pen inspection record",
        summary: "Tap 'Pig Welfare Check' in the Record tab. Select the pig group or pen, enter the pig count, and use the toggles to record ventilation, feed, and water status. Log bedding condition, tail biting or aggression observations, sick/injured count, and mortalities. Select the overall welfare outcome and attach photo evidence before saving.",
      },
      {
        title: "Pig Tail Biting Risk Assessment — risk factors, enrichment and monitoring",
        summary: "Log stocking density, health status, and the current risk level (Low/Medium/High/Critical). Record enrichment types provided, mixing frequency, and whether active biting is currently observed. If biting is active, record severity and interventions already taken. Set a monitoring frequency and next review date. Attach a photo before saving.",
      },
      {
        title: "Kidding Records — recording goat dairy births on mobile",
        summary: "Tap 'Kidding Record' in the Goat Dairy section. Enter the doe tag or name, select the flock, choose birth type (single, twin, triplet+), and record kids alive and stillborn. Confirm whether colostrum was given and whether a vet attended. Add a sire tag and notes, then attach a photo if needed. Records save offline and sync automatically.",
      },
    ],
  },
  {
    title: "Poultry",
    icon: "feather",
    color: "#b45309",
    bgColor: "#fff7ed",
    articles: [
      {
        title: "Campylobacter Monitoring — logging flock samples on mobile",
        summary: "Tap 'Campylobacter Monitoring' in the Record tab. Enter the sample date, house ID, flock ID, and number of samples taken. Select the sample type (boot swab, caeca, neck skin, or carcass) and the result (Positive/Negative/Inconclusive). Record the FSA band (A, B, or C), CFU count, lab name, and lab reference. Mark whether a Zoonoses Action Plan was triggered. Attach a photo of the lab report before saving.",
      },
      {
        title: "Poultry Biosecurity Cleanout — 12-step cleanout checklist",
        summary: "Tap 'Biosecurity Cleanout' in the Poultry section. Enter house name, flock/batch reference, and select whether the cleanout was carried out by farm staff or a contractor. Work through the 12-step checklist (litter removal, dry clean, pre-wash, disinfection, fumigation, drying, and biosecurity setup steps). Each step is ticked off with a checkbox. Enter disinfectant details, dilution rate, and contact time. Add notes and attach a photo of the cleaned house before saving.",
      },
    ],
  },
  {
    title: "Agri-Environment & SFI",
    icon: "map",
    color: "#0d9488",
    bgColor: "#f0fdfa",
    articles: [
      {
        title: "Environmental Features — recording habitats with GPS on mobile",
        summary: "Tap 'Environmental Feature' in the Record tab. Select the feature type (hedgerow, ditch/watercourse, woodland, pond, buffer strip, wildflower area, or other), enter a description, area (ha), and length (metres). Set the management practice and tick if it is enclosed/managed. Tap 'Get GPS Location' to tag the precise coordinates, and attach a photo before saving. Records appear in the Environmental Features register on the dashboard.",
      },
      {
        title: "SFI / ELMs Actions — logging scheme actions and evidence on mobile",
        summary: "Tap 'SFI / ELMs Action' in the Record tab. Select the scheme (SFI 2023, SFI 2024, CS, ES, or custom), action code and name, option area (ha), and annual payment amount. Set the compliance status (Compliant, Partially Compliant, Non-Compliant, or Pending). Enter the last evidence date, next evidence date, and evidence notes. Attach a photo as evidence before saving. GPS coordinates are captured automatically.",
      },
    ],
  },
  {
    title: "Food Safety & Hygiene",
    icon: "shield",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    articles: [
      {
        title: "Food Hygiene Inspections — recording inspection outcomes on mobile",
        summary: "Tap 'Food Hygiene Inspection' in the Record tab. Enter the inspection date, inspector name, inspector organisation, and the hygiene rating awarded. Record a findings summary and any corrective actions required. Mark whether a reinspection is required and set the reinspection date. Attach a photo of the inspection certificate or findings report before saving.",
      },
    ],
  },
  {
    title: "Organic Compliance",
    icon: "sun",
    color: "#ca8a04",
    bgColor: "#fefce8",
    articles: [
      {
        title: "Organic Compliance module — overview and getting started",
        summary: "Complementary records alongside your Soil Association or OF&G certifier portal. Covers certification status, field conversion tracker, inspection log, restricted inputs register, and mobile offline recording.",
      },
      {
        title: "Organic Arable — input log, seed sourcing and harvest declarations",
        summary: "Log Annex II approved inputs, record seed sourcing with derogation approval flow, and capture harvest declarations with certifier harvest reference.",
      },
      {
        title: "Feed Derogations — Art. 22 case register with correspondence log",
        summary: "One case per non-organic ingredient tracks the full lifecycle from application through approval to expiry. Correspondence log and document upload for approval letters and availability search evidence.",
      },
    ],
  },
  {
    title: "Inspections & Audits",
    icon: "check-square",
    color: "#6d28d9",
    bgColor: "#ede9fe",
    articles: [
      {
        title: "Red Tractor Audit Pack Generator — assembling evidence packs for assessor visits",
        summary: "The Audit Pack Generator assembles a complete evidence pack from your existing records across all modules. Select the scheme, date range, and record types to include.",
      },
      {
        title: "Inspector Mode — Advisor Portal filtered compliance view",
        summary: "Inspector Mode gives your Red Tractor assessor or agronomist advisor a filtered read-only view of your compliance records — no editing access, no confidential financial data.",
      },
    ],
  },
  {
    title: "Mobile App",
    icon: "smartphone",
    color: "#0369a1",
    bgColor: "#e0f2fe",
    articles: [
      {
        title: "Offline mode — records stored locally until synced",
        summary: "All record types save to on-device storage when you are out of mobile coverage. Records sync automatically when connectivity is restored, or tap Sync Now in the More tab. A sync badge on the More tab shows the count of pending records.",
      },
      {
        title: "Photo evidence — attaching photos to records on mobile",
        summary: "Most record forms include an 'Attach Photo Evidence' button near the bottom. Tap it to choose a photo from your library or take a new one with the camera. The thumbnail confirms the attachment. Tap it again to replace or remove the photo. Photos are stored with the record and sync to the dashboard alongside the other fields.",
      },
      {
        title: "Push notifications — task assignment alerts on mobile",
        summary: "When a task is assigned to you, a push notification is delivered to your device alongside the SMS alert. Tapping the notification opens the Task Inbox directly.",
      },
      {
        title: "Bluetooth RFID scanning — reading cattle and sheep ear tags",
        summary: "Pair a Bluetooth RFID reader in Settings → RFID Reader. Once paired, the scan button appears on livestock movement, medicine, and weigh-in record forms. Scanned tags fill the ear tag field automatically.",
      },
      {
        title: "GPS location tagging — attaching coordinates to field records",
        summary: "Records for Environmental Features, SFI Actions, Pig Welfare Checks, and LERAP Assessments include a 'Get GPS Location' button. Tapping it requests your device location and attaches latitude and longitude to the record. Grant location permission in your device Settings if the button is greyed out.",
      },
    ],
  },
];

function ArticleItem({ article, isLast }: { article: Article; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Pressable style={styles.articleRow} onPress={() => setExpanded((v) => !v)}>
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          {expanded && (
            <Text style={styles.articleSummary}>{article.summary}</Text>
          )}
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.textTertiary}
        />
      </Pressable>
      {!isLast && <View style={styles.articleDivider} />}
    </>
  );
}

function CategorySection({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.categoryCard}>
      <Pressable style={styles.categoryHeader} onPress={() => setOpen((v) => !v)}>
        <View style={[styles.categoryIcon, { backgroundColor: category.bgColor }]}>
          <Feather name={category.icon} size={18} color={category.color} />
        </View>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <View style={styles.categoryMeta}>
          <Text style={styles.articleCount}>{category.articles.length}</Text>
          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textTertiary}
          />
        </View>
      </Pressable>
      {open && (
        <View style={styles.articleList}>
          {category.articles.map((a, i) => (
            <ArticleItem key={i} article={a} isLast={i === category.articles.length - 1} />
          ))}
        </View>
      )}
    </View>
  );
}

function CategorySectionExpanded({ category }: { category: Category }) {
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.bgColor }]}>
          <Feather name={category.icon} size={18} color={category.color} />
        </View>
        <Text style={styles.categoryTitle}>{category.title}</Text>
        <View style={styles.categoryMeta}>
          <Text style={styles.articleCount}>{category.articles.length}</Text>
        </View>
      </View>
      <View style={styles.articleList}>
        {category.articles.map((a, i) => (
          <ArticleItem key={i} article={a} isLast={i === category.articles.length - 1} />
        ))}
      </View>
    </View>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const query = search.toLowerCase().trim();

  const filtered = query
    ? CATEGORIES.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(query) ||
            a.summary.toLowerCase().includes(query)
        ),
      })).filter(
        (cat) =>
          cat.articles.length > 0 ||
          cat.title.toLowerCase().includes(query)
      )
    : CATEGORIES;

  const totalResults = filtered.reduce((n, c) => n + c.articles.length, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Centre</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles…"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")} style={styles.clearBtn}>
            <Feather name="x" size={14} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!query && (
          <View style={styles.intro}>
            <Text style={styles.introText}>
              Browse guides below or search by keyword. For the full Help Centre with all articles, visit our website.
            </Text>
            <TouchableOpacity
              style={styles.webButton}
              onPress={() => Linking.openURL("https://bdefarmtrac.co.uk/help")}
            >
              <Feather name="external-link" size={15} color="#fff" />
              <Text style={styles.webButtonText}>Open Full Help Centre</Text>
            </TouchableOpacity>
          </View>
        )}

        {query && (
          <Text style={styles.resultsMeta}>
            {totalResults === 0
              ? "No articles found"
              : `${totalResults} article${totalResults === 1 ? "" : "s"} found`}
          </Text>
        )}

        {filtered.map((cat) =>
          query ? (
            <CategorySectionExpanded key={cat.title} category={cat} />
          ) : (
            <CategorySection key={cat.title} category={cat} />
          )
        )}

        {totalResults === 0 && query && (
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={colors.borderLight} />
            <Text style={styles.emptyTitle}>No results for "{search}"</Text>
            <Text style={styles.emptyText}>
              Try a different keyword, or open the full Help Centre for all articles.
            </Text>
            <TouchableOpacity
              style={styles.webButton}
              onPress={() => Linking.openURL("https://bdefarmtrac.co.uk/help")}
            >
              <Feather name="external-link" size={15} color="#fff" />
              <Text style={styles.webButtonText}>Open Full Help Centre</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Feather name="mail" size={16} color={colors.textTertiary} />
          <Text style={styles.footerText}>
            Can't find what you need?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => Linking.openURL("mailto:support@bdefarmtrac.co.uk")}
            >
              Contact support
            </Text>
          </Text>
        </View>

        <View style={{ height: 60 }} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  intro: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  introText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  webButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0369a1",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  webButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  resultsMeta: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  articleCount: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    backgroundColor: colors.borderLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  articleList: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  articleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  articleSummary: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  articleDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    justifyContent: "center",
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: fonts.semiBold,
    color: "#0369a1",
  },
});
