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
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigMovement } from "@/lib/types";

const MOVEMENT_TYPES = [
  { key: "on", label: "On — incoming pigs", icon: "arrow-down-circle" },
  { key: "off", label: "Off — outgoing pigs", icon: "arrow-up-circle" },
  { key: "between", label: "Between holdings", icon: "repeat" },
];

export default function PigMovementScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const pigAlert = useDiseaseAlert("pig");
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("pig-movement", currentFarm?.id, user?.id);
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const [saving, setSaving] = useState(false);

  const [movementDate, setMovementDate] = useState(new Date().toISOString().split("T")[0]);
  const [movementType, setMovementType] = useState("off");
  const [fromLocation, setFromLocation] = useState(currentFarm?.name || "");
  const [toLocation, setToLocation] = useState("");
  const [fromCph, setFromCph] = useState("");
  const [toCph, setToCph] = useState("");
  const [numberOfAnimals, setNumberOfAnimals] = useState("");
  const [eaml2Reference, setEaml2Reference] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [cleaningDeclaration, setCleaningDeclaration] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!numberOfAnimals.trim() || parseInt(numberOfAnimals, 10) < 1) {
      Alert.alert("Required", "Please enter the number of animals moved."); return;
    }
    if (!toLocation.trim()) {
      Alert.alert("Required", "Please enter the destination / to location."); return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigMovement = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      movementDate,
      movementType,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      fromCph: fromCph.trim(),
      toCph: toCph.trim(),
      numberOfAnimals: numberOfAnimals.trim(),
      eaml2Reference: eaml2Reference.trim(),
      transporterName: transporterName.trim(),
      vehicleRegistration: vehicleRegistration.trim(),
      cleaningDeclaration,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_MOVEMENTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert("Saved", "Movement record saved and queued for sync.\n\nRemember: All pig movements must be registered on EAML2 within 3 days.", [
      { text: "Record Another", onPress: () => {
        setNumberOfAnimals(""); setEaml2Reference(""); setTransporterName("");
        setVehicleRegistration(""); setToLocation(""); setToCph(""); setNotes("");
        setCleaningDeclaration(false);
      }},
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pig Movement</Text>
        <View style={{ width: 36 }} />
      </View>
      <DiseaseAlertBanner alert={pigAlert} sector="Pig" />

      <IdentifierBanner
        justSaved={justSaved}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="pig movement submissions"
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              All pig movements must be recorded in EAML2 within 3 days. Failure to register is a legal offence. You can record the movement here offline and it will sync — remember to also submit to EAML2.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="repeat" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Movement Type</Text>
          </View>
          {MOVEMENT_TYPES.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => { Haptics.selectionAsync(); setMovementType(t.key); if (t.key === "on") { const tmp = fromLocation; setFromLocation(toLocation || ""); setToLocation(tmp || currentFarm?.name || ""); } }}
              style={[styles.typeCard, movementType === t.key && styles.typeCardSelected]}
            >
              <Feather name={t.icon as "repeat"} size={18} color={movementType === t.key ? "#db2777" : colors.textSecondary} />
              <Text style={[styles.typeLabel, movementType === t.key && styles.typeLabelSelected]}>{t.label}</Text>
            </Pressable>
          ))}

          <View style={styles.sectionLabel}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Movement Details</Text>
          </View>
          <Input label="Movement Date *" placeholder="YYYY-MM-DD" maxDate="today" value={movementDate} onChangeText={setMovementDate} required />
          <Input label="Number of Animals *" placeholder="e.g. 50" value={numberOfAnimals} onChangeText={setNumberOfAnimals} keyboardType="number-pad" required />

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Locations</Text>
          </View>
          <View style={styles.row}>
            <Input label="From Location" placeholder="Holding / address" value={fromLocation} onChangeText={setFromLocation} containerStyle={styles.flex} />
            <Input label="From CPH" placeholder="00/000/0000" value={fromCph} onChangeText={setFromCph} containerStyle={styles.flex} />
          </View>
          <View style={styles.row}>
            <Input label="To Location *" placeholder="Holding / abattoir" value={toLocation} onChangeText={setToLocation} containerStyle={styles.flex} required />
            <Input label="To CPH" placeholder="00/000/0000" value={toCph} onChangeText={setToCph} containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="file-text" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>EAML2 &amp; Transport</Text>
          </View>
          <Input label="EAML2 Reference" placeholder="e.g. EAML2/2024/12345" value={eaml2Reference} onChangeText={setEaml2Reference} />
          <Input label="Transporter / Haulier Name" placeholder="e.g. Smith Livestock Transport" value={transporterName} onChangeText={setTransporterName} />
          <Input label="Vehicle Registration" placeholder="e.g. AB12 CDE" value={vehicleRegistration} onChangeText={setVehicleRegistration} />

          <View style={styles.sectionLabel}>
            <Feather name="shield" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Biosecurity Declaration</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="check-circle" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Cleansing & disinfection declaration</Text>
                <Text style={styles.toggleSub}>Vehicle cleaned and disinfected before movement</Text>
              </View>
            </View>
            <Switch value={cleaningDeclaration} onValueChange={(v) => { Haptics.selectionAsync(); setCleaningDeclaration(v); }} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={cleaningDeclaration ? colors.primary : colors.textTertiary} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Breed, purpose of movement, any other remarks…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Button title="Save Movement Record" onPress={handleSave} loading={saving} fullWidth icon="check" />
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
  typeCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.sm },
  typeCardSelected: { borderColor: "#db2777", backgroundColor: "#fff1f8" },
  typeLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  typeLabelSelected: { color: "#db2777", fontFamily: fonts.semiBold },
  toggleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleInfo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, flex: 1 },
  toggleTextBlock: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  toggleSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  identifierBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
