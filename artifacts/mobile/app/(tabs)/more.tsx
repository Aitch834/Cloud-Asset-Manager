import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListItem } from "@/components/ui/ListItem";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, farms, setCurrentFarm, user } = useFarm();
  const { pendingCount, isSyncing, lastSyncTime, triggerSync } = useSync();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
          </View>
        </View>

        <SectionHeader title="Farm" />
        <View style={styles.section}>
          <ListItem
            title="Current Farm"
            subtitle={currentFarm?.name || "None selected"}
            icon="map-pin"
            iconColor={colors.primary}
            onPress={() => {
              if (farms.length <= 1) return;
              Alert.alert(
                "Switch Farm",
                "Select the farm to manage:",
                farms.map((f) => ({
                  text: f.name,
                  onPress: () => setCurrentFarm(f),
                })),
              );
            }}
          />
          <View style={styles.divider} />
          <ListItem
            title="Sectors"
            subtitle={
              [
                currentFarm?.sectorArable && "Arable",
                currentFarm?.sectorBeef && "Beef",
                currentFarm?.sectorDairy && "Dairy",
                currentFarm?.sectorPigs && "Pigs",
                currentFarm?.sectorPoultry && "Poultry",
              ]
                .filter(Boolean)
                .join(", ") || "None"
            }
            icon="grid"
            showChevron={false}
          />
        </View>

        <SectionHeader title="Sync" />
        <View style={styles.section}>
          <ListItem
            title="Sync Status"
            subtitle={
              isSyncing
                ? "Syncing..."
                : pendingCount > 0
                  ? `${pendingCount} record${pendingCount === 1 ? "" : "s"} pending`
                  : "All records synced"
            }
            icon="refresh-cw"
            iconColor={pendingCount > 0 ? colors.accent : colors.success}
            iconBgColor={pendingCount > 0 ? colors.warningBg : colors.successBg}
            onPress={triggerSync}
            rightElement={
              pendingCount > 0 ? (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                </View>
              ) : undefined
            }
          />
          <View style={styles.divider} />
          <ListItem
            title="Last Synced"
            subtitle={
              lastSyncTime
                ? new Date(lastSyncTime).toLocaleString("en-GB")
                : "Never"
            }
            icon="clock"
            showChevron={false}
          />
        </View>

        <SectionHeader title="App" />
        <View style={styles.section}>
          <ListItem
            title="Offline Mode"
            subtitle="Records are stored locally until synced"
            icon="wifi-off"
            showChevron={false}
          />
          <View style={styles.divider} />
          <ListItem
            title="About BDE Farm Trac"
            subtitle="Version 1.0.0"
            icon="info"
            showChevron={false}
          />
        </View>

        <View style={styles.footer}>
          <Feather name="shield" size={20} color={colors.primaryMuted} />
          <Text style={styles.footerText}>Red Tractor Compliance Platform</Text>
          <Text style={styles.footerSubtext}>bdefarmtrac.co.uk</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  scrollContent: {},
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  profileEmail: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  pendingBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  pendingBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.textInverse,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footerSubtext: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
});
