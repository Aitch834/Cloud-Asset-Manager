import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";

import { apiFetch } from "@/lib/apiFetch";
const STATUS_COLORS: Record<string, string> = {
  planned: "#6b7280",
  active: "#2563eb",
  harvested: "#16a34a",
  completed: "#a16207",
  cancelled: "#dc2626",
};

interface Trial {
  id: number;
  trialName: string;
  cropName: string | null;
  season: string | null;
  status: string;
  plots: Plot[];
}

interface Plot {
  id: number;
  plotNumber: string;
  treatmentLabel: string | null;
  isControl: boolean;
  latitude: string | null;
  longitude: string | null;
  locationDescription: string | null;
}

export default function CropTrialsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;

  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!farmId) return;
    setLoading(true);
    apiFetch(`/api/farms/${farmId}/crop-trials`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setTrials((d.records ?? []).filter((t: Trial) => t.status === "active" || t.status === "planned")))
      .catch(() => Alert.alert("Error", "Could not load trials"))
      .finally(() => setLoading(false));
  }, [farmId]);

  async function captureGPS() {
    setCapturing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required to capture GPS coordinates.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("GPS Error", "Could not get location. Please ensure GPS is enabled.");
    } finally {
      setCapturing(false);
    }
  }

  async function savePlotLocation() {
    if (!selectedPlot || !farmId || !selectedTrial) return;
    if (!gpsCoords) {
      Alert.alert("No GPS", "Please capture your GPS position first.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(
        `/api/farms/${farmId}/crop-trials/${selectedTrial.id}/plots/${selectedPlot.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: String(gpsCoords.lat),
            longitude: String(gpsCoords.lng),
            locationDescription: notes || selectedPlot.locationDescription,
          }),
        }
      );
      if (!res.ok) throw new Error("Save failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", `GPS location saved for Plot ${selectedPlot.plotNumber}.`, [
        { text: "Save Another", onPress: () => { setSelectedPlot(null); setGpsCoords(null); setNotes(""); } },
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not save plot location.");
    } finally {
      setSaving(false);
    }
  }

  const paddingBottom = insets.bottom + spacing.xl;

  if (!farmId) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>No farm selected</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={20} color={colors.primary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Crop Trials — GPS</Text>
          <Text style={styles.subtitle}>Walk to each plot and capture its GPS location</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : trials.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="activity" size={28} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No active trials</Text>
            <Text style={styles.emptyText}>Active and planned trials will appear here for GPS capture.</Text>
          </View>
        ) : !selectedTrial ? (
          <View style={{ padding: spacing.xl, gap: spacing.lg }}>
            <Text style={styles.sectionLabel}>SELECT TRIAL</Text>
            {trials.map(t => (
              <Pressable key={t.id} style={styles.card} onPress={() => setSelectedTrial(t)}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{t.trialName}</Text>
                    <Text style={styles.cardSub}>{[t.cropName, t.season].filter(Boolean).join(" · ")}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[t.status] ?? "#6b7280") + "20" }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLORS[t.status] ?? "#6b7280" }]}>{t.status}</Text>
                  </View>
                </View>
                <Text style={styles.plotCount}>{t.plots.length} plot{t.plots.length !== 1 ? "s" : ""}</Text>
              </Pressable>
            ))}
          </View>
        ) : !selectedPlot ? (
          <View style={{ padding: spacing.xl, gap: spacing.lg }}>
            <Pressable onPress={() => setSelectedTrial(null)} style={styles.breadcrumb}>
              <Feather name="chevron-left" size={14} color={colors.primary} />
              <Text style={styles.breadcrumbText}>All Trials</Text>
            </Pressable>
            <Text style={styles.sectionLabel}>SELECT PLOT — {selectedTrial.trialName.toUpperCase()}</Text>
            {selectedTrial.plots.length === 0 ? (
              <Text style={styles.emptyText}>No plots added to this trial yet.</Text>
            ) : selectedTrial.plots.map(plot => (
              <Pressable key={plot.id} style={[styles.card, plot.latitude ? styles.cardSaved : undefined]} onPress={() => { setSelectedPlot(plot); setGpsCoords(plot.latitude ? { lat: parseFloat(plot.latitude), lng: parseFloat(plot.longitude ?? "0") } : null); setNotes(plot.locationDescription ?? ""); }}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      Plot {plot.plotNumber}
                      {plot.isControl && <Text style={styles.controlTag}> CTRL</Text>}
                    </Text>
                    {plot.treatmentLabel ? <Text style={styles.cardSub}>{plot.treatmentLabel}</Text> : null}
                  </View>
                  {plot.latitude ? (
                    <View style={styles.gpsSaved}>
                      <Feather name="map-pin" size={13} color={colors.success} />
                      <Text style={styles.gpsSavedText}>GPS saved</Text>
                    </View>
                  ) : (
                    <View style={styles.gpsNeeded}>
                      <Feather name="map-pin" size={13} color={colors.textSecondary} />
                      <Text style={styles.gpsNeededText}>No GPS</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ padding: spacing.xl, gap: spacing.xl }}>
            <Pressable onPress={() => { setSelectedPlot(null); setGpsCoords(null); setNotes(""); }} style={styles.breadcrumb}>
              <Feather name="chevron-left" size={14} color={colors.primary} />
              <Text style={styles.breadcrumbText}>{selectedTrial.trialName}</Text>
            </Pressable>
            <View style={styles.plotHeader}>
              <Text style={styles.plotTitle}>Plot {selectedPlot.plotNumber}</Text>
              {selectedPlot.isControl && <View style={styles.controlBadge}><Text style={styles.controlBadgeText}>CONTROL</Text></View>}
            </View>
            {selectedPlot.treatmentLabel ? <Text style={styles.cardSub}>{selectedPlot.treatmentLabel}</Text> : null}

            {/* GPS Capture */}
            <View style={styles.gpsSection}>
              <Text style={styles.sectionLabel}>GPS LOCATION</Text>
              {gpsCoords ? (
                <View style={styles.coordsBox}>
                  <Feather name="map-pin" size={16} color={colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.coordsText}>{gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}</Text>
                    <Text style={styles.coordsHint}>Tap below to re-capture</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.coordsEmpty}>
                  <Feather name="navigation" size={20} color={colors.textSecondary} />
                  <Text style={styles.emptyText}>Stand at the centre of the plot and tap the button below</Text>
                </View>
              )}
              <Pressable style={[styles.gpsButton, capturing && styles.gpsButtonDisabled]} onPress={captureGPS} disabled={capturing}>
                {capturing ? (
                  <><ActivityIndicator size="small" color="#fff" /><Text style={styles.gpsButtonText}>Getting location…</Text></>
                ) : (
                  <><Feather name="crosshair" size={18} color="#fff" /><Text style={styles.gpsButtonText}>{gpsCoords ? "Re-capture GPS" : "Capture GPS Position"}</Text></>
                )}
              </Pressable>
            </View>

            {/* Location notes */}
            <View>
              <Text style={styles.sectionLabel}>LOCATION NOTES (optional)</Text>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. NE corner, beside hedge, Strip 3"
                multiline
                numberOfLines={2}
              />
            </View>

            <Button
              onPress={savePlotLocation}
              disabled={!gpsCoords || saving}
              loading={saving}
              title={saving ? "Saving…" : "Save Plot Location"}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: spacing.md },
  backText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textSecondary, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.md },
  cardSaved: { borderColor: colors.success + "60", backgroundColor: "#f0fdf4" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  cardSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
  plotCount: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, textTransform: "capitalize" },
  emptyCard: { margin: spacing.xl, alignItems: "center", gap: spacing.md, padding: spacing.xxxl },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 4 },
  breadcrumbText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  plotHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  plotTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  controlBadge: { backgroundColor: "#fde047", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  controlBadgeText: { fontFamily: fonts.bold, fontSize: fontSize.xs, color: "#92400e" },
  controlTag: { color: "#a16207" },
  gpsSaved: { flexDirection: "row", alignItems: "center", gap: 4 },
  gpsSavedText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.success },
  gpsNeeded: { flexDirection: "row", alignItems: "center", gap: 4 },
  gpsNeededText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  gpsSection: { gap: spacing.lg },
  coordsBox: { flexDirection: "row", alignItems: "flex-start", gap: spacing.lg, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: radius.md, padding: spacing.lg },
  coordsText: { fontFamily: fonts.regular ?? fonts.medium, fontSize: fontSize.sm, color: colors.text },
  coordsHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  coordsEmpty: { alignItems: "center", gap: spacing.md, padding: spacing.xl, backgroundColor: colors.background ?? "#f9fafb", borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  gpsButton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md },
  gpsButtonDisabled: { opacity: 0.6 },
  gpsButtonText: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: "#fff" },
});
