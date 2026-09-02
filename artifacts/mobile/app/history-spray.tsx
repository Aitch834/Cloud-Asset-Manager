import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { getPendingSyncItems, requestPendingSyncItemDiscard } from "@/lib/database";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS } from "@/lib/storage";
import { scheduleSync } from "@/lib/sync-engine";

interface SprayRecord {
  id: number | string;
  applicationDate: string | null;
  productName: string | null;
  fieldName: string | null;
  targetCrop: string | null;
  areaSprayedHa: number | string | null;
  operatorName: string | null;
  productCategory: string | null;
  reasonForApplication: string | null;
  productId?: number | null;
  lerapCategory?: string | null;
  lerapStandardBufferM?: string | null;
  applicationRate?: string | null;
  rateUnit?: string | null;
  windSpeedKmh?: number | string | null;
  windDirection?: string | null;
  temperatureC?: number | string | null;
  humidity?: number | string | null;
  pressure?: number | string | null;
  equipmentUsed?: string | null;
  notes?: string | null;
  waterSourceNearby?: string | null;
  bufferZoneMetres?: number | string | null;
  productCostPencePerUnit?: number | string | null;
  growthStage?: string | null;
  createdAt?: string | null;
  pending?: boolean;
  localId?: string | null;
  pendingData?: Record<string, unknown>;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

export default function HistorySprayScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { pendingCount, refreshPendingCount } = useSync();
  const { records, loading, refreshing, error, refresh } = useApiFetch<SprayRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/spray-applications",
  );

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [pendingRecords, setPendingRecords] = useState<SprayRecord[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadPending = useCallback(async () => {
    if (!currentFarm?.id) {
      setPendingRecords([]);
      return;
    }

    const pendingItems = await getPendingSyncItems();
    const pending = pendingItems
      .filter((item) => item.record_type === STORAGE_KEYS.SPRAY_RECORDS)
      .map((item): SprayRecord | null => {
        try {
          const data = JSON.parse(item.data_json) as Record<string, unknown>;
          if (String(data.farmId ?? "") !== String(currentFarm.id) || data._discardRequested === true) {
            return null;
          }
          return {
            id: item.record_id,
            localId: item.record_id,
            pending: true,
            pendingData: data,
            applicationDate: String(data.applicationDate ?? data.startTime ?? data.createdAt ?? ""),
            productName: data.productName ? String(data.productName) : null,
            fieldName: data.fieldName ? String(data.fieldName) : null,
            targetCrop: data.targetCrop ? String(data.targetCrop) : null,
            areaSprayedHa: data.areaSprayedHa == null ? null : String(data.areaSprayedHa),
            operatorName: data.operatorName ? String(data.operatorName) : null,
            productCategory: data.lerapCategory ? String(data.lerapCategory) : null,
            reasonForApplication: data.notes ? String(data.notes) : null,
            productId: data.productId == null ? null : Number(data.productId),
            lerapCategory: data.lerapCategory ? String(data.lerapCategory) : null,
            lerapStandardBufferM: data.lerapStandardBufferM ? String(data.lerapStandardBufferM) : null,
            applicationRate: data.applicationRate ? String(data.applicationRate) : null,
            rateUnit: data.applicationUnit ? String(data.applicationUnit) : null,
            windSpeedKmh: data.windSpeed == null ? null : String(data.windSpeed),
            windDirection: data.windDirection ? String(data.windDirection) : null,
            temperatureC: data.temperature == null ? null : String(data.temperature),
            equipmentUsed: data.equipmentUsed ? String(data.equipmentUsed) : null,
            notes: data.notes ? String(data.notes) : null,
            waterSourceNearby: data.waterSourceNearby ? String(data.waterSourceNearby) : null,
            bufferZoneMetres: data.bufferZoneMetres == null ? null : String(data.bufferZoneMetres),
            productCostPencePerUnit: data.productCostPencePerUnit == null ? null : Number(data.productCostPencePerUnit),
            growthStage: data.growthStage ? String(data.growthStage) : null,
            createdAt: data.createdAt ? String(data.createdAt) : null,
          };
        } catch {
          return null;
        }
      })
      .filter((record): record is SprayRecord => record !== null);
    setPendingRecords(pending);
  }, [currentFarm?.id]);

  useEffect(() => {
    void loadPending();
  }, [loadPending, pendingCount]);

  const allRecords = useMemo(() => [...pendingRecords, ...records], [pendingRecords, records]);

  const years = useMemo(
    () => Array.from(new Set(allRecords.map(r => yearOf(r.applicationDate)).filter(Boolean))).sort().reverse(),
    [allRecords],
  );

  const filtered = useMemo(() => {
    let list = allRecords;
    if (yearFilter !== "all") list = list.filter(r => yearOf(r.applicationDate) === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.productName ?? "").toLowerCase().includes(q) ||
        (r.fieldName ?? "").toLowerCase().includes(q) ||
        (r.targetCrop ?? "").toLowerCase().includes(q) ||
        (r.operatorName ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [allRecords, yearFilter, search]);

  const handleEditPending = (record: SprayRecord) => {
    if (!record.localId) return;
    const data = record.pendingData ?? {};
    router.push({
      pathname: "/spray-record",
      params: {
        pendingId: record.localId,
        fieldName: String(data.fieldName ?? ""),
        targetCrop: String(data.targetCrop ?? ""),
        growthStage: String(data.growthStage ?? ""),
        productName: String(data.productName ?? ""),
        productId: data.productId == null ? "" : String(data.productId),
        lerapCategory: String(data.lerapCategory ?? ""),
        lerapStandardBufferM: String(data.lerapStandardBufferM ?? ""),
        areaSprayedHa: String(data.areaSprayedHa ?? ""),
        applicationRate: String(data.applicationRate ?? ""),
        applicationUnit: String(data.applicationUnit ?? "L/ha"),
        windSpeed: String(data.windSpeed ?? ""),
        windDirection: String(data.windDirection ?? ""),
        temperature: String(data.temperature ?? ""),
        humidity: String(data.humidity ?? ""),
        pressure: String(data.pressure ?? ""),
        operatorName: String(data.operatorName ?? ""),
        equipmentUsed: String(data.equipmentUsed ?? ""),
        notes: String(data.notes ?? ""),
        productCostPencePerUnit: data.productCostPencePerUnit == null
          ? ""
          : String(Number(data.productCostPencePerUnit) / 100),
        waterSourceNearby: String(data.waterSourceNearby ?? ""),
        bufferZoneMetres: String(data.bufferZoneMetres ?? ""),
        latitude: String(data.latitude ?? ""),
        longitude: String(data.longitude ?? ""),
        linkedWeatherDate: String(data.linkedWeatherDate ?? ""),
        detectedFieldId: String(data.detectedFieldId ?? ""),
        photoIds: JSON.stringify(data.photoIds ?? []),
        startTime: String(data.startTime ?? ""),
        endTime: String(data.endTime ?? ""),
        createdAt: String(data.createdAt ?? ""),
      },
    });
  };

  const handleDeletePending = (record: SprayRecord) => {
    if (!record.localId) return;
    Alert.alert(
      "Discard Pending Spray Record",
      `Remove "${record.productName ?? "this spray record"}"? It has not been saved to the server yet.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            setDeleting(record.localId!);
            try {
              const queued = await requestPendingSyncItemDiscard(
                STORAGE_KEYS.SPRAY_RECORDS,
                record.localId!,
              );
              if (!queued) {
                throw new Error("Pending spray record is no longer available");
              }
              setPendingRecords((previous) => previous.filter((item) => item.localId !== record.localId));
              await refreshPendingCount();
              await scheduleSync();
            } catch {
              Alert.alert("Error", "Could not discard this spray record. Please try again.");
            } finally {
              setDeleting(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Spray Applications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product, field or operator…"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll} contentContainerStyle={styles.yearScrollContent}>
          {["all", ...years].map(y => (
            <Pressable key={y} onPress={() => setYearFilter(y)} style={[styles.yearPill, yearFilter === y && styles.yearPillActive]}>
              <Text style={[styles.yearPillText, yearFilter === y && styles.yearPillTextActive]}>
                {y === "all" ? "All years" : y}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading && allRecords.length === 0 ? (
        <View style={styles.centre}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error && allRecords.length === 0 ? (
        <View style={styles.centre}>
          <Feather name="wifi-off" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Could not load records</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
           keyExtractor={item => item.pending && item.localId ? `pending-${item.localId}` : `server-${item.id}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          contentContainerStyle={filtered.length === 0 ? styles.centre : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="droplet" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No spray records{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</Text>
              <Text style={styles.emptySubtitle}>Spray applications recorded on the dashboard will appear here.</Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.countLabel}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
           renderItem={({ item }) => (
             <Pressable
               style={({ pressed }) => [styles.card, item.pending && pressed && styles.cardPressed]}
               onPress={() => { if (item.pending) handleEditPending(item); }}
               disabled={!item.pending}
               accessibilityRole={item.pending ? "button" : undefined}
               accessibilityLabel={item.pending ? `Edit pending spray record for ${item.productName ?? "unknown product"}` : undefined}
             >
              <View style={styles.cardHeader}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{formatDate(item.applicationDate)}</Text>
                </View>
                {item.productCategory ? (
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{item.productCategory}</Text>
                  </View>
                ) : null}
                 {item.pending ? (
                   <View style={styles.pendingBadge}>
                     <Text style={styles.pendingBadgeText}>Pending sync</Text>
                   </View>
                 ) : null}
                 {item.pending ? (
                   <Pressable
                     onPress={(event) => { event.stopPropagation(); handleDeletePending(item); }}
                     hitSlop={8}
                     disabled={deleting === item.localId}
                     style={styles.deleteButton}
                     accessibilityRole="button"
                     accessibilityLabel={`Discard pending spray record for ${item.productName ?? "unknown product"}`}
                   >
                     {deleting === item.localId
                       ? <ActivityIndicator size="small" color={colors.textSecondary} />
                       : <Feather name="trash-2" size={16} color={colors.textSecondary} />}
                   </Pressable>
                 ) : null}
              </View>
              <Text style={styles.cardTitle}>{item.productName ?? "Unknown product"}</Text>
              {item.fieldName ? <Text style={styles.cardSub}>📍 {item.fieldName}{item.targetCrop ? ` · ${item.targetCrop}` : ""}</Text> : null}
              <View style={styles.cardRow}>
                {item.areaSprayedHa != null ? (
                  <View style={styles.chip}>
                    <Feather name="maximize-2" size={11} color={colors.textSecondary} />
                    <Text style={styles.chipText}>{Number(item.areaSprayedHa).toFixed(2)} ha</Text>
                  </View>
                ) : null}
                {item.operatorName ? (
                  <View style={styles.chip}>
                    <Feather name="user" size={11} color={colors.textSecondary} />
                    <Text style={styles.chipText}>{item.operatorName}</Text>
                  </View>
                ) : null}
              </View>
              {item.reasonForApplication ? (
                <Text style={styles.cardNote} numberOfLines={2}>{item.reasonForApplication}</Text>
              ) : null}
             </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, alignItems: "flex-start" },
  title: { flex: 1, textAlign: "center", fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  filterBar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: spacing.sm },
  searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.lg, backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text },
  yearScroll: { flexGrow: 0 },
  yearScrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  yearPill: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  yearPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearPillText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  yearPillTextActive: { color: colors.textInverse },
  listContent: { padding: spacing.lg, gap: spacing.md },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyWrap: { alignItems: "center", paddingTop: spacing.xl * 2 },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.md, textAlign: "center" },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center", maxWidth: 280 },
  retryBtn: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md },
  retryText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textInverse },
  countLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2 },
  cardPressed: { opacity: 0.65 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  dateBadge: { backgroundColor: colors.primaryMuted + "33", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  dateBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primaryDark },
  catBadge: { backgroundColor: colors.infoBg, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  catBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.info },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  cardSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xs },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs, fontStyle: "italic" },
  pendingBadge: { backgroundColor: "#f1f5f9", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  pendingBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  deleteButton: { padding: 4, marginLeft: "auto" },
});
