import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { SignaturePad } from "@/components/ui/SignaturePad";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { usePrint } from "@/lib/hooks/usePrint";
import { grainIntakeDocketHtml } from "@/lib/printTemplates";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { ThirdPartyGrainIntakeMobile } from "@/lib/types";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const COMMODITIES_FALLBACK = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Malting Barley", "Winter Oats", "Spring Oats", "Oilseed Rape",
  "Winter Beans", "Spring Beans", "Peas", "Maize", "Linseed", "Other",
];

const GRADES = ["Feed", "Milling", "Malting", "Export", "Seed", "Other"];

type TransportBy = "customer" | "holding";

export default function ThirdPartyGrainIntakeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const commodities = useMobileLookup("commodity_types", COMMODITIES_FALLBACK);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [intakeDate, setIntakeDate] = useState(today);
  const [customerName, setCustomerName] = useState("");
  const [lotReference, setLotReference] = useState("");
  const [commodity, setCommodity] = useState("");
  const [variety, setVariety] = useState("");
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [screeningsPercent, setScreeningsPercent] = useState("");
  const [specificWeightKgHl, setSpecificWeightKgHl] = useState("");
  const [grade, setGrade] = useState("");
  const [deliveryNoteRef, setDeliveryNoteRef] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [haulier, setHaulier] = useState("");
  const [transportArrangedBy, setTransportArrangedBy] = useState<TransportBy>("customer");
  const [bayOrBin, setBayOrBin] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedBy, setRecordedBy] = useState(user?.name ?? "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [customerSignature, setCustomerSignature] = useState<string | null>(null);

  const handleSave = async () => {
    if (!customerName.trim()) {
      Alert.alert("Required", "Please enter the customer / farm name.");
      return;
    }
    if (!commodity.trim()) {
      Alert.alert("Required", "Please select a commodity.");
      return;
    }
    if (!quantityTonnes.trim()) {
      Alert.alert("Required", "Please enter the quantity in tonnes.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: ThirdPartyGrainIntakeMobile = {
      id: generateId(),
      farmId: currentFarm?.id ? String(currentFarm.id) : "",
      intakeDate,
      customerName: customerName.trim(),
      lotReference: lotReference.trim(),
      commodity: commodity.trim(),
      variety: variety.trim(),
      quantityTonnes: quantityTonnes.trim(),
      moisturePercent: moisturePercent.trim(),
      screeningsPercent: screeningsPercent.trim(),
      specificWeightKgHl: specificWeightKgHl.trim(),
      grade: grade.trim(),
      deliveryNoteRef: deliveryNoteRef.trim(),
      vehicleReg: vehicleReg.trim(),
      haulier: haulier.trim(),
      bayOrBin: bayOrBin.trim(),
      transportArrangedBy,
      notes: notes.trim(),
      recordedBy: recordedBy.trim(),
      customerSignature: customerSignature ?? undefined,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.THIRD_PARTY_GRAIN_INTAKES, record);
      await refreshPendingCount();
      const farmName = currentFarm?.name ?? "Unknown Farm";
      Alert.alert(
        "Intake Recorded",
        "Third-party grain intake saved and queued for sync.",
        [
          {
            text: "Print Docket",
            onPress: async () => { await print(grainIntakeDocketHtml(record, farmName)); router.back(); },
          },
          {
            text: "Share PDF",
            onPress: async () => { await savePdf(grainIntakeDocketHtml(record, farmName), "Grain Intake Docket"); router.back(); },
          },
          { text: "Done", onPress: () => router.back() },
        ],
      );
    } catch {
      Alert.alert("Error", "Failed to save intake record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Third-Party Grain Intake</Text>
            <Text style={styles.subtitle}>Book in a customer's grain delivery</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <Input
            label="Intake Date"
            maxDate="today"
            value={intakeDate}
            onChangeText={setIntakeDate}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="Customer / Farm Name *"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g. Meadowbrook Farm Ltd"
          />
          <Input
            label="Lot / Batch Reference"
            value={lotReference}
            onChangeText={setLotReference}
            placeholder="e.g. LOT-2025-001 (leave blank to auto-generate)"
          />
          <Input
            label="Delivery Note Reference"
            value={deliveryNoteRef}
            onChangeText={setDeliveryNoteRef}
            placeholder="Customer's delivery note number"
          />

          <Text style={styles.sectionTitle}>Commodity *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {commodities.map((c) => (
              <Pressable
                key={c}
                style={[styles.chip, commodity === c && styles.chipActive]}
                onPress={() => setCommodity(c)}
              >
                <Text style={[styles.chipText, commodity === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Input
            label="Variety"
            value={variety}
            onChangeText={setVariety}
            placeholder="e.g. Skyfall, KWS Extase"
          />

          <Text style={styles.sectionTitle}>Grade</Text>
          <View style={styles.chipRow}>
            {GRADES.map((g) => (
              <Pressable
                key={g}
                style={[styles.chip, grade === g && styles.chipActive]}
                onPress={() => setGrade(g)}
              >
                <Text style={[styles.chipText, grade === g && styles.chipTextActive]}>{g}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quantity & Quality</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Quantity (tonnes) *"
                value={quantityTonnes}
                onChangeText={setQuantityTonnes}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Moisture (%)"
                value={moisturePercent}
                onChangeText={setMoisturePercent}
                placeholder="e.g. 14.5"
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Screenings (%)"
                value={screeningsPercent}
                onChangeText={setScreeningsPercent}
                placeholder="e.g. 2.1"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Spec. Weight (kg/hl)"
                value={specificWeightKgHl}
                onChangeText={setSpecificWeightKgHl}
                placeholder="e.g. 76.0"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Storage Location</Text>
          <Input
            label="Bay / Bin"
            value={bayOrBin}
            onChangeText={setBayOrBin}
            placeholder="e.g. Bay 3, Bin 12, Main Store East"
          />

          <Text style={styles.sectionTitle}>Transport</Text>
          <Text style={styles.label}>Transport Arranged By</Text>
          <View style={styles.chipRow}>
            {([
              { key: "customer", label: "Customer's Lorry" },
              { key: "holding", label: "We Booked Haulier" },
            ] as { key: TransportBy; label: string }[]).map((opt) => (
              <Pressable
                key={opt.key}
                style={[styles.chip, transportArrangedBy === opt.key && styles.chipActive]}
                onPress={() => setTransportArrangedBy(opt.key)}
              >
                <Text style={[styles.chipText, transportArrangedBy === opt.key && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Vehicle Reg"
                value={vehicleReg}
                onChangeText={setVehicleReg}
                placeholder="e.g. AV23 XYZ"
                autoCapitalize="characters"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Haulier"
                value={haulier}
                onChangeText={setHaulier}
                placeholder="e.g. Smith's Haulage"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sign-off</Text>
          <LookupPicker label="Recorded By" options={staffOptions} value={recordedBy} onSelect={(_id, l) => setRecordedBy(l)} allowFreeText />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Condition of grain on arrival, any rejections, docket numbers…"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.sectionTitle}>Driver / Customer Sign-Off</Text>
          <View style={styles.infoCard}>
            <Feather name="edit-3" size={14} color={colors.primary} />
            <Text style={styles.infoText}>
              Hand the device to the driver or customer's representative to sign below, confirming the delivery details are correct.
            </Text>
          </View>
          <SignaturePad
            onCapture={setCustomerSignature}
            onClear={() => setCustomerSignature(null)}
            captured={!!customerSignature}
            height={140}
          />
          {customerSignature && (
            <View style={[styles.infoCard, { borderColor: "#86efac", backgroundColor: "#f0fdf4" }]}>
              <Feather name="check-circle" size={14} color="#16a34a" />
              <Text style={[styles.infoText, { color: "#15803d" }]}>
                Signature captured — it will be embedded in the PDF docket.
              </Text>
            </View>
          )}

          <View style={styles.infoCard}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.infoText}>
              This intake will appear under Farm Services → Third-Party Grain on the dashboard once synced.
              Storage charges will be calculated automatically from the linked service agreement.
            </Text>
          </View>

          <Button
            title={saving ? "Saving…" : "Save Intake"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipScroll: { marginBottom: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  infoCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    backgroundColor: colors.primary + "08",
    marginTop: spacing.sm,
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.primary, flex: 1, lineHeight: 20 },
  saveButton: { marginTop: spacing.lg },
});
