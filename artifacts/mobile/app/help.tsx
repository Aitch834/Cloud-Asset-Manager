import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
      { title: "Setting up your farm — business details, CPH, sectors and modules", summary: "Four-step setup wizard walks you through business details, farm details, module selection, and subscription." },
      { title: "Adding fields to the Field Register", summary: "Register each field with name, OS parcel reference, area (ha), NVZ designation, and soil type before recording crops or sprays." },
      { title: "Staff Auto-Populate — operator and assessor fields pre-fill from your login", summary: "Operator, assessor, and recorded-by fields across the platform pre-fill from the logged-in user's name — no typing required on same-day records." },
      { title: "Smart Date Validation — how date fields work across the platform", summary: "Dates default to today on new records; future dates are blocked on most record types; treatment withdrawal dates calculate forward automatically." },
    ],
  },
  {
    title: "Carbon & Sustainability",
    icon: "wind",
    color: "#0d9488",
    bgColor: "#f0fdfa",
    articles: [
      { title: "Carbon Auto-Calculator — DEFRA 2023 emission factors and Scope 1, 2 and 3 calculations", summary: "Select a year and tap Pre-fill from Farm Records. The platform reads fuel deliveries, fertiliser applications, livestock herd numbers, and grid electricity and applies DEFRA 2023 emission factors to return Scope 1 and Scope 2 tCO₂e totals with source badges." },
      { title: "Use these figures → Create Carbon Audit", summary: "After the Auto-Calculator returns prefilled totals, tap 'Use these figures → Create Carbon Audit' to open a new audit record with the tCO₂e values already populated. Review and adjust individual line items before saving." },
      { title: "Sustainability Reports — certifying body register, supplier lookup and PO/invoice tracking", summary: "The Sustainability Reports tab tracks every report submitted to supply chain customers. Each record captures the certifying body (searchable list including Carbon Trust, BSI PAS 2060, Agrecalc, and more), submission status, PO reference, and invoice reference." },
      { title: "Carbon audit records — Scope 1, 2 and 3 tCO₂e", summary: "Log annual farm carbon audits with gross emissions by category (enteric fermentation, manure, fuel, fertiliser, purchased feed, purchased electricity), sequestration credits, and net tCO₂e. Year-on-year bar chart shows progress against your baseline." },
      { title: "Carbon Sequestration Auto-Calculator — Woodland Carbon Code and Peatland Code factors", summary: "Select a year and the platform reads your Environmental Features register and Field Season Land Use records to calculate indicative annual sequestration by feature type and area using Woodland Carbon Code, Peatland Code, and DEFRA agri-environment factors." },
      { title: "Biodiversity Net Gain — Defra Metric 4.0 unit calculations", summary: "Log habitat creation records with area, habitat type, and condition score (Distinctly sub-optimal to Excellent on the statutory BNG metric scale). Estimated biodiversity units calculated automatically." },
    ],
  },
  {
    title: "Sprays & Inputs",
    icon: "droplet",
    color: "#16a34a",
    bgColor: "#f0fdf4",
    articles: [
      { title: "Recording spray applications — product, dose, operator and field", summary: "Log each spray event with date, product, dose, area, operator (PA certificate auto-filled), and target pest or weed. LERAP buffer and withholding period calculated automatically from product data." },
      { title: "IPM Plan — integrated pest management compliance record", summary: "The five-section IPM Plan is a structured written document required by Red Tractor. Spray records link back to the plan via the Spray Rationale field for a complete monitoring-to-application audit trail." },
      { title: "LERAP Assessments — recording assessments for sprays near watercourses", summary: "For Category A/B products adjacent to a watercourse, record the CRD Assessment Step, standard buffer distance, crop type, and soil type. Assessor must hold PA1 + PA2/PA6 certificates." },
      { title: "Spray Store Stocktake — recording a physical stock count on mobile", summary: "Open the Record tab and tap 'Spray Store Stocktake'. Select the spray product from your cached product list — the system quantity auto-fills from the product's current stock record. Enter the physical quantity you have counted in litres. A live variance badge shows the difference (green = zero, amber = surplus, red = shortfall). Enter who conducted the count, confirm the date, add any notes, and tap Save. Records are stored offline and sync to the Spray Store Stocktakes tab on the dashboard automatically when connectivity is restored." },
    ],
  },
  {
    title: "Grain & Crop Storage",
    icon: "package",
    color: "#b45309",
    bgColor: "#fffbeb",
    articles: [
      { title: "Grain Store Stocktake — recording a physical probe or weighbridge measurement on mobile", summary: "Open the Record tab and tap 'Grain Store Stocktake'. Select the storage bin or location, then enter the physical quantity in tonnes from your probe reading, auger sample, weighbridge, or visual estimate. The system quantity can be entered manually to see a live variance badge (green = zero, amber = surplus, red = shortfall). Select the measurement method, enter who conducted the stocktake, confirm the date and add any notes, then tap Save. Records are stored offline and sync to the Grain Store Stocktakes tab on the dashboard automatically when connectivity is restored." },
      { title: "Crop stock stocktake history — viewing records on the dashboard", summary: "Stocktake records captured on mobile sync to the dashboard. Open the Grain Store (Crop Stock) page and select the Stocktakes tab to view all historical entries with their variance badges, measurement methods, system quantities, physical quantities, and conducted-by attribution." },
      { title: "Stock movements — recording intakes, dispatches, and transfers", summary: "Grain and crop stock movements (intake, dispatch, on-farm transfer, sample withdrawal, drying loss, and manual adjustment) are recorded on the dashboard Grain Store page. Each movement can be linked to a haulage record, grain sale, or harvest record for a complete chain of custody from field to merchant." },
    ],
  },
  {
    title: "Livestock & Feed",
    icon: "heart",
    color: "#dc2626",
    bgColor: "#fef2f2",
    articles: [
      { title: "Recording livestock movements — on-farm, off-farm and BCMS submission", summary: "Log every cattle, sheep, goat, or deer movement with date, animals, and destination. One-click BCMS submission for cattle (CTS Web Services) and LIS for sheep, goats, and deer." },
      { title: "Medicine records — withdrawal period calculation and AMTRA compliance", summary: "Log veterinary medicines with product name, batch number, route, dose, prescribing vet, and withdrawal period. Clearance date auto-calculated. AMTRA SQP compliance fields included." },
      { title: "Vet Health Plans — recording action completion and manager sign-off", summary: "Annual vet-signed health plans with review date tracking. Action completion is recorded against individual plan items with sign-off by a named farm manager." },
      { title: "Welfare Outcome Assessments — assessor type, species measures and walkthrough tally", summary: "Select Staff Member or External Assessor. Measures adapt to the selected species (cattle, sheep, pig, poultry). For internal assessors, use the Walkthrough Tally to count animals per category during the walk — tallies feed the outcome scores. For external assessors, the expected fee auto-generates a purchase order on save. Records save offline and sync automatically." },
    ],
  },
  {
    title: "Organic Compliance",
    icon: "sun",
    color: "#ca8a04",
    bgColor: "#fefce8",
    articles: [
      { title: "Organic Compliance module — overview and getting started", summary: "Complementary records alongside your Soil Association or OF&G certifier portal. Covers certification status, field conversion tracker, inspection log, restricted inputs register, and mobile offline recording." },
      { title: "Organic Arable — input log, seed sourcing and harvest declarations", summary: "Log Annex II approved inputs, record seed sourcing with derogation approval flow, and capture harvest declarations with certifier harvest reference." },
      { title: "Feed Derogations — Art. 22 case register with correspondence log", summary: "One case per non-organic ingredient tracks the full lifecycle from application through approval to expiry. Correspondence log and document upload for approval letters and availability search evidence." },
    ],
  },
  {
    title: "Inspections & Audits",
    icon: "check-square",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    articles: [
      { title: "Red Tractor Audit Pack Generator — assembling evidence packs for assessor visits", summary: "The Audit Pack Generator assembles a complete evidence pack from your existing records across all modules. Select the scheme, date range, and record types to include." },
      { title: "Inspector Mode — Advisor Portal filtered compliance view", summary: "Inspector Mode gives your Red Tractor assessor or agronomist advisor a filtered read-only view of your compliance records — no editing access, no confidential financial data." },
    ],
  },
  {
    title: "Mobile App",
    icon: "smartphone",
    color: "#0369a1",
    bgColor: "#e0f2fe",
    articles: [
      { title: "Offline mode — records stored in SQLite until synced", summary: "All record types save to the on-device SQLite database when you are out of mobile coverage. Records sync automatically when connectivity is restored, or tap Sync Now in Settings." },
      { title: "Push notifications — task assignment alerts on mobile", summary: "When a task is assigned to you, a push notification is delivered to your device alongside the SMS alert. Tapping the notification opens the Task Inbox directly." },
      { title: "Bluetooth RFID scanning — reading cattle and sheep ear tags", summary: "Pair a Bluetooth RFID reader in Settings → RFID Reader. Once paired, the scan button appears on livestock movement, medicine, and weigh-in record forms. Scanned tags fill the ear tag field automatically." },
    ],
  },
];

function ArticleItem({ article, isLast }: { article: Article; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Pressable
        style={styles.articleRow}
        onPress={() => setExpanded((v) => !v)}
      >
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

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help Centre</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.intro}>
          <Text style={styles.introText}>
            Browse guides and FAQs below. Tap any article to expand it. For the full Help Centre with all articles, visit our website.
          </Text>
          <TouchableOpacity
            style={styles.webButton}
            onPress={() => Linking.openURL("https://bdefarmtrac.co.uk/help")}
          >
            <Feather name="external-link" size={15} color="#fff" />
            <Text style={styles.webButtonText}>Open Full Help Centre</Text>
          </TouchableOpacity>
        </View>

        {CATEGORIES.map((cat) => (
          <CategorySection key={cat.title} category={cat} />
        ))}

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
