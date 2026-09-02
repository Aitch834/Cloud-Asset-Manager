import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { HarvestRecord } from "@/lib/types";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";
import { apiFetch, isAbortError } from "@/lib/apiFetch";

const CROP_TYPES_FALLBACK = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Oats", "OSR", "Peas", "Beans", "Maize", "Rye", "Triticale", "Other",
];

function formatCurrentTime() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function HarvestRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const { members, loading: membersLoading, error: membersError } = useApiFarmMembers(currentFarm?.id);
  const cropTypes = useMobileLookup("commodity_types", CROP_TYPES_FALLBACK);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperatorName, setManualOperatorName] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperatorName;

  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState("");
  const [cropAutoFilled, setCropAutoFilled] = useState(false);
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("t/ha");
  const [areaHarvestedHa, setAreaHarvestedHa] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [moisturePhotoUri, setMoisturePhotoUri] = useState("");
  const [grainQualityNotes, setGrainQualityNotes] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [startTime, setStartTime] = useState(formatCurrentTime());
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [salePricePerTonnePence, setSalePricePerTonnePence] = useState("");

  useEffect(() => {
    if (!fieldName || !currentFarm?.id) return;
    const farmId = currentFarm.id;
    const controller = new AbortController();
    const today = new Date().toISOString().split("T")[0];
    (async () => {
      try {
        const params = new URLSearchParams({ fieldName, date: today });
        const res = await apiFetch(`/api/farms/${farmId}/crop-for-field?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json() as { found: boolean; cropName: string | null };
        if (data.found && data.cropName) {
          const matched = cropTypes.find(c => c.toLowerCase() === (data.cropName ?? "").toLowerCase()) ?? data.cropName;
          setCropType(matched ?? "");
          setCropAutoFilled(true);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          // Crop auto-fill is best-effort; growers can still select it manually.
        }
      }
    })();
    return () => controller.abort();
  }, [fieldName, currentFarm?.id]);

  const takeMoisturePhoto = () => {
    Alert.alert(
      "Moisture Reading Photo",
      "Photograph the moisture meter or cab display as evidence of the reading.",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera access is needed to photograph the moisture reading.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.85,
              allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
              setMoisturePhotoUri(result.assets[0].uri);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Photo library access is needed.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
            if (!result.canceled && result.assets[0]) {
              setMoisturePhotoUri(result.assets[0].uri);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleSave = async () => {
    if (!fieldName.trim() || !cropType) {
      Alert.alert("Required Fields", "Please select a field and crop type.");
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

    const record: HarvestRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      cropType,
      harvestDate: new Date().toISOString(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      yieldAmount: yieldAmount.trim(),
      yieldUnit,
      areaHarvestedHa: areaHarvestedHa.trim(),
      moisturePercent: moisturePercent.trim(),
      moisturePhotoUri: moisturePhotoUri.trim(),
      grainQualityNotes: grainQualityNotes.trim(),
      trailerVehicleNumber: "",
      storageDestination: "",
      operatorName: operatorName.trim(),
      equipmentUsed: equipmentUsed.trim(),
      notes: notes.trim(),
      salePricePerTonnePence: salePricePerTonnePence ? Math.round(parseFloat(salePricePerTonnePence) * 100) : undefined,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.HARVEST_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Harvest Session Created", "Transport drivers can now link their runs to this session.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Harvest Record</Text>
          <Text style={styles.subtitle}>Combine operator</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBanner}>
            <Feather name="info" size={13} color={colors.fieldGold} />
            <Text style={styles.infoBannerText}>
              This record covers the combine. Transport drivers log each load separately using <Text style={styles.infoBannerBold}>Transport Run</Text>.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.fieldGold} />
            <Text style={styles.sectionTitle}>Field</Text>
          </View>
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            onChangeField={(f) => {
              const ha = f.computedFarmableAreaHa ?? f.areaHectares;
              if (ha && parseFloat(String(ha)) > 0) setAreaHarvestedHa(parseFloat(String(ha)).toFixed(2));
            }}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="tag" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Crop Type</Text>
          </View>
          {cropAutoFilled && (
            <View style={styles.autoFillBadge}>
              <Feather name="zap" size={10} color="#16a34a" />
              <Text style={styles.autoFillText}>Auto-filled from field register · tap to change</Text>
            </View>
          )}
          <View style={styles.chipGrid}>
            {cropTypes.map((c) => (
              <Pressable
                key={c}
                onPress={() => { Haptics.selectionAsync(); setCropType(c); setCropAutoFilled(false); }}
                style={[
                  styles.chip,
                  cropType === c && { backgroundColor: colors.fieldGold, borderColor: colors.fieldGold },
                ]}
              >
                <Text style={[styles.chipText, cropType === c && { color: colors.textInverse }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Yield & Quality</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Yield Amount"
              placeholder="e.g. 8.5"
              value={yieldAmount}
              onChangeText={setYieldAmount}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Unit"
              placeholder="t/ha"
              value={yieldUnit}
              onChangeText={setYieldUnit}
              containerStyle={{ width: 90 }}
            />
          </View>
          <Input
            label="Area Harvested (ha)"
            placeholder="e.g. 12.5"
            value={areaHarvestedHa}
            onChangeText={setAreaHarvestedHa}
            keyboardType="decimal-pad"
          />
          {yieldUnit === "t/ha" && yieldAmount && areaHarvestedHa &&
            parseFloat(yieldAmount) > 0 && parseFloat(areaHarvestedHa) > 0 ? (
            <View style={styles.calcCard}>
              <Feather name="trending-up" size={14} color={colors.primary} />
              <Text style={styles.calcText}>
                Est. total yield:{" "}
                <Text style={styles.calcValue}>
                  {(parseFloat(yieldAmount) * parseFloat(areaHarvestedHa)).toFixed(1)} t
                </Text>
              </Text>
            </View>
          ) : null}
          <Input
            label="Moisture %"
            placeholder="e.g. 15"
            value={moisturePercent}
            onChangeText={setMoisturePercent}
            keyboardType="decimal-pad"
          />

          {/* Moisture photo evidence */}
          <Pressable onPress={takeMoisturePhoto} style={styles.photoButton}>
            <Feather name="camera" size={16} color={colors.primary} />
            <Text style={styles.photoButtonText}>
              {moisturePhotoUri ? "Retake Moisture Reading Photo" : "Photograph Moisture Reading"}
            </Text>
          </Pressable>
          {moisturePhotoUri ? (
            <View style={styles.photoPreviewWrapper}>
              <Image source={{ uri: moisturePhotoUri }} style={styles.photoPreview} resizeMode="cover" />
              <View style={styles.photoStamp}>
                <Feather name="check-circle" size={12} color="#15803d" />
                <Text style={styles.photoStampText}>Evidence captured — saved to camera roll</Text>
              </View>
              <Pressable
                onPress={() => { setMoisturePhotoUri(""); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
                style={styles.photoRemove}
              >
                <Feather name="x" size={14} color={colors.error} />
                <Text style={styles.photoRemoveText}>Remove</Text>
              </Pressable>
            </View>
          ) : null}

          <Input
            label="Grain Quality / Grade Notes"
            placeholder="e.g. Group 1, low N, clean sample"
            value={grainQualityNotes}
            onChangeText={setGrainQualityNotes}
            multiline
            numberOfLines={2}
          />

          <View style={styles.sectionLabel}>
            <Feather name="clock" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Timing</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Start Time"
              placeholder="e.g. 09:30"
              value={startTime}
              onChangeText={setStartTime}
              containerStyle={styles.flex}
            />
            <Input
              label="End Time"
              placeholder="e.g. 18:00"
              value={endTime}
              onChangeText={setEndTime}
              containerStyle={styles.flex}
            />
          </View>
          <Text style={styles.hintText}>Start time pre-filled from your device clock. Tap to adjust.</Text>

          <View style={styles.sectionLabel}>
            <Feather name="tool" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Equipment & Operator</Text>
          </View>
          <Input
            label="Combine / Equipment Used"
            placeholder="e.g. New Holland CR8090"
            value={equipmentUsed}
            onChangeText={setEquipmentUsed}
          />
          <Text style={styles.fieldLabel}>Operator</Text>
          <StaffMemberPicker
            selected={selectedOperator}
            onSelect={(m) => { setSelectedOperator(m); if (m) setManualOperatorName(""); }}
            members={members}
            loading={membersLoading}
            error={membersError}
          />
          <Input
            label={members.length === 0 ? "Operator Name" : "Or enter name manually"}
            value={manualOperatorName}
            onChangeText={(t) => { setManualOperatorName(t); if (t) setSelectedOperator(null); }}
            placeholder="e.g. John Smith"
            editable={!selectedOperator}
          />

          <Input
            label="Sale Price (£/t)"
            placeholder="e.g. 195.00"
            value={salePricePerTonnePence}
            onChangeText={setSalePricePerTonnePence}
            keyboardType="decimal-pad"
          />

          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Harvest Session"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
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
  headerCenter: {
    alignItems: "center",
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.fieldBrown,
    lineHeight: 17,
  },
  infoBannerBold: {
    fontFamily: fonts.semiBold,
    color: colors.fieldBrown,
  },
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
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
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
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    backgroundColor: colors.primary + "08",
    marginBottom: spacing.md,
  },
  photoButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  photoPreviewWrapper: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: spacing.md,
  },
  photoPreview: {
    width: "100%",
    height: 160,
  },
  photoStamp: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  photoStampText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#15803d",
  },
  photoRemove: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  photoRemoveText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.error,
  },
  autoFillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: spacing.sm,
    alignSelf: "flex-start",
  },
  autoFillText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#15803d",
  },
  calcCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  calcText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  calcValue: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
});
