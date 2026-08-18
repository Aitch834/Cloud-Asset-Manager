import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import type { DiseaseAlertData } from "@/lib/hooks/useDiseaseAlert";

interface Props {
  alert: DiseaseAlertData | null;
  /** Display name for the species/sector, e.g. "Cattle", "Dairy", "Sheep". */
  sector: string;
}

/**
 * Returns a relative "Issued today" / "Issued yesterday" / "Issued X days ago"
 * label matching the dashboard banner. Prefers the episode `issuedAt` ISO
 * timestamp; falls back to the legacy `date` string for pre-episode alerts.
 * Returns null when neither field is present or parseable.
 */
function formatAlertIssuedAt(issuedAt?: string, date?: string): string | null {
  if (issuedAt) {
    const issued = new Date(issuedAt);
    if (!isNaN(issued.getTime())) {
      const diffDays = Math.floor(
        (Date.now() - issued.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays === 0) return "Issued today";
      if (diffDays === 1) return "Issued yesterday";
      return `Issued ${diffDays} days ago`;
    }
  }
  if (date) return `Issued ${date}`;
  return null;
}

/**
 * Coloured disease-alert banner matching the dashboard's national / regional /
 * notice level colour coding (red / orange / amber). Renders nothing when
 * `alert` is null or inactive.
 */
export function DiseaseAlertBanner({ alert, sector }: Props) {
  if (!alert?.active) return null;

  const isNational = alert.level === "national";
  const isRegional = alert.level === "regional";

  const bg      = isNational ? "#fef2f2" : isRegional ? "#fff7ed" : "#fffbeb";
  const border  = isNational ? "#fca5a5" : isRegional ? "#fed7aa" : "#fde68a";
  const textCol = isNational ? "#7f1d1d" : isRegional ? "#9a3412" : "#78350f";
  const iconCol = isNational ? "#dc2626" : isRegional ? "#ea580c"  : "#d97706";

  const label = isNational
    ? `National ${sector} Disease Alert`
    : isRegional
    ? `Regional ${sector} Disease Alert`
    : `${sector} Disease Notice`;

  const dateStr = formatAlertIssuedAt(alert.issuedAt, alert.date);

  return (
    <View style={[styles.banner, { backgroundColor: bg, borderColor: border }]}>
      <Feather name="alert-triangle" size={15} color={iconCol} style={styles.icon} />
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: textCol }]}>{label}</Text>
        {!!alert.message && (
          <Text style={[styles.message, { color: textCol }]}>{alert.message}</Text>
        )}
        {!!dateStr && (
          <Text style={[styles.date, { color: textCol }]}>{dateStr}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: { marginTop: 2, marginRight: spacing.sm },
  textBlock: { flex: 1 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, lineHeight: 18 },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginTop: 2,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
    opacity: 0.8,
  },
});
