import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
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
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

type IncidentType = "disease-suspicion" | "notifiable-disease" | "welfare-concern" | "injury" | "environmental-incident";

const INCIDENT_TYPES: { key: IncidentType; label: string; icon: keyof typeof Feather.glyphMap; color: string; urgent?: boolean }[] = [
  { key: "notifiable-disease", label: "Notifiable Disease Suspicion", icon: "alert-triangle", color: "#dc2626", urgent: true },
  { key: "disease-suspicion", label: "Disease / Illness Suspicion", icon: "activity", color: "#f97316" },
  { key: "welfare-concern", label: "Welfare Concern", icon: "heart", color: "#8b5cf6" },
  { key: "injury", label: "Injury / Trauma", icon: "zap-off", color: "#0891b2" },
  { key: "environmental-incident", label: "Environmental Incident", icon: "cloud-rain", color: "#16a34a" },
];

const NOTIFIABLE_DISEASES = [
  "Foot & Mouth Disease (FMD)",
  "Bluetongue Virus",
  "Avian Influenza (Bird Flu)",
  "African Swine Fever (ASF)",
  "Classical Swine Fever",
  "Brucellosis",
  "Bovine Tuberculosis (bTB)",
  "Anthrax",
  "Sheep Pox / Goat Pox",
  "Swine Vesicular Disease",
  "Rabies",
  "Other notifiable disease",
];

const SPECIES_OPTIONS = ["Cattle", "Sheep", "Pigs", "Goats", "Deer", "Poultry", "Horses", "Mixed / Multiple", "Other"];

const ACTION_ITEMS = [
  { key: "vet-called", label: "Vet contacted" },
  { key: "apha-called", label: "APHA notified" },
  { key: "animals-isolated", label: "Affected animals isolated" },
  { key: "movement-restricted", label: "Farm movement restriction applied" },
  { key: "feed-withdrawn", label: "Suspect feed withdrawn" },
  { key: "staff-notified", label: "Staff notified" },
];

