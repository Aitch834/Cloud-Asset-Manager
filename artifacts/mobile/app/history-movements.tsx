import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { getItem, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase } from "@/lib/uploadPhoto";

interface MovementRecord {
  id: number;
  movementDate: string;
  movementType: string;
  species: string | null;
  numberOfAnimals: number | null;
  fromLocation: string | null;
  toLocation: string | null;
  reason: string | null;
  legalNotificationSubmitted: boolean;
  earTagNumbers: string | null;
  licenceNumber: string | null;
  lisSource: string | null;
  lisMovementRef: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

const MOVE_TYPE_LABELS: Record<string, string> = {
  "on": "Move ON",
  "off": "Move OFF",
  "on-farm": "On-Farm",
  "birth": "Birth",
  "death": "Death",
};

const MOVE_TYPE_COLOURS: Record<string, { text: string; bg: string }> = {
  "on": { text: "#15803d", bg: "#dcfce7" },
  "off": { text: "#b91c1c", bg: "#fee2e2" },
  "on-farm": { text: "#1d4ed8", bg: "#dbeafe" },
  "birth": { text: "#6d28d9", bg: "#ede9fe" },
  "death": { text: "#374151", bg: "#f3f4f6" },
};

export default function HistoryMovementsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<MovementRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/movements",
  );
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("movements-history", currentFarm?.id, user?.id);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const years = useMemo(
    () => Array.from(new Set(records.map(r => yearOf(r.movementDate)).filter(Boolean))).sort().reverse(),
    [records],
  );

  const types = useMemo(
    () => Array.from(new Set(records.map(r => r.movementType).filter(Boolean))),
    [records],
  );

  const filtered = useMemo(() => {
    let list = records;
    if (yearFilter !== "all") list = list.filter(r => yearOf(r.movementDate) === yearFilter);
    if (typeFilter !== "all") list = list.filter(r => r.movementType === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.species ?? "").toLowerCase().includes(q) ||
        (r.fromLocation ?? "").toLowerCase().includes(q) ||
        (r.toLocation ?? "").toLowerCase().includes(q) ||
        (r.reason ?? "").toLowerCase().includes(q) ||
        (r.earTagNumbers ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [records, yearFilter, typeFilter, search]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Livestock Movements</Text>
        <View style={{ width: 40 }} />
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="movement submissions"
      />

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search species, location or ear tag…"
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
          {types.length > 0 && <View style={styles.pillDivider} />}
          {types.map(t => (
            <Pressable key={t} onPress={() => setTypeFilter(typeFilter === t ? "all" : t)} style={[styles.yearPill, typeFilter === t && styles.yearPillActive]}>
              <Text style={[styles.yearPillText, typeFilter === t && styles.yearPillTextActive]}>
                {MOVE_TYPE_LABELS[t] ?? t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centre}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : error ? (
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
          keyExtractor={item => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          contentContainerStyle={filtered.length === 0 ? styles.centre : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="shuffle" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No movements{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</Text>
              <Text style={styles.emptySubtitle}>Livestock movements recorded on the dashboard or from LIS will appear here.</Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.countLabel}>{filtered.length} movement{filtered.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const typeColour = MOVE_TYPE_COLOURS[item.movementType] ?? { text: colors.textSecondary, bg: colors.background };
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{formatDate(item.movementDate)}</Text>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: typeColour.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColour.text }]}>
                      {MOVE_TYPE_LABELS[item.movementType] ?? item.movementType}
                    </Text>
                  </View>
                  {item.lisSource === "movement_review" ? (
                    <View style={[styles.typeBadge, { backgroundColor: "#fef3c7" }]}>
                      <Text style={[styles.typeBadgeText, { color: "#92400e" }]}>⏳ Pending Review</Text>
                    </View>
                  ) : item.lisSource === "reviewed_accepted" ? (
                    <View style={[styles.typeBadge, { backgroundColor: "#dcfce7" }]}>
                      <Text style={[styles.typeBadgeText, { color: "#166534" }]}>✓ LIS Accepted</Text>
                    </View>
                  ) : item.lisSource === "reviewed_rejected" ? (
                    <View style={[styles.typeBadge, { backgroundColor: "#fee2e2" }]}>
                      <Text style={[styles.typeBadgeText, { color: "#991b1b" }]}>✗ LIS Rejected</Text>
                    </View>
                  ) : item.lisSource ? (
                    <View style={[styles.typeBadge, { backgroundColor: "#eff6ff" }]}>
                      <Text style={[styles.typeBadgeText, { color: "#2563eb" }]}>LIS</Text>
                    </View>
                  ) : null}
                </View>
                {item.species ? <Text style={styles.cardTitle}>{item.species}</Text> : null}
                <View style={styles.locationRow}>
                  {item.fromLocation ? <Text style={styles.locationText}>{item.fromLocation}</Text> : <Text style={styles.locationPlaceholder}>—</Text>}
                  <Feather name="arrow-right" size={14} color={colors.textTertiary} style={{ marginHorizontal: spacing.sm }} />
                  {item.toLocation ? <Text style={styles.locationText}>{item.toLocation}</Text> : <Text style={styles.locationPlaceholder}>—</Text>}
                </View>
                <View style={styles.cardRow}>
                  {item.numberOfAnimals != null ? (
                    <View style={styles.chip}>
                      <Feather name="users" size={11} color={colors.textSecondary} />
                      <Text style={styles.chipText}>{item.numberOfAnimals} animal{item.numberOfAnimals !== 1 ? "s" : ""}</Text>
                    </View>
                  ) : null}
                  {item.legalNotificationSubmitted ? (
                    <View style={[styles.chip, { backgroundColor: colors.successBg }]}>
                      <Feather name="check-circle" size={11} color={colors.success} />
                      <Text style={[styles.chipText, { color: colors.success }]}>BCMS notified</Text>
                    </View>
                  ) : (
                    <View style={[styles.chip, { backgroundColor: colors.warningBg }]}>
                      <Feather name="alert-circle" size={11} color={colors.warning} />
                      <Text style={[styles.chipText, { color: colors.warning }]}>BCMS pending</Text>
                    </View>
                  )}
                  {item.licenceNumber ? (
                    <View style={styles.chip}>
                      <Feather name="file-text" size={11} color={colors.textSecondary} />
                      <Text style={styles.chipText}>Lic: {item.licenceNumber}</Text>
                    </View>
                  ) : null}
                </View>
                {item.reason ? <Text style={styles.cardNote} numberOfLines={2}>{item.reason}</Text> : null}
                {item.lisSource === "movement_review" && (() => {
                  const rawRef = item.lisMovementRef ?? "";
                  const requestId = Number(rawRef.replace("movement_review:", "").trim()) || 0;
                  const handleReview = () => {
                    if (!currentFarm?.id) return;
                    const arrivalDate = item.movementDate ? new Date(item.movementDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
                    Alert.alert(
                      "Review Inbound Movement",
                      `From: ${item.fromLocation ?? "—"}\nTo: ${item.toLocation ?? "—"}\nAnimals: ${item.numberOfAnimals ?? "—"}\nDate: ${formatDate(item.movementDate)}\n\nAccept to confirm animals arrived, or reject if this movement did not happen.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Reject",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
                              const headers: Record<string, string> = { "Content-Type": "application/json" };
                              if (token) headers["Authorization"] = `Bearer ${token}`;
                              const res = await fetch(`${getApiBase()}/api/farms/${currentFarm.id}/lis/review-movement`, {
                                method: "POST",
                                headers,
                                body: JSON.stringify({ movId: item.id, isAccepted: false, arrivalDate }),
                              });
                              if (res.ok) { Alert.alert("Done", "Movement marked as rejected."); refresh(); }
                              else Alert.alert("Error", "Could not submit review. Try again from the dashboard.");
                            } catch { Alert.alert("Error", "Network error. Please try again."); }
                          },
                        },
                        {
                          text: "Accept",
                          onPress: async () => {
                            try {
                              const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
                              const headers: Record<string, string> = { "Content-Type": "application/json" };
                              if (token) headers["Authorization"] = `Bearer ${token}`;
                              const res = await fetch(`${getApiBase()}/api/farms/${currentFarm.id}/lis/review-movement`, {
                                method: "POST",
                                headers,
                                body: JSON.stringify({ movId: item.id, isAccepted: true, arrivalDate }),
                              });
                              if (res.ok) { Alert.alert("Done", "Movement accepted and recorded."); refresh(); }
                              else Alert.alert("Error", "Could not submit review. Try again from the dashboard.");
                            } catch { Alert.alert("Error", "Network error. Please try again."); }
                          },
                        },
                      ],
                    );
                  };
                  return requestId ? (
                    <Pressable onPress={handleReview} style={styles.reviewBtn}>
                      <Feather name="check-circle" size={13} color="#1d4ed8" />
                      <Text style={styles.reviewBtnText}>Review this movement</Text>
                    </Pressable>
                  ) : null;
                })()}
              </View>
            );
          }}
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
  yearScrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm, alignItems: "center" },
  yearPill: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  yearPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearPillText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  yearPillTextActive: { color: colors.textInverse },
  pillDivider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 4 },
  listContent: { padding: spacing.lg, gap: spacing.md },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyWrap: { alignItems: "center", paddingTop: spacing.xl * 2 },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.md, textAlign: "center" },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center", maxWidth: 280 },
  retryBtn: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md },
  retryText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textInverse },
  countLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  dateBadge: { backgroundColor: colors.primaryMuted + "33", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  dateBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primaryDark },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  typeBadgeText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.xs },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  locationText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  locationPlaceholder: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xs },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs, fontStyle: "italic" },
  reviewBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm, backgroundColor: "#eff6ff", borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf: "flex-start" },
  reviewBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#1d4ed8" },
});
