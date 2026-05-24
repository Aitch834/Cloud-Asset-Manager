import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
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
import type { ApiSprayProduct } from "@/lib/hooks/useApiSprayProducts";

interface SprayProductPickerProps {
  label?: string;
  selected: ApiSprayProduct | null;
  manualName: string;
  onSelect: (product: ApiSprayProduct) => void;
  onManual: (name: string) => void;
  onClear: () => void;
  products: ApiSprayProduct[];
  loading?: boolean;
}

function LerapBadge({ category }: { category: string }) {
  const isA = category === "A";
  return (
    <View style={[styles.lerapBadge, isA ? styles.lerapBadgeA : styles.lerapBadgeB]}>
      <Text style={[styles.lerapBadgeText, isA ? styles.lerapBadgeTextA : styles.lerapBadgeTextB]}>
        LERAP {category}
      </Text>
    </View>
  );
}

export function SprayProductPicker({
  label = "Product",
  selected,
  manualName,
  onSelect,
  onManual,
  onClear,
  products,
  loading = false,
}: SprayProductPickerProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [freeTextMode, setFreeTextMode] = useState(false);
  const [freeTextValue, setFreeTextValue] = useState("");

  const displayValue = selected ? selected.productName : manualName;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.activeIngredient?.toLowerCase().includes(q) ||
        p.manufacturer?.toLowerCase().includes(q),
    );
  }, [products, search]);

  function handleSelect(product: ApiSprayProduct) {
    onSelect(product);
    setSearch("");
    setFreeTextMode(false);
    setVisible(false);
  }

  function handleFreeTextConfirm() {
    const trimmed = freeTextValue.trim();
    if (trimmed) {
      onManual(trimmed);
      setFreeTextValue("");
    }
    setFreeTextMode(false);
    setVisible(false);
  }

  function handleClose() {
    setSearch("");
    setFreeTextMode(false);
    setFreeTextValue("");
    setVisible(false);
  }

  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={[styles.trigger, displayValue ? styles.triggerFilled : null]}
        onPress={() => setVisible(true)}
      >
        <Feather
          name="droplet"
          size={14}
          color={displayValue ? colors.info : colors.textSecondary}
          style={{ marginRight: 6 }}
        />
        <Text
          style={[styles.triggerText, !displayValue && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {displayValue || "Select from product register…"}
        </Text>
        {displayValue ? (
          <Pressable
            hitSlop={8}
            onPress={(e) => { e.stopPropagation(); onClear(); }}
            style={{ padding: 2 }}
          >
            <Feather name="x" size={14} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <Feather name="chevron-down" size={14} color={colors.textSecondary} />
        )}
      </Pressable>
      {manualName && !selected && (
        <Text style={styles.manualHint}>
          <Feather name="edit-2" size={11} /> Entered manually — not in product register
        </Text>
      )}

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select Product</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          {!freeTextMode && products.length > 0 && (
            <View style={styles.searchRow}>
              <Feather name="search" size={14} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, ingredient, manufacturer…"
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
              <Text style={styles.freeTextLabel}>Enter product name manually</Text>
              <TextInput
                style={styles.freeTextInput}
                placeholder="e.g. Roundup, Kerb Flo 500"
                placeholderTextColor={colors.textSecondary}
                value={freeTextValue}
                onChangeText={setFreeTextValue}
                autoFocus
              />
              <View style={styles.freeTextActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setFreeTextMode(false)}>
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, !freeTextValue.trim() && styles.confirmBtnDisabled]}
                  onPress={handleFreeTextConfirm}
                  disabled={!freeTextValue.trim()}
                >
                  <Text style={styles.confirmBtnText}>Use This</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={28} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>
                {loading ? "Loading products…" : "No products cached"}
              </Text>
              <Text style={styles.emptyMsg}>
                {loading
                  ? "Please wait"
                  : "No products found in the spray product register. Add products in the dashboard, or enter manually below."}
              </Text>
              <TouchableOpacity style={styles.manualEntryBtn} onPress={() => setFreeTextMode(true)}>
                <Feather name="edit-2" size={13} color="#fff" />
                <Text style={styles.manualEntryBtnText}>Enter Manually</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(p) => String(p.id)}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No matches for "{search}"</Text>
                </View>
              }
              ListFooterComponent={
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.manualRow} onPress={() => setFreeTextMode(true)}>
                    <Feather name="edit-2" size={13} color={colors.info} />
                    <Text style={styles.manualRowText}>Enter manually (not in register)</Text>
                  </TouchableOpacity>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.productRow, selected?.id === item.id && styles.productRowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.productInfo}>
                    <View style={styles.productNameRow}>
                      <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
                      {item.lerapCategory ? <LerapBadge category={item.lerapCategory} /> : null}
                    </View>
                    {(item.activeIngredient || item.manufacturer || item.category) ? (
                      <Text style={styles.productMeta} numberOfLines={1}>
                        {[item.activeIngredient, item.manufacturer, item.category]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    ) : null}
                  </View>
                  {selected?.id === item.id && (
                    <Feather name="check" size={16} color={colors.primary} />
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
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
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
    marginBottom: spacing.md,
  },
  triggerFilled: {
    borderColor: colors.info,
    backgroundColor: colors.infoBg,
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
  manualHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
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
  list: { flex: 1 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  productRowSelected: {
    backgroundColor: "#f0fdf4",
  },
  productInfo: { flex: 1 },
  productNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  productName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flexShrink: 1,
  },
  productMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lerapBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lerapBadgeA: { backgroundColor: "#FEE2E2" },
  lerapBadgeB: { backgroundColor: "#FEF3C7" },
  lerapBadgeText: { fontFamily: fonts.semiBold, fontSize: 10 },
  lerapBadgeTextA: { color: "#DC2626" },
  lerapBadgeTextB: { color: "#D97706" },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    color: colors.info,
  },
  noResults: { padding: spacing.lg, alignItems: "center" },
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
    backgroundColor: colors.info,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  manualEntryBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  freeTextArea: { flex: 1, padding: spacing.md, gap: spacing.md },
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
    backgroundColor: colors.info,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
});
