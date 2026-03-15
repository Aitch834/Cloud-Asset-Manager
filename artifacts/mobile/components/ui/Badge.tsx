import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.successBg, text: colors.success },
  warning: { bg: colors.warningBg, text: colors.accentDark },
  error: { bg: colors.errorBg, text: colors.error },
  info: { bg: colors.infoBg, text: colors.info },
  neutral: { bg: colors.borderLight, text: colors.textSecondary },
};

export function Badge({ text, variant = "neutral", style }: BadgeProps) {
  const v = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
