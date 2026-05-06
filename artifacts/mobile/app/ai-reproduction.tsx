import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
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
import { HerdPicker } from "@/components/ui/HerdPicker";
import { SirePicker } from "@/components/ui/SirePicker";
import { StrawPicker } from "@/components/ui/StrawPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { useApiSires, type ApiSire } from "@/lib/hooks/useApiSires";
import { useApiStraws, type ApiStraw } from "@/lib/hooks/useApiStraws";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { AiReproductionRecord } from "@/lib/types";

type Method = AiReproductionRecord["method"];
type PregMethod = AiReproductionRecord["pregnancyCheckMethod"];
type Result = AiReproductionRecord["result"];

const METHODS: { key: Method; label: string }[] = [
  { key: "AI", label: "Artificial Insemination (AI)" },
  { key: "synchronised_AI", label: "Synchronised AI" },
  { key: "natural_service", label: "Natural Service" },
  { key: "ET", label: "Embryo Transfer (ET)" },
];

const PREG_METHODS: { key: PregMethod; label: string }[] = [
  { key: "visual", label: "Visual Observation" },
  { key: "rectal_palpation", label: "Rectal Palpation" },
  { key: "ultrasound", label: "Ultrasound Scanning" },
  { key: "blood_test", label: "Blood / Milk Test" },
];

const RESULTS: { key: Result; label: string; color: string }[] = [
  { key: "confirmed_in_calf", label: "Confirmed In-Calf", color: colors.success },
  { key: "not_in_calf", label: "Not In-Calf", color: colors.error },
  { key: "repeat_service", label: "Repeat Service Required", color: colors.accent },
  { key: "pending", label: "Pending Check", color: colors.textSecondary },
];

function calcExpectedCalving(serviceDate: string): string {
  if (!serviceDate) return "";
  const d = new Date(serviceDate);
  d.setDate(d.getDate() + 283);
  return d.toISOString().split("T")[0];
}

