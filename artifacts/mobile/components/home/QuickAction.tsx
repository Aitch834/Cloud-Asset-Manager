import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

interface QuickActionProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
}

export function QuickAction({ title, icon, color, bgColor, onPress }: QuickActionProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 76,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.text,
    textAlign: "center",
    lineHeight: 14,
  },
});
