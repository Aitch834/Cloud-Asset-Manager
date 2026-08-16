import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { LivestockSaleRecord } from "@/lib/types";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";

const SPECIES_FALLBACK = ["Cattle", "Sheep", "Pigs", "Deer", "Goats", "Other"];

export default function LivestockSaleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("livestock-sale", currentFarm?.id, user?.id);
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const speciesOptions = useMobileLookup("livestock_species", SPECIES_FALLBACK);
  const [saving, setSaving] = useState(false);

  const [saleType, setSaleType] = useState<"deadweight" | "mart">("deadweight");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [species, setSpecies] = useState("");
  const [headCount, setHeadCount] = useState("");
  const [processor, setProcessor] = useState("");
  const [martName, setMartName] = useState("");
  const [grade, setGrade] = useState("");
  const [totalDeadweightKg, setTotalDeadweightKg] = useState("");
  const [averageDeadweightKg, setAverageDeadweightKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [grossValue, setGrossValue] = useState("");
  const [deductions, setDeductions] = useState("");
  const [netPayment, setNetPayment] = useState("");
  const [killSheetRef, setKillSheetRef] = useState("");
  const [vendorDeclarationRef, setVendorDeclarationRef] = useState("");
  const [animalIds, setAnimalIds] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!species.trim()) {
      Alert.alert("Required", "Please select a species.");
      return;
    }
    if (!headCount.trim()) {
      Alert.alert("Required", "Please enter the head count.");
      return;
    }
    if (saleType === "deadweight" && !processor.trim()) {
      Alert.alert("Required", "Please enter the processor / abattoir name.");
      return;
    }
    if (saleType === "mart" && !martName.trim()) {
      Alert.alert("Required", "Please enter the mart / auction mart name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: LivestockSaleRecord = {
      id: generateId(),
      farmId: currentFarm?.id?.toString() ?? "",
      saleDate,
      saleType,
      species: species.trim(),
      headCount: headCount.trim(),
      processor: processor.trim(),
      martName: martName.trim(),
      grade: grade.trim(),
      totalDeadweightKg: totalDeadweightKg.trim(),
      averageDeadweightKg: averageDeadweightKg.trim(),
      pricePerKg: pricePerKg.trim(),
      grossValue: grossValue.trim(),
      deductions: deductions.trim(),
      netPayment: netPayment.trim(),
      killSheetRef: killSheetRef.trim(),
      vendorDeclarationRef: vendorDeclarationRef.trim(),
      animalIds: animalIds.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.LIVESTOCK_SALE_RECORDS, record);
      await refreshPendingCount();
      Alert.alert("Saved", "Livestock sale recorded and queued for sync.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Livestock Sale</Text>
          <View style={{ width: 40 }} />
        </View>

        <IdentifierBanner
          justSaved={justSaved && !identifiersLoading}
          missingIdentifiers={missingIdentifiers}
          bannerDismissed={bannerDismissed}
          onClearJustSaved={clearJustSaved}
          onDismiss={dismissBanner}
          cphMissing={!cphNumber}
          sbiMissing={!sbiNumber}
          context="livestock sale submissions"
        />

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Sale Type</Text>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, saleType === "deadweight" && styles.toggleBtnActive]}
              onPress={() => setSaleType("deadweight")}
            >
              <Feather name="package" size={16} color={saleType === "deadweight" ? "#fff" : colors.textSecondary} />
              <Text style={[styles.toggleText, saleType === "deadweight" && styles.toggleTextActive]}>Deadweight / Kill Sheet</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, saleType === "mart" && styles.toggleBtnActive]}
              onPress={() => setSaleType("mart")}
            >
              <Feather name="shopping-bag" size={16} color={saleType === "mart" ? "#fff" : colors.textSecondary} />
              <Text style={[styles.toggleText, saleType === "mart" && styles.toggleTextActive]}>Mart / Auction</Text>
            </Pressable>
          </View>

          {saleType === "deadweight" && (
            <View style={{ backgroundColor: "#eff6ff", borderRadius: 8, padding: 12, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: "#2563eb" }}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#1e40af", marginBottom: 4 }}>Movement Record Link Required</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#1e40af" }}>
                After this record syncs, open Sales &amp; Trading → Deadweight tab on the dashboard, edit this kill sheet, and link it to the off-farm movement record. This creates the BCMS audit trail required by Red Tractor and AHDB.
              </Text>
            </View>
          )}
          {saleType === "mart" && (
            <View style={{ backgroundColor: "#eff6ff", borderRadius: 8, padding: 12, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: "#2563eb" }}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#1e40af", marginBottom: 4 }}>Movement Record Link Required</Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#1e40af" }}>
                After this record syncs, open Sales &amp; Trading → Mart / Auction tab on the dashboard, edit this sale, and link it to the off-farm movement record. This completes the LIS submission audit trail.
              </Text>
            </View>
          )}

          <Input label="Sale / Kill Date *" value={saleDate} onChangeText={setSaleDate} placeholder="YYYY-MM-DD" maxDate="today" />

          <Text style={styles.sectionLabel}>Species *</Text>
          <View style={styles.pillRow}>
            {speciesOptions.map(s => (
              <Pressable
                key={s}
                style={[styles.pill, species === s && styles.pillActive]}
                onPress={() => setSpecies(s)}
              >
                <Text style={[styles.pillText, species === s && styles.pillTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Head Count *" value={headCount} onChangeText={setHeadCount} placeholder="0" keyboardType="number-pad" />

          {saleType === "deadweight" ? (
            <>
              <Input label="Processor / Abattoir *" value={processor} onChangeText={setProcessor} placeholder="e.g. ABP, Dawn Meats" />
              <Input label="Total Deadweight (kg)" value={totalDeadweightKg} onChangeText={setTotalDeadweightKg} placeholder="0.0" keyboardType="decimal-pad" />
              <Input label="Average Deadweight (kg)" value={averageDeadweightKg} onChangeText={setAverageDeadweightKg} placeholder="0.0" keyboardType="decimal-pad" />
              <Input label="Price (pence/kg)" value={pricePerKg} onChangeText={setPricePerKg} placeholder="e.g. 452" keyboardType="decimal-pad" />
              <Input label="Grade / Classification" value={grade} onChangeText={setGrade} placeholder="e.g. R4L, U3" />
              <Input label="Kill Sheet Ref" value={killSheetRef} onChangeText={setKillSheetRef} />
            </>
          ) : (
            <>
              <Input label="Mart / Auction Mart *" value={martName} onChangeText={setMartName} placeholder="e.g. Carlisle Auction Mart" />
              <Input label="Price per Head (£)" value={pricePerKg} onChangeText={setPricePerKg} placeholder="0.00" keyboardType="decimal-pad" />
              <Input label="Auctioneer Ref / Lot Number" value={killSheetRef} onChangeText={setKillSheetRef} />
            </>
          )}

          <Input label="Gross Value (£)" value={grossValue} onChangeText={setGrossValue} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Deductions (£)" value={deductions} onChangeText={setDeductions} placeholder="transport, levy etc." keyboardType="decimal-pad" />
          <Input label="Net Payment (£)" value={netPayment} onChangeText={setNetPayment} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Vendor Declaration Ref" value={vendorDeclarationRef} onChangeText={setVendorDeclarationRef} />
          <Input label="Animal Ear Tags / IDs" value={animalIds} onChangeText={setAnimalIds} placeholder="comma-separated" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes…" multiline numberOfLines={3} />

          <Button
            title={saving ? "Saving…" : "Save Sale"}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { padding: spacing.lg, gap: spacing.md },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6 },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: spacing.sm },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  toggleBtnActive: { backgroundColor: "#15803d", borderColor: "#15803d" },
  toggleText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  toggleTextActive: { color: "#fff" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: "#15803d", borderColor: "#15803d" },
  pillText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  pillTextActive: { color: "#fff" },
});