export default function AiReproductionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const farmIdStr = currentFarm?.id ? String(currentFarm.id) : undefined;
  const { herds, loading: herdsLoading, fromCache: herdsCached, error: herdsError } = useApiHerds(farmIdStr);
  const { sires, loading: siresLoading, fromCache: siresCached, error: siresError } = useApiSires(farmIdStr);
  const { inStockStraws, loading: strawsLoading, fromCache: strawsCached, error: strawsError } = useApiStraws(farmIdStr);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [herdName, setHerdName] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [serviceDate, setServiceDate] = useState(today);
  const [method, setMethod] = useState<Method>("AI");
  const [sireName, setSireName] = useState("");
  const [sireBreed, setSireBreed] = useState("");
  const [sireSource, setSireSource] = useState("");
  const [strawBatch, setStrawBatch] = useState("");
  const [strawInventoryId, setStrawInventoryId] = useState<number | null>(null);
  const [technicianName, setTechnicianName] = useState(user?.name || "");
  const [expectedCalvingDate, setExpectedCalvingDate] = useState(calcExpectedCalving(today));
  const [pregnancyConfirmed, setPregnancyConfirmed] = useState(false);
  const [pregnancyCheckDate, setPregnancyCheckDate] = useState("");
  const [pregnancyCheckMethod, setPregnancyCheckMethod] = useState<PregMethod>("ultrasound");
  const [result, setResult] = useState<Result>("pending");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const handleServiceDateChange = (val: string) => {
    setServiceDate(val);
    setExpectedCalvingDate(calcExpectedCalving(val));
  };

  const handleSireChange = (sire: ApiSire) => {
    if (!sire) {
      setSireName("");
      setSireBreed("");
      setSireSource("");
      return;
    }
    setSireName(sire.name);
    setSireBreed(sire.breed ?? "");
    setSireSource(sire.supplierName ?? sire.ownershipType === "owned" ? "Own Farm" : "");
  };

  const handleStrawChange = (straw: ApiStraw) => {
    if (!straw) {
      setStrawInventoryId(null);
      setStrawBatch("");
      setSireName("");
      setSireBreed("");
      return;
    }
    setStrawInventoryId(straw.id);
    setStrawBatch(straw.batchNumber);
    setSireName(straw.sireName);
    setSireBreed(straw.sireBreed ?? "");
    if (straw.supplierName) setSireSource(straw.supplierName);
  };

  const handleSave = async () => {
    if (!herdName.trim() || !animalId.trim()) {
      Alert.alert("Required Fields", "Please enter the herd/flock and animal ID.");
      return;
    }
    if (!serviceDate) {
      Alert.alert("Required Fields", "Please enter the service date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
      }
    } catch {}

    const record: AiReproductionRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      animalId: animalId.trim(),
      serviceDate,
      method,
      sireId: sireName.trim(),
      sireBreed: sireBreed.trim(),
      sireSource: sireSource.trim(),
      strawnBatchNumber: strawBatch.trim(),
      technicianName: technicianName.trim(),
      expectedCalvingDate,
      pregnancyConfirmed,
      pregnancyCheckDate: pregnancyCheckDate.trim(),
      pregnancyCheckMethod,
      result,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.AI_REPRODUCTION_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "AI/Reproduction record saved offline and queued for sync.", [
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
            <Text style={styles.title}>AI & Reproduction Record</Text>
            <Text style={styles.subtitle}>Service, pregnancy check and result</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {(herdsCached || siresCached) && (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color={colors.accent} />
              <Text style={styles.offlineText}>Offline — using cached data</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Animal Details</Text>
          <HerdPicker herds={herds} loading={herdsLoading} fromCache={herdsCached} error={herdsError} value={herdName} onChange={setHerdName} />
          <Input label="Animal Tag / Ear Number *" value={animalId} onChangeText={setAnimalId} placeholder="e.g. UK123456 00001" />

          <Text style={styles.sectionTitle}>Service Details</Text>
          <Input label="Service Date *" value={serviceDate} onChangeText={handleServiceDateChange} placeholder="YYYY-MM-DD" maxDate="today" />

          <Text style={styles.label}>Service Method *</Text>
          <View style={styles.chipRow}>
            {METHODS.map((m) => (
              <Pressable key={m.key} onPress={() => setMethod(m.key)} style={[styles.chip, method === m.key && styles.chipActive]}>
                <Text style={[styles.chipText, method === m.key && styles.chipTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Sire / Bull / Ram</Text>
          <SirePicker
            sires={sires}
            loading={siresLoading}
            fromCache={siresCached}
            error={siresError}
            value={sireName}
            onChange={setSireName}
            onChangeSire={handleSireChange}
          />
          {sires.length === 0 && !siresLoading && (
            <Pressable onPress={() => router.push("/sire-register")} style={styles.registerLink}>
              <Feather name="plus-circle" size={14} color={colors.primary} />
              <Text style={styles.registerLinkText}>Add to sire register</Text>
            </Pressable>
          )}
          <Input label="Sire Name" value={sireName} onChangeText={setSireName} placeholder="Auto-filled from register, or type manually" />
          <Input label="Sire Breed" value={sireBreed} onChangeText={setSireBreed} placeholder="e.g. Holstein, Hereford" />
          <Input label="Sire Source (Stud / Farm Name)" value={sireSource} onChangeText={setSireSource} placeholder="e.g. Cogent UK, Own Farm" />
          {(method === "AI" || method === "synchronised_AI" || method === "ET") && (
            <>
              <StrawPicker
                straws={inStockStraws}
                loading={strawsLoading}
                fromCache={strawsCached}
                error={strawsError}
                value={strawBatch}
                onChange={setStrawBatch}
                onChangeStraw={handleStrawChange}
                label="Straw Inventory — Pick Batch"
              />
              {inStockStraws.length === 0 && !strawsLoading && (
                <Pressable onPress={() => router.push("/straw-inventory")} style={styles.registerLink}>
                  <Feather name="plus-circle" size={14} color={colors.primary} />
                  <Text style={styles.registerLinkText}>Log a straw delivery</Text>
                </Pressable>
              )}
              <Input label="Straw / Batch Number" value={strawBatch} onChangeText={setStrawBatch} placeholder="Auto-filled from inventory, or enter manually" />
            </>
          )}
          <Input label="Technician / Inseminator" value={technicianName} onChangeText={setTechnicianName} placeholder="Name" />
          <Input label="Expected Calving Date (auto-calculated)" value={expectedCalvingDate} onChangeText={setExpectedCalvingDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.sectionTitle}>Pregnancy Check</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Pregnancy Confirmed</Text>
              <Text style={styles.switchSub}>Toggle on once pregnancy has been checked</Text>
            </View>
            <Switch
              value={pregnancyConfirmed}
              onValueChange={setPregnancyConfirmed}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {pregnancyConfirmed && (
            <>
              <Input label="Pregnancy Check Date" maxDate="today" value={pregnancyCheckDate} onChangeText={setPregnancyCheckDate} placeholder="YYYY-MM-DD" />
              <Text style={styles.label}>Check Method</Text>
              <View style={styles.chipRow}>
                {PREG_METHODS.map((m) => (
                  <Pressable key={m.key} onPress={() => setPregnancyCheckMethod(m.key)} style={[styles.chip, pregnancyCheckMethod === m.key && styles.chipActive]}>
                    <Text style={[styles.chipText, pregnancyCheckMethod === m.key && styles.chipTextActive]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.label}>Result</Text>
              <View style={styles.chipRow}>
                {RESULTS.map((r) => (
                  <Pressable key={r.key} onPress={() => setResult(r.key)} style={[styles.chip, result === r.key && { borderColor: r.color, backgroundColor: r.color + "20" }]}>
                    <Text style={[styles.chipText, result === r.key && { color: r.color, fontFamily: fonts.semiBold }]}>{r.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional observations…" multiline numberOfLines={3} />

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
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.warningBg, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm },
  offlineText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.accent },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  registerLink: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: -spacing.sm, marginBottom: spacing.sm },
  registerLinkText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  saveButton: { marginTop: spacing.lg },
});
