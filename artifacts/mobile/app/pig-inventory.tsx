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
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

export default function PigInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const {
    cphNumber,
    sbiNumber,
    loading: identifiersLoading,
    justSaved,
    clearJustSaved,
    refetch: refetchIdentifiers,
  } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss(
    "pig-inventory",
    currentFarm?.id,
    user?.id,
  );
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [countDate, setCountDate] = useState(new Date().toISOString().split("T")[0]);
  const [sowCount, setSowCount] = useState("");
  const [boarCount, setBoarCount] = useState("");
  const [pigletCount, setPigletCount] = useState("");
  const [weanerCount, setWeanerCount] = useState("");
  const [growerCount, setGrowerCount] = useState("");
  const [finisherCount, setFinisherCount] = useState("");
  const [countedBy, setCountedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const total =
    (parseInt(sowCount, 10) || 0) +
    (parseInt(boarCount, 10) || 0) +
    (parseInt(pigletCount, 10) || 0) +
    (parseInt(weanerCount, 10) || 0) +
    (parseInt(growerCount, 10) || 0) +
    (parseInt(finisherCount, 10) || 0);

  const handleSave = async () => {
    if (!countDate.trim()) {
      Alert.alert("Required", "Please enter the count date."); return;
    }
    if (total === 0) {
      Alert.alert("Required", "Please enter at least one pig count."); return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId: flockId || null,
      groupName: groupName.trim() || null,
      countDate,
      sowCount: parseInt(sowCount, 10) || 0,
      boarCount: parseInt(boarCount, 10) || 0,
      pigletCount: parseInt(pigletCount, 10) || 0,
      weanerCount: parseInt(weanerCount, 10) || 0,
      growerCount: parseInt(growerCount, 10) || 0,
      finisherCount: parseInt(finisherCount, 10) || 0,
      totalCount: total,
      countedBy: countedBy.trim() || null,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_INVENTORY_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Inventory saved",
      `${total} pigs recorded and queued for sync.`,
      [
        {
          text: "Record Another",
          onPress: () => {
            setSowCount(""); setBoarCount(""); setPigletCount("");
            setWeanerCount(""); setGrowerCount(""); setFinisherCount("");
            setNotes("");
          },
        },
        { text: "Done", onPress: () => router.back() },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pig Inventory Count</Text>
        <View style={{ width: 36 }} />
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="pig inventory submissions"
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              Regular pig inventory counts support APHA herd census returns and Red Tractor audit requirements. Record counts by age group for accuracy.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Herd / Group</Text>
          </View>
          <PigPenPicker
            label="Select Group (optional)"
            value={groupName}
            onChange={setGroupName}
            onChangeFlock={(f) => setFlockId(f.id)}
            flocks={flocks}
            loading={flocksLoading}
            fromCache={fromCache}
            error={flocksError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Count Details</Text>
          </View>
          <Input label="Count Date *" placeholder="YYYY-MM-DD" maxDate="today" value={countDate} onChangeText={setCountDate} required />
          <Input label="Counted By" placeholder="e.g. John Smith" value={countedBy} onChangeText={setCountedBy} />

          <View style={styles.sectionLabel}>
            <Feather name="hash" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Pig Counts by Category</Text>
          </View>
          <View style={styles.row}>
            <Input label="Sows" placeholder="0" value={sowCount} onChangeText={setSowCount} keyboardType="number-pad" containerStyle={styles.flex} />
            <Input label="Boars" placeholder="0" value={boarCount} onChangeText={setBoarCount} keyboardType="number-pad" containerStyle={styles.flex} />
          </View>
          <View style={styles.row}>
            <Input label="Piglets (suckling)" placeholder="0" value={pigletCount} onChangeText={setPigletCount} keyboardType="number-pad" containerStyle={styles.flex} />
            <Input label="Weaners" placeholder="0" value={weanerCount} onChangeText={setWeanerCount} keyboardType="number-pad" containerStyle={styles.flex} />
          </View>
          <View style={styles.row}>
            <Input label="Growers" placeholder="0" value={growerCount} onChangeText={setGrowerCount} keyboardType="number-pad" containerStyle={styles.flex} />
            <Input label="Finishers" placeholder="0" value={finisherCount} onChangeText={setFinisherCount} keyboardType="number-pad" containerStyle={styles.flex} />
          </View>

          {total > 0 && (
            <View style={styles.totalBox}>
              <Feather name="check-circle" size={15} color={colors.primary} />
              <Text style={styles.totalText}>Total pigs counted: <Text style={styles.totalNumber}>{total}</Text></Text>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Any discrepancies, remarks or context…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Button title="Save Inventory Count" onPress={handleSave} loading={saving} fullWidth icon="check" />
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
  infoBox: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.info, flex: 1, lineHeight: 18 },
  totalBox: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.successBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#86EFAC" },
  totalText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#166534" },
  totalNumber: { fontFamily: fonts.semiBold },
});
