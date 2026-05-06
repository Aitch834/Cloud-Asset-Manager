import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import type { ApiStraw } from "@/lib/hooks/useApiStraws";

interface StrawPickerProps {
  value: string;
  onChange: (batchNumber: string) => void;
  onChangeStraw?: (straw: ApiStraw) => void;
  straws: ApiStraw[];
  loading: boolean;
  fromCache: boolean;
  error: string | null;
  label?: string;
}

export function StrawPicker({
  value,
  onChange,
  onChangeStraw,
  straws,
  loading,
  fromCache,
  error,
  label = "Select from Straw Inventory",
}: StrawPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? straws.filter(
        (s) =>
          s.sireName.toLowerCase().includes(search.toLowerCase()) ||
          s.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
          (s.supplierName ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : straws;

  const select = (straw: ApiStraw) => {
    Haptics.selectionAsync();
    onChange(straw.batchNumber);
    onChangeStraw?.(straw);
    setModalOpen(false);
    setSearch("");
  };

  const clear = () => {
    Haptics.selectionAsync();
    onChange("");
    onChangeStraw?.(undefined as unknown as ApiStraw);
  };

  return (
    <>
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.row}>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setModalOpen(true); }}
            style={[styles.selector, !value && styles.selectorEmpty, { flex: 1 }]}
          >
            <Feather name="package" size={15} color={value ? colors.primary : colors.textSecondary} />
            <Text style={[styles.selectorText, !value && styles.selectorPlaceholder]} numberOfLines={1}>
              {value || "Pick an in-stock batch…"}
            </Text>
            {loading
              ? <ActivityIndicator size="small" color={colors.textSecondary} />
              : <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            }
          </Pressable>
          {value ? (
            <Pressable onPress={clear} style={styles.clearButton}>
              <Feather name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
        {fromCache && (
          <Text style={styles.cacheNote}>Offline — using cached straw list</Text>
        )}
      </View>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Straw Batch</Text>
            <Pressable onPress={() => { setModalOpen(false); setSearch(""); }} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by sire, batch, or supplier…"
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {loading && straws.length === 0 ? (
            <View style={styles.centre}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.centreText}>Loading straw inventory…</Text>
            </View>
          ) : straws.length === 0 ? (
            <View style={styles.centre}>
              <Feather name="package" size={40} color={colors.border} />
              <Text style={styles.centreTitle}>No straws in stock</Text>
              <Text style={styles.centreText}>
                {error
                  ? "Could not connect. Open the app online to sync your inventory."
                  : "Log a delivery in the web dashboard under Livestock → Straw Inventory, then sync."}
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centre}>
              <Text style={styles.centreText}>No batches match "{search}"</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const remaining = item.strawsReceived - (item.strawsUsed ?? 0);
                const isSelected = item.batchNumber === value;
                return (
                  <Pressable
                    onPress={() => select(item)}
                    style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                  >
                    <View style={[styles.itemIcon, isSelected && styles.itemIconSelected]}>
                      <Feather name="package" size={14} color={isSelected ? colors.textInverse : colors.primary} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                        {item.sireName}
                      </Text>
                      <Text style={styles.itemBatch}>{item.batchNumber}</Text>
                      <Text style={styles.itemMeta}>
                        {[item.sireBreed, item.sireSpecies, item.supplierName].filter(Boolean).join(" · ")}
                      </Text>
                      <View style={[styles.stockBadge, remaining <= 2 ? styles.stockLow : styles.stockOk]}>
                        <Text style={[styles.stockText, remaining <= 2 ? styles.stockTextLow : styles.stockTextOk]}>
                          {remaining} straw{remaining !== 1 ? "s" : ""} remaining
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={16} color={colors.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  selector: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selectorEmpty: { borderStyle: "dashed" },
  selectorText: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  selectorPlaceholder: { color: colors.textSecondary, fontFamily: fonts.regular },
  clearButton: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cacheNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs, opacity: 0.7 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  closeButton: { padding: spacing.xs },
  searchRow: { flexDirection: "row", alignItems: "center", margin: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: spacing.sm },
  searchIcon: { marginRight: 2 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text, padding: 0 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  itemRowSelected: { borderColor: colors.primary, backgroundColor: "#f0fdf4" },
  itemIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginTop: 2 },
  itemIconSelected: { backgroundColor: colors.primary },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  itemNameSelected: { color: colors.primary },
  itemBatch: { fontFamily: fonts.regular ?? fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  itemMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  stockBadge: { marginTop: spacing.xs, alignSelf: "flex-start", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  stockOk: { backgroundColor: "#dcfce7" },
  stockLow: { backgroundColor: "#fef3c7" },
  stockText: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  stockTextOk: { color: "#166534" },
  stockTextLow: { color: "#92400e" },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  centreTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, textAlign: "center" },
  centreText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
});
