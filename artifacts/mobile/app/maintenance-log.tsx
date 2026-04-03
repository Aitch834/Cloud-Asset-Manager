import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import type { MaintenanceLog } from "@/lib/types";

type MaintenanceType = MaintenanceLog["maintenanceType"];

const MAINTENANCE_TYPES: { key: MaintenanceType; label: string; icon: string }[] = [
  { key: "mot", label: "MOT Test", icon: "shield" },
  { key: "annual_service", label: "Annual Service", icon: "settings" },
  { key: "interim_service", label: "Interim / Oil Service", icon: "droplet" },
  { key: "repair", label: "Repair", icon: "tool" },
  { key: "inspection", label: "Safety Inspection", icon: "eye" },
  { key: "pre_use", label: "Pre-Use Check", icon: "check-circle" },
  { key: "warranty", label: "Warranty Work", icon: "award" },
  { key: "other", label: "Other", icon: "more-horizontal" },
];

export default function MaintenanceLogScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [assetName, setAssetName] = useState("");
  const [assetReference, setAssetReference] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(today);
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>("service");
  const [description, setDescription] = useState("");
  const [hoursAtService, setHoursAtService] = useState("");
  const [labourHours, setLabourHours] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [labourCost, setLabourCost] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [technician, setTechnician] = useState(user?.name || "");
  const [externalGarage, setExternalGarage] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [nextServiceDue, setNextServiceDue] = useState("");
  const [nextServiceHours, setNextServiceHours] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const parts = parseFloat(partsCost) || 0;
    const labour = parseFloat(labourCost) || 0;
    const total = parts + labour;
    if (total > 0) setTotalCost(total.toFixed(2));
  }, [partsCost, labourCost]);

  const handleSave = async () => {
    if (!assetName.trim() || !maintenanceDate) {
      Alert.alert("Required Fields", "Please enter the asset name and maintenance date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: MaintenanceLog = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      assetName: assetName.trim(),
      assetReference: assetReference.trim(),
      maintenanceDate,
      maintenanceType,
      description: description.trim(),
      hoursAtService: hoursAtService.trim(),
      labourHours: labourHours.trim(),
      partsCost: partsCost.trim(),
      labourCost: labourCost.trim(),
      totalCost: totalCost.trim(),
      technician: technician.trim(),
      externalGarage: externalGarage.trim(),
      invoiceNumber: invoiceNumber.trim(),
      nextServiceDue: nextServiceDue.trim(),
      nextServiceHours: nextServiceHours.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.MAINTENANCE_LOGS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Maintenance log saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Maintenance / Service Log</Text>
            <Text style={styles.subtitle}>Equipment repairs, services & inspections</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Asset</Text>
          <Input label="Asset Name *" value={assetName} onChangeText={setAssetName} placeholder="e.g. John Deere 6155M" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Asset Reference / Reg" value={assetReference} onChangeText={setAssetReference} placeholder="e.g. EQ-0023 / AX71 BDE" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Hours at Service" value={hoursAtService} onChangeText={setHoursAtService} placeholder="e.g. 3420" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Maintenance Type</Text>
          <View style={styles.chipRow}>
            {MAINTENANCE_TYPES.map((t) => (
              <Pressable key={t.key} onPress={() => setMaintenanceType(t.key)} style={[styles.chip, maintenanceType === t.key && styles.chipActive]}>
                <Feather name={t.icon as any} size={12} color={maintenanceType === t.key ? colors.primary : colors.textSecondary} />
                <Text style={[styles.chipText, maintenanceType === t.key && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Work Details</Text>
          <Input label="Maintenance Date *" value={maintenanceDate} onChangeText={setMaintenanceDate} placeholder="YYYY-MM-DD" />
          <Input label="Description of Work *" value={description} onChangeText={setDescription} placeholder="What was done…" multiline numberOfLines={3} />
          <Input label="Technician / Operator" value={technician} onChangeText={setTechnician} placeholder="Who carried out the work" />
          <Input label="External Garage / Contractor" value={externalGarage} onChangeText={setExternalGarage} placeholder="If applicable" />
          <Input label="Invoice / Job Number" value={invoiceNumber} onChangeText={setInvoiceNumber} placeholder="Reference number" />

          <Text style={styles.sectionTitle}>Costs</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Labour Hours" value={labourHours} onChangeText={setLabourHours} placeholder="e.g. 2.5" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Labour Cost (£)" value={labourCost} onChangeText={setLabourCost} placeholder="e.g. 90.00" keyboardType="decimal-pad" />
            </View>
          </View>
          <Input label="Parts Cost (£)" value={partsCost} onChangeText={setPartsCost} placeholder="e.g. 245.00" keyboardType="decimal-pad" />
          {totalCost ? (
            <View style={styles.totalBanner}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>£{totalCost}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Next Service</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Next Service Due (date)" value={nextServiceDue} onChangeText={setNextServiceDue} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Next Service (hours)" value={nextServiceHours} onChangeText={setNextServiceHours} placeholder="e.g. 3670" keyboardType="numeric" />
            </View>
          </View>

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Maintenance Log"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  totalBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F0FDF4", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#BBF7D0" },
  totalLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.success },
  totalValue: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.success },
  saveButton: { marginTop: spacing.lg },
});
