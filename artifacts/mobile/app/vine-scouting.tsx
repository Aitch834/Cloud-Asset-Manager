import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
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
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { VineBlockPicker } from "@/components/VineBlockPicker";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { apiFetch } from "@/lib/apiFetch";
import { ScoutingPhotoSection } from "@/components/ScoutingPhotoSection";

const today = new Date().toISOString().split("T")[0];

const PRESSURE_LABELS = ["None", "Low", "Medium", "High"];
const PRESSURE_COLORS = [colors.textSecondary, colors.success, colors.warning ?? "#f59e0b", colors.error];

function PressurePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.pressureRow}>
      <Text style={styles.pressureLabel}>{label}</Text>
      <View style={styles.pressureButtons}>
        {PRESSURE_LABELS.map((l, i) => (
          <Pressable
            key={i}
            style={[styles.pressureBtn, value === i && { backgroundColor: PRESSURE_COLORS[i], borderColor: PRESSURE_COLORS[i] }]}
            onPress={() => { Haptics.selectionAsync(); onChange(i); }}
          >
            <Text style={[styles.pressureBtnText, value === i && { color: "#fff" }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function BooleanToggle({ label, value, onChange, urgent }: { label: string; value: boolean; onChange: (v: boolean) => void; urgent?: boolean }) {
  return (
    <Pressable
      style={[styles.toggleRow, value && urgent && styles.toggleRowUrgent, value && !urgent && styles.toggleRowActive]}
      onPress={() => { Haptics.selectionAsync(); onChange(!value); }}
    >
      <Feather name={value ? "check-square" : "square"} size={18} color={value ? (urgent ? colors.error : colors.success) : colors.textSecondary} />
      <Text style={[styles.toggleLabel, value && urgent && { color: colors.error }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function VineScoutingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedScout, setSelectedScout] = useState<ApiFarmMember | null>(null);
  const [manualScout, setManualScout] = useState(user?.name || "");
  const scoutedBy = selectedScout ? memberFullName(selectedScout) : manualScout;

  const [scoutDate, setScoutDate] = useState(today);
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [manualBlockName, setManualBlockName] = useState("");
  const [nextScoutDate, setNextScoutDate] = useState("");

  const [downyMildew, setDownyMildew] = useState(0);
  const [powderyMildew, setPowderyMildew] = useState(0);
  const [botrytis, setBotrytis] = useState(0);
  const [phomopsis, setPhomopsis] = useState(0);
  const [leafhopper, setLeafhopper] = useState(0);
  const [spiderMite, setSpiderMite] = useState(0);

  const [vineWeevil, setVineWeevil] = useState(false);
  const [eutypaDieback, setEutypaDieback] = useState(false);
  const [xylella, setXylella] = useState(false);
  const [phytophthora, setPhytophthora] = useState(false);

  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  // After a successful API save we get a server-side record ID — used for photo attachment
  const [savedRecordId, setSavedRecordId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!scoutDate || !scoutedBy.trim()) {
      Alert.alert("Required Fields", "Please enter a scout date and your name.");
      return;
    }

    if (xylella || phytophthora) {
      Alert.alert(
        "⚠️ Notifiable Pest Suspected",
        `You have flagged a possible notifiable plant pest. You must report this to APHA immediately on 0300 1000 313 before moving any plant material.\n\nRecord will still be saved.`,
        [{ text: "Understood — Save Record", style: "destructive", onPress: () => doSave() }, { text: "Cancel" }],
      );
      return;
    }

    doSave();
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const body = {
      scoutDate,
      blockName: (selectedBlock?.blockName ?? manualBlockName.trim()) || undefined,
      blockId: selectedBlock?.id ?? undefined,
      scoutedBy: scoutedBy.trim(),
      nextScoutDate: nextScoutDate || undefined,
      downyMildewPressure: downyMildew,
      powderyMildewPressure: powderyMildew,
      botrytisPressure: botrytis,
      phomopsisPressure: phomopsis,
      leafhopperPressure: leafhopper,
      spiderMitePressure: spiderMite,
      vineWeevilSighted: vineWeevil,
      eutypaDiebackSighted: eutypaDieback,
      xylellaFastidiosa: xylella,
      phytophthoraViticola: phytophthora,
      actionTaken: actionTaken.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-scouting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", (err as any).error ?? "Could not save the scouting record. Please try again.");
        setSaving(false);
        return;
      }

      const data: { record: { id: number } } = await res.json();
      setSavedRecordId(data.record.id);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please check your connection and try again.");
      setSaving(false);
      return;
    }

    setSaving(false);

    const hasHighPressure = downyMildew >= 2 || powderyMildew >= 2 || botrytis >= 2 || phomopsis >= 2;
    if (hasHighPressure || xylella || vineWeevil) {
      setTaskSheet({
        title: `High Disease Pressure — ${(selectedBlock?.blockName ?? manualBlockName) || "Vineyard"} · ${scoutDate}`,
        description: `Scout: ${scoutedBy}. Downy: ${PRESSURE_LABELS[downyMildew]}, Powdery: ${PRESSURE_LABELS[powderyMildew]}, Botrytis: ${PRESSURE_LABELS[botrytis]}${xylella ? " — XYLELLA SUSPECTED" : ""}. Consider spray intervention.`,
      });
    }
    // If no task sheet, the user stays on the screen to add photos, then navigates back manually
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Vineyard Disease Scouting</Text>
        </View>

        {/* ── Form (hidden once saved) ── */}
        {savedRecordId === null ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Walkabout Details</Text>
              <Text style={styles.fieldLabel}>Scout Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={scoutDate}
                onChangeText={v => { if (v <= today) setScoutDate(v); }}
                keyboardType="numeric"
              />
              <Text style={styles.fieldLabel}>Block / Area</Text>
              <VineBlockPicker blocks={blocks} selected={selectedBlock} onSelect={setSelectedBlock} loading={blocksLoading} />
              {!selectedBlock && (
                <Input placeholder={blocks.length ? "Or type block name manually" : "e.g. South Slope, Block 3"} value={manualBlockName} onChangeText={setManualBlockName} style={{ marginTop: 4 }} />
              )}
              <Text style={styles.fieldLabel}>Scouted By</Text>
              <StaffMemberPicker
                members={members}
                selected={selectedScout}
                onSelect={setSelectedScout}
                loading={false}
                error={null}
              />
              {!selectedScout && (
                <Input placeholder="Or type name manually" value={manualScout} onChangeText={setManualScout} style={{ marginTop: spacing.xs }} />
              )}
              <Text style={styles.fieldLabel}>Next Scout Date (planned)</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={nextScoutDate}
                onChangeText={v => { if (!v || v >= today) setNextScoutDate(v); }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Disease Pressure</Text>
              <PressurePicker label="Downy Mildew" value={downyMildew} onChange={setDownyMildew} />
              <PressurePicker label="Powdery Mildew" value={powderyMildew} onChange={setPowderyMildew} />
              <PressurePicker label="Botrytis" value={botrytis} onChange={setBotrytis} />
              <PressurePicker label="Phomopsis" value={phomopsis} onChange={setPhomopsis} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Pest Pressure</Text>
              <PressurePicker label="Leafhopper" value={leafhopper} onChange={setLeafhopper} />
              <PressurePicker label="Spider Mite" value={spiderMite} onChange={setSpiderMite} />
              <BooleanToggle label="Vine Weevil sighted" value={vineWeevil} onChange={setVineWeevil} urgent />
              <BooleanToggle label="Eutypa Dieback sighted" value={eutypaDieback} onChange={setEutypaDieback} />
            </View>

            <View style={[styles.card, { borderColor: colors.error, borderWidth: 1.5 }]}>
              <Text style={[styles.sectionTitle, { color: colors.error }]}>Notifiable Plant Pests</Text>
              <Text style={styles.helperText}>Report to APHA immediately on 0300 1000 313 if any of these are suspected. Do not move plant material off-site.</Text>
              <BooleanToggle label="Xylella fastidiosa suspected" value={xylella} onChange={setXylella} urgent />
              <BooleanToggle label="Phytophthora viticola suspected" value={phytophthora} onChange={setPhytophthora} urgent />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Actions & Notes</Text>
              <Text style={styles.fieldLabel}>Action Taken</Text>
              <Input placeholder="Describe any action taken…" value={actionTaken} onChangeText={setActionTaken} multiline numberOfLines={3} />
              <Text style={styles.fieldLabel}>Notes</Text>
              <Input placeholder="Additional observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
            </View>

            <Button title={saving ? "Saving…" : "Save Scouting Record"} onPress={handleSave} disabled={saving} />
          </>
        ) : (
          /* ── Post-save: show success banner + photo gallery ── */
          <>
            <View style={styles.savedBanner}>
              <Feather name="check-circle" size={20} color={colors.success} />
              <Text style={styles.savedBannerText}>Scouting record saved</Text>
            </View>

            <ScoutingPhotoSection farmId={currentFarm?.id ?? ""} scoutingId={savedRecordId} />

            <Button title="Done" onPress={() => router.back()} />
          </>
        )}
      </ScrollView>

      {taskSheet && (
        <RaiseTaskSheet
          visible
          farmId={currentFarm?.id ?? ""}
          module="viticulture"
          defaultTitle={taskSheet.title}
          defaultDescription={taskSheet.description}
          onRaised={() => {
            setTaskSheet(null);
            if (savedRecordId !== null) {
              // Stay on screen for photo attachment — dismiss task sheet only
            } else {
              router.back();
            }
          }}
          onSkip={() => {
            setTaskSheet(null);
            if (savedRecordId === null) router.back();
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  backBtn: { padding: spacing.xs },
  title: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: colors.text, flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.text },
  fieldLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: spacing.xs },
  helperText: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
  pressureRow: { gap: spacing.xs },
  pressureLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text },
  pressureButtons: { flexDirection: "row", gap: spacing.xs },
  pressureBtn: { flex: 1, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  pressureBtnText: { fontSize: fontSize.xs, fontFamily: fonts.medium, color: colors.textSecondary },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  toggleRowActive: { borderColor: colors.success, backgroundColor: "#f0fdf4" },
  toggleRowUrgent: { borderColor: colors.error, backgroundColor: "#fef2f2" },
  toggleLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },

  // Saved state
  savedBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#f0fdf4", borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.success },
  savedBannerText: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.success, flex: 1 },
});

function ScoutingPhotoLightbox({ photos, initialIndex, visible, onClose, onDelete, onReload }: ScoutingLightboxProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Sync index when lightbox opens; also reset in-flight flags on open/close
  useEffect(() => {
    if (visible) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, photos.length - 1)));
    }
    setSharing(false);
    setDeleting(false);
  }, [visible, initialIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clamp if photos array shrinks (e.g. a delete from outside).
  // clampIndexAfterDelete returns -1 when the array is empty — that's the close signal.
  useEffect(() => {
    const next = clampIndexAfterDelete(currentIndex, photos.length);
    if (next === -1) {
      onClose();
      return;
    }
    setCurrentIndex(next);
  }, [photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset in-flight flags and image error state when the displayed photo changes
  useEffect(() => {
    setSharing(false);
    setDeleting(false);
    setImgError(false);
  }, [currentIndex]);

  // Also clear the error whenever the photo's URL is refreshed (e.g. after onReload)
  const photo = photos[currentIndex] ?? null;
  const prevDownloadUrl = useRef(photo?.downloadUrl);
  if (prevDownloadUrl.current !== photo?.downloadUrl) {
    prevDownloadUrl.current = photo?.downloadUrl;
    if (imgError) setImgError(false);
  }

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, photos.length - 1));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keep a ref to photos.length so the PanResponder closure stays current
  const photosLenRef = useRef(photos.length);
  photosLenRef.current = photos.length;

  // Horizontal swipe via PanResponder (no extra deps)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gs) =>
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_evt, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          setCurrentIndex((i) => Math.min(i + 1, photosLenRef.current - 1));
        } else if (gs.dx > SWIPE_THRESHOLD) {
          setCurrentIndex((i) => Math.max(i - 1, 0));
        }
      },
    }),
  ).current;

  const handleShare = useCallback(async () => {
    if (!photo?.downloadUrl || sharing) return;
    setSharing(true);
    try {
      const ext = photo.fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
      const tmpUri = `${FileSystem.cacheDirectory}scouting_share_${photo.id}.${ext}`;
      const dl = await FileSystem.downloadAsync(photo.downloadUrl, tmpUri);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing Not Available", "Sharing is not supported on this device.");
        return;
      }
      await Sharing.shareAsync(dl.uri, { mimeType: `image/${ext === "jpg" ? "jpeg" : ext}` });
    } catch {
      Alert.alert("Share Failed", "Could not share the photo. Please try again.");
    } finally {
      setSharing(false);
    }
  }, [photo, sharing]);

  const handleDelete = useCallback(() => {
    if (!photo || deleting) return;
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await onDelete(photo.id);
            } finally {
              // Reset so the button is re-enabled for a retry if the call failed.
              // (If it succeeded the lightbox will already be closing or the photos
              // array will have shrunk, so this is a no-op in the happy path.)
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [photo, deleting, onDelete]);

  if (!visible) return null;

  const uri = photo?.downloadUrl ?? null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
      <View style={lbStyles.backdrop}>
        {/* Close button */}
        <Pressable
          style={[lbStyles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={12}
        >
          <Feather name="x" size={24} color="#fff" />
        </Pressable>

        {/* Photo count indicator — hidden for single photos */}
        {showCounter(photos.length) ? (
          <View style={[lbStyles.counter, { top: insets.top + 18 }]}>
            <Text style={lbStyles.counterText}>
              {counterText(currentIndex, photos.length)}
            </Text>
          </View>
        ) : null}

        {/* Swipeable photo area */}
        <View style={lbStyles.imageWrapper} {...panResponder.panHandlers}>
          {uri && !imgError ? (
            <Image
              source={{ uri }}
              style={lbStyles.image}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <Pressable style={lbStyles.imagePlaceholder} onPress={onReload} hitSlop={12}>
              <Feather name="refresh-cw" size={40} color="rgba(255,255,255,0.55)" />
              <Text style={lbStyles.reloadLabel}>Tap to reload</Text>
            </Pressable>
          )}

          {/* Left chevron — hidden at index 0 and for single photos */}
          {showLeftChevron(photos.length, currentIndex) ? (
            <Pressable style={[lbStyles.chevron, lbStyles.chevronLeft]} onPress={goPrev} hitSlop={12}>
              <Feather name="chevron-left" size={32} color="#fff" />
            </Pressable>
          ) : null}

          {/* Right chevron — hidden at last index and for single photos */}
          {showRightChevron(photos.length, currentIndex) ? (
            <Pressable style={[lbStyles.chevron, lbStyles.chevronRight]} onPress={goNext} hitSlop={12}>
              <Feather name="chevron-right" size={32} color="#fff" />
            </Pressable>
          ) : null}
        </View>

        {/* Caption */}
        {photo?.caption ? (
          <View style={lbStyles.captionBar}>
            <Text style={lbStyles.captionText} numberOfLines={3}>
              {photo.caption}
            </Text>
          </View>
        ) : null}

        {/* Action bar */}
        <View style={[lbStyles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
          {/* Share */}
          <Pressable
            style={[lbStyles.actionBtn, sharing && lbStyles.actionBtnDisabled]}
            onPress={handleShare}
            disabled={sharing || !uri}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="share-2" size={22} color="#fff" />
            )}
            <Text style={lbStyles.actionBtnText}>{sharing ? "Sharing…" : "Share"}</Text>
          </Pressable>

          {/* Delete */}
          <Pressable
            style={[lbStyles.actionBtn, lbStyles.actionBtnDanger]}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Feather name="trash-2" size={22} color="#fca5a5" />
            <Text style={[lbStyles.actionBtnText, { color: "#fca5a5" }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
