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
import { SmallRuminantPicker } from "@/components/ui/SmallRuminantPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function GoatMilkRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache: flocksCached, error: flocksError } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [recordDate, setRecordDate] = useState(todayDate());
  const [flockGroup, setFlockGroup] = useState("");
  const [volumeLitres, setVolumeLitres] = useState("");
  const [fatPercentage, setFatPercentage] = useState("");
  const [proteinPercentage, setProteinPercentage] = useState("");
  const [sccCount, setSccCount] = useState("");
  const [tbcCount, setTbcCount] = useState("");
  const [collectionSlipRef, setCollectionSlipRef] = useState("");
  const [lactationNumber, setLactationNumber] = useState("");
  const [notes, setNotes] = useState("");

  const sccWarning = sccCount && Number(sccCount) > 1000;

  const handleSave = async () => {
    if (!volumeLitres.trim()) {
      Alert.alert("Volume required", "Please enter the volume collected in litres.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "goat-milk-record",
        recordDate,
        flockGroup: flockGroup || null,
        volumeLitres,
        fatPercentage: fatPercentage || null,
        proteinPercentage: proteinPercentage || null,
        sccCount: sccCount ? Number(sccCount) : null,
        tbcCount: tbcCount ? Number(tbcCount) : null,
        collectionSlipRef: collectionSlipRef || null,
        lactationNumber: lactationNumber ? Number(lactationNumber) : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-dairy/milk-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Milk record saved",
        `${volumeLitres}L recorded for ${recordDate}. Will sync when connected.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Goat Milk Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Record Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Record Date *</Text>
            <Input value={recordDate} onChangeText={setRecordDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Volume (litres) *</Text>
            <Input value={volumeLitres} onChangeText={setVolumeLitres} placeholder="e.g. 420" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Herd / Group</Text>
          <SmallRuminantPicker species="goat" value={flockGroup} onChange={setFlockGroup} flocks={flocks} loading={flocksLoading} fromCache={flocksCached} error={flocksError} />
        </View>

        <Text style={styles.sectionTitle}>Milk Quality</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Fat %</Text>
            <Input value={fatPercentage} onChangeText={setFatPercentage} placeholder="e.g. 4.8" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Protein %</Text>
            <Input value={proteinPercentage} onChangeText={setProteinPercentage} placeholder="e.g. 3.5" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>SCC (k/mL)</Text>
            <Input value={sccCount} onChangeText={setSccCount} placeholder="limit 1,000k" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>TBC (k/mL)</Text>
            <Input value={tbcCount} onChangeText={setTbcCount} placeholder="e.g. 25" keyboardType="number-pad" />
          </View>
        </View>

        {!!sccWarning && (
          <View style={styles.warning}>
            <Feather name="alert-triangle" size={14} color="#92400e" />
            <Text style={styles.warningText}>SCC exceeds the 1,000k/mL regulatory limit for goat milk</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>References</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Collection Slip Ref</Text>
            <Input value={collectionSlipRef} onChangeText={setCollectionSlipRef} placeholder="Slip/docket number" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Lactation No.</Text>
            <Input value={lactationNumber} onChangeText={setLactationNumber} placeholder="e.g. 2" keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

        <Button title={saving ? "Saving…" : "Save Milk Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  warning: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fef3c7", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  warningText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
