import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useRFID } from "@/lib/context/RFIDContext";
import { RFIDTagInput } from "@/components/ui/RFIDTagInput";

const COMPATIBLE_READERS = [
  { brand: "Tru-Test", model: "SRS2 / XRS2", note: "Set to 'Keyboard Wedge' mode via app" },
  { brand: "Agrident", model: "ABR100 / APR350", note: "Hold mode button 3 s to enable HID" },
  { brand: "Zee Tag", model: "ZT-1 / BRT1", note: "Pairs in keyboard emulation by default" },
  { brand: "Gallagher", model: "HR2 / TSi", note: "Select 'Bluetooth HID' in device settings" },
  { brand: "WaterFord", model: "TT Series", note: "Enable 'BT Keyboard' in configuration" },
];

const STEPS = [
  { icon: "bluetooth" as const, text: "Enable Bluetooth on your phone and on your RFID wand." },
  { icon: "settings" as const, text: "On your wand, select 'Bluetooth HID' or 'Keyboard Wedge' mode (see your reader manual)." },
  { icon: "smartphone" as const, text: "In your phone's Bluetooth settings, pair the wand as a keyboard device." },
  { icon: "check-circle" as const, text: "Return here — tap the Bluetooth icon next to any ear tag field and scan your first tag to confirm it's working." },
];

export default function RFIDSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { readerName, setReaderName, recentScans, clearRecentScans, isScanModeActive } = useRFID();
  const [nameInput, setNameInput] = useState(readerName);
  const [testTag, setTestTag] = useState("");

  const handleSaveName = async () => {
    await setReaderName(nameInput.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", "Reader name saved.");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>RFID Reader</Text>
          <Text style={styles.headerSub}>Bluetooth ear tag scanning</Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isScanModeActive ? colors.success : colors.border }]} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={styles.explainerCard}>
          <Feather name="info" size={16} color={colors.info} style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.explainerTitle}>How it works</Text>
            <Text style={styles.explainerText}>
              Cattle, sheep and goat ear tags contain a 15-digit ISO 11784/11785 transponder
              operating at 134.2 kHz — a different frequency to your phone's NFC chip.
            </Text>
            <Text style={[styles.explainerText, { marginTop: spacing.xs }]}>
              A Bluetooth RFID wand (listed below) pairs with your phone as a{" "}
              <Text style={styles.bold}>wireless keyboard</Text>. When you scan a tag it types
              the number directly into whichever ear tag field has the Bluetooth icon.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pairing Instructions</Text>
        <View style={styles.card}>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Feather name={step.icon} size={16} color={colors.primary} style={styles.stepIcon} />
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Compatible Readers</Text>
        <View style={styles.card}>
          {COMPATIBLE_READERS.map((r, i) => (
            <View key={r.model}>
              <View style={styles.readerRow}>
                <View style={styles.readerIcon}>
                  <Feather name="wifi" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.readerBrand}>
                    {r.brand} <Text style={styles.readerModel}>{r.model}</Text>
                  </Text>
                  <Text style={styles.readerNote}>{r.note}</Text>
                </View>
              </View>
              {i < COMPATIBLE_READERS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Your Reader</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Reader Name (optional label)</Text>
          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Tru-Test SRS2 — Race"
              placeholderTextColor={colors.textTertiary}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <Pressable style={styles.saveBtn} onPress={handleSaveName}>
              <Feather name="check" size={16} color="#fff" />
            </Pressable>
          </View>
          {!!readerName && (
            <View style={styles.savedRow}>
              <Feather name="bluetooth" size={12} color={colors.success} />
              <Text style={styles.savedText}>Saved: {readerName}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Test Scan</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>
            Tap the Bluetooth icon, then scan a tag with your paired wand
          </Text>
          <RFIDTagInput
            label="Test Tag Field"
            value={testTag}
            onChangeText={setTestTag}
            onTagScanned={(tag) => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Tag Scanned!", `Reader successfully sent:\n\n${tag}\n\nYour wand is correctly paired.`);
            }}
            placeholder="Tap Bluetooth icon to start"
          />
          {testTag.length > 0 && (
            <Pressable onPress={() => setTestTag("")} style={styles.clearBtn}>
              <Feather name="x" size={14} color={colors.textSecondary} />
              <Text style={styles.clearBtnText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {recentScans.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Recent Scans</Text>
              <Pressable onPress={clearRecentScans} hitSlop={8}>
                <Text style={styles.clearAllText}>Clear all</Text>
              </Pressable>
            </View>
            <View style={styles.card}>
              {recentScans.map((tag, i) => (
                <View key={tag}>
                  <View style={styles.scanRow}>
                    <View style={styles.tagBadge}>
                      <Feather name="tag" size={12} color={colors.primary} />
                    </View>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                  {i < recentScans.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scroll: { padding: spacing.md, gap: spacing.sm },
  explainerCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  explainerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  explainerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#1e40af",
    lineHeight: 20,
  },
  bold: { fontFamily: fonts.semiBold },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  clearAllText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: "hidden",
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: "#fff",
  },
  stepIcon: { marginTop: 3 },
  stepText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  readerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  readerIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  readerBrand: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  readerModel: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  readerNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: colors.borderLight },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  saveBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  savedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  savedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
  clearBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  tagBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  tagText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: 0.5,
  },
});
