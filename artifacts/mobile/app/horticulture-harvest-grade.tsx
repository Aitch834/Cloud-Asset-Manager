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
import type { HorticultureHarvestGrade } from "@/lib/types";

export default function HorticultureHarvestGradeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [gradeDate, setGradeDate] = useState(today);
  const [cropName, setCropName] = useState("");
  const [blockOrField, setBlockOrField] = useState("");
  const [totalHarvestedKg, setTotalHarvestedKg] = useState("");
  const [class1Kg, setClass1Kg] = useState("");
  const [class2Kg, setClass2Kg] = useState("");
  const [rejectedKg, setRejectedKg] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState("");
  const [packedByKg, setPackedByKg] = useState("");
  const [destinationPacker, setDestinationPacker] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [coldStoreReference, setColdStoreReference] = useState("");
  const [gradedBy, setGradedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");
  const [yieldPct, setYieldPct] = useState("");

  useEffect(() => {
    const total = parseFloat(totalHarvestedKg);
    const c1 = parseFloat(class1Kg) || 0;
    const c2 = parseFloat(class2Kg) || 0;
    if (total > 0 && (c1 + c2) > 0) {
      setYieldPct((((c1 + c2) / total) * 100).toFixed(1));
    } else {
      setYieldPct("");
    }
  }, [totalHarvestedKg, class1Kg, class2Kg]);

  const handleSave = async () => {
    if (!cropName.trim() || !totalHarvestedKg.trim()) {
      Alert.alert("Required Fields", "Please enter the crop name and total harvested weight.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: HorticultureHarvestGrade = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      gradeDate,
      cropName: cropName.trim(),
      blockOrField: blockOrField.trim(),
      totalHarvestedKg: totalHarvestedKg.trim(),
      class1Kg: class1Kg.trim(),
      class2Kg: class2Kg.trim(),
      rejectedKg: rejectedKg.trim(),
      rejectionReasons: rejectionReasons.trim(),
      packedByKg: packedByKg.trim(),
      destinationPacker: destinationPacker.trim(),
      lotNumber: lotNumber.trim(),
      coldStoreReference: coldStoreReference.trim(),
      gradedBy: gradedBy.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.HORTICULTURE_HARVEST_GRADES, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Harvest grade record saved offline and queued for sync.", [
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
            <Text style={styles.title}>Harvest Grade & Quality</Text>
            <Text style={styles.subtitle}>Packed weights, rejection rates & traceability</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Crop & Date</Text>
          <Input label="Grade Date" value={gradeDate} onChangeText={setGradeDate} placeholder="YYYY-MM-DD" maxDate="today" />
          <Input label="Crop Name *" value={cropName} onChangeText={setCropName} placeholder="e.g. Strawberry, Courgette" />
          <Input label="Block / Field" value={blockOrField} onChangeText={setBlockOrField} placeholder="e.g. Block B" />

          <Text style={styles.sectionTitle}>Weight & Grading</Text>
          <Input label="Total Harvested (kg) *" value={totalHarvestedKg} onChangeText={setTotalHarvestedKg} placeholder="e.g. 850" keyboardType="decimal-pad" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Class 1 / Grade A (kg)" value={class1Kg} onChangeText={setClass1Kg} placeholder="e.g. 680" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Class 2 / Grade B (kg)" value={class2Kg} onChangeText={setClass2Kg} placeholder="e.g. 120" keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Rejected (kg)" value={rejectedKg} onChangeText={setRejectedKg} placeholder="e.g. 50" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Packed / Marketed (kg)" value={packedByKg} onChangeText={setPackedByKg} placeholder="e.g. 800" keyboardType="decimal-pad" />
            </View>
          </View>

          {yieldPct ? (
            <View style={styles.yieldBanner}>
              <Feather name="trending-up" size={16} color={colors.success} />
              <Text style={styles.yieldText}>Pack-out rate: <Text style={styles.yieldValue}>{yieldPct}%</Text></Text>
            </View>
          ) : null}

          <Input label="Rejection Reasons" value={rejectionReasons} onChangeText={setRejectionReasons} placeholder="e.g. Botrytis, size, damage" multiline numberOfLines={2} />

          <Text style={styles.sectionTitle}>Traceability</Text>
          <Input label="Lot / Batch Number" value={lotNumber} onChangeText={setLotNumber} placeholder="Packer lot reference" />
          <Input label="Destination Packer / Buyer" value={destinationPacker} onChangeText={setDestinationPacker} placeholder="Company or packing house name" />
          <Input label="Cold Store Reference" value={coldStoreReference} onChangeText={setColdStoreReference} placeholder="Store bay or reference" />
          <Input label="Graded By" value={gradedBy} onChangeText={setGradedBy} placeholder="Name" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any quality observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Grade Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  yieldBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#F0FDF4", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#BBF7D0" },
  yieldText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.success },
  yieldValue: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.success },
  saveButton: { marginTop: spacing.lg },
});
