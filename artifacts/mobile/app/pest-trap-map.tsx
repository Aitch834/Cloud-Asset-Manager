import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";

interface PestCapture {
  id: number;
  captureDate: string;
  trapRef?: string | null;
  trapType?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  swdMaleCount?: number | null;
  swdFemaleCount?: number | null;
  totalInsectCount?: number | null;
  pestPressure?: string | null;
  aiSummary?: string | null;
  analysisStatus?: string | null;
  blockId?: number | null;
}

const PRESSURE_COLORS: Record<string, string> = {
  none: "#22c55e",
  low: "#eab308",
  medium: "#f97316",
  high: "#ef4444",
};

function pressureColor(p?: string | null) {
  return PRESSURE_COLORS[p ?? "none"] ?? "#6b7280";
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PestTrapMapScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const mapRef = useRef<MapView>(null);

  const [captures, setCaptures] = useState<PestCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");

  const load = async () => {
    if (!currentFarm?.id) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/pest-trap-captures`);
      if (res.ok) {
        const data = await res.json() as { captures: PestCapture[] };
        setCaptures(data.captures ?? []);
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentFarm?.id]);

  const mappable = captures.filter(
    (c) => c.latitude && c.longitude && !isNaN(parseFloat(c.latitude)) && !isNaN(parseFloat(c.longitude))
  );

  const farmLat = 51.5;
  const farmLng = -1.5;

  const initialRegion = mappable.length > 0
    ? {
        latitude: mappable.reduce((s, c) => s + parseFloat(c.latitude!), 0) / mappable.length,
        longitude: mappable.reduce((s, c) => s + parseFloat(c.longitude!), 0) / mappable.length,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : { latitude: farmLat, longitude: farmLng, latitudeDelta: 0.02, longitudeDelta: 0.02 };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pest Trap Map</Text>
        <Button title="" icon="plus" variant="ghost" size="sm" onPress={() => router.push("/pest-trap-capture")} />
      </View>

      {/* View toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "map" && styles.toggleActive]}
          onPress={() => setView("map")}
        >
          <Feather name="map" size={14} color={view === "map" ? colors.primary : colors.textSecondary} />
          <Text style={[styles.toggleText, view === "map" && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, view === "list" && styles.toggleActive]}
          onPress={() => setView("list")}
        >
          <Feather name="list" size={14} color={view === "list" ? colors.primary : colors.textSecondary} />
          <Text style={[styles.toggleText, view === "list" && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centre}><ActivityIndicator color={colors.primary} /></View>
      ) : captures.length === 0 ? (
        <View style={styles.centre}>
          <EmptyState icon="cpu" title="No captures yet" message="Submit your first pest trap photo to see results here." />
          <Button title="New Capture" icon="camera" onPress={() => router.push("/pest-trap-capture")} style={{ marginTop: spacing.lg }} />
        </View>
      ) : view === "map" ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            mapType="hybrid"
            showsUserLocation
          >
            {mappable.map((c) => (
              <Marker
                key={c.id}
                coordinate={{ latitude: parseFloat(c.latitude!), longitude: parseFloat(c.longitude!) }}
                pinColor={pressureColor(c.pestPressure)}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutDate}>{formatDate(c.captureDate)}</Text>
                    {!!c.trapRef && <Text style={styles.calloutRef}>Trap: {c.trapRef}</Text>}
                    <Text style={[styles.calloutPressure, { color: pressureColor(c.pestPressure) }]}>
                      {(c.pestPressure ?? "none").toUpperCase()} pressure
                    </Text>
                    <Text style={styles.calloutCount}>
                      SWD: {(c.swdMaleCount ?? 0) + (c.swdFemaleCount ?? 0)} | Total: {c.totalInsectCount ?? 0}
                    </Text>
                    {!!c.aiSummary && (
                      <Text style={styles.calloutSummary} numberOfLines={3}>{c.aiSummary}</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          {/* Pressure legend */}
          <View style={styles.legend}>
            {Object.entries(PRESSURE_COLORS).map(([p, col]) => (
              <View key={p} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: col }]} />
                <Text style={styles.legendText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {captures.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{formatDate(c.captureDate)}</Text>
                <View style={[styles.badge, { backgroundColor: pressureColor(c.pestPressure) + "22", borderColor: pressureColor(c.pestPressure) }]}>
                  <Text style={[styles.badgeText, { color: pressureColor(c.pestPressure) }]}>
                    {(c.pestPressure ?? "none").toUpperCase()}
                  </Text>
                </View>
              </View>
              {!!c.trapRef && <Text style={styles.cardRef}>Trap: {c.trapRef} · {c.trapType ?? ""}</Text>}
              <View style={styles.counts}>
                <Text style={styles.countItem}>♂ SWD: {c.swdMaleCount ?? "–"}</Text>
                <Text style={styles.countItem}>♀ SWD: {c.swdFemaleCount ?? "–"}</Text>
                <Text style={styles.countItem}>Total: {c.totalInsectCount ?? "–"}</Text>
              </View>
              {!!c.aiSummary && <Text style={styles.cardSummary} numberOfLines={2}>{c.aiSummary}</Text>}
              {!c.latitude && <Text style={styles.noGps}>No GPS location</Text>}
            </View>
          ))}
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  toggle: {
    flexDirection: "row", marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: 3,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: spacing.xs, borderRadius: radius.sm },
  toggleActive: { backgroundColor: colors.background, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  toggleTextActive: { color: colors.primary, fontFamily: fonts.medium },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg },
  mapContainer: { flex: 1, position: "relative" },
  map: { flex: 1 },
  legend: {
    position: "absolute", bottom: spacing.lg, left: spacing.lg,
    backgroundColor: "rgba(0,0,0,0.65)", borderRadius: radius.md, padding: spacing.sm, gap: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: "#fff", fontSize: fontSize.xs, fontFamily: fonts.regular },
  callout: { width: 220, padding: spacing.sm },
  calloutDate: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  calloutRef: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  calloutPressure: { fontFamily: fonts.bold, fontSize: fontSize.xs, marginTop: 4 },
  calloutCount: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  calloutSummary: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 4 },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs },
  cardDate: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  badge: { borderRadius: radius.sm, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { fontFamily: fonts.bold, fontSize: fontSize.xs },
  cardRef: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  counts: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xs },
  countItem: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  cardSummary: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  noGps: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs },
});
