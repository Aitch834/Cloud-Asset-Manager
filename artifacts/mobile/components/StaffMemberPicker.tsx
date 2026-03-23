import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { memberFullName, type ApiFarmMember } from "@/lib/hooks/useApiFarmMembers";

export { memberFullName, type ApiFarmMember };

export function StaffMemberPicker({
  selected,
  onSelect,
  members,
  loading,
  error,
}: {
  selected: ApiFarmMember | null;
  onSelect: (m: ApiFarmMember | null) => void;
  members: ApiFarmMember[];
  loading: boolean;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = members.filter(
    (m) =>
      memberFullName(m).toLowerCase().includes(search.toLowerCase()) ||
      (m.jobTitle ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Pressable
        onPress={() => { setSearch(""); setOpen(true); }}
        style={[styles.pickerButton, error !== null ? styles.pickerButtonError : null]}
      >
        <Feather name="user" size={16} color={selected ? colors.primary : colors.textSecondary} />
        <Text style={[styles.pickerText, selected ? null : styles.pickerPlaceholder]}>
          {loading
            ? "Loading staff…"
            : selected
            ? memberFullName(selected) + (selected.jobTitle ? ` · ${selected.jobTitle}` : "")
            : members.length === 0
            ? "No staff recorded — type a name below"
            : "Select staff member…"}
        </Text>
        <Feather name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>

      {error !== null && (
        <Text style={styles.pickerErrorText}>Could not load staff list. Please type the name below.</Text>
      )}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Staff Member</Text>
            <Pressable onPress={() => setOpen(false)} style={styles.modalClose}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Feather name="search" size={15} color={colors.textSecondary} style={{ marginRight: spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name or job title…"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x-circle" size={15} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="users" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No staff recorded</Text>
              <Text style={styles.emptySubtitle}>
                Add staff members in the dashboard first, or type a name manually in the field below.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={{ paddingBottom: 32 }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.memberRow, selected?.id === item.id ? styles.memberRowActive : null]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {item.firstName[0]}{item.lastName[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{memberFullName(item)}</Text>
                    {item.jobTitle ? (
                      <Text style={styles.memberRole}>{item.jobTitle}</Text>
                    ) : item.farmRole ? (
                      <Text style={styles.memberRole}>{item.farmRole}</Text>
                    ) : null}
                  </View>
                  {selected?.id === item.id && (
                    <Feather name="check-circle" size={18} color={colors.primary} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: colors.textSecondary, padding: spacing.lg }}>
                  No results for &quot;{search}&quot;
                </Text>
              }
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 13 },
  pickerButtonError: { borderColor: colors.error },
  pickerText: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pickerPlaceholder: { color: colors.textTertiary },
  pickerErrorText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.error, marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  modalClose: { padding: spacing.xs },
  searchRow: { flexDirection: "row", alignItems: "center", margin: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  emptyState: { alignItems: "center", padding: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  memberRowActive: { backgroundColor: colors.primary + "08" },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },
  memberName: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  memberRole: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
