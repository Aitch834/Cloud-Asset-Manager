import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

import { Card } from "../ui/Card";

interface WeatherWidgetProps {
  temperature: string;
  conditions: string;
  windSpeed: string;
  rainfall: string;
}

const conditionIcons: Record<string, keyof typeof Feather.glyphMap> = {
  sunny: "sun",
  cloudy: "cloud",
  rainy: "cloud-rain",
  windy: "wind",
  snowy: "cloud-snow",
  stormy: "cloud-lightning",
  default: "cloud",
};

export function WeatherWidget({ temperature, conditions, windSpeed, rainfall }: WeatherWidgetProps) {
  const iconName = conditionIcons[conditions.toLowerCase()] || conditionIcons.default;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.tempSection}>
          <Feather name={iconName} size={28} color={colors.accent} />
          <View style={styles.tempText}>
            <Text style={styles.temp}>{temperature}</Text>
            <Text style={styles.conditions}>{conditions}</Text>
          </View>
        </View>
        <View style={styles.detailsSection}>
          <View style={styles.detail}>
            <Feather name="wind" size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{windSpeed}</Text>
          </View>
          <View style={styles.detail}>
            <Feather name="droplet" size={14} color={colors.info} />
            <Text style={styles.detailText}>{rainfall}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tempSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  tempText: {},
  temp: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  conditions: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailsSection: {
    gap: spacing.sm,
  },
  detail: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  detailText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
