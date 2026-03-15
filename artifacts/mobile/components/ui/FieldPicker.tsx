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
import type { ApiField } from "@/lib/hooks/useApiFields";

interface FieldPickerProps {
  value: string;
  onChange: (name: string) => void;
  fields: ApiField[];
  loading: boolean;
  error: string | null;
  label?: string;
}

export function FieldPicker({ value, onChange, fields, loading, error, label = "Field" }: FieldPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? fields.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : fields;

  const select = (name: string) => {
    Haptics.selectionAsync();
    onChange(name);
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
          <Feather name="map-pin" size={15} color={value ? colors.primary : colors.textSecondary} />
          <Text style={[styles.selectorText, !value && styles.selectorPlaceholder]} numberOfLines={1}>
            {value || "Select a field…"}
          </Text>
          {loading
            ? <ActivityIndicator size="small" color={colors.textSecondary} />
            : <Feather name="chevron-down" size={16} color={colors.textSecondary} />
          }
        </Pressable>
        {error && (
          <Text style={styles.errorText}>Could not load fields — you can type the name manually below.</Text>
        )}
      </View>

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalOpen(false)}>
        <View style={[styles.modal, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Field</Text>
            <Pressable onPress={() => { setModalOpen(false); setSearch(""); }} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search fields…"
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

          {loading ? (
            <View style={styles.centre}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.centreText}>Loading fields…</Text>
            </View>
          ) : fields.length === 0 ? (
            <View style={styles.centre}>
              <Feather name="map" size={40} color={colors.border} />
              <Text style={styles.centreTitle}>No fields registered</Text>
              <Text style={styles.centreText}>Add your fields in the web dashboard under Fields & Crops, then they will appear here.</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.centre}>
              <Text style={styles.centreText}>No fields match "{search}"</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => select(item.name)}
                  style={[styles.fieldRow, item.name === value && styles.fieldRowSelected]}
                >
                  <View style={[styles.fieldIcon, item.name === value && styles.fieldIconSelected]}>
                    <Feather name="map-pin" size={14} color={item.name === value ? colors.textInverse : colors.primary} />
                  </View>
                  <View style={styles.fieldInfo}>
                    <Text style={[styles.fieldName, item.name === value && styles.fieldNameSelected]}>
                      {item.name}
                    </Text>
                    {(item.soilType || item.areaSqMetres) && (
                      <Text style={styles.fieldMeta}>
                        {[
                          item.soilType,
                          item.areaSqMetres ? `${(item.areaSqMetres / 10000).toFixed(2)} ha` : null,
                        ].filter(Boolean).join(" · ")}
                      </Text>
                    )}
                  </View>
                  {item.name === value && (
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
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectorEmpty: {
    borderStyle: "dashed",
  },
  selectorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  selectorPlaceholder: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    padding: 0,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldRowSelected: {
    borderColor: colors.primary,
    backgroundColor: "#f0fdf4",
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldIconSelected: {
    backgroundColor: colors.primary,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  fieldNameSelected: {
    color: colors.primary,
  },
  fieldMeta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  centreTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: "center",
  },
  centreText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
