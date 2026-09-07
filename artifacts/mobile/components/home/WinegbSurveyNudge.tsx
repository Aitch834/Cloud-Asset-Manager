import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

export const WINEGB_CHECKLIST_ROUTE = "/vine-phenology-history";

export function WinegbSurveyNudge({ pendingCount }: { pendingCount: number }) {
  return (
    <Pressable
      style={styles.banner}
      onPress={() => router.push(WINEGB_CHECKLIST_ROUTE)}
      accessibilityRole="button"
      accessibilityLabel="Open WineGB survey checklist"
      testID="winegb-home-checklist-shortcut"
    >
      <View style={styles.iconWrap}>
        <Feather name="globe" size={18} color="#059669" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {pendingCount === 1
            ? "1 WineGB survey to submit"
            : `${pendingCount} WineGB surveys to submit`}
        </Text>
        <Text style={styles.subtitle}>
          Open the checklist to mark surveys as submitted
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});