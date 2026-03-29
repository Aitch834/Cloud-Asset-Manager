import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { AccidentReport } from "@/lib/types";

type IncidentType = AccidentReport["incidentType"];
type SeverityLevel = AccidentReport["severityLevel"];

const INCIDENT_TYPES: { key: IncidentType; label: string; color: string; icon: "alert-triangle" | "alert-circle" | "zap" | "thermometer" }[] = [
  { key: "accident", label: "Accident", color: colors.error, icon: "alert-triangle" },
  { key: "near_miss", label: "Near Miss", color: colors.accent, icon: "alert-circle" },
  { key: "dangerous_occurrence", label: "Dangerous Occurrence", color: "#7C3AED", icon: "zap" },
  { key: "occupational_disease", label: "Occupational Disease", color: "#0284c7", icon: "thermometer" },
];

const SEVERITY_LEVELS: { key: SeverityLevel; label: string; sublabel: string; color: string }[] = [
  { key: "minor", label: "Minor", sublabel: "No lost time, first aid only", color: colors.success },
  { key: "over_3_day", label: "Over 3-Day", sublabel: "More than 3 days off work (RIDDOR)", color: colors.accent },
  { key: "major", label: "Major Injury", sublabel: "Fracture, amputation, etc. (RIDDOR)", color: colors.error },
  { key: "fatal", label: "Fatal", sublabel: "Fatality (RIDDOR)", color: "#7C3AED" },
];

const BODY_PARTS = [
  "Head", "Eye(s)", "Neck", "Shoulder", "Arm / Elbow", "Wrist / Hand",
  "Finger(s)", "Chest / Ribs", "Back / Spine", "Abdomen", "Hip / Pelvis",
  "Leg / Knee", "Ankle / Foot", "Toe(s)", "Multiple", "None (near miss)",
];

