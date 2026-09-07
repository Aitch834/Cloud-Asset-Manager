import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/apiFetch";
import { getMobileAuthToken as getCurrentAuthToken } from "@/lib/authToken";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList, generateId } from "@/lib/storage";

const RECORD_TYPES = [
  { value: "daily-temperature", label: "Daily Temperature Check" },
  { value: "cleaning",          label: "Tank Cleaning" },
  { value: "antibiotic-residue-test", label: "Antibiotic Residue Test" },
  { value: "maintenance",       label: "Tank Maintenance" },
];

const ABR_RESULTS = ["negative", "positive", "borderline", "invalid"];

type MilkCollection = {
  id: number;
  tankId?: number | null;
  collectionDate: string;
  volumeCollectedLitres?: string | null;
  milkBuyer?: string | null;
  tankerRegistration?: string | null;
  tankerDriverName?: string | null;
  collectionRef?: string | null;
  statementRef?: string | null;
  abtResultBeforeCollection?: string | null;
  pencePerLitre?: string | null;
  grossValuePence?: number | null;
  qualityBonusPence?: number | null;
  qualityPenaltyPence?: number | null;
  transportDeductionPence?: number | null;
  netPaymentPence?: number | null;
  buyerSccThousands?: number | null;
  buyerBactoscanThousands?: number | null;
  buyerTvcCfuMl?: number | null;
  buyerThermsCfuMl?: number | null;
  buyerColiformsCfuMl?: number | null;
  buyerFatPercent?: string | null;
  buyerProteinPercent?: string | null;
  buyerCaseinPercent?: string | null;
  buyerLactosePercent?: string | null;
  buyerUreaMillimolesPerLitre?: string | null;
  notes?: string | null;
};

type StatementForm = {
  statementRef: string;
  pencePerLitre: string;
  grossValue: string;
  qualityBonus: string;
  qualityPenalty: string;
  transportDeduction: string;
  netPayment: string;
  buyerSccThousands: string;
  buyerBactoscanThousands: string;
  buyerTvcCfuMl: string;
  buyerThermsCfuMl: string;
  buyerColiformsCfuMl: string;
  buyerFatPercent: string;
  buyerProteinPercent: string;
  buyerCaseinPercent: string;
  buyerLactosePercent: string;
  buyerUreaMillimolesPerLitre: string;
};

type StatementValidationErrors = Partial<Record<keyof StatementForm, string>>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function moneyFromPence(value?: number | null): string {
  return value == null ? "" : (value / 100).toFixed(2);
}

function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function intOrNull(value: string): number | null {
  const parsed = numberOrNull(value);
  return parsed == null ? null : Math.round(parsed);
}

function poundsToPence(value: string): number | null {
  const parsed = numberOrNull(value);
  return parsed == null ? null : Math.round(parsed * 100);
}

function validateStatementForm(form: StatementForm): StatementValidationErrors {
  const errors: StatementValidationErrors = {};
  const validateMoney = (field: keyof StatementForm, label: string) => {
    const value = form[field].trim();
    if (value && !/^\d+(?:\.\d{1,2})?$/.test(value)) {
      errors[field] = `${label} must be a non-negative amount with up to two decimal places.`;
    }
  };
  const validateWholeNumber = (field: keyof StatementForm, label: string) => {
    const value = form[field].trim();
    if (value && !/^\d+$/.test(value)) {
      errors[field] = `${label} must be a whole number.`;
    }
  };
  const validateDecimal = (field: keyof StatementForm, label: string) => {
    const value = form[field].trim();
    if (value && !/^\d+(?:\.\d{1,2})?$/.test(value)) {
      errors[field] = `${label} must be a non-negative number with up to two decimal places.`;
    }
  };

  validateMoney("pencePerLitre", "Pence per litre");
  validateMoney("grossValue", "Gross value");
  validateMoney("qualityBonus", "Quality bonus");
  validateMoney("qualityPenalty", "Quality penalty");
  validateMoney("transportDeduction", "Transport deduction");
  validateMoney("netPayment", "Net payment");
  validateWholeNumber("buyerSccThousands", "SCC");
  validateWholeNumber("buyerBactoscanThousands", "Bactoscan");
  validateWholeNumber("buyerTvcCfuMl", "TVC");
  validateWholeNumber("buyerThermsCfuMl", "Thermodurics");
  validateWholeNumber("buyerColiformsCfuMl", "Coliforms");
  validateDecimal("buyerFatPercent", "Buyer fat");
  validateDecimal("buyerProteinPercent", "Buyer protein");
  validateDecimal("buyerCaseinPercent", "Buyer casein");
  validateDecimal("buyerLactosePercent", "Buyer lactose");
  validateDecimal("buyerUreaMillimolesPerLitre", "Buyer urea");
  return errors;
}

