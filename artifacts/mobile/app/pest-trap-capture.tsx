import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";

interface VineyardBlock {
  id: number;
  blockName: string;
  blockCode?: string | null;
}

interface AnalysisResult {
  swdMaleCount: number;
  swdFemaleCount: number;
  otherPests: { commonName: string; count: number; riskToGrapes: string }[];
  totalInsectCount: number;
  pestPressure: "none" | "low" | "medium" | "high";
  summary: string;
}

const TRAP_TYPES = [
  { value: "red-sticky", label: "Red Sticky Card" },
  { value: "yellow-sticky", label: "Yellow Sticky Card" },
  { value: "drowning-cup", label: "Drowning Cup" },
  { value: "delta", label: "Delta Trap" },
  { value: "mcphail", label: "McPhail Trap" },
  { value: "other", label: "Other" },
];

const PRESSURE_COLORS: Record<string, string> = {
  none: colors.success ?? "#22c55e",
  low: "#eab308",
  medium: "#f97316",
  high: "#ef4444",
};

export default function PestTrapCaptureScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();

  const [blocks, setBlocks] = useState<VineyardBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [trapRef, setTrapRef] = useState("");
  const [trapType, setTrapType] = useState("red-sticky");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [showTrapTypePicker, setShowTrapTypePicker] = useState(false);

  useEffect(() => {
    if (!currentFarm?.id) return;
    apiFetch(`/api/farms/${currentFarm.id}/vineyard-blocks`)
      .then((r) => r.json())
      .then((data: { blocks?: VineyardBlock[] }) => setBlocks(data.blocks ?? []))
      .catch(() => {});
  }, [currentFarm?.id]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: false, base64: true });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await captureGps();
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Library access is needed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: false, base64: true });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (!latitude) await captureGps();
    }
  };

  const captureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
      }
    } catch {
      // GPS optional — silently skip
    }
  };

  const handleSubmit = async () => {
    if (!currentFarm?.id) return;
    if (!photoUri) {
      Alert.alert("Photo Required", "Please take or select a photo of the trap.");
      return;
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = {
        captureDate: today,
        blockId: selectedBlockId,
        trapRef: trapRef.trim() || undefined,
        trapType,
        notes: notes.trim() || undefined,
        latitude,
        longitude,
        photoBase64: photoBase64 ?? undefined,
        photoFileName: `trap-${Date.now()}.jpg`,
      };

      const res = await apiFetch(`/api/farms/${currentFarm.id}/pest-trap-captures`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Server error ${res.status}`);
      }

      const data = await res.json() as { capture: { swdMaleCount?: number; swdFemaleCount?: number; otherPests?: AnalysisResult["otherPests"]; totalInsectCount?: number; pestPressure?: AnalysisResult["pestPressure"]; aiSummary?: string } };
      const cap = data.capture;

      setResult({
        swdMaleCount: cap.swdMaleCount ?? 0,
        swdFemaleCount: cap.swdFemaleCount ?? 0,
        otherPests: (cap.otherPests as AnalysisResult["otherPests"]) ?? [],
        totalInsectCount: cap.totalInsectCount ?? 0,
        pestPressure: cap.pestPressure ?? "none",
        summary: cap.aiSummary ?? "Analysis complete.",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: unknown) {
      Alert.alert("Submission Failed", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedTrapLabel = TRAP_TYPES.find((t) => t.value === trapType)?.label ?? trapType;

  if (result) {
    const pressureColor = PRESSURE_COLORS[result.pestPressure] ?? colors.text;
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
          <Text style={styles.title}>Analysis Result</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pressure badge */}
          <View style={[styles.pressureBadge, { backgroundColor: pressureColor + "22", borderColor: pressureColor }]}>
            <Feather name="alert-triangle" size={20} color={pressureColor} />
            <Text style={[styles.pressureLabel, { color: pressureColor }]}>
              {result.pestPressure.toUpperCase()} PEST PRESSURE
            </Text>
          </View>

          {/* SWD counts */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SWD Counts</Text>
            <View style={styles.row}>
              <View style={styles.countBox}>
                <Text style={styles.countNumber}>{result.swdMaleCount}</Text>
                <Text style={styles.countLabel}>Males</Text>
              </View>
              <View style={styles.countBox}>
                <Text style={styles.countNumber}>{result.swdFemaleCount}</Text>
                <Text style={styles.countLabel}>Females</Text>
              </View>
              <View style={styles.countBox}>
                <Text style={styles.countNumber}>{result.totalInsectCount}</Text>
                <Text style={styles.countLabel}>Total Insects</Text>
              </View>
            </View>
          </View>

          {/* Other pests */}
          {result.otherPests.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Other Flying Pests</Text>
              {result.otherPests.map((p, i) => (
                <View key={i} style={styles.pestRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pestName}>{p.commonName}</Text>
                    <Text style={styles.pestRisk}>Risk: {p.riskToGrapes}</Text>
                  </View>
                  <Text style={styles.pestCount}>{p.count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Summary</Text>
            <Text style={styles.summaryText}>{result.summary}</Text>
          </View>

          <Button title="Record Another Capture" icon="camera" onPress={() => {
            setResult(null);
            setPhotoUri(null);
            setPhotoBase64(null);
            setTrapRef("");
            setNotes("");
            setLatitude(null);
            setLongitude(null);
          }} fullWidth style={{ marginTop: spacing.md }} />

          <Button title="View Trap Map" icon="map" variant="outline" onPress={() => router.push("/pest-trap-map")} fullWidth style={{ marginTop: spacing.sm }} />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pest Trap Capture</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Photo */}
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
            {latitude && longitude && (
              <View style={styles.gpsBadge}>
                <Feather name="map-pin" size={12} color="#fff" />
                <Text style={styles.gpsText}>GPS captured</Text>
              </View>
            )}
            <Button title="Retake" icon="refresh-cw" variant="outline" size="sm"
              onPress={() => { setPhotoUri(null); setLatitude(null); setLongitude(null); }}
              style={styles.retakeButton} />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Feather name="camera" size={48} color={colors.primaryMuted ?? colors.border} />
            <Text style={styles.placeholderText}>No photo yet</Text>
            <Text style={styles.placeholderSub}>Take a clear photo of the trap card</Text>
          </View>
        )}

        <View style={styles.photoActions}>
          <Button title="Take Photo" icon="camera" onPress={takePhoto} fullWidth />
          <Button title="Choose from Library" icon="image" variant="outline" onPress={pickPhoto} fullWidth />
        </View>

        {/* Block picker */}
        <Text style={styles.fieldLabel}>Vineyard Block</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowBlockPicker(true)}>
          <Text style={selectedBlockId ? styles.pickerValue : styles.pickerPlaceholder}>
            {selectedBlock ? `${selectedBlock.blockName}${selectedBlock.blockCode ? ` (${selectedBlock.blockCode})` : ""}` : "Select block (optional)"}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Trap type */}
        <Text style={styles.fieldLabel}>Trap Type</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowTrapTypePicker(true)}>
          <Text style={styles.pickerValue}>{selectedTrapLabel}</Text>
          <Feather name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <Input label="Trap Reference" placeholder="e.g. T1, NW-Corner" value={trapRef} onChangeText={setTrapRef} />
        <Input label="Notes" placeholder="Any observations..." value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

        <Button
          title={saving ? "Analysing with AI…" : "Submit & Analyse"}
          icon={saving ? undefined : "cpu"}
          onPress={handleSubmit}
          loading={saving}
          disabled={!photoUri || saving}
          fullWidth
          style={{ marginTop: spacing.md }}
        />

        <View style={{ height: insets.bottom + spacing.xxxl }} />
      </ScrollView>

      {/* Block picker modal */}
      <Modal visible={showBlockPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Block</Text>
            <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedBlockId(null); setShowBlockPicker(false); }}>
              <Text style={styles.modalItemText}>No specific block</Text>
            </TouchableOpacity>
            {blocks.map((b) => (
              <TouchableOpacity key={b.id} style={styles.modalItem} onPress={() => { setSelectedBlockId(b.id); setShowBlockPicker(false); }}>
                <Text style={[styles.modalItemText, selectedBlockId === b.id && styles.modalItemSelected]}>
                  {b.blockName}{b.blockCode ? ` (${b.blockCode})` : ""}
                </Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" variant="ghost" onPress={() => setShowBlockPicker(false)} fullWidth />
          </View>
        </View>
      </Modal>

      {/* Trap type picker modal */}
      <Modal visible={showTrapTypePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Trap Type</Text>
            {TRAP_TYPES.map((t) => (
              <TouchableOpacity key={t.value} style={styles.modalItem} onPress={() => { setTrapType(t.value); setShowTrapTypePicker(false); }}>
                <Text style={[styles.modalItemText, trapType === t.value && styles.modalItemSelected]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" variant="ghost" onPress={() => setShowTrapTypePicker(false)} fullWidth />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  photoContainer: { borderRadius: radius.lg, overflow: "hidden", marginBottom: spacing.lg, position: "relative" },
  photo: { width: "100%", height: 280, borderRadius: radius.lg },
  gpsBadge: {
    position: "absolute", bottom: spacing.sm, left: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: radius.sm,
    flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4,
  },
  gpsText: { color: "#fff", fontSize: fontSize.xs, fontFamily: fonts.regular },
  retakeButton: { position: "absolute", top: spacing.md, right: spacing.md },
  placeholder: {
    height: 220, backgroundColor: colors.surface, borderRadius: radius.lg,
    alignItems: "center", justifyContent: "center", borderWidth: 2,
    borderColor: colors.border, borderStyle: "dashed", marginBottom: spacing.lg,
  },
  placeholderText: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing.md },
  placeholderSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.xs },
  photoActions: { gap: spacing.sm, marginBottom: spacing.lg },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.sm },
  picker: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  pickerValue: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text },
  pickerPlaceholder: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.textTertiary },
  // Result screen
  pressureBadge: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, marginBottom: spacing.lg,
  },
  pressureLabel: { fontFamily: fonts.bold, fontSize: fontSize.md },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md },
  countBox: { flex: 1, alignItems: "center", backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.sm },
  countNumber: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary },
  countLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  pestRow: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  pestName: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pestRisk: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  pestCount: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.primary },
  summaryText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, maxHeight: "70%",
  },
  modalTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, marginBottom: spacing.md },
  modalItem: { paddingVertical: spacing.sm + 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalItemText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text },
  modalItemSelected: { color: colors.primary, fontFamily: fonts.semiBold },
});
