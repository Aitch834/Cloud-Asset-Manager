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
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("t/ha");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [grainQualityNotes, setGrainQualityNotes] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [startTime, setStartTime] = useState(formatCurrentTime());
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

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
      moisturePercent: moisturePercent.trim(),
      grainQualityNotes: grainQualityNotes.trim(),
      trailerVehicleNumber: "",
      storageDestination: "",
      operatorName: operatorName.trim(),
      equipmentUsed: equipmentUsed.trim(),
      notes: notes.trim(),
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
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="tag" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Crop Type</Text>
          </View>
          <View style={styles.chipGrid}>
            {cropTypes.map((c) => (
              <Pressable
                key={c}
                onPress={() => { Haptics.selectionAsync(); setCropType(c); }}
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
            label="Moisture %"
            placeholder="e.g. 15"
            value={moisturePercent}
            onChangeText={setMoisturePercent}
            keyboardType="decimal-pad"
          />
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
});