export default function AccidentReportScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [incidentType, setIncidentType] = useState<IncidentType>("accident");
  const [severityLevel, setSeverityLevel] = useState<SeverityLevel>("minor");
  const [locationDescription, setLocationDescription] = useState("");
  const [descriptionOfIncident, setDescriptionOfIncident] = useState("");
  const [injuredPersonName, setInjuredPersonName] = useState("");
  const [bodyPartInjured, setBodyPartInjured] = useState("");
  const [natureOfInjury, setNatureOfInjury] = useState("");
  const [firstAidGiven, setFirstAidGiven] = useState(false);
  const [firstAidDetails, setFirstAidDetails] = useState("");
  const [witnessNames, setWitnessNames] = useState("");
  const [reportableRiddor, setReportableRiddor] = useState(false);
  const [immediateActionsTaken, setImmediateActionsTaken] = useState("");
  const [reportedBy, setReportedBy] = useState(user?.name || "");
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const isRiddorSeverity = severityLevel === "over_3_day" || severityLevel === "major" || severityLevel === "fatal";

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to photograph the incident scene.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUris((p) => [...p, result.assets[0].uri]);
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      setPhotoUris((p) => [...p, ...result.assets.map((a) => a.uri)]);
    }
  };

  const handleSave = async () => {
    if (!locationDescription.trim()) {
      Alert.alert("Required", "Please enter where the incident occurred.");
      return;
    }
    if (!descriptionOfIncident.trim()) {
      Alert.alert("Required", "Please describe what happened.");
      return;
    }
    if (!reportedBy.trim()) {
      Alert.alert("Required", "Please enter who is reporting this incident.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: AccidentReport = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      incidentType,
      severityLevel,
      incidentDate: new Date().toISOString(),
      locationDescription: locationDescription.trim(),
      descriptionOfIncident: descriptionOfIncident.trim(),
      injuredPersonName: injuredPersonName.trim(),
      bodyPartInjured,
      natureOfInjury: natureOfInjury.trim(),
      firstAidGiven,
      firstAidDetails: firstAidDetails.trim(),
      witnessNames: witnessNames.trim(),
      reportableRiddor: reportableRiddor || isRiddorSeverity,
      immediateActionsTaken: immediateActionsTaken.trim(),
      reportedBy: reportedBy.trim(),
      photoUris,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ACCIDENT_REPORTS, record);
    await refreshPendingCount();
    setSaving(false);

    const riddorWarning = (reportableRiddor || isRiddorSeverity)
      ? "\n\nThis incident may be RIDDOR-reportable. Please notify the responsible person to report to the HSE within the required timescale."
      : "";

    Alert.alert("Saved", `Accident / incident report saved.${riddorWarning}`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Accident / Incident Report</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.urgencyBanner}>
            <Feather name="alert-triangle" size={16} color={colors.error} />
            <Text style={styles.urgencyText}>
              Ensure casualties receive immediate first aid or medical attention before completing this form.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="tag" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Incident Type <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.typeGrid}>
            {INCIDENT_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => { Haptics.selectionAsync(); setIncidentType(t.key); }}
                style={[
                  styles.typeCard,
                  incidentType === t.key && { borderColor: t.color, backgroundColor: t.color + "15" },
                ]}
              >
                <Feather name={t.icon} size={18} color={incidentType === t.key ? t.color : colors.textSecondary} />
                <Text style={[styles.typeLabel, incidentType === t.key && { color: t.color }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Severity</Text>
          </View>
          {SEVERITY_LEVELS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => {
                Haptics.selectionAsync();
                setSeverityLevel(s.key);
                if (s.key === "over_3_day" || s.key === "major" || s.key === "fatal") {
                  setReportableRiddor(true);
                }
              }}
              style={[
                styles.severityRow,
                severityLevel === s.key && { borderColor: s.color, backgroundColor: s.color + "12" },
              ]}
            >
              <View style={[styles.severityDot, { backgroundColor: severityLevel === s.key ? s.color : colors.border }]} />
              <View style={styles.severityText}>
                <Text style={[styles.severityLabel, severityLevel === s.key && { color: s.color }]}>{s.label}</Text>
                <Text style={styles.severitySub}>{s.sublabel}</Text>
              </View>
            </Pressable>
          ))}

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Location & Description <Text style={styles.required}>*</Text></Text>
          </View>
          <Input
            label="Where did the incident occur?"
            placeholder="e.g. Grain store entrance, field H4, dairy parlour pit"
            value={locationDescription}
            onChangeText={setLocationDescription}
          />
          <Input
            label="What happened? (full description)"
            placeholder="Describe the sequence of events leading to the incident in as much detail as possible..."
            value={descriptionOfIncident}
            onChangeText={setDescriptionOfIncident}
            multiline
            numberOfLines={5}
          />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Injured Person</Text>
          </View>
          <Input
            label="Injured Person's Name (if applicable)"
            placeholder="Full name or 'None — near miss'"
            value={injuredPersonName}
            onChangeText={setInjuredPersonName}
          />
          <View style={styles.bodyPartGrid}>
            {BODY_PARTS.map((bp) => (
              <Pressable
                key={bp}
                onPress={() => { Haptics.selectionAsync(); setBodyPartInjured(bodyPartInjured === bp ? "" : bp); }}
                style={[
                  styles.bodyChip,
                  bodyPartInjured === bp && { backgroundColor: colors.error + "18", borderColor: colors.error },
                ]}
              >
                <Text style={[styles.bodyChipText, bodyPartInjured === bp && { color: colors.error }]}>{bp}</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Nature of Injury"
            placeholder="e.g. Laceration, bruising, fracture, sprain, crush injury"
            value={natureOfInjury}
            onChangeText={setNatureOfInjury}
          />

          <View style={styles.sectionLabel}>
            <Feather name="heart" size={14} color="#0284c7" />
            <Text style={styles.sectionTitle}>First Aid</Text>
          </View>
          <Pressable
            style={styles.toggleRow}
            onPress={() => { Haptics.selectionAsync(); setFirstAidGiven((v) => !v); }}
          >
            <Text style={styles.toggleLabel}>First aid was given</Text>
            <Switch
              value={firstAidGiven}
              onValueChange={(v) => { Haptics.selectionAsync(); setFirstAidGiven(v); }}
              trackColor={{ false: colors.borderLight, true: "#0284c7" }}
              thumbColor={colors.surface}
            />
          </Pressable>
          {firstAidGiven && (
            <Input
              label="First Aid Details"
              placeholder="e.g. Wound cleaned and dressed, called 999, casualty kept still pending ambulance"
              value={firstAidDetails}
              onChangeText={setFirstAidDetails}
              multiline
              numberOfLines={2}
            />
          )}

          <View style={styles.sectionLabel}>
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Photo Evidence</Text>
          </View>
          <Text style={styles.photoHint}>
            Photograph the incident scene, hazard, equipment involved, or any injuries (with the person's consent).
          </Text>
          {photoUris.length > 0 && (
            <View style={styles.photoGrid}>
              {photoUris.map((uri, i) => (
                <View key={uri} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                  <Pressable style={styles.removePhoto} onPress={() => setPhotoUris((p) => p.filter((_, j) => j !== i))}>
                    <Feather name="x" size={12} color={colors.textInverse} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={styles.photoRow}>
            <Pressable style={styles.photoBtn} onPress={handleTakePhoto}>
              <Feather name="camera" size={14} color={colors.text} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={handleChoosePhoto}>
              <Feather name="image" size={14} color={colors.text} />
              <Text style={styles.photoBtnText}>Choose from Library</Text>
            </Pressable>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Witnesses & Actions</Text>
          </View>
          <Input
            label="Witness Names"
            placeholder="Names of anyone who witnessed the incident"
            value={witnessNames}
            onChangeText={setWitnessNames}
          />
          <Input
            label="Immediate Actions Taken"
            placeholder="e.g. Area cordoned off, machinery isolated, management notified, ambulance called"
            value={immediateActionsTaken}
            onChangeText={setImmediateActionsTaken}
            multiline
            numberOfLines={2}
          />

          <View style={styles.sectionLabel}>
            <Feather name="file-text" size={14} color="#7C3AED" />
            <Text style={styles.sectionTitle}>RIDDOR</Text>
          </View>
          <Pressable
            style={[styles.toggleRow, isRiddorSeverity && { borderColor: "#7C3AED", backgroundColor: "#7C3AED12" }]}
            onPress={() => { if (!isRiddorSeverity) { Haptics.selectionAsync(); setReportableRiddor((v) => !v); } }}
          >
            <View style={styles.riddorLeft}>
              <Text style={[styles.toggleLabel, isRiddorSeverity && { color: "#7C3AED" }]}>Reportable under RIDDOR</Text>
              <Text style={styles.riddorSub}>
                {isRiddorSeverity
                  ? "Auto-flagged due to injury severity — report to HSE within required timescale"
                  : "Tick if this incident must be reported to the HSE"}
              </Text>
            </View>
            <Switch
              value={reportableRiddor || isRiddorSeverity}
              onValueChange={(v) => { if (!isRiddorSeverity) { Haptics.selectionAsync(); setReportableRiddor(v); } }}
              trackColor={{ false: colors.borderLight, true: "#7C3AED" }}
              thumbColor={colors.surface}
              disabled={isRiddorSeverity}
            />
          </Pressable>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Reported By <Text style={styles.required}>*</Text></Text>
          </View>
          <Input
            label="Your Name"
            value={reportedBy}
            onChangeText={setReportedBy}
            placeholder="Name of person completing this form"
          />

          <Button
            title="Save Accident Report"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  urgencyBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
    backgroundColor: "#FFF5F5",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FED7D7",
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  urgencyText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.error,
    lineHeight: 18,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  required: { color: colors.error },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  severityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  severityDot: { width: 12, height: 12, borderRadius: 6 },
  severityText: { flex: 1 },
  severityLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  severitySub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  bodyPartGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  bodyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bodyChipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  toggleLabel: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  riddorLeft: { flex: 1 },
  riddorSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  photoHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoThumb: { width: 72, height: 72, borderRadius: radius.md, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },
  removePhoto: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  photoRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  photoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photoBtnText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
});
