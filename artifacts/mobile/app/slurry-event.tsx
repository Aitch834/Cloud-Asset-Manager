import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SlurryEvent } from "@/lib/types";

type EventType = SlurryEvent["eventType"];
type AppMethod = SlurryEvent["applicationMethod"];

const EVENT_TYPES: { key: EventType; label: string; icon: string }[] = [
  { key: "spreading", label: "Field Spreading", icon: "wind" },
  { key: "store_fill", label: "Store Fill / Received", icon: "arrow-down" },
  { key: "store_empty", label: "Store Empty / Exported", icon: "arrow-up" },
  { key: "analysis", label: "Slurry Analysis", icon: "activity" },
  { key: "import", label: "Import from Off-Farm", icon: "log-in" },
  { key: "export", label: "Export Off-Farm", icon: "log-out" },
];

const APP_METHODS: { key: AppMethod; label: string }[] = [
  { key: "splash_plate", label: "Splash Plate" },
  { key: "trailing_shoe", label: "Trailing Shoe" },
  { key: "injected", label: "Injected (umbilical)" },
  { key: "band_spread", label: "Band Spreading" },
  { key: "irrigated", label: "Irrigated / Tanker Hose" },
];

export default function SlurryEventScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fromCache: fieldsCached } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [eventType, setEventType] = useState<EventType>("spreading");
  const [eventDate, setEventDate] = useState(today);
  const [storeReference, setStoreReference] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [applicationMethod, setApplicationMethod] = useState<AppMethod>("trailing_shoe");
  const [volumeM3, setVolumeM3] = useState("");
  const [applicationRate, setApplicationRate] = useState("");
  const [areaTreatedHa, setAreaTreatedHa] = useState("");
  const [contractor, setContractor] = useState("");
  const [nvzClosed, setNvzClosed] = useState(false);
  const [soilCondition, setSoilCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const isSpreadingEvent = eventType === "spreading";

  const handleGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert("Location Error", "Could not get GPS position.");
    }
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SlurryEvent = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      eventDate,
      eventType,
      storeReference: storeReference.trim(),
      fieldName: fieldName.trim(),
      applicationMethod,
      volumeM3: volumeM3.trim(),
      applicationRateM3PerHa: applicationRate.trim(),
      areaTreatedHa: areaTreatedHa.trim(),
      contractor: contractor.trim(),
      nvzClosed,
      soilCondition: soilCondition.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SLURRY_EVENTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Slurry event saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleSave = async () => {
    if (!eventDate || !storeReference.trim()) {
      Alert.alert("Required Fields", "Please enter the date and store/tank reference.");
      return;
    }
    if (isSpreadingEvent && nvzClosed) {
      Alert.alert(
        "NVZ Warning",
        "You have indicated this spreading occurred in a closed NVZ period. This may be a compliance breach — please check before saving.",
        [
          { text: "Cancel" },
          { text: "Save Anyway", style: "destructive", onPress: doSave },
        ]
      );
      return;
    }
    doSave();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Slurry & Manure Event</Text>
            <Text style={styles.subtitle}>Spreading, store records & NVZ compliance</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {fieldsCached && (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color={colors.accent} />
              <Text style={styles.offlineText}>Offline — using cached field list</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Event Type</Text>
          <View style={styles.chipRow}>
            {EVENT_TYPES.map((e) => (
              <Pressable key={e.key} onPress={() => setEventType(e.key)} style={[styles.chip, eventType === e.key && styles.chipActive]}>
                <Feather name={e.icon as any} size={12} color={eventType === e.key ? colors.primary : colors.textSecondary} />
                <Text style={[styles.chipText, eventType === e.key && styles.chipTextActive]}>{e.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Details</Text>
          <Input label="Event Date *" value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" />
          <Input label="Store / Tank Reference *" value={storeReference} onChangeText={setStoreReference} placeholder="e.g. Slurry Store 1" />
          <Input label="Volume (m³)" value={volumeM3} onChangeText={setVolumeM3} placeholder="e.g. 150" keyboardType="decimal-pad" />

          {isSpreadingEvent && (
            <>
              <Text style={styles.sectionTitle}>Spreading Details</Text>
              <Input label="Field Name" value={fieldName} onChangeText={setFieldName} placeholder="Field or paddock name" />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input label="Rate (m³/ha)" value={applicationRate} onChangeText={setApplicationRate} placeholder="e.g. 30" keyboardType="decimal-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Area Treated (ha)" value={areaTreatedHa} onChangeText={setAreaTreatedHa} placeholder="e.g. 5.0" keyboardType="decimal-pad" />
                </View>
              </View>

              <Text style={styles.label}>Application Method</Text>
              <View style={styles.chipRow}>
                {APP_METHODS.map((m) => (
                  <Pressable key={m.key} onPress={() => setApplicationMethod(m.key)} style={[styles.chip, applicationMethod === m.key && styles.chipActive]}>
                    <Text style={[styles.chipText, applicationMethod === m.key && styles.chipTextActive]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Input label="Soil Condition at Spreading" value={soilCondition} onChangeText={setSoilCondition} placeholder="e.g. firm, moist, saturated" />

              <View style={[styles.switchRow, nvzClosed && { borderColor: colors.error }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.switchLabel, nvzClosed && { color: colors.error }]}>NVZ Closed Period</Text>
                  <Text style={styles.switchSub}>Turn on if spreading occurred in a closed NVZ period</Text>
                </View>
                <Switch value={nvzClosed} onValueChange={setNvzClosed} trackColor={{ false: colors.border, true: colors.error }} thumbColor="#fff" />
              </View>
            </>
          )}

          <Input label="Contractor / Operator" value={contractor} onChangeText={setContractor} placeholder="Name or company" />

          <Pressable onPress={handleGps} style={styles.gpsButton}>
            <Feather name="map-pin" size={16} color={latitude ? colors.success : colors.primary} />
            <Text style={[styles.gpsText, latitude !== undefined ? { color: colors.success } : null]}>
              {latitude !== undefined ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : "Capture GPS Location"}
            </Text>
          </Pressable>

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional information…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Event"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.warningBg, padding: spacing.sm, borderRadius: radius.md },
  offlineText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.accent },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  gpsButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  gpsText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  saveButton: { marginTop: spacing.lg },
});
