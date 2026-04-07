import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { kvGet, kvSet } from "@/lib/database";
import type { HaulageConfirmation } from "@/lib/types";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";
import { cropDispatchDocketHtml } from "@/lib/printTemplates";
import { usePrint } from "@/lib/hooks/usePrint";

interface Haulier { id: number; companyName: string; }

async function _getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SS = await import("expo-secure-store");
      const t = await SS.getItemAsync("auth_session_token");
      if (t) return t;
    } else {
      try { const t = localStorage.getItem("auth_session_token"); if (t) return t; } catch { }
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function _getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) { const f = JSON.parse(raw); return f.tenantSlug || f.slug || ""; }
  } catch { }
  return "";
}

interface GrainBin { id: number; binName: string; binType: string; }

function useGrainBinLookup(farmId: string | number | undefined): GrainBin[] {
  const [bins, setBins] = useState<GrainBin[]>([]);
  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;
    (async () => {
      const cacheKey = `grain_bins_${farmId}`;
      try {
        const cached = await kvGet(cacheKey);
        if (cached && !cancelled) setBins(JSON.parse(cached));
      } catch { }
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!apiDomain) return;
      try {
        const [token, slug] = await Promise.all([_getAuthToken(), _getTenantSlug()]);
        if (!slug) return;
        const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/grain-storage-bins`, { headers });
        if (!res.ok) return;
        const json = await res.json() as { rows?: GrainBin[] };
        const rows = json.rows ?? [];
        if (!cancelled) { setBins(rows); await kvSet(cacheKey, JSON.stringify(rows)); }
      } catch { }
    })();
    return () => { cancelled = true; };
  }, [farmId]);
  return bins;
}

function useHaulierLookup(farmId: string | number | undefined): Haulier[] {
  const [hauliers, setHauliers] = useState<Haulier[]>([]);
  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;
    (async () => {
      const cacheKey = `hauliers_${farmId}`;
      try {
        const cached = await kvGet(cacheKey);
        if (cached && !cancelled) setHauliers(JSON.parse(cached));
      } catch { }
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!apiDomain) return;
      try {
        const [token, slug] = await Promise.all([_getAuthToken(), _getTenantSlug()]);
        if (!slug) return;
        const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/hauliers`, { headers });
        if (!res.ok) return;
        const json = await res.json() as { records?: Haulier[] };
        const records = json.records ?? [];
        if (!cancelled) { setHauliers(records); await kvSet(cacheKey, JSON.stringify(records)); }
      } catch { }
    })();
    return () => { cancelled = true; };
  }, [farmId]);
  return hauliers;
}

const CROP_TYPES_FALLBACK = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Oilseed Rape", "Oats", "Peas / Beans", "Maize", "Sugar Beet", "Potatoes", "Other",
];