export default function DiseaseIncidentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  const [incidentType, setIncidentType] = useState<IncidentType>("disease-suspicion");
  const [notifiableDisease, setNotifiableDisease] = useState("");
  const [species, setSpecies] = useState("");
  const [animalCount, setAnimalCount] = useState("");
  const [herdGroup, setHerdGroup] = useState("");
  const [location, setLocation] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [vetName, setVetName] = useState("");
  const [aphaRef, setAphaRef] = useState("");
  const [actionsApplied, setActionsApplied] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const isNotifiable = incidentType === "notifiable-disease";
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  const toggleAction = (key: string) => {
    Haptics.selectionAsync();
    setActionsApplied(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    );
  };

  const callAPHA = () => {
    Linking.openURL("tel:03000200301");
  };

  const handleSave = async () => {
    if (!species || !symptoms.trim()) {
      Alert.alert("Required Fields", "Please select species and describe the symptoms or concern.");
      return;
    }

    setSaving(true);
    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "incident-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {}
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch {
      // GPS optional
    }

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      incidentType,
      notifiableDisease: isNotifiable ? notifiableDisease : "",
      species,
      animalCount: animalCount.trim(),
      herdGroup: herdGroup.trim(),
      incidentLocation: location.trim(),
      symptoms: symptoms.trim(),
      vetName: vetName.trim(),
      aphaRef: aphaRef.trim(),
      actionsApplied,
      additionalNotes: additionalNotes.trim(),
      latitude,
      longitude,
      incidentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.DISEASE_INCIDENTS, { ...record, documentUrl });
    await refreshPendingCount();
    setSaving(false);

    if (isNotifiable) {
      Alert.alert(
        "Incident Logged",
        "Notifiable disease incident recorded. Ensure APHA has been notified on 03000 200 301 and do not move animals off the farm.",
        [{
          text: "Raise Follow-up Task",
          onPress: () => setTaskSheet({
            title: `NOTIFIABLE DISEASE SUSPICION — ${notifiableDisease || species}`,
            description: `Species: ${species} · Animals: ${animalCount} · Location: ${location.trim() || "—"} · Symptoms: ${symptoms.trim().slice(0, 100)}`,
          }),
        },
        { text: "Done", onPress: () => router.back() }],
      );
    } else {
      setTaskSheet({
        title: `Disease Incident Follow-up — ${species}`,
        description: `Type: ${incidentType} · Symptoms: ${symptoms.trim().slice(0, 120)} · Vet: ${vetName.trim() || "—"}`,
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Disease & Incident Report</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Notifiable disease alert banner */}
          {isNotifiable && (
            <Pressable onPress={callAPHA} style={styles.notifiableBanner}>
              <View style={styles.notifiableLeft}>
                <Feather name="alert-triangle" size={20} color="#dc2626" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifiableTitle}>Call APHA immediately</Text>
                  <Text style={styles.notifiableBody}>
                    Do NOT wait for lab results. Legal requirement to notify APHA on suspicion — do not move animals off the farm.
                  </Text>
                </View>
              </View>
              <View style={styles.aphaCallButton}>
                <Feather name="phone" size={14} color="#fff" />
                <Text style={styles.aphaCallText}>03000 200 301</Text>
              </View>
            </Pressable>
          )}

          {/* Incident type */}
          <View style={styles.sectionLabel}>
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Incident Type</Text>
          </View>
          <View style={styles.typeGrid}>
            {INCIDENT_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => { Haptics.selectionAsync(); setIncidentType(t.key); }}
                style={[
                  styles.typeCard,
                  incidentType === t.key && { borderColor: t.color, backgroundColor: t.color + "12" },
                ]}
              >
                <View style={[styles.typeIcon, { backgroundColor: t.color + "18" }]}>
                  <Feather name={t.icon} size={16} color={t.color} />
                </View>
                <Text style={[styles.typeLabel, incidentType === t.key && { color: t.color, fontFamily: fonts.semiBold }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Notifiable disease picker */}
          {isNotifiable && (
            <>
              <View style={styles.sectionLabel}>
                <Feather name="list" size={14} color="#dc2626" />
                <Text style={[styles.sectionTitle, { color: "#dc2626" }]}>Suspected Notifiable Disease</Text>
              </View>
              <View style={styles.chipRow}>
                {NOTIFIABLE_DISEASES.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => { Haptics.selectionAsync(); setNotifiableDisease(d); }}
                    style={[
                      styles.chip,
                      notifiableDisease === d && { backgroundColor: "#dc2626", borderColor: "#dc2626" },
                    ]}
                  >
                    <Text style={[styles.chipText, notifiableDisease === d && { color: "#fff" }]}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Species */}
          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Species Affected</Text>
          </View>
          <View style={styles.chipRow}>
            {SPECIES_OPTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => { Haptics.selectionAsync(); setSpecies(s); }}
                style={[
                  styles.chip,
                  species === s && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.chipText, species === s && { color: "#fff" }]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          {/* Animal details */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Animals Affected (count)"
                placeholder="e.g. 3"
                value={animalCount}
                onChangeText={setAnimalCount}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Herd / Group / Pen"
                placeholder="e.g. Spring calves"
                value={herdGroup}
                onChangeText={setHerdGroup}
              />
            </View>
          </View>

          <Input
            label="Location on Farm"
            placeholder="e.g. Top shed, North field, Isolation pen"
            value={location}
            onChangeText={setLocation}
          />

          {/* Symptoms */}
          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color="#f97316" />
            <Text style={styles.sectionTitle}>Signs & Symptoms <Text style={styles.required}>*</Text></Text>
          </View>
          <Input
            label=""
            placeholder="Describe what you have observed — clinical signs, behaviour changes, mortality pattern, onset timeline…"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
          />

          {/* Actions applied */}
          <View style={styles.sectionLabel}>
            <Feather name="check-square" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Immediate Actions Taken</Text>
          </View>
          <View style={styles.actionGrid}>
            {ACTION_ITEMS.map((a) => {
              const on = actionsApplied.includes(a.key);
              return (
                <Pressable
                  key={a.key}
                  onPress={() => toggleAction(a.key)}
                  style={[styles.actionChip, on && styles.actionChipOn]}
                >
                  <Feather
                    name={on ? "check-square" : "square"}
                    size={14}
                    color={on ? colors.success : colors.textSecondary}
                  />
                  <Text style={[styles.actionChipText, on && styles.actionChipTextOn]}>{a.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Vet & APHA details */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Vet Contacted (name / practice)"
                placeholder="e.g. James Farrow, Minster Vets"
                value={vetName}
                onChangeText={setVetName}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="APHA Reference No."
                placeholder="e.g. APHA-2026-XXXXX"
                value={aphaRef}
                onChangeText={setAphaRef}
              />
            </View>
          </View>

          <Input
            label="Additional Notes"
            placeholder="Any other relevant detail — treatment given, feed lot numbers, other farms contacted…"
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={3}
          />

          {/* GPS note */}
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>GPS coordinates will be captured automatically and attached to the incident report.</Text>
          </View>

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Photo / Evidence"
            promptTitle="Attach Photo to Disease Incident Report"
          />

          <Button
            title={saving ? "Saving…" : "Log Incident"}
            onPress={handleSave}
            loading={saving}
            style={isNotifiable ? { ...styles.saveButton, backgroundColor: "#dc2626" } : styles.saveButton}
          />

          {taskSheet && (
            <RaiseTaskSheet
              visible={!!taskSheet}
              farmId={currentFarm?.id ?? ""}
              defaultTitle={taskSheet.title}
              defaultDescription={taskSheet.description}
              module="biosecurity"
              onRaised={() => { setTaskSheet(null); router.back(); }}
              onSkip={() => { setTaskSheet(null); router.back(); }}
            />
          )}

          {isNotifiable && (
            <Pressable onPress={callAPHA} style={styles.aphaFooter}>
              <Feather name="phone" size={16} color="#dc2626" />
              <Text style={styles.aphaFooterText}>Tap to call APHA: 03000 200 301</Text>
            </Pressable>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  form: { padding: spacing.lg, paddingBottom: spacing.xxl },

  notifiableBanner: {
    backgroundColor: "#fff1f2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  notifiableLeft: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  notifiableTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: "#dc2626",
    marginBottom: 2,
  },
  notifiableBody: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#b91c1c",
    lineHeight: 18,
  },
  aphaCallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#dc2626",
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  aphaCallText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: "#fff",
    letterSpacing: 0.5,
  },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  required: { color: colors.error },

  typeGrid: { gap: spacing.sm },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },

  row: { flexDirection: "row", gap: spacing.md },
  halfInput: { flex: 1 },

  actionGrid: { gap: spacing.xs, marginBottom: spacing.sm },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionChipOn: {
    borderColor: colors.success,
    backgroundColor: colors.successBg,
  },
  actionChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  actionChipTextOn: { color: colors.success },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  saveButton: { marginTop: spacing.md },

  aphaFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fca5a5",
    backgroundColor: "#fff1f2",
  },
  aphaFooterText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#dc2626",
  },
});
