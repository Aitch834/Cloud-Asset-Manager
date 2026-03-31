import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import {
  getCachedBatches,
  getCachedHerds,
  getCachedSuppliers,
  getRefCacheSyncedMinsAgo,
  syncRefData,
  type RefBatch,
} from "@/lib/refCache";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { FeedRecord } from "@/lib/types";

const FEED_TYPES = [
  { key: "compound-pellets", label: "Compound Pellets" },
  { key: "rolled-barley", label: "Rolled Barley" },
  { key: "wholecrop-silage", label: "Wholecrop Silage" },
  { key: "grass-silage", label: "Grass Silage" },
  { key: "maize-silage", label: "Maize Silage" },
  { key: "hay", label: "Hay" },
  { key: "straw", label: "Straw (feed)" },
  { key: "sugar-beet-pulp", label: "Sugar Beet Pulp" },
  { key: "distillers-grains", label: "Distillers' Grains" },
  { key: "soya-meal", label: "Soya Meal" },
  { key: "rape-meal", label: "Rape Meal" },
  { key: "minerals", label: "Minerals / Boluses" },
  { key: "creep-feed", label: "Creep Feed" },
  { key: "milk-replacer", label: "Milk Replacer" },
  { key: "total-mixed-ration", label: "Total Mixed Ration (TMR)" },
  { key: "other", label: "Other" },
];

