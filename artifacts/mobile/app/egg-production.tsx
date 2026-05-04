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
import type { EggProductionRecord } from "@/lib/types";

export default function EggProductionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [flockReference, setFlockReference] = useState("");
  const [house, setHouse] = useState("");
  const [recordDate, setRecordDate] = useState(today);
  const [birdsInFlock, setBirdsInFlock] = useState("");
  const [eggsCollected, setEggsCollected] = useState("");
  const [brokenEggs, setBrokenEggs] = useState("");
  const [dirtyEggs, setDirtyEggs] = useState("");
  const [grade1, setGrade1] = useState("");
  const [grade2, setGrade2] = useState("");
  const [thirds, setThirds] = useState("");
  const [downgraded, setDowngraded] = useState("");
  const [collectedBy, setCollectedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");
  const [layRate, setLayRate] = useState("");

  useEffect(() => {
    const birds = parseFloat(birdsInFlock);
    const eggs = parseFloat(eggsCollected);
    if (birds > 0 && eggs >= 0) {
      setLayRate(((eggs / birds) * 100).toFixed(1));
    } else {
      setLayRate("");
    }
  }, [birdsInFlock, eggsCollected]);

  const handleSave = async () => {
    if (!flockReference.trim() || !eggsCollected.trim()) {
      Alert.alert("Required Fields", "Please enter the flock reference and eggs collected.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: EggProductionRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockReference: flockReference.trim(),
      house: house.trim(),
      recordDate,
      birdsInFlock: birdsInFlock.trim(),
      eggsCollected: eggsCollected.trim(),
      brokenEggs: brokenEggs.trim() || "0",
      dirtyEggs: dirtyEggs.trim() || "0",
      layRate,
      grade1: grade1.trim(),
      grade2: grade2.trim(),
      thirds: thirds.trim(),
      downgraded: downgraded.trim(),
      collectedBy: collectedBy.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.EGG_PRODUCTION_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Egg production record saved offline and queued for sync.", [
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
            <Text style={styles.title}>Egg Production Record</Text>
            <Text style={styles.subtitle}>Daily lay rate, grading and packing</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Flock</Text>
          <Input label="Flock Reference *" value={flockReference} onChangeText={setFlockReference} placeholder="e.g. House 2 – Layers 2024" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="House / Unit" value={house} onChangeText={setHouse} placeholder="House number" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Record Date" value={recordDate} onChangeText={setRecordDate} placeholder="YYYY-MM-DD" maxDate="today" />
            </View>
          </View>
          <Input label="Birds in Flock" value={birdsInFlock} onChangeText={setBirdsInFlock} placeholder="Head count" keyboardType="numeric" />

          <Text style={styles.sectionTitle}>Collection</Text>
          <Input label="Eggs Collected *" value={eggsCollected} onChangeText={setEggsCollected} placeholder="Total eggs" keyboardType="numeric" />

          {layRate ? (
            <View style={styles.layRateBanner}>
              <Feather name="trending-up" size={16} color={colors.success} />
              <Text style={styles.layRateText}>Lay Rate: <Text style={styles.layRateValue}>{layRate}%</Text></Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Broken Eggs" value={brokenEggs} onChangeText={setBrokenEggs} placeholder="0" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Dirty Eggs" value={dirtyEggs} onChangeText={setDirtyEggs} placeholder="0" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Grading (optional)</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Grade 1 / Class A" value={grade1} onChangeText={setGrade1} placeholder="Qty" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Grade 2 / Class B" value={grade2} onChangeText={setGrade2} placeholder="Qty" keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Thirds / Underweight" value={thirds} onChangeText={setThirds} placeholder="Qty" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Downgraded / Rejected" value={downgraded} onChangeText={setDowngraded} placeholder="Qty" keyboardType="numeric" />
            </View>
          </View>

          <Input label="Collected By" value={collectedBy} onChangeText={setCollectedBy} placeholder="Name" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Production Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  layRateBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#F0FDF4", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#BBF7D0" },
  layRateText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.success },
  layRateValue: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.success },
  saveButton: { marginTop: spacing.lg },
});
