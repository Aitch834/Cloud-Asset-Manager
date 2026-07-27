import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Image,
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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { FieldPicker } from "@/components/ui/FieldPicker";
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { kvGet } from "@/lib/database";
import type { FieldInspection } from "@/lib/types";

type ActionRequired = FieldInspection["actionRequired"];

const ACTIONS: { key: ActionRequired; label: string; color: string }[] = [
  { key: "none", label: "No Action", color: colors.success },
  { key: "monitor", label: "Monitor", color: colors.accent },
  { key: "treat", label: "Treatment Recommended", color: colors.error },
  { key: "urgent", label: "Urgent Action", color: "#7C3AED" },
];

// ── UK standardised crop types ────────────────────────────────────────────────
const UK_CROP_TYPES = [
  { label: "Winter Wheat", group: "Cereals" },
  { label: "Spring Wheat", group: "Cereals" },
  { label: "Winter Barley", group: "Cereals" },
  { label: "Spring Barley", group: "Cereals" },
  { label: "Winter Oats", group: "Cereals" },
  { label: "Spring Oats", group: "Cereals" },
  { label: "Winter Rye", group: "Cereals" },
  { label: "Triticale", group: "Cereals" },
  { label: "Winter OSR", group: "Oilseeds" },
  { label: "Spring OSR", group: "Oilseeds" },
  { label: "Linseed", group: "Oilseeds" },
  { label: "Field Beans", group: "Pulses" },
  { label: "Spring Beans", group: "Pulses" },
  { label: "Peas", group: "Pulses" },
  { label: "Sugar Beet", group: "Roots" },
  { label: "Fodder Beet", group: "Roots" },
  { label: "Potatoes", group: "Roots" },
  { label: "Maize", group: "Other" },
  { label: "Grass / Herbage", group: "Other" },
  { label: "Cover Crop", group: "Other" },
  { label: "Fallow / Bare", group: "Other" },
  { label: "Other", group: "Other" },
];

type CropGroup = "cereal" | "osr" | "sugarbeet" | "potatoes" | "beans" | "peas" | "maize" | "grass" | "generic";

function getCropGroup(c: string): CropGroup {
  const l = c.toLowerCase();
  if (/wheat|barley|oat|rye|triticale/.test(l)) return "cereal";
  if (/osr|rapeseed/.test(l)) return "osr";
  if (/sugar beet/.test(l)) return "sugarbeet";
  if (/potato/.test(l)) return "potatoes";
  if (/bean/.test(l)) return "beans";
  if (/pea/.test(l)) return "peas";
  if (/maize|corn/.test(l)) return "maize";
  if (/grass|herbage/.test(l)) return "grass";
  return "generic";
}

const GROWTH_STAGES_BY_GROUP: Record<CropGroup, string[]> = {
  cereal: [
    "Pre-emergence", "GS10–19 (Seedling)", "GS20–29 (Tillering)",
    "GS30 (Stem extension)", "GS31 (1st node)", "GS32 (2nd node)",
    "GS37–39 (Flag leaf)", "GS41–49 (Booting)", "GS51–59 (Ear emergence)",
    "GS61–69 (Anthesis)", "GS71–79 (Grain fill)", "GS80–89 (Ripening)", "Harvest ripe",
  ],
  osr: [
    "Pre-emergence", "Cotyledon stage", "1–3 true leaves", "Rosette (Autumn)",
    "Over-wintered rosette", "Stem extension", "Green bud", "Yellow bud",
    "Full flower", "Pod fill", "Ripening", "Harvest ripe",
  ],
  sugarbeet: [
    "Pre-emergence", "Cotyledon stage", "2 true leaves", "4 true leaves",
    "6 leaves", "8 leaves", "Canopy closure", "Mid-season", "Mature / Harvest",
  ],
  potatoes: [
    "Pre-emergence", "Emergence", "Early vegetative", "Canopy development",
    "Canopy closure", "Flowering", "Tuber bulking", "Senescence", "Harvest ready",
  ],
  beans: [
    "Pre-emergence", "Germination", "Seedling (VC)", "2 true leaves",
    "Vegetative growth", "Flowering (R1)", "Pod set (R3)", "Pod fill (R5)", "Harvest ripe",
  ],
  peas: [
    "Pre-emergence", "Germination", "Seedling (1st node)", "2–4 nodes",
    "Tendrils", "Flowering", "Pod set", "Pod fill", "Harvest ripe",
  ],
  maize: [
    "Pre-emergence", "VE (Emergence)", "V2–V3", "V4–V6", "V8–V10",
    "V12 (Knee high)", "VT (Tasselling)", "R1 (Silking)",
    "R2–R3 (Grain fill)", "R4–R5 (Dough / Dent)", "R6 (Maturity)", "Harvest ripe",
  ],
  grass: [
    "Pre-growth / Dormant", "Early growth", "Vegetative", "Stem extension",
    "Heading", "Anthesis", "Post-cut recovery", "Post-grazing recovery",
  ],
  generic: [
    "Pre-emergence", "Germination", "Seedling", "Early vegetative",
    "Vegetative growth", "Flowering / Bolting", "Fruit / Seed / Tuber set", "Maturity", "Harvest ripe",
  ],
};

