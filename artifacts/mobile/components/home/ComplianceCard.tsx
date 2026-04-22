import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

import { Card } from "../ui/Card";

interface ComplianceCardProps {
  score: number;
  completedForms: number;
  totalForms: number;
  overdueItems: number;
  loading?: boolean;
}

export function ComplianceCard({ score, completedForms, totalForms, overdueItems, loading }: ComplianceCardProps) {
  const scoreColor = score >= 80 ? colors.compliant : score >= 60 ? colors.warning : colors.nonCompliant;

  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>Red Tractor Compliance</Text>
            <View style={[styles.skeletonBlock, { width: 80, height: 36, marginTop: 4 }]} />
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.borderLight }]} />
        </View>
        <View style={[styles.progressTrack, { marginBottom: spacing.lg }]}>
          <View style={[styles.progressFill, { width: "40%", backgroundColor: colors.borderLight }]} />
        </View>
        <View style={styles.stats}>
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.stat}>
                <View style={[styles.skeletonBlock, { width: 32, height: 22, marginBottom: 4 }]} />
                <View style={[styles.skeletonBlock, { width: 56, height: 12 }]} />
              </View>
            </React.Fragment>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Red Tractor Compliance</Text>
          <Text style={[styles.score, { color: scoreColor }]}>{score}%</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + "18" }]}>
          <Feather
            name={score >= 80 ? "check-circle" : "alert-triangle"}
            size={20}
            color={scoreColor}
          />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: scoreColor }]} />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedForms}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Math.max(0, totalForms - completedForms)}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, overdueItems > 0 && { color: colors.error }]}>
            {overdueItems}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  score: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxxl,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  skeletonBlock: {
    backgroundColor: colors.borderLight,
    borderRadius: 4,
  },
});
