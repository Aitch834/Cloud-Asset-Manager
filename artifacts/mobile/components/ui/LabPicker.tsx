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
import type { ApiLab } from "@/lib/hooks/useApiLabs";

interface LabPickerProps {
  value: number | null;
  labName: string;
  onChange: (labId: number, labName: string) => void;
  onClear?: () => void;
  labs: ApiLab[];
  loading: boolean;
  fromCache: boolean;
  error: string | null;
  label?: string;
}

export function LabPicker({
  value,
  labName,
  onChange,
  onClear,
  labs,
  loading,
  fromCache,
  error,
  label = "Testing Laboratory",
}: LabPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? labs.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    : labs;

  const select = (lab: ApiLab) => {
    Haptics.selectionAsync();
    onChange(lab.id, lab.name);
    setModalOpen(false);
    setSearch("");
  };

  const displayText = labName || (value ? `Lab #${value}` : null);

  return (
    <>
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Pressable
          onPress={() => { Haptics.selectionAsync(); setModalOpen(true); }}
          style={[styles.selector, !displayText && styles.selectorEmpty]}
        >
          <Feather name="flask" size={15} color={displayText ? colors.primary : colors.textSecondary} />
          <Text style={[styles.selectorText, !displayText && styles.selectorPlaceholder]} numberOfLines={1}>
            {displayText || "Select a laboratory…"}
          </Text>
          {loading
            ? <ActivityIndicator size="small" color={colors.textSecondary} />
            : displayText && onClear
              ? (
                <Pressable onPress={() => { Haptics.selectionAsync(); onClear(); }} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.textSecondary} />
                </Pressable>
              )
              : <Feather name="chevron-down" size={16} color={colors.textSecondary} />
          }
        </Pressable>
        {fromCache && (
          <Text style={styles.cacheNote}>
            <Feather name="wifi-off" size={10} /> Showing cached list — connect to refresh
          </Text>
        )}
      </View>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Laboratory</Text>
            <Pressable onPress={() => { setModalOpen(false); setSearch(""); }} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search laboratories…"
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

          {loading && labs.length === 0 ? (
            <View style={styles.centre}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.centreText}>Loading laboratories…</Text>
            </View>
          ) : labs.length === 0 ? (
            <View style={styles.centre}>
              <Feather name="flask" size={40} color={colors.border} />
              <Text style={styles.centreTitle}>No laboratories registered</Text>
              <Text style={styles.centreText}>
                {error
                  ? "Could not connect to load laboratories. Open the app online to sync your list."
                  : "Add testing laboratories in the web dashboard under Suppliers, then they will appear here."}
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centre}>
              <Text style={styles.centreText}>No laboratories match "{search}"</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => select(item)}
                  style={[styles.itemRow, item.id === value && styles.itemRowSelected]}
                >
                  <View style={[styles.itemIcon, item.id === value && styles.itemIconSelected]}>
                    <Feather name="flask" size={14} color={item.id === value ? colors.textInverse : colors.primary} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.id === value && styles.itemNameSelected]}>
                      {item.name}
                    </Text>
                    {item.accountNumber && (
                      <Text style={styles.itemMeta}>UKAS: {item.accountNumber}</Text>
                    )}
                  </View>
                  {item.id === value && (
                    <Feather name="check" size={16} color={colors.primary} />
                  )}
                </Pressable>
              )}
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
  selector: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selectorEmpty: { borderStyle: "dashed" },
  selectorText: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  selectorPlaceholder: { color: colors.textSecondary, fontFamily: fonts.regular },
  cacheNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs, opacity: 0.7 },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  closeButton: { padding: spacing.xs },
  searchRow: { flexDirection: "row", alignItems: "center", margin: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: spacing.sm },
  searchIcon: { marginRight: 2 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text, padding: 0 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  itemRowSelected: { borderColor: colors.primary, backgroundColor: "#eff6ff" },
  itemIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" },
  itemIconSelected: { backgroundColor: colors.primary },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  itemNameSelected: { color: colors.primary },
  itemMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  centreTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, textAlign: "center" },
  centreText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
});
