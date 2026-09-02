import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useSync } from "@/lib/context/SyncContext";
import { router } from "expo-router";

export function SyncStatusBar() {
  const { pendingCount, failedCount, isSyncing, isConnected, lastError, triggerSync } = useSync();

  if (pendingCount === 0 && failedCount === 0 && isConnected && !isSyncing && !lastError) {
    return null;
  }

  let bgColor = colors.accent;
  let icon: "wifi-off" | "upload-cloud" | "refresh-cw" | "alert-triangle" = "upload-cloud";
  let text = "";

  if (!isConnected) {
    bgColor = "#6B7280";
    icon = "wifi-off";
    text = `Offline${pendingCount > 0 ? ` \u00B7 ${pendingCount} pending` : ""}`;
  } else if (isSyncing) {
    bgColor = colors.info;
    icon = "refresh-cw";
    text = "Syncing...";
  } else if (lastError) {
    bgColor = colors.error;
    icon = "alert-triangle";
    text = lastError;
  } else if (pendingCount > 0) {
    bgColor = colors.accent;
    icon = "upload-cloud";
    text = `${pendingCount} record${pendingCount > 1 ? "s" : ""} to sync`;
  } else if (failedCount > 0) {
    bgColor = colors.error;
    icon = "alert-triangle";
    text = "Sync needs attention";
  }

  const handlePress = () => {
    if (failedCount > 0) {
      router.push("/sync-status");
      return;
    }
    if (isConnected && !isSyncing && pendingCount > 0) {
      triggerSync();
    }
  };

  return (
    <Pressable
      onPress={failedCount > 0 || (isConnected && !isSyncing && pendingCount > 0) ? handlePress : undefined}
      accessibilityRole="button"
      accessibilityLabel={failedCount > 0 ? "View failed sync records" : "Sync pending records"}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      <View style={styles.content}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Feather name={icon} size={14} color="#fff" />
        )}
        <Text style={styles.text}>{text}</Text>
        {failedCount > 0 && (
          <View style={styles.failedBadge}>
            <Text style={styles.failedBadgeText}>
              {failedCount} failed
            </Text>
          </View>
        )}
        {isConnected && !isSyncing && pendingCount > 0 && (
          <Text style={styles.tapText}>Tap to sync</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#fff",
  },
  tapText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.7)",
  },
  failedBadge: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  failedBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.error,
  },
});
