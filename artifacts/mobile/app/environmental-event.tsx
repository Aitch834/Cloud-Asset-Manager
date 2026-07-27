import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import type { EnvironmentalEvent } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const EVENT_TYPES: { value: string; label: string }[] = [
  { value: "hedge_trimming",        label: "Hedge Trimming / Laying" },
  { value: "scrub_clearance",       label: "Scrub Clearance" },
  { value: "mowing",                label: "Mowing / Cutting" },
  { value: "pond_clearance",        label: "Pond Clearance" },
  { value: "ditch_clearance",       label: "Ditch Clearance" },
  { value: "vegetation_management", label: "Vegetation Management" },
  { value: "tree_work",             label: "Tree Work / Coppicing" },
  { value: "grazing",               label: "Grazing / Livestock Management" },
  { value: "spraying",              label: "Spraying" },
  { value: "cultivation",           label: "Cultivation" },
  { value: "planting",              label: "Planting / Seeding" },
  { value: "water_management",      label: "Water / Irrigation Management" },
  { value: "pest_control",          label: "Pest / Invasive Species Control" },
  { value: "other",                 label: "Other" },
];

export default function EnvironmentalEventScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [eventDate, setEventDate] = useState(today);
  const [eventType, setEventType] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [operator, setOperator] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) =>
      setStaffOptions(members.map(m => ({ id: m.id, label: m.label, sublabel: m.role || undefined })))
    );
  }, [currentFarm?.id]);
  const [contractorUsed, setContractorUsed] = useState(false);
  const [contractorName, setContractorName] = useState("");
  const [notes, setNotes] = useState("");

  const [showTypePicker, setShowTypePicker] = useState(false);

  const typeLabel = EVENT_TYPES.find(t => t.value === eventType)?.label ?? "Select event type…";

  const handleSave = async () => {
    if (!eventDate || !eventType) {
      Alert.alert("Required Fields", "Please select a date and event type.");
      return;
    }
    if (!currentFarm?.id) {
      Alert.alert("No Farm", "Please select a farm first.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: EnvironmentalEvent = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      eventDate: new Date(eventDate).toISOString(),
      eventType,
      featureName: featureName.trim(),
      description: description.trim(),
      operator: contractorUsed ? "" : operator.trim(),
      contractorUsed,
      contractorName: contractorUsed ? contractorName.trim() : "",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ENVIRONMENTAL_EVENTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert("Saved", "Environmental management event logged successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Environmental Event</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date */}
          <Input
            label="Date *"
            placeholder={today}
            value={eventDate}
            onChangeText={setEventDate}
            maxDate="today"
          />

          {/* Event type picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Event Type *</Text>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setShowTypePicker(true); }}
              style={styles.selectButton}
            >
              <Text style={[styles.selectText, !eventType && styles.placeholder]}>
                {typeLabel}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Event type modal */}
          {showTypePicker && (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Event Type</Text>
                  <Pressable onPress={() => setShowTypePicker(false)}>
                    <Feather name="x" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {EVENT_TYPES.map((t) => (
                    <Pressable
                      key={t.value}
                      onPress={() => {
                        setEventType(t.value);
                        Haptics.selectionAsync();
                        setShowTypePicker(false);
                      }}
                      style={[
                        styles.pickerItem,
                        eventType === t.value && styles.pickerItemSelected,
                      ]}
                    >
                      <Text style={[styles.pickerItemText, eventType === t.value && styles.pickerItemTextSelected]}>
                        {t.label}
                      </Text>
                      {eventType === t.value && (
                        <Feather name="check" size={16} color={colors.primary} />
                      )}
                    </Pressable>
                  ))}
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </View>
          )}

          {/* Feature */}
          <Input
            label="Feature / Location"
            placeholder="e.g. North boundary hedgerow, West pond"
            value={featureName}
            onChangeText={setFeatureName}
          />

          {/* Description */}
          <Input
            label="Description of work"
            placeholder="e.g. Hedge trimmed to 1.5m on both sides, arisings left on field side"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Operator or contractor */}
          <View style={styles.row}>
            <View style={styles.flex}>
              {contractorUsed ? (
                <Input
                  label="Contractor Name"
                  placeholder="Company / contractor name"
                  value={contractorName}
                  onChangeText={setContractorName}
                  containerStyle={styles.flex}
                />
              ) : (
                <LookupPicker
                  label="Carried out by"
                  value={operator}
                  options={staffOptions}
                  onSelect={(_id, label) => setOperator(label)}
                  placeholder="Select or type name…"
                  allowFreeText
                  icon="user"
                />
              )}
            </View>
          </View>

          {/* Contractor toggle */}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setContractorUsed(v => !v); }}
            style={styles.toggleRow}
          >
            <View style={[styles.toggleBox, contractorUsed && styles.toggleBoxActive]}>
              {contractorUsed && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.toggleLabel}>Carried out by contractor</Text>
          </Pressable>

          {/* Notes */}
          <Input
            label="Notes"
            placeholder="Conditions, observations, follow-up needed…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Log Event"
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  selectText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textTertiary,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  toggleBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "75%",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  pickerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  pickerScroll: {
    marginTop: spacing.sm,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  pickerItemSelected: {
    backgroundColor: colors.successBg,
  },
  pickerItemText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  pickerItemTextSelected: {
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});
