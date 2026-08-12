import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { RFIDTagInput } from "@/components/ui/RFIDTagInput";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { LivestockMovement } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";
import { usePrint } from "@/lib/hooks/usePrint";
import { livestockMovementHtml } from "@/lib/printTemplates";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";

type MovType = LivestockMovement["movementType"];

const MOVEMENT_TYPES: { key: MovType; label: string; icon: keyof typeof Feather.glyphMap; color: string }[] = [
  { key: "on", label: "On to Farm", icon: "arrow-down-circle", color: colors.success },
  { key: "off", label: "Off Farm", icon: "arrow-up-circle", color: colors.error },
  { key: "between", label: "Between Holdings", icon: "repeat", color: colors.info },
];

const SPECIES_OPTIONS_FALLBACK = ["Cattle", "Sheep", "Pigs", "Goats", "Deer", "Horses", "Poultry", "Other"];

export default function LivestockMovementScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user: _user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const speciesOptions = useMobileLookup("livestock_species", SPECIES_OPTIONS_FALLBACK);
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("movement", currentFarm?.id);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [herdName, setHerdName] = useState("");
  const [species, setSpecies] = useState("");
  const [animalCount, setAnimalCount] = useState("");
  const [earTagNumbers, setEarTagNumbers] = useState("");
  const [movementType, setMovementType] = useState<MovType>("off");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [movementRef, setMovementRef] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [ataNumber, setAtaNumber] = useState("");
  const [ataExpiryDate, setAtaExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lisNotified, setLisNotified] = useState<boolean | null>(null);
  const [lisRef, setLisRef] = useState("");

  const handleSave = async () => {
    if (!animalCount.trim() || !fromLocation.trim() || !toLocation.trim()) {
      Alert.alert("Required Fields", "Please enter animal count, from location and to location.");
      return;
    }

    setSaving(true);
    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "movement-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {}
    }
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

    const record: LivestockMovement = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      species,
      animalCount: animalCount.trim(),
      earTagNumbers: earTagNumbers.trim(),
      movementType,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movementDate: new Date().toISOString(),
      movementRef: movementRef.trim(),
      transporterName: transporterName.trim(),
      vehicleReg: vehicleReg.trim(),
      ataNumber: ataNumber.trim() || undefined,
      ataExpiryDate: ataExpiryDate.trim() || undefined,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
      lisNotified: lisNotified ?? false,
      lisRef: lisRef.trim() || undefined,
    };

    await appendToList(STORAGE_KEYS.LIVESTOCK_MOVEMENTS, { ...record, documentUrl } as LivestockMovement);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert(
      "Movement Recorded",
      `Movement saved and queued for sync.\n\nOnce synced, open the Movements register on the dashboard to submit${record.species === "Cattle" ? " to BCMS or LIP (cattle tracing)" : ["Sheep", "Goats", "Deer"].includes(record.species) ? " to LIS (Livestock Information Service)" : " to the relevant government portal"} with one click.`,
      [
        { text: "Print AML", onPress: async () => { await print(livestockMovementHtml(record, currentFarm)); router.back(); } },
        { text: "Save PDF", onPress: async () => { await savePdf(livestockMovementHtml(record, currentFarm), "Livestock Movement"); router.back(); } },
        { text: "Done", onPress: () => router.back() },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Livestock Movement</Text>
        <View style={{ width: 36 }} />
      </View>

      {justSaved && !missingIdentifiers && !identifiersLoading && (
        <Pressable onPress={clearJustSaved} style={[styles.identifierBanner, styles.identifierBannerSaved]}>
          <Feather name="check-circle" size={15} color="#166534" />
          <Text style={[styles.identifierBannerText, styles.identifierBannerSavedText]}>
            Identifiers saved successfully. Tap to dismiss.
          </Text>
        </Pressable>
      )}

      {missingIdentifiers && !bannerDismissed && (
        <Pressable
          onPress={() => router.push("/(tabs)/more")}
          style={styles.identifierBanner}
        >
          <Feather name="alert-triangle" size={15} color="#92400e" />
          <Text style={styles.identifierBannerText}>
            {!cphNumber && !sbiNumber
              ? "CPH and SBI are missing from your farm profile — movements cannot be submitted without them."
              : !cphNumber
              ? "CPH number is missing from your farm profile — required for movement submissions."
              : "SBI number is missing from your farm profile — required for movement submissions."}
            {" "}Tap to go to Settings.
          </Text>
          <Pressable
            onPress={(e) => { e.stopPropagation(); dismissBanner(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss warning"
          >
            <Feather name="x" size={15} color="#92400e" />
          </Pressable>
        </Pressable>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="repeat" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Movement Type</Text>
          </View>
          <View style={styles.chipRow}>
            {MOVEMENT_TYPES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => { Haptics.selectionAsync(); setMovementType(m.key); }}
                style={[
                  styles.chip,
                  movementType === m.key && { backgroundColor: m.color, borderColor: m.color },
                ]}
              >
                <Feather
                  name={m.icon}
                  size={15}
                  color={movementType === m.key ? colors.textInverse : m.color}
                />
                <Text style={[styles.chipText, movementType === m.key && { color: colors.textInverse }]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Animal Details</Text>
          </View>
          <Input
            label="Herd / Group Name (optional)"
            placeholder="e.g. Spring calves"
            value={herdName}
            onChangeText={setHerdName}
          />
          <View style={styles.sectionLabel}>
            <Feather name="tag" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Species</Text>
          </View>
          <View style={styles.chipRow}>
            {speciesOptions.map((s) => (
              <Pressable
                key={s}
                onPress={() => { Haptics.selectionAsync(); setSpecies(s); }}
                style={[
                  styles.chip,
                  species === s && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.chipText, species === s && { color: colors.textInverse }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Number of Animals"
            placeholder="e.g. 24"
            value={animalCount}
            onChangeText={setAnimalCount}
            keyboardType="number-pad"
            required
          />
          <RFIDTagInput
            label={
              species === "Cattle"
                ? "Ear Tag Numbers (required for BCMS)"
                : ["Sheep", "Goats", "Deer"].includes(species)
                ? "Ear Tag / EID Numbers"
                : "Ear Tag / ID Numbers (optional)"
            }
            placeholder={
              species === "Cattle"
                ? "e.g. UK123456 789012, UK123456 789013"
                : species === "Pigs"
                ? "e.g. Herd mark tattooed — AB1234"
                : "e.g. UK1234 56789"
            }
            value={earTagNumbers}
            onChangeText={setEarTagNumbers}
            onTagScanned={(tag) =>
              setEarTagNumbers((prev) =>
                prev.trim() ? `${prev.trim()}\n${tag}` : tag
              )
            }
            multiline
            numberOfLines={3}
          />

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Input
            label="From Location / CPH"
            placeholder="e.g. Home farm CPH 12/345/6789"
            value={fromLocation}
            onChangeText={setFromLocation}
            required
          />
          <Input
            label="To Location / CPH"
            placeholder="e.g. Market / abattoir CPH"
            value={toLocation}
            onChangeText={setToLocation}
            required
          />

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Transport & Reference</Text>
          </View>
          <Input
            label="Movement Reference / AML No."
            placeholder="e.g. AML2-12345"
            value={movementRef}
            onChangeText={setMovementRef}
          />
          <Input
            label="Transporter Name"
            placeholder="e.g. Smith Haulage"
            value={transporterName}
            onChangeText={setTransporterName}
          />
          <Input
            label="Vehicle Registration"
            placeholder="e.g. AB12 CDE"
            value={vehicleReg}
            onChangeText={setVehicleReg}
          />
          <Input
            label="ATA Authorisation Number"
            placeholder="e.g. ATA-12345 (cattle transporters)"
            value={ataNumber}
            onChangeText={setAtaNumber}
          />
          <Input
            label="ATA Expiry Date"
            placeholder="YYYY-MM-DD"
            value={ataExpiryDate}
            onChangeText={setAtaExpiryDate}
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {["Sheep", "Goats", "Deer"].includes(species) && (
            <>
              <View style={styles.sectionLabel}>
                <Feather name="shield" size={14} color="#2563eb" />
                <Text style={styles.sectionTitle}>LIS Notification</Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>
                Sheep, goat and deer movements must be notified to the Livestock Information Service (cla.livestockinformation.org.uk). Has this movement been notified?
              </Text>
              <View style={styles.chipRow}>
                {([{ key: true, label: "Yes — Notified" }, { key: false, label: "No / Not yet" }] as const).map((opt) => (
                  <Pressable
                    key={String(opt.key)}
                    onPress={() => { Haptics.selectionAsync(); setLisNotified(opt.key); }}
                    style={[
                      styles.chip,
                      lisNotified === opt.key && {
                        backgroundColor: opt.key ? "#16a34a" : "#dc2626",
                        borderColor: opt.key ? "#16a34a" : "#dc2626",
                      },
                    ]}
                  >
                    <Feather
                      name={opt.key ? "check-circle" : "clock"}
                      size={14}
                      color={lisNotified === opt.key ? "#fff" : opt.key ? "#16a34a" : "#dc2626"}
                    />
                    <Text style={[styles.chipText, lisNotified === opt.key && { color: "#fff" }]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {lisNotified === true && (
                <Input
                  label="LIS Reference Number"
                  placeholder="e.g. CLA-2024-123456"
                  value={lisRef}
                  onChangeText={setLisRef}
                />
              )}
            </>
          )}

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Photo"
            promptTitle="Attach Photo to Movement Record"
          />

          <Button
            title="Save Movement Record"
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
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  identifierBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  identifierBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  identifierBannerSaved: {
    backgroundColor: colors.successBg,
    borderColor: "#86EFAC",
  },
  identifierBannerSavedText: {
    color: "#166534",
  },
});
