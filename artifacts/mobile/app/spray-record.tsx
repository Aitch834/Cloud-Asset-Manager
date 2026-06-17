import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldPicker } from "@/components/ui/FieldPicker";
import { LookupPicker } from "@/components/ui/LookupPicker";
import { SprayProductPicker } from "@/components/ui/SprayProductPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields, type ApiField } from "@/lib/hooks/useApiFields";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { useApiSprayProducts, type ApiSprayProduct } from "@/lib/hooks/useApiSprayProducts";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";
import { appendToList, generateId, getList, STORAGE_KEYS } from "@/lib/storage";
import { kvGet } from "@/lib/database";
import type { FieldBoundary, SprayRecord, WeatherEntry } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { sprayRecordHtml } from "@/lib/printTemplates";

function isPointInPolygon(
  point: { latitude: number; longitude: number },
  polygon: { latitude: number; longitude: number }[],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;
    const intersect = yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function SprayRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const { fields: apiFields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const { members, loading: membersLoading, error: membersError } = useApiFarmMembers(currentFarm?.id);
  const { products, loading: productsLoading } = useApiSprayProducts(currentFarm?.id);
  const bbchStages = useMobileLookup("spray_bbch_stages", []);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperatorName, setManualOperatorName] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperatorName;

  const [waterSourceNearby, setWaterSourceNearby] = useState("");
  const [bufferZoneMetres, setBufferZoneMetres] = useState("");

  const WATER_SOURCE_OPTIONS = [
    { id: "ditch", label: "Ditch" },
    { id: "stream", label: "Stream" },
    { id: "pond_lake", label: "Pond / Lake" },
    { id: "borehole_well", label: "Borehole / Well" },
    { id: "none", label: "None / Not applicable" },
    { id: "other", label: "Other" },
  ];

  const handleWaterSourceChange = (id: string, label: string) => {
    setWaterSourceNearby(label);
    if (!bufferZoneMetres) {
      if (["ditch", "stream", "pond_lake"].includes(id)) {
        setBufferZoneMetres("5");
      } else if (id === "borehole_well") {
        setBufferZoneMetres("50");
      }
    }
  };

  const [fieldName, setFieldName] = useState("");
  const [areaSprayedHa, setAreaSprayedHa] = useState("");
  const [areaAutoFilled, setAreaAutoFilled] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ApiSprayProduct | null>(null);
  const [manualProductName, setManualProductName] = useState("");

  const [applicationRate, setApplicationRate] = useState("");
  const [applicationUnit, setApplicationUnit] = useState("L/ha");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDirection, setWindDirection] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [notes, setNotes] = useState("");
  const [targetCrop, setTargetCrop] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [cropAutoFilled, setCropAutoFilled] = useState(false);

  const [detectedField, setDetectedField] = useState<FieldBoundary | null>(null);
  const [linkedWeather, setLinkedWeather] = useState<WeatherEntry | null>(null);
  const [fields, setFields] = useState<FieldBoundary[]>([]);

  const productName = selectedProduct ? selectedProduct.productName : manualProductName;

  const lerapCategory = selectedProduct?.lerapCategory ?? null;
  const lerapBufferM = selectedProduct?.lerapStandardBufferM ?? null;

  const bbchOptions = useMemo(
    () => bbchStages.map((s) => ({ id: s, label: s })),
    [bbchStages],
  );

  const estimatedQty = useMemo(() => {
    const rate = parseFloat(applicationRate);
    const area = parseFloat(areaSprayedHa);
    if (!isNaN(rate) && rate > 0 && !isNaN(area) && area > 0) {
      return (rate * area).toFixed(2);
    }
    return null;
  }, [applicationRate, areaSprayedHa]);

  const handleFieldChange = useCallback((name: string) => {
    setFieldName(name);
    if (!name) { setAreaAutoFilled(false); }
  }, []);

  const handleFieldSelect = useCallback((field: ApiField) => {
    const ha =
      field.computedFarmableAreaHa != null
        ? String(field.computedFarmableAreaHa)
        : field.areaHectares != null
          ? String(field.areaHectares)
          : null;
    if (ha && parseFloat(ha) > 0) {
      setAreaSprayedHa(parseFloat(ha).toFixed(2));
      setAreaAutoFilled(true);
    } else {
      setAreaAutoFilled(false);
    }
  }, []);

  const detectFieldFromGPS = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const point = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      const allFields = await getList<FieldBoundary>(STORAGE_KEYS.FIELD_BOUNDARIES, currentFarm?.id);
      setFields(allFields);

      for (const field of allFields) {
        if (field.coordinates.length >= 3 && isPointInPolygon(point, field.coordinates)) {
          setDetectedField(field);
          setFieldName(field.fieldName);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return;
        }
      }
    } catch (locErr: unknown) {
      console.warn("GPS field detection unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }
  }, [currentFarm?.id]);

  const linkTodayWeather = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const entries = await getList<WeatherEntry>(STORAGE_KEYS.WEATHER_ENTRIES, currentFarm?.id);
    const todayEntry = entries.find((e) => e.date === today);
    if (todayEntry) {
      setLinkedWeather(todayEntry);
      if (!windSpeed) setWindSpeed(todayEntry.windSpeed);
      if (!windDirection) setWindDirection(todayEntry.windDirection);
      if (!temperature) setTemperature(todayEntry.temperatureHigh);
      if (!pressure) setPressure(todayEntry.pressure);
    }
  }, [currentFarm?.id]);

  useEffect(() => {
    detectFieldFromGPS();
    linkTodayWeather();
  }, [detectFieldFromGPS, linkTodayWeather]);

  useEffect(() => {
    if (!fieldName.trim() || !currentFarm?.id) { setCropAutoFilled(false); return; }
    const today = new Date().toISOString().split("T")[0];
    const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
    (async () => {
      try {
        const token = await kvGet("bde_auth_token");
        const tenantId = await kvGet("bde_current_farm");
        const res = await fetch(
          `${domain}/api/farms/${currentFarm.id}/crop-for-field?fieldName=${encodeURIComponent(fieldName)}&date=${today}`,
          { headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenantId || "" } },
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.found && data.cropName) {
          setTargetCrop(data.cropName);
          setCropAutoFilled(true);
        } else {
          setCropAutoFilled(false);
        }
      } catch { /* ignore */ }
    })();
  }, [fieldName, currentFarm?.id]);

  const handleSave = async () => {
    if (!fieldName.trim() || !productName.trim() || !targetCrop.trim()) {
      Alert.alert("Required Fields", "Please select a field, select the product, and enter the target crop.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Spray record location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: SprayRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      targetCrop: targetCrop.trim(),
      growthStage: growthStage.trim(),
      productName: productName.trim(),
      productId: selectedProduct?.id,
      lerapCategory: lerapCategory ?? undefined,
      lerapStandardBufferM: lerapBufferM ?? undefined,
      areaSprayedHa: areaSprayedHa.trim() || undefined,
      applicationRate: applicationRate.trim(),
      applicationUnit,
      windSpeed: windSpeed.trim(),
      windDirection: windDirection.trim(),
      temperature: temperature.trim(),
      humidity: humidity.trim(),
      pressure: pressure.trim(),
      operatorName: operatorName,
      equipmentUsed: equipmentUsed.trim(),
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      notes: notes.trim(),
      waterSourceNearby: waterSourceNearby.trim() || undefined,
      bufferZoneMetres: bufferZoneMetres.trim() || undefined,
      latitude,
      longitude,
      linkedWeatherDate: linkedWeather?.date || "",
      detectedFieldId: detectedField?.id || "",
      photoIds: [],
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SPRAY_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Spray record saved. Print or save the application record?", [
      { text: "Print", onPress: async () => { await print(sprayRecordHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(sprayRecordHtml(record, currentFarm), "Spray Record"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Spray Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {detectedField && (
            <View style={styles.detectedBanner}>
              <Feather name="navigation" size={14} color={colors.success} />
              <Text style={styles.detectedText}>
                GPS detected: {detectedField.fieldName}
              </Text>
              <Badge text="Auto" variant="success" />
            </View>
          )}

          {linkedWeather && (
            <View style={styles.linkedBanner}>
              <Feather name="cloud" size={14} color={colors.info} />
              <Text style={styles.linkedText}>
                Weather linked from today's entry ({linkedWeather.conditions})
              </Text>
            </View>
          )}

          {/* ── Location ── */}
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={handleFieldChange}
            onChangeField={handleFieldSelect}
            fields={apiFields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          {/* ── Crop ── */}
          <View style={styles.sectionLabel}>
            <Feather name="feather" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Crop Being Sprayed</Text>
          </View>
          {cropAutoFilled && (
            <View style={styles.detectedBanner}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={styles.detectedText}>Target crop auto-filled from field register</Text>
              <Badge text="Auto" variant="success" />
            </View>
          )}
          <Input
            label="Target Crop *"
            placeholder="e.g. Winter Wheat, OSR, Sugar Beet"
            value={targetCrop}
            onChangeText={(t) => { setTargetCrop(t); setCropAutoFilled(false); }}
            required
          />
          <Text style={styles.fieldLabel}>Growth Stage (BBCH)</Text>
          <LookupPicker
            label="Growth Stage (BBCH)"
            value={growthStage}
            onSelect={(_id, label) => setGrowthStage(label)}
            options={bbchOptions}
            placeholder="e.g. BBCH 30 – Beginning of stem elongation"
            allowFreeText
            emptyMessage="Sync when online to load BBCH growth stages, or enter manually."
            icon="bar-chart-2"
          />

          {/* ── Product ── */}
          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>

          <SprayProductPicker
            selected={selectedProduct}
            manualName={manualProductName}
            onSelect={(p) => { setSelectedProduct(p); setManualProductName(""); }}
            onManual={(name) => { setManualProductName(name); setSelectedProduct(null); }}
            onClear={() => { setSelectedProduct(null); setManualProductName(""); }}
            products={products}
            loading={productsLoading}
          />

          {/* LERAP warning */}
          {lerapCategory === "A" && (
            <View style={styles.lerapBannerA}>
              <Feather name="alert-triangle" size={15} color={colors.error} />
              <View style={styles.lerapBannerBody}>
                <Text style={[styles.lerapBannerTitle, { color: colors.error }]}>
                  LERAP Category A{lerapBufferM ? ` — ${lerapBufferM} m buffer` : ""}
                </Text>
                <Text style={[styles.lerapBannerMsg, { color: "#7F1D1D" }]}>
                  This product carries a fixed buffer zone that cannot be reduced. Maintain the full
                  {lerapBufferM ? ` ${lerapBufferM} m` : ""} buffer from any surface watercourse.
                </Text>
              </View>
            </View>
          )}
          {lerapCategory === "B" && (
            <Pressable style={styles.lerapBannerB} onPress={() => router.push("/lerap-assessment")}>
              <Feather name="alert-triangle" size={15} color={colors.warning} />
              <View style={styles.lerapBannerBody}>
                <Text style={[styles.lerapBannerTitle, { color: "#92400E" }]}>
                  LERAP Category B{lerapBufferM ? ` — ${lerapBufferM} m standard buffer` : ""}
                </Text>
                <Text style={[styles.lerapBannerMsg, { color: "#78350F" }]}>
                  A CRD LERAP assessment must be completed before applying near surface water. The
                  {lerapBufferM ? ` ${lerapBufferM} m` : ""} standard buffer may be reduced.{" "}
                  <Text style={{ fontFamily: fonts.semiBold, textDecorationLine: "underline" }}>
                    Tap to record a LERAP assessment →
                  </Text>
                </Text>
              </View>
            </Pressable>
          )}

          <View style={styles.row}>
            <Input
              label="Application Rate"
              placeholder="e.g. 3.0"
              value={applicationRate}
              onChangeText={setApplicationRate}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Unit"
              placeholder="L/ha"
              value={applicationUnit}
              onChangeText={setApplicationUnit}
              containerStyle={{ width: 100 }}
            />
          </View>

          <View style={styles.areaRow}>
            <Input
              label="Area Sprayed (ha)"
              placeholder="e.g. 12.5"
              value={areaSprayedHa}
              onChangeText={(t) => { setAreaSprayedHa(t); setAreaAutoFilled(false); }}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            {areaAutoFilled && (
              <Badge text="Auto-filled" variant="info" style={styles.areaBadge} />
            )}
          </View>

          {estimatedQty && (
            <View style={styles.qtyBanner}>
              <Feather name="package" size={14} color={colors.info} />
              <Text style={styles.qtyText}>
                Estimated quantity: <Text style={styles.qtyValue}>{estimatedQty} {applicationUnit.replace("/ha", "")}</Text>
                {" "}({applicationRate} {applicationUnit} × {areaSprayedHa} ha)
              </Text>
            </View>
          )}

          {/* ── Weather ── */}
          <View style={styles.sectionLabel}>
            <Feather name="cloud" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Weather Conditions</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Wind Speed (mph)"
              placeholder="e.g. 8"
              value={windSpeed}
              onChangeText={setWindSpeed}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Wind Direction"
              placeholder="e.g. NW"
              value={windDirection}
              onChangeText={setWindDirection}
              containerStyle={styles.flex}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Temperature (°C)"
              placeholder="e.g. 14"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Humidity (%)"
              placeholder="e.g. 65"
              value={humidity}
              onChangeText={setHumidity}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>
          <Input
            label="Pressure (hPa)"
            placeholder="e.g. 1013"
            value={pressure}
            onChangeText={setPressure}
            keyboardType="decimal-pad"
          />

          {/* ── Operator & Equipment ── */}
          <View style={styles.sectionLabel}>
            <Feather name="tool" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Operator & Equipment</Text>
          </View>
          <Text style={styles.fieldLabel}>Operator *</Text>
          <StaffMemberPicker
            selected={selectedOperator}
            onSelect={(m) => { setSelectedOperator(m); if (m) setManualOperatorName(""); }}
            members={members}
            loading={membersLoading}
            error={membersError}
          />
          {!selectedOperator && (
            <Input
              label={members.length === 0 ? "Operator Name *" : "Or enter name manually"}
              value={manualOperatorName}
              onChangeText={(t) => { setManualOperatorName(t); if (t) setSelectedOperator(null); }}
              placeholder="e.g. John Smith"
            />
          )}
          <Input
            label="Equipment Used"
            placeholder="e.g. 24m sprayer"
            value={equipmentUsed}
            onChangeText={setEquipmentUsed}
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {/* ── Near Water ── */}
          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Near Water / Buffer Zone</Text>
          </View>
          <Text style={styles.fieldLabel}>Nearest Water Source</Text>
          <LookupPicker
            label="Nearest Water Source"
            value={waterSourceNearby}
            onSelect={handleWaterSourceChange}
            options={WATER_SOURCE_OPTIONS}
            placeholder="Select water source nearby…"
            allowFreeText={false}
            emptyMessage="No options available"
            icon="droplet"
          />
          {waterSourceNearby && waterSourceNearby !== "None / Not applicable" && (
            <Input
              label="Buffer Zone Distance (m)"
              placeholder="e.g. 5"
              value={bufferZoneMetres}
              onChangeText={setBufferZoneMetres}
              keyboardType="decimal-pad"
              hint={
                bufferZoneMetres === "5"
                  ? "CoP minimum 5 m · check product label / LERAP rating"
                  : bufferZoneMetres === "50"
                    ? "SPZ minimum 50 m"
                    : undefined
              }
            />
          )}

          <Button
            title="Save Spray Record"
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  detectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.successBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  detectedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.success,
    flex: 1,
  },
  linkedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  linkedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.info,
    flex: 1,
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
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  areaBadge: {
    marginTop: 28,
  },
  qtyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  qtyText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.info,
    lineHeight: 20,
  },
  qtyValue: {
    fontFamily: fonts.semiBold,
  },
  lerapBannerA: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lerapBannerB: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lerapBannerBody: { flex: 1 },
  lerapBannerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    marginBottom: 4,
  },
  lerapBannerMsg: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
});