function statementFormFromCollection(collection: MilkCollection): StatementForm {
  return {
    statementRef: collection.statementRef ?? "",
    pencePerLitre: collection.pencePerLitre ?? "",
    grossValue: moneyFromPence(collection.grossValuePence),
    qualityBonus: moneyFromPence(collection.qualityBonusPence),
    qualityPenalty: moneyFromPence(collection.qualityPenaltyPence),
    transportDeduction: moneyFromPence(collection.transportDeductionPence),
    netPayment: moneyFromPence(collection.netPaymentPence),
    buyerSccThousands: collection.buyerSccThousands?.toString() ?? "",
    buyerBactoscanThousands: collection.buyerBactoscanThousands?.toString() ?? "",
    buyerTvcCfuMl: collection.buyerTvcCfuMl?.toString() ?? "",
    buyerThermsCfuMl: collection.buyerThermsCfuMl?.toString() ?? "",
    buyerColiformsCfuMl: collection.buyerColiformsCfuMl?.toString() ?? "",
    buyerFatPercent: collection.buyerFatPercent ?? "",
    buyerProteinPercent: collection.buyerProteinPercent ?? "",
    buyerCaseinPercent: collection.buyerCaseinPercent ?? "",
    buyerLactosePercent: collection.buyerLactosePercent ?? "",
    buyerUreaMillimolesPerLitre: collection.buyerUreaMillimolesPerLitre ?? "",
  };
}

function formatCollectionDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value.slice(0, 10)
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function hasStatementDetails(collection: MilkCollection): boolean {
  return collection.statementRef != null ||
    collection.pencePerLitre != null ||
    collection.netPaymentPence != null ||
    collection.buyerSccThousands != null ||
    collection.buyerFatPercent != null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function BulkTankRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { triggerSync } = useSync();
  const params = useLocalSearchParams<{ tankId?: string; tankName?: string; presetType?: string }>();

  const [recordDate, setRecordDate] = useState(today());
  const [recordType, setRecordType] = useState<string>(params.presetType === "cleaning" ? "cleaning" : "daily-temperature");
  const [temperature, setTemperature] = useState("");
  const [tankCleaned, setTankCleaned] = useState(params.presetType === "cleaning");
  const [cleaningProduct, setCleaningProduct] = useState("");
  const [cleaningBatch, setCleaningBatch] = useState("");
  const [abrResult, setAbrResult] = useState<string>("");
  const [abrRef, setAbrRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const tankId = params.tankId ? parseInt(params.tankId) : null;
  const tankName = params.tankName ?? null;

  const [collections, setCollections] = useState<MilkCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsRefreshing, setCollectionsRefreshing] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [statementCollection, setStatementCollection] = useState<MilkCollection | null>(null);
  const [statementForm, setStatementForm] = useState<StatementForm | null>(null);
  const [statementValidationErrors, setStatementValidationErrors] = useState<StatementValidationErrors>({});
  const [statementSaving, setStatementSaving] = useState(false);

  const loadCollections = useCallback(async (refresh = false) => {
    if (!currentFarm?.id) {
      setCollections([]);
      return;
    }
    if (refresh) setCollectionsRefreshing(true);
    else setCollectionsLoading(true);
    setCollectionsError(null);
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/dairy/milk-collections`);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const data = await res.json() as { collections?: MilkCollection[] };
      setCollections(data.collections ?? []);
    } catch (error) {
      setCollectionsError(error instanceof Error ? error.message : "Could not load milk collections.");
    } finally {
      setCollectionsLoading(false);
      setCollectionsRefreshing(false);
    }
  }, [currentFarm?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadCollections();
    }, [loadCollections]),
  );

  function openStatementSheet(collection: MilkCollection) {
    Haptics.selectionAsync();
    setStatementCollection(collection);
    setStatementForm(statementFormFromCollection(collection));
    setStatementValidationErrors({});
  }

  function closeStatementSheet(force = false) {
    if (statementSaving && !force) return;
    setStatementCollection(null);
    setStatementForm(null);
    setStatementValidationErrors({});
  }

  function setStatementField(field: keyof StatementForm, value: string) {
    setStatementForm(previous => previous ? { ...previous, [field]: value } : previous);
    setStatementValidationErrors(previous => {
      const { [field]: _clearedError, ...remaining } = previous;
      return remaining;
    });
  }

  async function saveStatement() {
    if (!currentFarm || !statementCollection || !statementForm) return;
    const validationErrors = validateStatementForm(statementForm);
    if (Object.keys(validationErrors).length) {
      setStatementValidationErrors(validationErrors);
      Alert.alert("Check statement details", "Correct the highlighted values before saving.");
      return;
    }
    setStatementSaving(true);
    try {
      setStatementValidationErrors({});
      const payload = {
        statementRef: statementForm.statementRef.trim() || null,
        pencePerLitre: statementForm.pencePerLitre.trim() || null,
        grossValuePence: poundsToPence(statementForm.grossValue),
        qualityBonusPence: poundsToPence(statementForm.qualityBonus),
        qualityPenaltyPence: poundsToPence(statementForm.qualityPenalty),
        transportDeductionPence: poundsToPence(statementForm.transportDeduction),
        netPaymentPence: poundsToPence(statementForm.netPayment),
        buyerSccThousands: intOrNull(statementForm.buyerSccThousands),
        buyerBactoscanThousands: intOrNull(statementForm.buyerBactoscanThousands),
        buyerTvcCfuMl: intOrNull(statementForm.buyerTvcCfuMl),
        buyerThermsCfuMl: intOrNull(statementForm.buyerThermsCfuMl),
        buyerColiformsCfuMl: intOrNull(statementForm.buyerColiformsCfuMl),
        buyerFatPercent: statementForm.buyerFatPercent.trim() || null,
        buyerProteinPercent: statementForm.buyerProteinPercent.trim() || null,
        buyerCaseinPercent: statementForm.buyerCaseinPercent.trim() || null,
        buyerLactosePercent: statementForm.buyerLactosePercent.trim() || null,
        buyerUreaMillimolesPerLitre: statementForm.buyerUreaMillimolesPerLitre.trim() || null,
      };
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/dairy/milk-collections/${statementCollection.id}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errorBody.error ?? `Request failed (${res.status})`);
      }
      const data = await res.json() as { collection?: MilkCollection };
      const updated = data.collection ?? { ...statementCollection, ...payload };
      setCollections(previous => previous.map(collection => collection.id === updated.id ? updated : collection));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeStatementSheet(true);
    } catch (error) {
      Alert.alert("Save Failed", error instanceof Error ? error.message : "Could not save statement details. Try again.");
    } finally {
      setStatementSaving(false);
    }
  }

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tankId,
        recordDate,
        recordType,
        tankTemperatureCelsius: temperature ? parseFloat(temperature) : null,
        tankCleaned,
        cleaningProductUsed: tankCleaned ? cleaningProduct || null : null,
        cleaningProductBatch: tankCleaned ? cleaningBatch || null : null,
        antibioticResidueResult: abrResult || null,
        antibioticResidueTestRef: abrRef || null,
        notes: notes || null,
      };

      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        const token = await getCurrentAuthToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const farmRaw = await (await import("@/lib/database")).kvGet("bde_current_farm");
        if (farmRaw) {
          const farm = JSON.parse(farmRaw);
          const slug = farm.tenantSlug || farm.slug || "";
          if (slug) headers["x-tenant-slug"] = slug;
        }
      } catch {}

      const res = await fetch(
        `https://${apiDomain}/api/farms/${currentFarm.id}/dairy/bulk-tank-records`,
        { method: "POST", headers, body: JSON.stringify(payload) }
      );

      if (res.ok) {
        await appendToList(STORAGE_KEYS.PENDING_SYNC, { id: generateId(), savedAt: new Date().toISOString() });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerSync();
        router.back();
      } else {
        const body = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", body.error ?? "Could not save the record. Try again.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not reach the server. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{tankName ? "Tank Monitoring Record" : "Bulk Tank"}</Text>
          {tankName && <Text style={styles.headerSub}>{tankName}</Text>}
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl * 2 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={collectionsRefreshing}
            onRefresh={() => { void loadCollections(true); }}
            tintColor={colors.primary}
          />
        }
      >
        <Section title="Milk Collections">
          <Text style={styles.sectionHint}>
            Add statement details to a collection when your buyer sends the settlement.
          </Text>
          {collectionsLoading && collections.length === 0 ? (
            <View style={styles.collectionState}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.stateText}>Loading milk collections…</Text>
            </View>
          ) : collectionsError && collections.length === 0 ? (
            <View style={styles.collectionState}>
              <Feather name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.stateText}>{collectionsError}</Text>
              <Pressable onPress={() => { void loadCollections(); }} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : collections.length === 0 ? (
            <View style={styles.emptyCollections}>
              <Feather name="droplet" size={20} color={colors.textTertiary} />
              <Text style={styles.stateText}>No milk collections recorded yet.</Text>
            </View>
          ) : (
            <View style={styles.collectionList}>
              {collections.map(collection => (
                <View key={collection.id} style={styles.collectionRow}>
                  <View style={styles.collectionDetails}>
                    <View style={styles.collectionTitleRow}>
                      <Text style={styles.collectionDate}>{formatCollectionDate(collection.collectionDate)}</Text>
                      <View style={[
                        styles.statementBadge,
                        hasStatementDetails(collection) ? styles.statementBadgeComplete : styles.statementBadgePending,
                      ]}>
                        <Text style={[
                          styles.statementBadgeText,
                          hasStatementDetails(collection) ? styles.statementBadgeCompleteText : styles.statementBadgePendingText,
                        ]}>
                          {hasStatementDetails(collection) ? "Statement entered" : "Awaiting statement"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.collectionMeta} numberOfLines={1}>
                      {[collection.milkBuyer, collection.volumeCollectedLitres ? `${collection.volumeCollectedLitres} L` : null]
                        .filter(Boolean)
                        .join(" · ") || "Milk collection"}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Enter statement details for ${formatCollectionDate(collection.collectionDate)}`}
                    onPress={() => openStatementSheet(collection)}
                    style={styles.receiptButton}
                    hitSlop={8}
                  >
                    <Feather name="file-text" size={18} color={colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Section>

        <View style={styles.monitoringDivider} />
        <Section title="Date *">
          <TextInput
            style={styles.input}
            value={recordDate}
            onChangeText={setRecordDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Section title="Record Type *">
          <View style={styles.chipRow}>
            {RECORD_TYPES.map(rt => (
              <Pressable
                key={rt.value}
                style={[styles.chip, recordType === rt.value && styles.chipSelected]}
                onPress={() => { Haptics.selectionAsync(); setRecordType(rt.value); if (rt.value === "cleaning") setTankCleaned(true); }}
              >
                <Text style={[styles.chipText, recordType === rt.value && styles.chipTextSelected]}>{rt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Tank Temperature (°C)">
          <TextInput
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="decimal-pad"
            placeholder="Target ≤4°C"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Section title="Tank Cleaned">
          <View style={styles.switchRow}>
            <Switch
              value={tankCleaned}
              onValueChange={v => { Haptics.selectionAsync(); setTankCleaned(v); }}
              trackColor={{ false: "#e2e8f0", true: colors.primary }}
              thumbColor="#fff"
            />
            <Text style={styles.switchLabel}>{tankCleaned ? "Tank cleaned and sanitised" : "Not cleaned this record"}</Text>
          </View>
        </Section>

        {tankCleaned && (
          <>
            <Section title="Cleaning Product">
              <TextInput
                style={styles.input}
                value={cleaningProduct}
                onChangeText={setCleaningProduct}
                placeholder="e.g. Alkacip Plus"
                placeholderTextColor={colors.textSecondary}
              />
            </Section>
            <Section title="Product Batch Number">
              <TextInput
                style={styles.input}
                value={cleaningBatch}
                onChangeText={setCleaningBatch}
                placeholder="Batch / lot number"
                placeholderTextColor={colors.textSecondary}
              />
            </Section>
          </>
        )}

        <Section title="Antibiotic Residue Result">
          <View style={styles.chipRow}>
            {ABR_RESULTS.map(r => (
              <Pressable
                key={r}
                style={[
                  styles.chip,
                  abrResult === r && (r === "negative" ? styles.chipGreen : r === "positive" ? styles.chipRed : styles.chipSelected),
                ]}
                onPress={() => { Haptics.selectionAsync(); setAbrResult(abrResult === r ? "" : r); }}
              >
                <Text style={[styles.chipText, abrResult === r && styles.chipTextSelected]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="ABR Test Reference">
          <TextInput
            style={styles.input}
            value={abrRef}
            onChangeText={setAbrRef}
            placeholder="Test kit lot / reference"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Section title="Notes">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Any additional observations"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Button
          title={saving ? "Saving…" : "Save Record"}
          onPress={handleSave}
          disabled={saving || !recordDate || !recordType}
          style={styles.saveBtn}
        />
      </ScrollView>

      <Modal
        visible={statementCollection !== null && statementForm !== null}
        transparent
        animationType="slide"
        onRequestClose={() => closeStatementSheet()}
      >
        <KeyboardAvoidingView
          style={styles.sheetOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.sheetBackdrop} onPress={() => closeStatementSheet()} />
          {statementCollection && statementForm && (
            <View style={styles.statementSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleBlock}>
                  <View style={styles.sheetTitleRow}>
                    <Feather name="file-text" size={18} color={colors.primary} />
                    <Text style={styles.sheetTitle}>Milk Statement Details</Text>
                  </View>
                  <Text style={styles.sheetSubtitle}>
                    {formatCollectionDate(statementCollection.collectionDate)}
                    {statementCollection.milkBuyer ? ` · ${statementCollection.milkBuyer}` : ""}
                  </Text>
                </View>
                <Pressable
                  onPress={() => closeStatementSheet()}
                  style={styles.sheetCloseButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close statement details"
                  hitSlop={8}
                >
                  <Feather name="x" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + spacing.lg }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sheetSectionTitle}>Financial Settlement</Text>
                <Text style={styles.sheetHint}>
                  Enter the figures from your buyer’s statement. Amounts are in pounds.
                </Text>
                <Input
                  label="Statement Reference"
                  value={statementForm.statementRef}
                  onChangeText={value => setStatementField("statementRef", value)}
                  placeholder="e.g. ARLA-2026-04"
                />
                <Input
                  label="Pence per Litre"
                  value={statementForm.pencePerLitre}
                  onChangeText={value => setStatementField("pencePerLitre", value)}
                  error={statementValidationErrors.pencePerLitre}
                  placeholder="e.g. 35.50"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Gross Value (£)"
                  value={statementForm.grossValue}
                  onChangeText={value => setStatementField("grossValue", value)}
                  error={statementValidationErrors.grossValue}
                  placeholder="e.g. 3018.00"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Quality Bonus (£)"
                  value={statementForm.qualityBonus}
                  onChangeText={value => setStatementField("qualityBonus", value)}
                  error={statementValidationErrors.qualityBonus}
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Quality Penalty (£)"
                  value={statementForm.qualityPenalty}
                  onChangeText={value => setStatementField("qualityPenalty", value)}
                  error={statementValidationErrors.qualityPenalty}
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Transport Deduction (£)"
                  value={statementForm.transportDeduction}
                  onChangeText={value => setStatementField("transportDeduction", value)}
                  error={statementValidationErrors.transportDeduction}
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Net Payment (£)"
                  value={statementForm.netPayment}
                  onChangeText={value => setStatementField("netPayment", value)}
                  error={statementValidationErrors.netPayment}
                  keyboardType="decimal-pad"
                />

                <View style={styles.sheetSectionDivider} />
                <Text style={styles.sheetSectionTitle}>Buyer Quality Results</Text>
                <Text style={styles.sheetHint}>
                  Add the lab results shown on the buyer’s statement.
                </Text>
                <Input
                  label="Buyer SCC (k/mL)"
                  value={statementForm.buyerSccThousands}
                  onChangeText={value => setStatementField("buyerSccThousands", value)}
                  error={statementValidationErrors.buyerSccThousands}
                  placeholder="e.g. 120"
                  keyboardType="number-pad"
                />
                <Input
                  label="Bactoscan (k/mL)"
                  value={statementForm.buyerBactoscanThousands}
                  onChangeText={value => setStatementField("buyerBactoscanThousands", value)}
                  error={statementValidationErrors.buyerBactoscanThousands}
                  placeholder="e.g. 15"
                  keyboardType="number-pad"
                />
                <Input
                  label="TVC (cfu/mL)"
                  value={statementForm.buyerTvcCfuMl}
                  onChangeText={value => setStatementField("buyerTvcCfuMl", value)}
                  error={statementValidationErrors.buyerTvcCfuMl}
                  keyboardType="number-pad"
                />
                <Input
                  label="Thermodurics (cfu/mL)"
                  value={statementForm.buyerThermsCfuMl}
                  onChangeText={value => setStatementField("buyerThermsCfuMl", value)}
                  error={statementValidationErrors.buyerThermsCfuMl}
                  keyboardType="number-pad"
                />
                <Input
                  label="Coliforms (cfu/mL)"
                  value={statementForm.buyerColiformsCfuMl}
                  onChangeText={value => setStatementField("buyerColiformsCfuMl", value)}
                  error={statementValidationErrors.buyerColiformsCfuMl}
                  keyboardType="number-pad"
                />
                <Input
                  label="Buyer Fat %"
                  value={statementForm.buyerFatPercent}
                  onChangeText={value => setStatementField("buyerFatPercent", value)}
                  error={statementValidationErrors.buyerFatPercent}
                  placeholder="e.g. 4.15"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Buyer Protein %"
                  value={statementForm.buyerProteinPercent}
                  onChangeText={value => setStatementField("buyerProteinPercent", value)}
                  error={statementValidationErrors.buyerProteinPercent}
                  placeholder="e.g. 3.30"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Buyer Casein %"
                  value={statementForm.buyerCaseinPercent}
                  onChangeText={value => setStatementField("buyerCaseinPercent", value)}
                  error={statementValidationErrors.buyerCaseinPercent}
                  placeholder="e.g. 2.60"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Buyer Lactose %"
                  value={statementForm.buyerLactosePercent}
                  onChangeText={value => setStatementField("buyerLactosePercent", value)}
                  error={statementValidationErrors.buyerLactosePercent}
                  placeholder="e.g. 4.70"
                  keyboardType="decimal-pad"
                />
                <Input
                  label="Buyer Urea (mmol/L)"
                  value={statementForm.buyerUreaMillimolesPerLitre}
                  onChangeText={value => setStatementField("buyerUreaMillimolesPerLitre", value)}
                  error={statementValidationErrors.buyerUreaMillimolesPerLitre}
                  placeholder="e.g. 4.5"
                  keyboardType="decimal-pad"
                />

                <View style={styles.sheetActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={closeStatementSheet}
                    disabled={statementSaving}
                    style={styles.sheetCancelButton}
                  />
                  <Button
                    title={statementSaving ? "Saving…" : "Save Statement Details"}
                    onPress={saveStatement}
                    disabled={statementSaving}
                    style={styles.sheetSaveButton}
                  />
                </View>
              </ScrollView>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerTextBlock: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: "#fff" },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  content: { padding: spacing.lg, gap: spacing.md },
  section: { gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  sectionHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 17 },
  collectionList: { gap: spacing.sm },
  collectionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
  },
  collectionDetails: { flex: 1, minWidth: 0 },
  collectionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  collectionDate: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  collectionMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 3 },
  statementBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statementBadgeComplete: { backgroundColor: colors.successBg },
  statementBadgePending: { backgroundColor: colors.warningBg },
  statementBadgeText: { fontFamily: fonts.medium, fontSize: 10 },
  statementBadgeCompleteText: { color: "#166534" },
  statementBadgePendingText: { color: "#92400e" },
  receiptButton: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  collectionState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyCollections: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  stateText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  retryButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  retryText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  monitoringDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  textarea: { minHeight: 80, textAlignVertical: "top", paddingTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipGreen: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipRed: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: "#fff" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.xs },
  switchLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  saveBtn: { marginTop: spacing.lg },
  sheetOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject },
  statementSheet: {
    maxHeight: "92%",
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheetTitleBlock: { flex: 1 },
  sheetTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  sheetSubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  sheetCloseButton: { padding: spacing.xs, marginLeft: spacing.sm },
  sheetContent: { padding: spacing.lg },
  sheetSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sheetHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  sheetSectionDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  sheetActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  sheetCancelButton: { flex: 1 },
  sheetSaveButton: { flex: 2 },
});
