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
  Switch,
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
import { useApiSheepFlocks } from "@/lib/hooks/useApiSheepFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const CERTIFIERS = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Biodynamic Association (BDOCA)", "Other"];
const STATUSES = ["In Conversion", "Conversion Complete — Awaiting Cert", "Fully Certified", "Suspended", "Withdrawn"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.borderLight, true: "#15803d" }} thumbColor="#fff" />
    </View>
  );
}

export default function OrganicSheepFlockConversionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache: flocksCached, error: flocksError } = useApiSheepFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockGroup, setFlockGroup] = useState("");
  const [flockName, setFlockName] = useState("");
  const [breed, setBreed] = useState("");
  const [numberOfEwes, setNumberOfEwes] = useState("");
  const [conversionStartDate, setConversionStartDate] = useState(todayDate());
  const [expectedMilkCertDate, setExpectedMilkCertDate] = useState("");
  const [certifier, setCertifier] = useState("");
  const [certificationRef, setCertificationRef] = useState("");
  const [status, setStatus] = useState("In Conversion");
  const [parallelProduction, setParallelProduction] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!flockName.trim()) {
      Alert.alert("Flock name required", "Please enter the flock name.");
      return;
    }
    if (!conversionStartDate.trim()) {
      Alert.alert("Conversion start date required", "Please enter the date conversion started.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-sheep-flock-conversion",
        flockGroup: flockGroup || null,
        flockName,
        breed: breed || null,
        numberOfEwes: numberOfEwes ? Number(numberOfEwes) : null,
        conversionStartDate,
        expectedMilkCertDate: expectedMilkCertDate || null,
        certifier: certifier || null,
        certificationRef: certificationRef || null,
        status,
        parallelProduction,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-sheep-dairy/flock-conversion`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Conversion record saved",
        `Flock "${flockName}" conversion record saved. Will sync when connected.`,
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
        <Text style={styles.headerTitle}>Sheep Flock Conversion</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hint}>
          <Feather name="info" size={14} color="#1d4ed8" />
          <Text style={styles.hintText}>Organic conversion for sheep dairy milk requires a minimum 6-month conversion period before milk can be sold as organic</Text>
        </View>

        <Text style={styles.sectionTitle}>Flock Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Flock Name *</Text>
          <Input value={flockName} onChangeText={setFlockName} placeholder="e.g. Home flock — Friesland ewes" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Flock Group / Lot</Text>
          <SmallRuminantPicker species="sheep" label="Flock Group / Lot" value={flockGroup} onChange={setFlockGroup} flocks={flocks} loading={flocksLoading} fromCache={flocksCached} error={flocksError} />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Breed</Text>
            <Input value={breed} onChangeText={setBreed} placeholder="e.g. Friesland" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number of Ewes</Text>
            <Input value={numberOfEwes} onChangeText={setNumberOfEwes} placeholder="e.g. 120" keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Conversion Dates</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Conversion Start *</Text>
            <Input value={conversionStartDate} onChangeText={setConversionStartDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Expected Cert Date</Text>
            <Input value={expectedMilkCertDate} onChangeText={setExpectedMilkCertDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Certifier</Text>
        <View style={styles.chips}>
          {CERTIFIERS.map(c => (
            <Chip key={c} label={c} selected={certifier === c} onPress={() => setCertifier(c === certifier ? "" : c)} />
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Certification Reference</Text>
          <Input value={certificationRef} onChangeText={setCertificationRef} placeholder="e.g. SA/G/12345" autoCapitalize="characters" />
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map(s => (
            <Chip key={s} label={s} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Parallel Production</Text>
        <ToggleRow
          label="Parallel production permitted by certifier"
          value={parallelProduction}
          onChange={setParallelProduction}
        />

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

        <Button title={saving ? "Saving…" : "Save Conversion Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  hint: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, backgroundColor: "#dbeafe", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  hintText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#1e40af", flex: 1 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.xs },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1, paddingRight: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
