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
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigFeedConsumption } from "@/lib/types";

const FEED_TYPES = [
  "Creep feed", "Weaner pellets", "Grower pellets", "Finisher pellets",
  "Sow lactation", "Sow gestation", "Boar feed", "Whey / liquid feed",
  "Mash", "Rolled barley", "Other",
];

export default function PigFeedConsumptionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [consumptionDate, setConsumptionDate] = useState(new Date().toISOString().split("T")[0]);
  const [penName, setPenName] = useState("");
  const [feedType, setFeedType] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [batchLotNumber, setBatchLotNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!feedType.trim()) { Alert.alert("Required", "Please select the feed type."); return; }
    if (!quantityKg.trim()) { Alert.alert("Required", "Please enter the quantity consumed."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigFeedConsumption = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      consumptionDate,
      penName: penName.trim() || groupName.trim(),
      feedType: feedType.trim(),
      quantityKg: quantityKg.trim(),
      batchLotNumber: batchLotNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_FEED_CONSUMPTION, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Feed consumption record saved and queued for sync.", [
      { text: "Log Another", onPress: () => { setQuantityKg(""); setNotes(""); setBatchLotNumber(""); }},
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Feed Consumption</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="grid" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Group / Pen &amp; Date</Text>
          </View>
          <PigPenPicker label="Select Group (optional)" value={groupName} onChange={setGroupName} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <View style={styles.row}>
            <Input label="Date *" placeholder="YYYY-MM-DD" value={consumptionDate} onChangeText={setConsumptionDate} containerStyle={styles.flex} required />
            <Input label="Pen Name" placeholder="e.g. Pen 3" value={penName} onChangeText={setPenName} containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Feed Type</Text>
          </View>
          <View style={styles.chipRow}>
            {FEED_TYPES.map((ft) => (
              <Pressable key={ft} onPress={() => { Haptics.selectionAsync(); setFeedType(ft); }} style={[styles.chip, feedType === ft && styles.chipSelected]}>
                <Text style={[styles.chipText, feedType === ft && styles.chipTextSelected]}>{ft}</Text>
              </Pressable>
            ))}
          </View>
          {feedType === "Other" && (
            <Input label="Describe Feed Type" placeholder="e.g. Maize silage, DDGS blend" value={feedType === "Other" ? "" : feedType} onChangeText={setFeedType} />
          )}

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Quantity &amp; Batch</Text>
          </View>
          <View style={styles.row}>
            <Input label="Quantity (kg) *" placeholder="e.g. 500" value={quantityKg} onChangeText={setQuantityKg} keyboardType="decimal-pad" containerStyle={styles.flex} required />
            <Input label="Batch / Lot Number" placeholder="e.g. LOT2024-12" value={batchLotNumber} onChangeText={setBatchLotNumber} containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Any relevant observations — feed refusal, palatability, delivery notes…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Button title="Save Feed Record" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: "#db2777", borderColor: "#db2777" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});