function FeedTypeGrid({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (k: string) => void;
}) {
  return (
    <View style={styles.feedGrid}>
      {FEED_TYPES.map((f) => {
        const selected = value === f.key;
        return (
          <Pressable
            key={f.key}
            style={[styles.feedChip, selected && styles.feedChipSelected]}
            onPress={() => onSelect(f.key)}
          >
            <Text style={[styles.feedChipText, selected && styles.feedChipTextSelected]}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function FeedRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id ?? "";

  const [herdName, setHerdName] = useState("");
  const [feedType, setFeedType] = useState("");
  const [customFeedType, setCustomFeedType] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [feedDate, setFeedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const [herdOptions, setHerdOptions] = useState<LookupOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<LookupOption[]>([]);
  const [batchOptions, setBatchOptions] = useState<LookupOption[]>([]);
  const [batchRaw, setBatchRaw] = useState<RefBatch[]>([]);
  const [herdSyncMins, setHerdSyncMins] = useState<number | null>(null);
  const [supplierSyncMins, setSupplierSyncMins] = useState<number | null>(null);
  const [batchSyncMins, setBatchSyncMins] = useState<number | null>(null);

  const loadRefData = useCallback(async () => {
    if (!farmId) return;
    const [herds, suppliers, batches] = await Promise.all([
      getCachedHerds(farmId),
      getCachedSuppliers(farmId),
      getCachedBatches(farmId),
    ]);
    const [hMins, sMins, bMins] = await Promise.all([
      getRefCacheSyncedMinsAgo("herds", farmId),
      getRefCacheSyncedMinsAgo("suppliers", farmId),
      getRefCacheSyncedMinsAgo("batches", farmId),
    ]);
    setHerdOptions(
      herds.map((h) => ({ id: h.id, label: h.label, sublabel: h.type })),
    );
    setSupplierOptions(
      suppliers.map((s) => ({
        id: s.id,
        label: s.label,
        sublabel: s.supplierType !== "general" ? s.supplierType : undefined,
      })),
    );
    setBatchRaw(batches);
    setBatchOptions(batches.map((b) => ({ id: b.id, label: b.label, sublabel: b.supplierName })));
    setHerdSyncMins(hMins);
    setSupplierSyncMins(sMins);
    setBatchSyncMins(bMins);
  }, [farmId]);

  useEffect(() => {
    loadRefData();
    if (farmId) {
      syncRefData(farmId)
        .then(() => loadRefData())
        .catch(() => {});
    }
  }, [farmId, loadRefData]);

  function handleSupplierSelect(id: string, label: string) {
    setSupplierId(id);
    setSupplierName(label);
    setBatchNumber("");
    if (id && id !== "__manual__") {
      const filtered = batchRaw.filter((b) => b.supplierId === id);
      setBatchOptions(filtered.map((b) => ({ id: b.id, label: b.label, sublabel: b.supplierName })));
    } else {
      setBatchOptions(batchRaw.map((b) => ({ id: b.id, label: b.label, sublabel: b.supplierName })));
    }
  }

  function handleBatchSelect(id: string, label: string) {
    if (id === "__manual__") {
      setBatchNumber(label);
      return;
    }
    const match = batchRaw.find((b) => b.id === id);
    if (match) {
      setBatchNumber(match.batchNumber || match.lotNumber || label);
    } else {
      setBatchNumber(label);
    }
  }

  const handleSave = async () => {
    const resolvedFeedType = feedType === "other" ? customFeedType.trim() : feedType;
    if (!herdName.trim() || !resolvedFeedType) {
      Alert.alert("Required Fields", "Please enter the herd/flock name and select a feed type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: FeedRecord = {
      id: generateId(),
      farmId,
      herdName: herdName.trim(),
      feedType: resolvedFeedType,
      supplier: supplierName.trim(),
      batchNumber: batchNumber.trim(),
      quantityKg: quantityKg.trim(),
      feedDate,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.FEED_RECORDS, record);
      await refreshPendingCount();
      Alert.alert(
        "Feed Record Saved",
        "The feed record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save feed record error:", err);
      Alert.alert("Save Failed", "Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Feed Record</Text>
          <Text style={styles.headerSub}>Feed delivery & ration log</Text>
        </View>
        <View style={styles.greenBadge}>
          <Feather name="package" size={14} color="#065F46" />
          <Text style={styles.greenBadgeText}>Traceability</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoNote}>
          <Feather name="info" size={14} color="#065F46" style={{ marginTop: 2 }} />
          <Text style={styles.infoNoteText}>
            Red Tractor requires feed records including supplier name and batch/lot number for
            traceability audits. Retain purchase invoices to match batch numbers.
          </Text>
        </View>

        <Section title="Herd / Flock">
          <Text style={styles.label}>Herd or Flock *</Text>
          <LookupPicker
            label="Select Herd or Flock"
            value={herdName}
            onSelect={(id, label) => {
              setHerdName(id === "__manual__" ? label : label);
            }}
            options={herdOptions}
            placeholder="Select herd or flock…"
            syncedMinsAgo={herdSyncMins}
            icon="users"
            emptyMessage="No herds or flocks found in cache. Add herds via the Livestock module on the web dashboard, then open this screen while connected to sync."
          />
        </Section>

        <Section title="Feed Type *">
          <FeedTypeGrid value={feedType} onSelect={setFeedType} />
          {feedType === "other" && (
            <>
              <Text style={[styles.label, { marginTop: spacing.sm }]}>Specify Feed Type</Text>
              <Input
                placeholder="Describe the feed..."
                value={customFeedType}
                onChangeText={setCustomFeedType}
              />
            </>
          )}
        </Section>

        <Section title="Supplier & Traceability">
          <Text style={styles.label}>Supplier / Source</Text>
          <LookupPicker
            label="Select Supplier"
            value={supplierName}
            onSelect={handleSupplierSelect}
            options={supplierOptions}
            placeholder="Select supplier…"
            syncedMinsAgo={supplierSyncMins}
            icon="truck"
            emptyMessage="No suppliers cached. Add suppliers via the Stock & Suppliers module on the web dashboard, then open this screen while connected."
          />

          <Text style={[styles.label, { marginTop: spacing.sm }]}>Batch / Lot Number</Text>
          <LookupPicker
            label={supplierId ? `Select Batch — ${supplierName}` : "Select Batch / Lot"}
            value={batchNumber}
            onSelect={handleBatchSelect}
            options={batchOptions}
            placeholder={
              supplierId
                ? `Select a GRN batch for ${supplierName}…`
                : "Select supplier first, or search all batches…"
            }
            syncedMinsAgo={batchSyncMins}
            icon="hash"
            emptyMessage="No GRN batches found. Log stock deliveries via the Stock & Suppliers module, then sync to use batch lookup."
          />
          {batchNumber.length > 0 && (
            <View style={styles.batchConfirm}>
              <Feather name="check-circle" size={12} color="#059669" />
              <Text style={styles.batchConfirmText}>Batch: {batchNumber}</Text>
            </View>
          )}
        </Section>

        <Section title="Quantity & Date">
          <Text style={styles.label}>Quantity (kg)</Text>
          <Input
            placeholder="e.g. 500"
            value={quantityKg}
            onChangeText={setQuantityKg}
            keyboardType="decimal-pad"
          />
          <Text style={styles.label}>Feed Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={feedDate}
            onChangeText={setFeedDate}
            keyboardType="numbers-and-punctuation"
          />
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Any additional notes — ration changes, refusals, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          onPress={handleSave}
          disabled={saving}
          style={{ backgroundColor: "#059669" }}
        >
          {saving ? "Saving…" : "Save Feed Record"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  greenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  greenBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: "#065F46",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  infoNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#065F46",
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  feedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  feedChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedChipSelected: {
    backgroundColor: "#059669",
    borderColor: "#059669",
  },
  feedChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  feedChipTextSelected: {
    color: "#fff",
  },
  batchConfirm: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  batchConfirmText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#059669",
  },
  footer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
