import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
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
import type { HaulageConfirmation } from "@/lib/types";

const CROP_TYPES = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Oilseed Rape", "Oats", "Peas / Beans", "Maize", "Sugar Beet", "Potatoes", "Other",
];

export default function HaulageConfirmScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [haulierName, setHaulierName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [driverName, setDriverName] = useState("");
  const [cropType, setCropType] = useState("");
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
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
      Alert.alert("Required", "Please enter who is confirming this delivery.");
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
      deliveryNotes: deliveryNotes.trim(),
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
    Alert.alert("Confirmed", "Delivery confirmed and logged successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Confirm Delivery</Text>
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
          <Input
            label="Haulier / Haulage Company"
            placeholder="e.g. Smith's Transport Ltd"
            value={haulierName}
            onChangeText={setHaulierName}
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
            {CROP_TYPES.map((c) => (
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
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Delivery Photos</Text>
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
            label="Delivery Notes"
            placeholder="Any discrepancies, damage, weight queries, or special instructions noted..."
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
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
            title="Confirm Delivery"
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