export default function FieldInspectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState("");
  const [cropAutoFilled, setCropAutoFilled] = useState(false);
  const [growthStage, setGrowthStage] = useState("");
  const [pestDiseaseObservations, setPestDiseaseObservations] = useState("");
  const [actionRequired, setActionRequired] = useState<ActionRequired>("none");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [inspector, setInspector] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  const [notes, setNotes] = useState("");
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  // Load staff members for inspector picker
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);

  // Auto-populate crop from field register when fieldName changes
  useEffect(() => {
    if (!fieldName || !currentFarm?.id) return;
    const farmId = currentFarm.id;
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;

    let cancelled = false;
    const today = new Date().toISOString().split("T")[0];

    (async () => {
      try {
        let token: string | null = null;
        let tenantSlug = "";

        if (Platform.OS !== "web") {
          try {
            const SecureStore = await import("expo-secure-store");
            token = await SecureStore.getItemAsync("auth_session_token");
          } catch {}
        } else {
          try { token = localStorage.getItem("auth_session_token"); } catch {}
        }
        if (!token) {
          try { const raw = await kvGet("bde_auth_token"); token = raw ? JSON.parse(raw) : null; } catch {}
        }
        try {
          const raw = await kvGet("bde_current_farm");
          if (raw) { const farm = JSON.parse(raw); tenantSlug = farm.tenantSlug || farm.slug || ""; }
        } catch {}

        const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": tenantSlug };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const params = new URLSearchParams({ fieldName, date: today });
        const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/crop-for-field?${params}`, { headers });
        if (!res.ok) return;
        const data = await res.json() as { found: boolean; cropName: string | null };
        if (!cancelled && data.found && data.cropName) {
          const matched = UK_CROP_TYPES.find(c => c.label.toLowerCase() === (data.cropName ?? "").toLowerCase())?.label ?? data.cropName;
          setCropType(matched ?? "");
          setGrowthStage("");
          setCropAutoFilled(true);
        }
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [fieldName, currentFarm?.id]);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take photos.");
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
    if (!fieldName.trim()) {
      Alert.alert("Required Fields", "Please select a field.");
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

    const record: FieldInspection = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      inspectionDate: new Date().toISOString(),
      cropType: cropType.trim(),
      growthStage,
      pestDiseaseObservations: pestDiseaseObservations.trim(),
      actionRequired,
      recommendedAction: recommendedAction.trim(),
      inspector: inspector.trim(),
      notes: notes.trim(),
      photoUris,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FIELD_INSPECTIONS, record);
    await refreshPendingCount();
    setSaving(false);
    if (actionRequired === "treat" || actionRequired === "urgent") {
      setTaskSheet({
        title: `Field Inspection Follow-up — ${fieldName.trim()}`,
        description: `Crop: ${cropType.trim() || "—"} · Action: ${actionRequired} · ${(recommendedAction.trim() || pestDiseaseObservations.trim()).slice(0, 120)}`,
      });
    } else {
      Alert.alert("Saved", "Field inspection saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Field Crop Inspection</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Field</Text>
          </View>
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color={colors.fieldGreen} />
            <Text style={styles.sectionTitle}>Crop & Growth Stage</Text>
          </View>
          <View style={styles.cropLabelRow}>
            <Text style={styles.fieldLabel}>Crop</Text>
            {cropAutoFilled && (
              <View style={styles.autoFillBadge}>
                <Feather name="zap" size={10} color="#16a34a" />
                <Text style={styles.autoFillText}>Auto-filled from field register · tap to change</Text>
              </View>
            )}
          </View>
          <View style={styles.stageGrid}>
            {UK_CROP_TYPES.map((c) => (
              <Pressable
                key={c.label}
                onPress={() => { Haptics.selectionAsync(); setCropType(c.label); setGrowthStage(""); setCropAutoFilled(false); }}
                style={[
                  styles.stageChip,
                  cropType === c.label && { backgroundColor: colors.fieldGreen, borderColor: colors.fieldGreen },
                ]}
              >
                <Text style={[styles.stageText, cropType === c.label && { color: colors.textInverse }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.fieldLabel, { marginTop: spacing.sm }]}>
            Growth Stage{cropType ? ` — ${cropType}` : " (select crop first)"}
          </Text>
          <View style={styles.stageGrid}>
            {(cropType ? GROWTH_STAGES_BY_GROUP[getCropGroup(cropType)] : []).map((gs) => (
              <Pressable
                key={gs}
                onPress={() => { Haptics.selectionAsync(); setGrowthStage(gs); }}
                style={[
                  styles.stageChip,
                  growthStage === gs && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.stageText, growthStage === gs && { color: colors.textInverse }]}>{gs}</Text>
              </Pressable>
            ))}
            {!cropType && (
              <Text style={styles.stageHint}>Select a crop above to see relevant growth stages</Text>
            )}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="search" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Observations</Text>
          </View>
          <Input
            label="Pest / Disease Observations"
            placeholder="e.g. Septoria on lower leaves (5-15%), aphid pressure moderate, slugs in headlands"
            value={pestDiseaseObservations}
            onChangeText={setPestDiseaseObservations}
            multiline
            numberOfLines={4}
          />

          <View style={styles.sectionLabel}>
            <Feather name="flag" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Action Required</Text>
          </View>
          <View style={styles.actionGrid}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => { Haptics.selectionAsync(); setActionRequired(a.key); }}
                style={[
                  styles.actionCard,
                  actionRequired === a.key && { borderColor: a.color, backgroundColor: a.color + "18" },
                ]}
              >
                <View style={[styles.actionDot, { backgroundColor: actionRequired === a.key ? a.color : colors.border }]} />
                <Text style={[styles.actionLabel, actionRequired === a.key && { color: a.color }]}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {actionRequired !== "none" && (
            <Input
              label="Recommended Action"
              placeholder="e.g. Apply T1 fungicide, target BBCH 31–32"
              value={recommendedAction}
              onChangeText={setRecommendedAction}
              multiline
              numberOfLines={2}
            />
          )}

          <View style={styles.sectionLabel}>
            <Feather name="camera" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Photo Evidence</Text>
          </View>
          <Text style={styles.photoHint}>
            Photograph crop damage, disease symptoms, pest pressure or any observations noted above.
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

          <LookupPicker
            label="Inspector"
            value={inspector}
            options={staffOptions}
            onSelect={(_id, label) => setInspector(label)}
            placeholder="Select or type name…"
            allowFreeText
            icon="user"
          />
          <Input
            label="Notes"
            placeholder="Any additional observations..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Inspection"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
      {taskSheet && (
        <RaiseTaskSheet
          visible={!!taskSheet}
          farmId={currentFarm?.id ?? ""}
          defaultTitle={taskSheet.title}
          defaultDescription={taskSheet.description}
          module="field-inspection"
          onRaised={() => { setTaskSheet(null); router.back(); }}
          onSkip={() => { setTaskSheet(null); router.back(); }}
        />
      )}
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
  stageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cropLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  autoFillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  autoFillText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: "#16a34a",
  },
  stageHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: "italic",
    paddingVertical: spacing.xs,
  },
  actionGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
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
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
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
  photoBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
