import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

export interface LookupOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface LookupPickerProps {
  label: string;
  value: string;
  onSelect: (id: string, label: string) => void;
  options: LookupOption[];
  placeholder?: string;
  allowFreeText?: boolean;
  syncedMinsAgo?: number | null;
  emptyMessage?: string;
  required?: boolean;
  icon?: keyof typeof Feather.glyphMap;
}

export function LookupPicker({
  label,
  value,
  onSelect,
  options,
  placeholder = "Select or search…",
  allowFreeText = true,
  syncedMinsAgo,
  emptyMessage = "No items cached yet — sync when online to populate.",
  required,
  icon = "list",
}: LookupPickerProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [freeTextValue, setFreeTextValue] = useState("");
  const [freeTextMode, setFreeTextMode] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSearch("");
      setFreeTextMode(false);
      setFreeTextValue("");
    }
  }, [visible]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, search]);

  const syncLabel =
    syncedMinsAgo === null || syncedMinsAgo === undefined
      ? "Not yet synced"
      : syncedMinsAgo < 1
        ? "Synced just now"
        : syncedMinsAgo < 60
          ? `Synced ${syncedMinsAgo}m ago`
          : `Synced ${Math.floor(syncedMinsAgo / 60)}h ago`;

  const hasOptions = options.length > 0;

  function handleSelect(id: string, lbl: string) {
    onSelect(id, lbl);
    setVisible(false);
  }

  function handleFreeTextConfirm() {
    const trimmed = freeTextValue.trim();
    if (trimmed) {
      onSelect("__manual__", trimmed);
    }
    setVisible(false);
  }

  return (
    <>
      <Pressable
        style={[styles.trigger, value ? styles.triggerFilled : null]}
        onPress={() => setVisible(true)}
      >
        <Feather
          name={icon}
          size={14}
          color={value ? colors.text : colors.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.triggerText, !value && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        {value ? (
          <Pressable
            hitSlop={8}
            onPress={(e) => {
              e.stopPropagation();
              onSelect("", "");
            }}
            style={{ padding: 2 }}
          >
            <Feather name="x" size={14} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <Feather name="chevron-down" size={14} color={colors.textSecondary} />
        )}
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setVisible(false)} hitSlop={8}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          {hasOptions && !freeTextMode && (
            <View style={styles.searchRow}>
              <Feather name="search" size={14} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search…"
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
                autoFocus={Platform.OS !== "web"}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Feather name="x" size={13} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          )}

          {freeTextMode ? (
            <View style={styles.freeTextArea}>
              <Text style={styles.freeTextLabel}>Enter value manually</Text>
              <TextInput
                style={styles.freeTextInput}
                placeholder="Type here…"
                placeholderTextColor={colors.textSecondary}
                value={freeTextValue}
                onChangeText={setFreeTextValue}
                autoFocus
              />
              <View style={styles.freeTextActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setFreeTextMode(false)}
                >
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    !freeTextValue.trim() && styles.confirmBtnDisabled,
                  ]}
                  onPress={handleFreeTextConfirm}
                  disabled={!freeTextValue.trim()}
                >
                  <Text style={styles.confirmBtnText}>Use This</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : !hasOptions ? (
            <View style={styles.emptyState}>
              <Feather name="wifi-off" size={28} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No data cached</Text>
              <Text style={styles.emptyMsg}>{emptyMessage}</Text>
              {allowFreeText && (
                <TouchableOpacity
                  style={styles.manualEntryBtn}
                  onPress={() => setFreeTextMode(true)}
                >
                  <Feather name="edit-2" size={13} color="#fff" />
                  <Text style={styles.manualEntryBtnText}>Enter Manually</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(o) => o.id}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>
                    No matches for "{search}"
                  </Text>
                </View>
              }
              ListFooterComponent={
                <View style={styles.footer}>
                  {allowFreeText && (
                    <TouchableOpacity
                      style={styles.manualRow}
                      onPress={() => setFreeTextMode(true)}
                    >
                      <Feather name="edit-2" size={13} color="#059669" />
                      <Text style={styles.manualRowText}>
                        Enter manually (not in list)
                      </Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.syncLabel}>
                    <Feather name="refresh-cw" size={10} /> {syncLabel}
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => handleSelect(item.id, item.label)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    {item.sublabel ? (
                      <Text style={styles.optionSublabel}>{item.sublabel}</Text>
                    ) : null}
                  </View>
                  {value === item.label && (
                    <Feather name="check" size={15} color="#059669" />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.background,
    gap: 4,
    minHeight: 42,
  },
  triggerFilled: {
    borderColor: "#059669",
    backgroundColor: "#f0fdf4",
  },
  triggerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  triggerPlaceholder: {
    color: colors.textSecondary,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    margin: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  list: {
    flex: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  optionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  optionSublabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  manualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.sm,
  },
  manualRowText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#059669",
  },
  syncLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  noResults: {
    padding: spacing.lg,
    alignItems: "center",
  },
  noResultsText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyMsg: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  manualEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: "#059669",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  manualEntryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  freeTextArea: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  freeTextLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  freeTextInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  freeTextActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#059669",
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
});
