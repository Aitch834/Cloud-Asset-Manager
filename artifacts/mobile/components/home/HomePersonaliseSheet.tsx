import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import type { HomeHeroCard } from "@/lib/hooks/useHomePreference";

interface Option {
  value: HomeHeroCard;
  title: string;
  description: string;
  icon: "check-square" | "shield";
  accentColor: string;
  accentBg: string;
}

const OPTIONS: Option[] = [
  {
    value: "tasks",
    title: "My Tasks",
    description: "See your assigned tasks and what's due today",
    icon: "check-square",
    accentColor: "#16A34A",
    accentBg: "#F0FDF4",
  },
  {
    value: "compliance",
    title: "Compliance Overview",
    description: "Red Tractor score, completed forms and overdue items",
    icon: "shield",
    accentColor: colors.primary,
    accentBg: "#F0FDF4",
  },
];

interface HomePersonaliseSheetProps {
  visible: boolean;
  current: HomeHeroCard;
  onSelect: (value: HomeHeroCard) => void;
  onClose: () => void;
}

export function HomePersonaliseSheet({
  visible,
  current,
  onSelect,
  onClose,
}: HomePersonaliseSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Personalise Home</Text>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.sheetSub}>
            Choose what you see at the top of your home screen. This only affects your own device.
          </Text>

          <View style={styles.options}>
            {OPTIONS.map((opt) => {
              const active = current === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.option,
                    active && { borderColor: opt.accentColor, backgroundColor: opt.accentBg },
                  ]}
                  onPress={() => { onSelect(opt.value); onClose(); }}
                >
                  <View style={[styles.optionIcon, { backgroundColor: active ? opt.accentColor : colors.borderLight }]}>
                    <Feather name={opt.icon} size={20} color={active ? "white" : colors.textSecondary} />
                  </View>

                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{opt.title}</Text>
                    <Text style={styles.optionDesc}>{opt.description}</Text>
                  </View>

                  <View style={[styles.radio, active && { borderColor: opt.accentColor, backgroundColor: opt.accentColor }]}>
                    {active && <Feather name="check" size={12} color="white" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl ?? 40,
  },
  handleRow: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl ?? 24,
    lineHeight: 20,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg ?? 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
