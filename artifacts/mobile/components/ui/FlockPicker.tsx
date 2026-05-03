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
import type { ApiFlock } from "@/lib/hooks/useApiPoultryFlocks";

interface FlockPickerProps {
  value: string;
  onChange: (flockNumber: string) => void;
  onChangeFlock?: (flock: ApiFlock) => void;
  flocks: ApiFlock[];
  loading: boolean;
  fromCache: boolean;
  error: string | null;
  label?: string;
}

export function FlockPicker({
  value,
  onChange,
  onChangeFlock,
  flocks,
  loading,
  fromCache,
  error,
  label = "Flock",
}: FlockPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? flocks.filter(
        (f) =>
          f.flockNumber.toLowerCase().includes(search.toLowerCase()) ||
          f.species.toLowerCase().includes(search.toLowerCase())
      )
    : flocks;

  const select = (flock: ApiFlock) => {
    Haptics.selectionAsync();
    onChange(flock.flockNumber);
    onChangeFlock?.(flock);
    setModalOpen(false);
    setSearch("");
  };

  return (
    <>
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Pressable
          onPress={() => { Haptics.selectionAsync(); setModalOpen(true); }}
          style={[styles.selector, !value && styles.selectorEmpty]}
        >
          <Feather name="feather" size={15} color={value ? "#d97706" : colors.textSecondary} />
          <Text style={[styles.selectorText, !value && styles.selectorPlaceholder]} numberOfLines={1}>
            {value || "Select active flock…"}
          </Text>
          {loading
            ? <ActivityIndicator size="small" color={colors.textSecondary} />
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
            <Text style={styles.modalTitle}>Select Flock</Text>
            <Pressable onPress={() => { setModalOpen(false); setSearch(""); }} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search flocks…"
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

          {loading && flocks.length === 0 ? (
            <View style={styles.centre}>
              <ActivityIndicator size="large" color="#d97706" />
              <Text style={styles.centreText}>Loading flocks…</Text>
            </View>
          ) : flocks.length === 0 ? (
            <View style={styles.centre}>
              <Feather name="feather" size={40} color={colors.border} />
              <Text style={styles.centreTitle}>No active flocks</Text>
              <Text style={styles.centreText}>
                {error
                  ? "Could not connect to load flocks. Open the app online to sync your list."
                  : "Herds and flocks are managed in Livestock → Herds & Animals on the web dashboard."}
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centre}>
              <Text style={styles.centreText}>No flocks match "{search}"</Text>
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
                  style={[styles.itemRow, item.flockNumber === value && styles.itemRowSelected]}
                >
                  <View style={[styles.itemIcon, item.flockNumber === value && styles.itemIconSelected]}>
                    <Feather name="feather" size={14} color={item.flockNumber === value ? colors.textInverse : "#d97706"} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.flockNumber === value && styles.itemNameSelected]}>
                      {item.flockNumber}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {[item.species, item.breed, item.productionSystem].filter(Boolean).join(" · ")}
                    </Text>
                    {item.houseName && (
                      <Text style={styles.itemMeta}>House: {item.houseName}</Text>
                    )}
                    <Text style={styles.itemMeta}>
                      Placed: {item.placementDate ? new Date(item.placementDate).toLocaleDateString("en-GB") : "—"} · {item.placementCount?.toLocaleString()} birds
                    </Text>
                  </View>
                  {item.flockNumber === value && (
                    <Feather name="check" size={16} color="#d97706" />
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
  itemRowSelected: { borderColor: "#d97706", backgroundColor: "#fefce8" },
  itemIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center" },
  itemIconSelected: { backgroundColor: "#d97706" },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  itemNameSelected: { color: "#d97706" },
  itemMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  centreTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, textAlign: "center" },
  centreText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
});