export default function HaulageConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const cropTypes = useMobileLookup("commodity_types", CROP_TYPES_FALLBACK);
  const registeredHauliers = useHaulierLookup(currentFarm?.id);
  const grainBins = useGrainBinLookup(currentFarm?.id);
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);
  const [selectedHaulierId, setSelectedHaulierId] = useState<number | null>(null);
  const [selectedBinId, setSelectedBinId] = useState<number | null>(null);
  const [storageLocationName, setStorageLocationName] = useState("");

  const [haulierName, setHaulierName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [driverName, setDriverName] = useState("");
  const [cropType, setCropType] = useState("");
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [destination, setDestination] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerRef, setCustomerRef] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [confirmedBy, setConfirmedBy] = useState(user?.name || "");
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUris((p) => [...p, result.assets[0].uri]);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 6,
    });
    if (!result.canceled) {
      setPhotoUris((p) => [...p, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSave = async () => {
    if (!haulierName.trim()) {
      Alert.alert("Required", "Please enter the haulier or haulage company name.");
      return;
    }
    if (!confirmedBy.trim()) {
      Alert.alert("Required", "Please enter who is confirming this dispatch.");
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

    const record: HaulageConfirmation = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      confirmationDate: new Date().toISOString(),
      haulierName: haulierName.trim(),
      vehicleReg: vehicleReg.trim(),
      driverName: driverName.trim(),
      cropType,
      quantityTonnes: quantityTonnes.trim(),
      storageLocationName: storageLocationName.trim() || undefined,
      binId: selectedBinId ?? undefined,
      destination: destination.trim() || undefined,
      customerName: customerName.trim() || undefined,
      customerRef: customerRef.trim() || undefined,
      dispatchNotes: dispatchNotes.trim(),
      confirmedBy: confirmedBy.trim(),
      photoUris,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.HAULAGE_CONFIRMATIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Dispatch Confirmed", "Crop dispatch confirmed and logged successfully.", [
      { text: "Print Docket", onPress: async () => { await print(cropDispatchDocketHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(cropDispatchDocketHtml(record, currentFarm), "Crop Dispatch Docket"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Confirm Crop Dispatch</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBanner}>
            <Feather name="truck" size={16} color="#0284c7" />
            <Text style={styles.infoText}>
              Use this form when a lorry arrives to collect crop. Your confirmation is logged against the haulage record.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color="#0284c7" />
            <Text style={styles.sectionTitle}>Haulier Details <Text style={styles.required}>*</Text></Text>
          </View>

          {registeredHauliers.length > 0 && (
            <>
              <Text style={styles.lookupHint}>Select a registered haulier or enter manually below</Text>
              <View style={styles.chipGrid}>
                {registeredHauliers.map((h) => {
                  const selected = selectedHaulierId === h.id;
                  return (
                    <Pressable
                      key={h.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        if (selected) {
                          setSelectedHaulierId(null);
                          setHaulierName("");
                        } else {
                          setSelectedHaulierId(h.id);
                          setHaulierName(h.companyName);
                        }
                      }}
                      style={[
                        styles.chip,
                        { flexDirection: "row", alignItems: "center" },
                        selected && { backgroundColor: "#dbeafe", borderColor: "#0284c7" },
                      ]}
                    >
                      {selected && <Feather name="check" size={12} color="#0284c7" style={{ marginRight: 4 }} />}
                      <Text style={[styles.chipText, selected && { color: "#0284c7", fontFamily: fonts.semiBold }]}>
                        {h.companyName}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Input
            label={registeredHauliers.length > 0 ? "Or enter haulier name manually" : "Haulier / Haulage Company"}
            placeholder="e.g. Smith's Transport Ltd"
            value={haulierName}
            onChangeText={(t) => { setSelectedHaulierId(null); setHaulierName(t); }}
            editable={selectedHaulierId === null}
          />
          <View style={styles.row}>
            <Input
              label="Vehicle Registration"
              placeholder="e.g. SN23 XYZ"
              value={vehicleReg}
              onChangeText={setVehicleReg}
              containerStyle={styles.flex}
            />
            <Input
              label="Driver Name"
              placeholder="Driver's name"
              value={driverName}
              onChangeText={setDriverName}
              containerStyle={styles.flex}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="package" size={14} color={colors.fieldGold} />
            <Text style={styles.sectionTitle}>Commodity</Text>
          </View>
          <View style={styles.chipGrid}>
            {cropTypes.map((c) => (
              <Pressable
                key={c}
                onPress={() => { Haptics.selectionAsync(); setCropType(c); }}
                style={[
                  styles.chip,
                  cropType === c && { backgroundColor: "#fef3c7", borderColor: "#d97706" },
                ]}
              >
                <Text style={[styles.chipText, cropType === c && { color: "#d97706", fontFamily: fonts.semiBold }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Quantity (tonnes)"
            placeholder="e.g. 28.4"
            value={quantityTonnes}
            onChangeText={setQuantityTonnes}
            keyboardType="decimal-pad"
          />

          <View style={styles.sectionLabel}>
            <Feather name="database" size={14} color="#7c3aed" />
            <Text style={styles.sectionTitle}>Store / Collection Point</Text>
          </View>
          {grainBins.length > 0 && (
            <>
              <Text style={styles.lookupHint}>Select the bin or store the load is being collected from</Text>
              <View style={styles.chipGrid}>
                {grainBins.map((b) => {
                  const sel = selectedBinId === b.id;
                  return (
                    <Pressable
                      key={b.id}
                      onPress={() => {
                        Haptics.selectionAsync();
                        if (sel) { setSelectedBinId(null); setStorageLocationName(""); }
                        else { setSelectedBinId(b.id); setStorageLocationName(b.binName); }
                      }}
                      style={[
                        styles.chip,
                        { flexDirection: "row", alignItems: "center" },
                        sel && { backgroundColor: "#ede9fe", borderColor: "#7c3aed" },
                      ]}
                    >
                      {sel && <Feather name="check" size={12} color="#7c3aed" style={{ marginRight: 4 }} />}
                      <Text style={[styles.chipText, sel && { color: "#7c3aed", fontFamily: fonts.semiBold }]}>
                        {b.binName}{b.binType ? ` (${b.binType})` : ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
          <Input
            label={grainBins.length > 0 ? "Or enter store / bin name manually" : "Store / Bin / Collection Point"}
            placeholder="e.g. Main Grain Store — Bin 3"
            value={storageLocationName}
            onChangeText={(t) => { setSelectedBinId(null); setStorageLocationName(t); }}
            editable={selectedBinId === null}
          />

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Destination &amp; Customer</Text>
          </View>
          <Input
            label="Buyer / Customer"
            placeholder="e.g. Gleadell Agriculture Ltd"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <View style={styles.row}>
            <Input
              label="Customer Reference"
              placeholder="Contract / order no."
              value={customerRef}
              onChangeText={setCustomerRef}
              containerStyle={styles.flex}
            />
          </View>
          <Input
            label="Destination (merchant / store / processor)"
            placeholder="e.g. Pocklington Grain Store, East Yorkshire"
            value={destination}
            onChangeText={setDestination}
          />

          <View style={styles.sectionLabel}>
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Dispatch Photos</Text>
          </View>
          <Text style={styles.photoHint}>
            Photograph the vehicle, ticket, docket or load for traceability records.
          </Text>
          {photoUris.length > 0 && (
            <View style={styles.photoGrid}>
              {photoUris.map((uri, i) => (
                <View key={uri} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                  <Pressable style={styles.removePhoto} onPress={() => setPhotoUris((p) => p.filter((_, j) => j !== i))}>
                    <Feather name="x" size={12} color={colors.textInverse} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={styles.photoRow}>
            <Pressable style={styles.photoBtn} onPress={handleTakePhoto}>
              <Feather name="camera" size={14} color={colors.text} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={handleChoosePhoto}>
              <Feather name="image" size={14} color={colors.text} />
              <Text style={styles.photoBtnText}>Choose from Library</Text>
            </Pressable>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes & Sign-off <Text style={styles.required}>*</Text></Text>
          </View>
          <Input
            label="Dispatch Notes"
            placeholder="Any discrepancies, damage, weight queries, or special instructions noted..."
            value={dispatchNotes}
            onChangeText={setDispatchNotes}
            multiline
            numberOfLines={3}
          />
          <Input
            label="Confirmed By"
            value={confirmedBy}
            onChangeText={setConfirmedBy}
            placeholder="Your name — person authorising this confirmation"
          />

          <Button
            title="Confirm Dispatch"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check-circle"
          />

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
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  infoBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#0284c7",
    lineHeight: 18,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  required: { color: colors.error },
  lookupHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  row: { flexDirection: "row", gap: spacing.md },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  photoHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoThumb: { width: 72, height: 72, borderRadius: radius.md, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  removePhoto: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  photoRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photoBtnText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
});
