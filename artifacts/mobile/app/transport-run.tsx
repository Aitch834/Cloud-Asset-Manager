import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { StoragePicker } from "@/components/ui/StoragePicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiStorageLocations } from "@/lib/hooks/useApiStorageLocations";
import { kvGet, kvSet } from "@/lib/database";
import { appendToList, generateId, getList, STORAGE_KEYS } from "@/lib/storage";
import type { HarvestRecord, HarvestTransportRecord } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const VEHICLE_PREF_KEY = "bde_driver_vehicle_pref";

function todayPrefix() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export default function TransportRunScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { locations: storageLocations, loading: storageLoading, error: storageError } = useApiStorageLocations(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const [todayHarvests, setTodayHarvests] = useState<HarvestRecord[]>([]);
  const [selectedHarvest, setSelectedHarvest] = useState<HarvestRecord | null>(null);
  const [manualField, setManualField] = useState("");
  const [manualCrop, setManualCrop] = useState("");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [rememberVehicle, setRememberVehicle] = useState(true);
  const [storageDestination, setStorageDestination] = useState("");
  const [driverName, setDriverName] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [loadNotes, setLoadNotes] = useState("");

  useEffect(() => {
    loadTodayHarvests();
    loadSavedVehicle();
  }, []);

  async function loadTodayHarvests() {
    const all = await getList<HarvestRecord>(STORAGE_KEYS.HARVEST_RECORDS);
    const today = todayPrefix();
    const todays = all.filter((r) => r.harvestDate.startsWith(today));
    setTodayHarvests(todays);
    if (todays.length === 1) setSelectedHarvest(todays[0]);
  }

  async function loadSavedVehicle() {
    try {
      const saved = await kvGet(VEHICLE_PREF_KEY);
      if (saved) setVehicleNumber(JSON.parse(saved));
    } catch { }
  }

  async function saveVehiclePref(v: string) {
    try {
      await kvSet(VEHICLE_PREF_KEY, JSON.stringify(v));
    } catch { }
  }

  function selectHarvest(h: HarvestRecord) {
    Haptics.selectionAsync();
    setSelectedHarvest(h === selectedHarvest ? null : h);
  }

  const handleSave = async () => {
    const fieldName = selectedHarvest?.fieldName || manualField.trim();
    const cropType = selectedHarvest?.cropType || manualCrop.trim();

    if (!fieldName || !cropType) {
      Alert.alert("Missing Info", "Please select a harvest session above, or enter the field and crop type manually.");
      return;
    }
    if (!vehicleNumber.trim()) {
      Alert.alert("Required", "Please enter your vehicle / trailer number.");
      return;
    }
    if (!storageDestination.trim()) {
      Alert.alert("Required", "Please select or enter a storage destination.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (rememberVehicle && vehicleNumber.trim()) {
      await saveVehiclePref(vehicleNumber.trim());
    }

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch { }

    const record: HarvestTransportRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      harvestRecordId: selectedHarvest?.id || "",
      fieldName,
      cropType,
      vehicleNumber: vehicleNumber.trim(),
      storageDestination: storageDestination.trim(),
      loadNotes: loadNotes.trim() || undefined,
      driverName: driverName.trim(),
      harvestDate: new Date().toISOString(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.HARVEST_TRANSPORT_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);

    setStorageDestination("");
    setLoadNotes("");
  };

  const hasHarvests = todayHarvests.length > 0;
  const noHarvestSelected = !selectedHarvest;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Transport Run</Text>
          <Text style={styles.subtitle}>Driver — log each load</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {savedFlash && (
        <View style={styles.savedBanner}>
          <Feather name="check-circle" size={15} color="#16a34a" />
          <Text style={styles.savedBannerText}>Run saved — ready for next load</Text>
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="scissors" size={14} color={colors.fieldGold} />
            <Text style={styles.sectionTitle}>Harvest Session</Text>
          </View>

          {hasHarvests ? (
            <>
              <Text style={styles.hintText}>
                Select which harvest session your load is from. Tap to select.
              </Text>
              {todayHarvests.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => selectHarvest(h)}
                  style={[styles.harvestCard, selectedHarvest?.id === h.id && styles.harvestCardSelected]}
                >
                  <View style={[styles.harvestCardIcon, selectedHarvest?.id === h.id && styles.harvestCardIconSelected]}>
                    <Feather name="scissors" size={16} color={selectedHarvest?.id === h.id ? colors.textInverse : colors.fieldGold} />
                  </View>
                  <View style={styles.harvestCardInfo}>
                    <Text style={[styles.harvestCardField, selectedHarvest?.id === h.id && styles.harvestCardFieldSelected]}>
                      {h.fieldName}
                    </Text>
                    <Text style={styles.harvestCardMeta}>
                      {h.cropType}
                      {h.startTime ? ` · Started ${h.startTime}` : ""}
                      {h.moisturePercent ? ` · ${h.moisturePercent}% moisture` : ""}
                    </Text>
                  </View>
                  {selectedHarvest?.id === h.id && (
                    <Feather name="check-circle" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </>
          ) : (
            <View style={styles.noHarvestBox}>
              <Feather name="alert-circle" size={20} color={colors.accent} />
              <Text style={styles.noHarvestTitle}>No harvest sessions found for today</Text>
              <Text style={styles.noHarvestHint}>
                The combine operator needs to create a harvest session first. Or enter the field and crop below.
              </Text>
              <Input
                label="Field Name"
                placeholder="e.g. Top 20, North Field"
                value={manualField}
                onChangeText={setManualField}
              />
              <Input
                label="Crop Type"
                placeholder="e.g. Winter Wheat"
                value={manualCrop}
                onChangeText={setManualCrop}
              />
            </View>
          )}

          {hasHarvests && noHarvestSelected && (
            <Text style={[styles.hintText, { color: colors.error }]}>
              Tap a session above to select it before saving.
            </Text>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Vehicle</Text>
          </View>
          <Input
            label="Tractor / Trailer Registration or Number"
            placeholder="e.g. AB12 CDE, Trailer 3"
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
          />
          <View style={styles.rememberRow}>
            <Text style={styles.rememberLabel}>Remember my vehicle for next time</Text>
            <Switch
              value={rememberVehicle}
              onValueChange={setRememberVehicle}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={rememberVehicle ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="database" size={14} color={colors.fieldGold} />
            <Text style={styles.sectionTitle}>Storage Destination</Text>
          </View>
          <StoragePicker
            label="Where are you tipping this load?"
            value={storageDestination}
            onChange={setStorageDestination}
            locations={storageLocations}
            loading={storageLoading}
            error={storageError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Driver & Notes</Text>
          </View>
          <LookupPicker label="Driver Name" options={staffOptions} value={driverName} onSelect={(_id, l) => setDriverName(l)} allowFreeText />
          <Text style={styles.hintText}>Pre-filled from your login. Tap to change if using someone else's device.</Text>
          <Input
            label="Load Notes (optional)"
            placeholder="e.g. approx 10t, partial load, final run of the field"
            value={loadNotes}
            onChangeText={setLoadNotes}
            multiline
            numberOfLines={2}
          />

          <Button
            title="Save This Run"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />
          <Text style={styles.multiRunHint}>
            The form resets after saving so you can quickly log your next load.
          </Text>

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  headerCenter: { alignItems: "center" },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  savedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#dcfce7",
    borderBottomWidth: 1,
    borderBottomColor: "#86efac",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  savedBannerText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#16a34a",
  },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  harvestCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  harvestCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#f0fdf4",
  },
  harvestCardIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "#fef9c3",
    alignItems: "center",
    justifyContent: "center",
  },
  harvestCardIconSelected: {
    backgroundColor: colors.fieldGold,
  },
  harvestCardInfo: { flex: 1 },
  harvestCardField: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  harvestCardFieldSelected: {
    color: colors.primary,
  },
  harvestCardMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noHarvestBox: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "flex-start",
  },
  noHarvestTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.fieldBrown,
  },
  noHarvestHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.fieldBrown,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  rememberLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  multiRunHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});
