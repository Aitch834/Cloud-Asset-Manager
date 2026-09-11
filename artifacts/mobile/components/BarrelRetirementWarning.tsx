import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { isBarrelType } from "../lib/utils/vesselAlerts";

type BarrelRetirementWarningProps = {
  loading: boolean;
  hasError: boolean;
  thresholdLoaded: boolean;
  vesselType: string | null;
  totalMaintenanceSpendPence: number;
  thresholdPence: number;
};

export function BarrelRetirementWarning({
  loading,
  hasError,
  thresholdLoaded,
  vesselType,
  totalMaintenanceSpendPence,
  thresholdPence,
}: BarrelRetirementWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  if (
    loading ||
    hasError ||
    !thresholdLoaded ||
    dismissed ||
    !isBarrelType(vesselType) ||
    totalMaintenanceSpendPence <= thresholdPence
  ) {
    return null;
  }

  return (
    <View style={styles.warning}>
      <Feather name="alert-triangle" size={16} color="#D97706" style={styles.warningIcon} />
      <Text style={styles.warningText}>
        Total maintenance spend (£{(totalMaintenanceSpendPence / 100).toFixed(2)}) exceeds the
        retirement threshold (£{(thresholdPence / 100).toFixed(0)}). Consider retiring this barrel.
      </Text>
      <TouchableOpacity
        onPress={() => setDismissed(true)}
        style={styles.dismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss retirement warning"
      >
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  warningIcon: {
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: "#92400E",
    lineHeight: 18,
  },
  dismiss: {
    paddingLeft: spacing.xs,
    paddingBottom: spacing.xs,
  },
  dismissText: {
    fontSize: fontSize.sm,
    lineHeight: 16,
    fontFamily: fonts.semiBold,
    color: "#D97706",
  },
});