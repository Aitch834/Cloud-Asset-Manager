import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { WasteDisposalRecord } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const WASTE_TYPES = [
  "Chemical containers (plastic)",
  "Silage / bale wrap",
  "Scrap metal",
  "Used oil",
  "Used tyres",
  "Clinical / veterinary waste",
  "Animal by-products",
  "Cardboard / paper",
  "Electronic waste (WEEE)",
  "Asbestos",
  "Mixed farm waste",
  "Other",
];

const DISPOSAL_METHODS = [
  "Licensed carrier collection",
  "Return to supplier",
  "Agricultural merchant",
  "Skip hire",
  "Approved incineration",
  "Waste transfer station",
  "Licensed landfill",
  "Composting",
  "Other",
];

export default function WasteDisposalScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [wasteType, setWasteType] = useState("");
  const [customWasteType, setCustomWasteType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [disposalMethod, setDisposalMethod] = useState("");
  const [customDisposalMethod, setCustomDisposalMethod] = useState("");
  const [disposalDate, setDisposalDate] = useState(todayDate());
  const [carrierName, setCarrierName] = useState("");
  const [carrierLicence, setCarrierLicence] = useState("");
  const [destinationSite, setDestinationSite] = useState("");
  const [wasteTransferNote, setWasteTransferNote] = useState("");
  const [notes, setNotes] = useState("");

  const effectiveWasteType = wasteType === "Other" ? customWasteType : wasteType;
  const effectiveDisposalMethod = disposalMethod === "Other" ? customDisposalMethod : disposalMethod;

  const handleSave = async () => {
    if (!effectiveWasteType.trim()) {
      Alert.alert("Required Field", "Please select or enter a waste type.");
      return;
    }
    if (!effectiveDisposalMethod.trim()) {
      Alert.alert("Required Field", "Please select or enter a disposal method.");
      return;
    }
    if (!disposalDate.trim()) {
      Alert.alert("Required Field", "Please enter a disposal date.");
      return;
    }

    setSaving(true);
    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "waste-disposal-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {}
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: WasteDisposalRecord = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      wasteType: effectiveWasteType.trim(),
      quantity: quantity.trim(),
      disposalMethod: effectiveDisposalMethod.trim(),
      disposalDate,
      carrierName: carrierName.trim(),
      carrierLicence: carrierLicence.trim(),
      destinationSite: destinationSite.trim(),
      wasteTransferNote: wasteTransferNote.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.WASTE_DISPOSAL_RECORDS, { ...record, documentUrl } as WasteDisposalRecord);
    await refreshPendingCount();

    setSaving(false);
    router.back();
  };

  const needsCarrierDetails =
    disposalMethod === "Licensed carrier collection" ||
    disposalMethod === "Skip hire" ||
    disposalMethod === "Waste transfer station" ||
    disposalMethod === "Licensed landfill" ||
    disposalMethod === "Approved incineration";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Waste Disposal Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              Waste transfer notes must be kept for at least 2 years. Enter the
              WTN number where a carrier is used.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waste Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Disposal Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                maxDate="today"
                value={disposalDate}
                onChangeText={setDisposalDate}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Waste Type *</Text>
              <View style={styles.chipWrap}>
                {WASTE_TYPES.map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.chip,
                      wasteType === t && styles.chipSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setWasteType(t);
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        wasteType === t && styles.chipTextSelected,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {wasteType === "Other" && (
                <Input
                  placeholder="Describe the waste type…"
                  value={customWasteType}
                  onChangeText={setCustomWasteType}
                  style={{ marginTop: spacing.xs }}
                />
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Quantity</Text>
              <Input
                placeholder="e.g. 12 drums, 3 tonnes, 1 skip"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disposal Method</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Method *</Text>
              <View style={styles.chipWrap}>
                {DISPOSAL_METHODS.map((m) => (
                  <Pressable
                    key={m}
                    style={[
                      styles.chip,
                      disposalMethod === m && styles.chipSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setDisposalMethod(m);
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        disposalMethod === m && styles.chipTextSelected,
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {disposalMethod === "Other" && (
                <Input
                  placeholder="Describe the disposal method…"
                  value={customDisposalMethod}
                  onChangeText={setCustomDisposalMethod}
                  style={{ marginTop: spacing.xs }}
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Carrier &amp; Transfer Note</Text>
            {!needsCarrierDetails && disposalMethod ? (
              <Text style={styles.hint}>
                No licensed carrier details required for this disposal method.
                Complete the fields below if applicable.
              </Text>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>
                Carrier / Contractor Name
                {needsCarrierDetails ? " *" : ""}
              </Text>
              <Input
                placeholder="e.g. ABC Waste Services Ltd"
                value={carrierName}
                onChangeText={setCarrierName}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Carrier Waste Licence Number
                {needsCarrierDetails ? " *" : ""}
              </Text>
              <Input
                placeholder="e.g. CBDU123456"
                value={carrierLicence}
                onChangeText={setCarrierLicence}
                autoCapitalize="characters"
              />
              <Text style={styles.hint}>
                Registered carriers have a CB prefix number issued by the
                Environment Agency
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Destination / Treatment Site</Text>
              <Input
                placeholder="e.g. Anytown Recycling Centre, TR1 1AA"
                value={destinationSite}
                onChangeText={setDestinationSite}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Waste Transfer Note (WTN) Number</Text>
              <Input
                placeholder="e.g. WTN-2024-00123"
                value={wasteTransferNote}
                onChangeText={setWasteTransferNote}
              />
              <Text style={styles.hint}>
                Keep the signed WTN document on file for at least 2 years
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input
              placeholder="Any additional information about this waste disposal…"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Photo"
            promptTitle="Attach Photo to Waste Disposal Record"
          />

          <Button
            title="Save Waste Disposal Record"
            loading={saving}
            onPress={handleSave}
          />

          <View style={{ height: spacing.xl }} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.info,
    lineHeight: 17,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
});
