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
import type { ApiStorageLocation } from "@/lib/hooks/useApiStorageLocations";

const TYPE_LABELS: Record<string, string> = {
  grain_store: "Grain Store",
  silo: "Silo",
  bin: "Bin",
  temporary: "Temp Heap",
  merchant: "Merchant",
  cold_store: "Cold Store",
  other: "Other",
};

interface StoragePickerProps {
  value: string;
  onChange: (name: string) => void;
  locations: ApiStorageLocation[];
  loading: boolean;
  error: string | null;
  label?: string;
  allowScan?: boolean;
}

export function StoragePicker({
  value,
  onChange,
  locations,
  loading,
  error,
  label = "Storage Destination",
  allowScan = true,
}: StoragePickerProps) {
  const insets = useSafeAreaInsets();
  const [modalOpen, setModalOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? locations.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    : locations;

  const select = (name: string) => {
    Haptics.selectionAsync();
    onChange(name);
    setModalOpen(false);
    setSearch("");
  };

  function handleScanResolved(result: BdeScanResult) {
    const name = (result.data.name as string) || `Store #${result.data.id}`;
    onChange(name);
  }

  const noLocations = !loading && locations.length === 0;

  if (noLocations || error) {
    return (
      <View style={styles.wrapper}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.selectorRow}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="e.g. Home store bin 2, Co-op Dereham"
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={onChange}
          />
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
        {error ? (
          <Text style={styles.hintText}>Using free text — storage locations could not be loaded.</Text>
        ) : (
          <Text style={styles.hintText}>No storage locations set up yet. Add them in the web dashboard, or type here.</Text>
        )}
        <QrScanModal
          visible={scanOpen}
          onClose={() => setScanOpen(false)}
          onResolved={handleScanResolved}
          entityType="storage"
          title="Scan Storage QR Code"
        />
      </View>
    );
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
            <Feather name="database" size={15} color={value ? colors.fieldGold : colors.textSecondary} />
            <Text style={[styles.selectorText, !value && styles.selectorPlaceholder]} numberOfLines={1}>
              {value || "Select storage location…"}
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
      </View>

      <QrScanModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onResolved={handleScanResolved}
        entityType="storage"
        title="Scan Storage QR Code"
      />

      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setModalOpen(false); setSearch(""); }}
      >
        <View style={[styles.modal, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Storage Location</Text>
            <Pressable onPress={() => { setModalOpen(false); setSearch(""); }} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search locations…"
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

          {filtered.length === 0 && search.trim() ? (
            <Pressable style={styles.freeTextRow} onPress={() => select(search.trim())}>
              <Feather name="plus-circle" size={16} color={colors.primary} />
              <Text style={styles.freeTextLabel}>Use "{search.trim()}"</Text>
            </Pressable>
          ) : null}

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => select(item.name)}
                style={[styles.row, item.name === value && styles.rowSelected]}
              >
                <View style={[styles.icon, item.name === value && styles.iconSelected]}>
                  <Feather name="database" size={14} color={item.name === value ? colors.textInverse : colors.fieldGold} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, item.name === value && styles.nameSelected]}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {[
                      TYPE_LABELS[item.type] ?? item.type,
                      item.capacityTonnes ? `${item.capacityTonnes} t cap.` : null,
                      item.locationDescription,
                    ].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                {item.name === value && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </Pressable>
            )}
            ListFooterComponent={
              <Pressable style={styles.freeTextRow} onPress={() => { setModalOpen(false); onChange(search || value); }}>
                <Feather name="edit-3" size={15} color={colors.textSecondary} />
                <Text style={styles.freeTextGrey}>Enter a location not in the list</Text>
              </Pressable>
            }
          />
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
  textInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  freeTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  freeTextLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  freeTextGrey: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  row: {
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
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: "#fffbeb",
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "#fef9c3",
    alignItems: "center",
    justifyContent: "center",
  },
  iconSelected: {
    backgroundColor: colors.fieldGold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  nameSelected: {
    color: colors.primary,
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
