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
import type { ApiHerd } from "@/lib/hooks/useApiHerds";

interface SmallRuminantPickerProps {
  species: "sheep" | "goat";
  value: string;
  onChange: (name: string) => void;
  onChangeFlock?: (flock: ApiHerd) => void;
  flocks: ApiHerd[];
  loading: boolean;
  fromCache: boolean;
  error: string | null;
  label?: string;
}

const SPECIES_CONFIG = {
  sheep: {
    accentColor: "#16a34a",
    accentBg: "#dcfce7",
    accentBgSelected: "#f0fdf4",
    emptyIcon: "feather" as const,
    emptyTitle: "No sheep flocks registered",
    emptyHint: "Add your sheep flocks in the web dashboard under Livestock → Herd & Flock Register.",
    placeholder: "Select sheep flock…",
    searchPlaceholder: "Search sheep flocks…",
    modalTitle: "Select Sheep Flock",
    noun: "flock",
  },
  goat: {
    accentColor: "#0891b2",
    accentBg: "#cffafe",
    accentBgSelected: "#f0fdff",
    emptyIcon: "circle" as const,
    emptyTitle: "No goat herds registered",
    emptyHint: "Add your goat herds in the web dashboard under Livestock → Herd & Flock Register.",
    placeholder: "Select goat herd…",
    searchPlaceholder: "Search goat herds…",
    modalTitle: "Select Goat Herd",
    noun: "herd",
  },
} as const;

export function SmallRuminantPicker({
  species,
  value,
  onChange,
  onChangeFlock,
  flocks,
  loading,
  fromCache,
  error,
  label,
}: SmallRuminantPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const cfg = SPECIES_CONFIG[species];

  const filtered = search.trim()
    ? flocks.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          (f.breed ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (f.herdNumber ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : flocks;

  const select = (flock: ApiHerd) => {
    Haptics.selectionAsync();
    onChange(flock.name);
    onChangeFlock?.(flock);
    setModalOpen(false);
    setSearch("");
  };

  const defaultLabel = species === "sheep" ? "Flock / Group" : "Herd / Group";

  return (
    <>
      <View style={styles.wrapper}>
        {(label ?? defaultLabel) ? (
          <Text style={styles.label}>{label ?? defaultLabel}</Text>
        ) : null}
        <Pressable
          onPress={() => { Haptics.selectionAsync(); setModalOpen(true); }}
          style={[styles.selector, !value && styles.selectorEmpty]}
        >
          <Feather
            name="users"
            size={15}
            color={value ? cfg.accentColor : colors.textSecondary}
          />
          <Text
            style={[styles.selectorText, !value && styles.selectorPlaceholder]}
            numberOfLines={1}
          >
            {value || cfg.placeholder}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Feather name="chevron-down" size={16} color={colors.textSecondary} />
          )}
        </Pressable>
        {fromCache && (
          <Text style={styles.cacheNote}>
            <Feather name="wifi-off" size={10} /> Showing cached list — connect to refresh
          </Text>
        )}
      </View>

      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={[styles.modal, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{cfg.modalTitle}</Text>
            <Pressable
              onPress={() => { setModalOpen(false); setSearch(""); }}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={cfg.searchPlaceholder}
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
              <ActivityIndicator size="large" color={cfg.accentColor} />
              <Text style={styles.centreText}>
                Loading {cfg.noun}s…
              </Text>
            </View>
          ) : flocks.length === 0 ? (
            <View style={styles.centre}>
              <Feather name={cfg.emptyIcon} size={40} color={colors.border} />
              <Text style={styles.centreTitle}>{cfg.emptyTitle}</Text>
              <Text style={styles.centreText}>
                {error
                  ? `Could not connect to load ${cfg.noun}s. Open the app online to sync your list.`
                  : cfg.emptyHint}
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centre}>
              <Text style={styles.centreText}>No {cfg.noun}s match "{search}"</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.name === value;
                return (
                  <Pressable
                    onPress={() => select(item)}
                    style={[
                      styles.itemRow,
                      selected && { borderColor: cfg.accentColor, backgroundColor: cfg.accentBgSelected },
                    ]}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: cfg.accentBg },
                        selected && { backgroundColor: cfg.accentColor },
                      ]}
                    >
                      <Feather
                        name="users"
                        size={14}
                        color={selected ? colors.textInverse : cfg.accentColor}
                      />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text
                        style={[
                          styles.itemName,
                          selected && { color: cfg.accentColor },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {(item.type || item.breed) && (
                        <Text style={styles.itemMeta}>
                          {[item.type, item.breed].filter(Boolean).join(" · ")}
                        </Text>
                      )}
                      {item.herdNumber && (
                        <Text style={styles.itemMeta}>
                          {species === "sheep" ? "Flock No" : "Herd No"}: {item.herdNumber}
                        </Text>
                      )}
                    </View>
                    {selected && (
                      <Feather name="check" size={16} color={cfg.accentColor} />
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
  itemIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  itemMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  centreTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, textAlign: "center" },
  centreText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
});
