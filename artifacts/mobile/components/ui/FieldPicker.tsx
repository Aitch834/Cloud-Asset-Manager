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

import { QrScanModal, type BdeScanResult } from "@/components/ui/QrScanModal";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import type { ApiField } from "@/lib/hooks/useApiFields";

interface FieldPickerProps {
  value: string;
  onChange: (name: string) => void;
  onChangeField?: (field: ApiField) => void;
  fields: ApiField[];
  loading: boolean;
  fromCache?: boolean;
  error: string | null;
  label?: string;
  allowScan?: boolean;
}

export function FieldPicker({
  value,
  onChange,
  onChangeField,
  fields,
  loading,
  fromCache,
  error,
  label = "Field",
  allowScan = true,
}: FieldPickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? fields.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : fields;

  const select = (field: ApiField) => {
    Haptics.selectionAsync();
    onChange(field.name);
    onChangeField?.(field);
    setModalOpen(false);
    setSearch("");
  };

  function handleScanResolved(result: BdeScanResult) {
    const data = result.data as unknown as ApiField;
    const name = (data.name as string) || `Field #${data.id}`;
    onChange(name);
    const matched = fields.find((f) => f.id === (data.id as number));
    onChangeField?.(matched ?? (data as unknown as ApiField));
  }

  return (
    <>
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.selectorRow}>
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

          {allowScan && (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setScanOpen(true); }}
              style={styles.scanBtn}
              hitSlop={6}
            >
              <Feather name="camera" size={18} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {fromCache && (
          <Text style={styles.cacheNote}>Offline — showing cached fields list</Text>
        )}
      </View>

      <QrScanModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onResolved={handleScanResolved}
        entityType="field"
        title="Scan Field QR Code"
      />

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
              <Text style={styles.centreTitle}>No fields available</Text>
              <Text style={styles.centreText}>
                {error
                  ? "Could not connect to load fields. Open the app online to sync your fields list."
                  : "Add your fields in the web dashboard under Fields & Crops, then they will appear here."}
              </Text>
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
                  onPress={() => select(item)}
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
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  selector: {
    flex: 1,
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
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    backgroundColor: colors.primary + "0e",
    alignItems: "center",
    justifyContent: "center",
  },
  cacheNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    opacity: 0.7,
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
