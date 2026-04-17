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
import type { ShootingRecord } from "@/lib/types";

const SHOOT_TYPES: { key: ShootingRecord["shootType"]; label: string }[] = [
  { key: "formal_driven", label: "Formal Driven" },
  { key: "rough_shoot", label: "Rough Shoot" },
  { key: "walked_up", label: "Walked-Up" },
  { key: "pigeon", label: "Pigeon" },
  { key: "wildfowl", label: "Wildfowl" },
  { key: "other", label: "Other" },
];

const SPECIES = [
  { key: "bagsPheasant", label: "Pheasant" },
  { key: "bagsPartridge", label: "Partridge" },
  { key: "bagsGrouse", label: "Grouse" },
  { key: "bagsDuck", label: "Duck" },
  { key: "bagsWoodcock", label: "Woodcock" },
  { key: "bagsOther", label: "Other" },
] as const;

export default function ShootingRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [shootDate, setShootDate] = useState(today);
  const [shootType, setShootType] = useState<ShootingRecord["shootType"]>("formal_driven");
  const [organiser, setOrganiser] = useState("");
  const [numberOfGuns, setNumberOfGuns] = useState("");
  const [gamekeeperName, setGamekeeperName] = useState("");
  const [bags, setBags] = useState<Record<string, string>>({
    bagsPheasant: "", bagsPartridge: "", bagsGrouse: "",
    bagsDuck: "", bagsWoodcock: "", bagsOther: "",
  });
  const [gameDealer, setGameDealer] = useState("");
  const [incomeLeaseFee, setIncomeLeaseFee] = useState("");
  const [notes, setNotes] = useState("");

  const totalBag = Object.values(bags).reduce((sum, v) => sum + (parseInt(v) || 0), 0);

  const handleSave = async () => {
    if (!shootDate) {
      Alert.alert("Required Fields", "Please enter the shoot date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: ShootingRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      shootDate,
      shootType,
      organiser: organiser.trim(),
      numberOfGuns: numberOfGuns.trim(),
      gamekeeperName: gamekeeperName.trim(),
      bagsPheasant: bags.bagsPheasant || "0",
      bagsPartridge: bags.bagsPartridge || "0",
      bagsGrouse: bags.bagsGrouse || "0",
      bagsDuck: bags.bagsDuck || "0",
      bagsWoodcock: bags.bagsWoodcock || "0",
      bagsOther: bags.bagsOther || "0",
      totalBag: String(totalBag),
      gameDealer: gameDealer.trim(),
      incomeLeaseFee: incomeLeaseFee.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SHOOTING_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Shooting record saved offline and queued for sync.", [
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
            <Text style={styles.title}>Shooting & Game Record</Text>
            <Text style={styles.subtitle}>Log shoot days, bag counts and game dealer details</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Shoot Details</Text>
          <Input label="Shoot Date *" value={shootDate} onChangeText={setShootDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Shoot Type</Text>
          <View style={styles.chipRow}>
            {SHOOT_TYPES.map((s) => (
              <Pressable key={s.key} onPress={() => setShootType(s.key)} style={[styles.chip, shootType === s.key && styles.chipActive]}>
                <Text style={[styles.chipText, shootType === s.key && styles.chipTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Organiser" value={organiser} onChangeText={setOrganiser} placeholder="Name of shoot organiser or tenant" />
          <Input label="Number of Guns" value={numberOfGuns} onChangeText={setNumberOfGuns} placeholder="e.g. 8" keyboardType="numeric" />
          <Input label="Gamekeeper Name" value={gamekeeperName} onChangeText={setGamekeeperName} placeholder="Keeper on the day" />

          <Text style={styles.sectionTitle}>Bag Counts</Text>
          <View style={styles.bagGrid}>
            {SPECIES.map((s) => (
              <View key={s.key} style={styles.bagItem}>
                <Text style={styles.bagLabel}>{s.label}</Text>
                <Input
                  value={bags[s.key]}
                  onChangeText={(v) => setBags((b) => ({ ...b, [s.key]: v }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bag</Text>
            <Text style={styles.totalValue}>{totalBag}</Text>
          </View>

          <Text style={styles.sectionTitle}>Income & Disposal</Text>
          <Input label="Game Dealer" value={gameDealer} onChangeText={setGameDealer} placeholder="Name of game dealer" />
          <Input label="Income / Lease Fee (£)" value={incomeLeaseFee} onChangeText={setIncomeLeaseFee} placeholder="e.g. 2500.00" keyboardType="decimal-pad" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional details…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  bagGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  bagItem: { width: "30%", flexGrow: 1 },
  bagLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  totalLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  totalValue: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.primary },
  saveButton: { marginTop: spacing.lg },
});
