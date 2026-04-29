import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SectionList,
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

type Section = {
  title: string;
  colour: string | null;
  data: ApiFarmMember[];
};

function buildSections(members: ApiFarmMember[], search: string): Section[] {
  const lower = search.toLowerCase();
  const filtered = members.filter(
    (m) =>
      memberFullName(m).toLowerCase().includes(lower) ||
      (m.jobTitle ?? "").toLowerCase().includes(lower) ||
      (m.departmentName ?? "").toLowerCase().includes(lower)
  );

  // Check if any member has a department
  const hasDepts = filtered.some((m) => m.departmentName);

  if (!hasDepts) {
    return [{ title: "", colour: null, data: filtered }];
  }

  // Group by department
  const map = new Map<string, { colour: string | null; members: ApiFarmMember[] }>();
  for (const m of filtered) {
    const key = m.departmentName ?? "No Department";
    if (!map.has(key)) map.set(key, { colour: m.departmentColour ?? null, members: [] });
    map.get(key)!.members.push(m);
  }

  const sections: Section[] = Array.from(map.entries())
    .sort(([a], [b]) => {
      if (a === "No Department") return 1;
      if (b === "No Department") return -1;
      return a.localeCompare(b);
    })
    .map(([title, { colour, members }]) => ({ title, colour, data: members }));

  return sections;
}

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

  const hasDepts = members.some((m) => m.departmentName);
  const sections = useMemo(() => buildSections(members, search), [members, search]);
  const totalFiltered = sections.reduce((n, s) => n + s.data.length, 0);

  return (
    <>
      <Pressable
        onPress={() => { setSearch(""); setOpen(true); }}
        style={[styles.pickerButton, error !== null ? styles.pickerButtonError : null]}
      >
        <Feather name="user" size={16} color={selected ? colors.primary : colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.pickerText, selected ? null : styles.pickerPlaceholder]}>
            {loading
              ? "Loading staff…"
              : selected
              ? memberFullName(selected)
              : members.length === 0
              ? "No staff recorded — type a name below"
              : "Select staff member…"}
          </Text>
          {selected && (selected.departmentName || selected.jobTitle) && (
            <Text style={styles.pickerSub}>
              {[selected.departmentName, selected.jobTitle].filter(Boolean).join(" · ")}
            </Text>
          )}
        </View>
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
              placeholder={hasDepts ? "Search by name, job title or department…" : "Search by name or job title…"}
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
            <SectionList
              sections={sections}
              keyExtractor={(m) => String(m.id)}
              contentContainerStyle={{ paddingBottom: 32 }}
              stickySectionHeadersEnabled={hasDepts}
              renderSectionHeader={({ section }) =>
                hasDepts && section.title ? (
                  <View style={styles.sectionHeader}>
                    {section.colour && (
                      <View style={[styles.deptDot, { backgroundColor: section.colour }]} />
                    )}
                    <Text style={styles.sectionHeaderText}>{section.title}</Text>
                  </View>
                ) : null
              }
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.memberRow, selected?.id === item.id ? styles.memberRowActive : null]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <View style={[
                    styles.memberAvatar,
                    item.departmentColour ? { backgroundColor: item.departmentColour + "28" } : null,
                  ]}>
                    <Text style={[
                      styles.memberAvatarText,
                      item.departmentColour ? { color: item.departmentColour } : null,
                    ]}>
                      {item.firstName[0]}{item.lastName[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{memberFullName(item)}</Text>
                    {(item.jobTitle || item.farmRole) && (
                      <Text style={styles.memberRole}>
                        {item.jobTitle ?? item.farmRole}
                      </Text>
                    )}
                  </View>
                  {selected?.id === item.id && (
                    <Feather name="check-circle" size={18} color={colors.primary} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                totalFiltered === 0 ? (
                  <Text style={{ textAlign: "center", color: colors.textSecondary, padding: spacing.lg }}>
                    No results for &quot;{search}&quot;
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 13,
  },
  pickerButtonError: { borderColor: colors.error },
  pickerText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pickerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  pickerPlaceholder: { color: colors.textTertiary },
  pickerErrorText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.error, marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  modalTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  modalClose: { padding: spacing.xs },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    margin: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 10,
    borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  emptyState: { alignItems: "center", padding: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptySubtitle: {
    fontFamily: fonts.regular, fontSize: fontSize.sm,
    color: colors.textSecondary, textAlign: "center", lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  deptDot: { width: 8, height: 8, borderRadius: 4 },
  sectionHeaderText: {
    fontFamily: fonts.semiBold, fontSize: fontSize.xs,
    color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5,
  },
  memberRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  memberRowActive: { backgroundColor: colors.primary + "08" },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary + "20",
    alignItems: "center", justifyContent: "center",
  },
  memberAvatarText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },
  memberName: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  memberRole: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
