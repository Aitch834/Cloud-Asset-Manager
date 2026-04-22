import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import type { TaskSummaryData } from "@/lib/hooks/useApiMyTasksSummary";

import { Card } from "../ui/Card";

const MODULE_LABELS: Record<string, string> = {
  equipment_defect: "Equipment Defect",
  risk_assessment: "Risk Assessment",
  medicine_followup: "Medicine",
  vet_followup: "Vet Follow-up",
  spray_assignment: "Spray",
  feed_bin: "Feed Bin",
  farm_services: "Farm Services",
  work_order: "Work Order",
  field_inspection: "Field Inspection",
  planner: "Planner",
};

function fmtDue(d: string): string {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  return `Due ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

interface MyTasksCardProps {
  data: TaskSummaryData | null;
  loading?: boolean;
}

export function MyTasksCard({ data, loading }: MyTasksCardProps) {
  const taskColor = "#16A34A";
  const taskBg = "#F0FDF4";

  if (loading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.label}>My Tasks</Text>
            <View style={[styles.skeletonBlock, { width: 100, height: 36, marginTop: 4 }]} />
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: colors.borderLight }]} />
        </View>
        <View style={styles.stats}>
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.stat}>
                <View style={[styles.skeletonBlock, { width: 32, height: 22, marginBottom: 4 }]} />
                <View style={[styles.skeletonBlock, { width: 48, height: 12 }]} />
              </View>
            </React.Fragment>
          ))}
        </View>
      </Card>
    );
  }

  const total = data?.total ?? 0;
  const done = data?.done ?? 0;
  const todo = data?.todo ?? 0;
  const overdue = data?.overdue ?? 0;
  const next = data?.nextTask ?? null;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>My Tasks</Text>
          <Text style={[styles.score, { color: taskColor }]}>
            {total}{" "}
            <Text style={styles.scoreUnit}>assigned</Text>
          </Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: taskBg }]}>
          <Feather name="check-square" size={20} color={taskColor} />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: taskColor }]}>{done}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{todo}</Text>
          <Text style={styles.statLabel}>To Do</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, overdue > 0 && { color: colors.error }]}>
            {overdue}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {next && (
        <View style={styles.nextTask}>
          <Text style={styles.nextLabel}>Up next</Text>
          <Text style={styles.nextTitle} numberOfLines={1}>{next.title}</Text>
          <View style={styles.nextMeta}>
            <Feather name="clock" size={11} color={colors.textSecondary} />
            <Text style={styles.nextMetaText}>
              {fmtDue(next.dueDate)}
              {next.module ? ` · ${MODULE_LABELS[next.module] ?? next.module}` : ""}
            </Text>
          </View>
        </View>
      )}

      <Pressable
        style={styles.cta}
        onPress={() => router.push("/task-inbox")}
      >
        <Text style={[styles.ctaText, { color: taskColor }]}>View all tasks</Text>
        <Feather name="chevron-right" size={14} color={taskColor} />
      </Pressable>
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
    marginBottom: spacing.lg,
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
  scoreUnit: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
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
  nextTask: {
    backgroundColor: "#F0FDF4",
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: "#16A34A",
    marginBottom: spacing.md,
  },
  nextLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: "#15803D",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  nextTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 4,
  },
  nextMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nextMetaText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: spacing.xs,
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
  },
  skeletonBlock: {
    backgroundColor: colors.borderLight,
    borderRadius: 4,
  },
});
