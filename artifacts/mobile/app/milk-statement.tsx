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
import type { MilkStatementRecord } from "@/lib/types";

const BUYERS = [
  "Arla", "First Milk", "Müller", "Dairy Crest", "Lactalis",
  "Crediton Dairy", "Yeo Valley", "Co-op", "M&S", "Other",
];

export default function MilkStatementScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [statementMonth, setStatementMonth] = useState(defaultMonth);
  const [buyer, setBuyer] = useState("");
  const [litresSupplied, setLitresSupplied] = useState("");
  const [pencePerLitre, setPencePerLitre] = useState("");
  const [grossValue, setGrossValue] = useState("");
  const [butterfatPct, setButterfatPct] = useState("");
  const [proteinPct, setProteinPct] = useState("");
  const [scc, setScc] = useState("");
  const [qualityBonus, setQualityBonus] = useState("");
  const [qualityPenalty, setQualityPenalty] = useState("");
  const [transportDeduction, setTransportDeduction] = useState("");
  const [netPayment, setNetPayment] = useState("");
  const [statementRef, setStatementRef] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!buyer.trim()) {
      Alert.alert("Required", "Please enter the milk buyer / processor.");
      return;
    }
    if (!litresSupplied.trim()) {
      Alert.alert("Required", "Please enter the litres supplied.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: MilkStatementRecord = {
      id: generateId(),
      farmId: currentFarm?.id?.toString() ?? "",
      statementMonth,
      buyer: buyer.trim(),
      litresSupplied: litresSupplied.trim(),
      pencePerLitre: pencePerLitre.trim(),
      grossValue: grossValue.trim(),
      butterfatPct: butterfatPct.trim(),
      proteinPct: proteinPct.trim(),
      scc: scc.trim(),
      qualityBonus: qualityBonus.trim(),
      qualityPenalty: qualityPenalty.trim(),
      transportDeduction: transportDeduction.trim(),
      netPayment: netPayment.trim(),
      statementRef: statementRef.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.MILK_STATEMENT_RECORDS, record);
      await refreshPendingCount();
      Alert.alert("Saved", "Milk statement recorded and queued for sync.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save milk statement. Please try again.");
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
          <Text style={styles.headerTitle}>Milk Statement</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          <Input label="Statement Month *" value={statementMonth} onChangeText={setStatementMonth} placeholder="YYYY-MM" />

          <Text style={styles.sectionLabel}>Milk Buyer *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {BUYERS.map(b => (
              <Pressable
                key={b}
                style={[styles.buyerPill, buyer === b && styles.buyerPillActive]}
                onPress={() => setBuyer(b)}
              >
                <Text style={[styles.buyerText, buyer === b && styles.buyerTextActive]}>{b}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Input label="Buyer (or type name above)" value={buyer} onChangeText={setBuyer} placeholder="e.g. Arla Foods UK" />

          <Input label="Litres Supplied *" value={litresSupplied} onChangeText={setLitresSupplied} placeholder="0" keyboardType="decimal-pad" />
          <Input label="Pence per Litre (ppl)" value={pencePerLitre} onChangeText={setPencePerLitre} placeholder="e.g. 34.50" keyboardType="decimal-pad" />
          <Input label="Gross Value (£)" value={grossValue} onChangeText={setGrossValue} placeholder="0.00" keyboardType="decimal-pad" />

          <View style={styles.qualityRow}>
            <View style={{ flex: 1 }}>
              <Input label="Butterfat (%)" value={butterfatPct} onChangeText={setButterfatPct} placeholder="e.g. 4.10" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Protein (%)" value={proteinPct} onChangeText={setProteinPct} placeholder="e.g. 3.30" keyboardType="decimal-pad" />
            </View>
          </View>

          <Input label="SCC (cells/ml 000s)" value={scc} onChangeText={setScc} placeholder="e.g. 180" keyboardType="number-pad" />
          <Input label="Quality Bonus (£)" value={qualityBonus} onChangeText={setQualityBonus} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Quality Penalty (£)" value={qualityPenalty} onChangeText={setQualityPenalty} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Transport Deduction (£)" value={transportDeduction} onChangeText={setTransportDeduction} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Net Payment (£)" value={netPayment} onChangeText={setNetPayment} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Statement Reference" value={statementRef} onChangeText={setStatementRef} placeholder="e.g. Arla-2024-03" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any comments on quality or deductions…" multiline numberOfLines={3} />

          <Button
            title={saving ? "Saving…" : "Save Milk Statement"}
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
  buyerPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    marginRight: 8,
  },
  buyerPillActive: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  buyerText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  buyerTextActive: { color: "#fff" },
  qualityRow: { flexDirection: "row", gap: 8 },
});
