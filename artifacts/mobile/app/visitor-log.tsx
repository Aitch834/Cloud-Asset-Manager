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
import type { VisitorLogEntry } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { visitorLogHtml } from "@/lib/printTemplates";

export default function VisitorLogScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [visitorName, setVisitorName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [areasVisited, setAreasVisited] = useState("");
  const [biosecurityCompliant, setBiosecurityCompliant] = useState(true);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!visitorName.trim()) {
      Alert.alert("Required", "Please enter the visitor's name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry: VisitorLogEntry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      visitorName: visitorName.trim(),
      organisation: organisation.trim(),
      purpose: purpose.trim(),
      vehicleReg: vehicleReg.trim().toUpperCase(),
      timeIn: new Date().toISOString(),
      timeOut: "",
      areasVisited: areasVisited.trim(),
      biosecurityCompliant,
      signature: user?.name || "",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.VISITOR_LOG, entry);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Visitor logged. Print or save the visitor record?", [
      { text: "Print", onPress: async () => { await print(visitorLogHtml(entry, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(visitorLogHtml(entry, currentFarm), "Visitor Log"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Visitor Log</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.timeCard}>
            <Feather name="clock" size={18} color={colors.primary} />
            <View>
              <Text style={styles.timeLabel}>Time In</Text>
              <Text style={styles.timeValue}>
                {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} {"\u00B7"}{" "}
                {new Date().toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Visitor Details</Text>
          </View>
          <Input
            label="Visitor Name"
            placeholder="Full name"
            value={visitorName}
            onChangeText={setVisitorName}
            icon="user"
            required
          />
          <Input
            label="Organisation"
            placeholder="Company or organisation"
            value={organisation}
            onChangeText={setOrganisation}
          />
          <Input
            label="Purpose of Visit"
            placeholder="e.g. Grain delivery, Vet visit"
            value={purpose}
            onChangeText={setPurpose}
          />

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Vehicle & Access</Text>
          </View>
          <Input
            label="Vehicle Registration"
            placeholder="e.g. AB12 CDE"
            value={vehicleReg}
            onChangeText={setVehicleReg}
            autoCapitalize="characters"
          />
          <Input
            label="Areas Visited"
            placeholder="e.g. Yard, Fields 1-3"
            value={areasVisited}
            onChangeText={setAreasVisited}
          />

          <View style={styles.sectionLabel}>
            <Feather name="shield" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Biosecurity</Text>
          </View>
          <Pressable
            style={styles.toggleRow}
            onPress={() => {
              Haptics.selectionAsync();
              setBiosecurityCompliant(!biosecurityCompliant);
            }}
          >
            <Text style={styles.toggleLabel}>Biosecurity measures followed?</Text>
            <View
              style={[
                styles.toggle,
                biosecurityCompliant ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  biosecurityCompliant ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}
              />
            </View>
          </Pressable>

          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Log Visitor"
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
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primaryMuted + "22",
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  timeLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: 2,
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: colors.success,
  },
  toggleOff: {
    backgroundColor: colors.border,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
  },
  toggleThumbOff: {
    alignSelf: "flex-start",
  },
});
