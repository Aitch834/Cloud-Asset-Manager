import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import type { VineBlock } from "@/lib/hooks/useApiVineBlocks";

interface Props {
  blocks: VineBlock[];
  selected: VineBlock | null;
  onSelect: (block: VineBlock | null) => void;
  loading?: boolean;
}

const THUMB_SIZE = 36;

function BlockThumbnail({ uri }: { uri: string | null }) {
  if (uri) {
    return (
      <View style={styles.thumb}>
        <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
      </View>
    );
  }
  return (
    <View style={[styles.thumb, styles.thumbPlaceholder]}>
      <Feather name="image" size={14} color={colors.textSecondary} />
    </View>
  );
}

function statusColor(plantingStatus: string) {
  if (plantingStatus === "active") return "#16a34a";
  if (plantingStatus === "suspended") return "#d97706";
  return colors.textSecondary;
}

function statusLabel(plantingStatus: string) {
  if (plantingStatus === "active") return "Active";
  if (plantingStatus === "suspended") return "Suspended";
  return plantingStatus;
}

export function VineBlockPicker({ blocks, selected, onSelect, loading }: Props) {
  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading blocks…</Text>
      </View>
    );
  }

  if (!blocks.length) return null;

  const activeBlocks = blocks.filter(b => b.plantingStatus === "active");
  const suspendedBlocks = blocks.filter(b => b.plantingStatus === "suspended");

  return (
    <View style={styles.container}>
      {activeBlocks.length > 0 && (
        <Text style={styles.groupLabel}>Active Blocks</Text>
      )}
      {activeBlocks.map(block => {
        const isSelected = selected?.id === block.id;
        return (
          <Pressable
            key={block.id}
            style={[styles.blockRow, isSelected && styles.blockRowSelected]}
            onPress={() => onSelect(isSelected ? null : block)}
          >
            <BlockThumbnail uri={block.coverPhotoUrl ?? null} />
            <View style={[styles.statusDot, { backgroundColor: statusColor(block.plantingStatus) }]} />
            <View style={styles.blockInfo}>
              <Text style={[styles.blockName, isSelected && styles.blockNameSelected]}>
                {block.blockName}
                {block.blockRef ? <Text style={styles.blockRef}> · {block.blockRef}</Text> : null}
              </Text>
              {block.variety ? (
                <Text style={styles.blockMeta}>
                  {block.variety}{block.rootstock ? ` / ${block.rootstock}` : ""}
                  {block.areaHa ? ` · ${Number(block.areaHa).toFixed(2)} ha` : ""}
                </Text>
              ) : null}
            </View>
            {isSelected && <Feather name="check" size={16} color={colors.primary} />}
          </Pressable>
        );
      })}

      {suspendedBlocks.length > 0 && (
        <>
          <Text style={[styles.groupLabel, { marginTop: spacing.sm }]}>Suspended</Text>
          {suspendedBlocks.map(block => {
            const isSelected = selected?.id === block.id;
            return (
              <Pressable
                key={block.id}
                style={[styles.blockRow, styles.blockRowSuspended, isSelected && styles.blockRowSelected]}
                onPress={() => onSelect(isSelected ? null : block)}
              >
                <BlockThumbnail uri={block.coverPhotoUrl ?? null} />
                <View style={[styles.statusDot, { backgroundColor: statusColor(block.plantingStatus) }]} />
                <View style={styles.blockInfo}>
                  <Text style={[styles.blockName, isSelected && styles.blockNameSelected]}>
                    {block.blockName}
                    <Text style={{ color: colors.warning ?? "#d97706" }}> (Suspended)</Text>
                  </Text>
                  {block.variety ? (
                    <Text style={styles.blockMeta}>
                      {block.variety}{block.areaHa ? ` · ${Number(block.areaHa).toFixed(2)} ha` : ""}
                    </Text>
                  ) : null}
                </View>
                {isSelected && <Feather name="check" size={16} color={colors.primary} />}
              </Pressable>
            );
          })}
        </>
      )}

      {selected && (
        <Pressable style={styles.clearRow} onPress={() => onSelect(null)}>
          <Feather name="x" size={14} color={colors.textSecondary} />
          <Text style={styles.clearText}>Clear selection</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.xs },
  loadingText: { fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: fonts.regular },
  groupLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  blockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  blockRowSelected: {
    borderColor: colors.primary,
    backgroundColor: "#ede9fe",
  },
  blockRowSuspended: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.sm,
    overflow: "hidden",
    flexShrink: 0,
  },
  thumbImage: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  thumbPlaceholder: {
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blockInfo: { flex: 1 },
  blockName: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  blockNameSelected: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  blockRef: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  blockMeta: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  clearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 4,
  },
  clearText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
});
