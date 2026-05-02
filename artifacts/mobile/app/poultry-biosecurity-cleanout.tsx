import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryBiosecurityCleanout } from "@/lib/types";

interface CheckItem {
  key: keyof PoultryBiosecurityCleanout;
  label: string;
  sublabel: string;
  icon: "trash-2" | "wind" | "droplet" | "shield" | "alert-circle" | "check-circle" | "tool" | "settings";
}

const CHECKLIST: CheckItem[] = [
  {
    key: "litterRemoval",
    label: "Litter Removal",
    sublabel: "All litter and manure completely removed from house and surrounds",
    icon: "trash-2",
  },
  {
    key: "dryClean",
    label: "Dry Clean",
    sublabel: "House dry-cleaned — loose organic material removed from surfaces, equipment, ledges",
    icon: "wind",
  },
  {
    key: "prewash",
    label: "Pre-Wash",
    sublabel: "Pre-wet applied to soften remaining organic material before main wash",
    icon: "droplet",
  },
  {
    key: "mainWash",
    label: "Main Wash",
    sublabel: "Full pressure wash of all internal surfaces, feeders, drinkers, and equipment",
    icon: "droplet",
  },
  {
    key: "disinfectantApplied",
    label: "Disinfectant Applied",
    sublabel: "Approved disinfectant applied at correct dilution rate to all surfaces",
    icon: "shield",
  },
  {
    key: "disinfectantContactTimeMet",
    label: "Contact Time Met",
    sublabel: "Disinfectant left for the manufacturer's minimum contact time before flock entry",
    icon: "check-circle",
  },
  {
    key: "fumigationCarriedOut",
    label: "Fumigation",
    sublabel: "House fumigated (formalin/alternatives where required by vet/company protocol)",
    icon: "alert-circle",
  },
  {
    key: "verminControlChecked",
    label: "Vermin Control",
    sublabel: "All rodent bait stations checked, replenished, and records updated. Entry points blocked",
    icon: "alert-circle",
  },
  {
    key: "waterSystemFlushed",
    label: "Water System Flushed & Treated",
    sublabel: "Drinker lines flushed, disinfected, and medication residues cleared",
    icon: "droplet",
  },
  {
    key: "feedSystemCleaned",
    label: "Feed System Cleaned",
    sublabel: "Hoppers, augers, and feed pans emptied and cleaned",
    icon: "settings",
  },
  {
    key: "footbathsSetUp",
    label: "Footbaths Set Up",
    sublabel: "Disinfectant footbaths filled at all entry points with correct product and concentration",
    icon: "shield",
  },
  {
    key: "biosecuritySignsInPlace",
    label: "Biosecurity Signs",
    sublabel: "Biosecurity warning signs displayed at all entry points",
    icon: "alert-circle",
  },
  {
    key: "changeRoomSetUp",
    label: "Change Room Ready",
    sublabel: "PPE, protective clothing and boot wash facilities in place at house entry",
    icon: "shield",
  },
  {
    key: "eggEquipmentCleaned",
    label: "Egg Equipment Cleaned",
    sublabel: "Egg belts, trays, graders and handling equipment washed and disinfected (laying flocks)",
    icon: "tool",
  },
];

export default function PoultryBiosecurityCleanoutScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [houseName, setHouseName] = useState("");
  const [flockRef, setFlockRef] = useState("");
  const [isContractor, setIsContractor] = useState(false);
  const [contractorName, setContractorName] = useState("");
  const [contractorOwnSupplies, setContractorOwnSupplies] = useState(false);
  const [completedBy, setCompletedBy] = useState(user?.name || "");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [primaryDisinfectant, setPrimaryDisinfectant] = useState("");
  const [disinfectantApprovalNumber, setDisinfectantApprovalNumber] = useState("");
  const [dilutionRate, setDilutionRate] = useState("");
  const [contactTimeMinutes, setContactTimeMinutes] = useState("");
  const [downtime, setDowntime] = useState("");
  const [notes, setNotes] = useState("");

  const [checks, setChecks] = useState<Record<string, boolean>>({
    litterRemoval: false,
    dryClean: false,
    prewash: false,
    mainWash: false,
    disinfectantApplied: false,
    disinfectantContactTimeMet: false,
    fumigationCarriedOut: false,
    verminControlChecked: false,
    waterSystemFlushed: false,
    feedSystemCleaned: false,
    footbathsSetUp: false,
    biosecuritySignsInPlace: false,
    changeRoomSetUp: false,
    eggEquipmentCleaned: false,
  });

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = CHECKLIST.length;
  const allDone = completedCount === totalCount;

  const toggleCheck = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  };

  const handleSave = async () => {
    if (!houseName.trim()) {
      Alert.alert("Required", "Please enter the house name or number.");
      return;
    }
    if (!isContractor && !completedBy.trim()) {
      Alert.alert("Required", "Please enter who completed the cleanout.");
      return;
    }
    if (isContractor && !contractorName.trim()) {
      Alert.alert("Required", "Please enter the contractor company name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryBiosecurityCleanout = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      houseName: houseName.trim(),
      cleanoutDate: new Date().toISOString(),
      flockRef: flockRef.trim(),
      supervisedBy: completedBy.trim(),
      completedBy: completedBy.trim(),
      verifiedBy: verifiedBy.trim(),
      isContractor,
      contractorName: contractorName.trim(),
      contractorOwnSupplies,
      primaryDisinfectant: primaryDisinfectant.trim(),
      disinfectantApprovalNumber: disinfectantApprovalNumber.trim(),
      dilutionRate: dilutionRate.trim(),
      contactTimeMinutes: contactTimeMinutes.trim(),
      litterRemoval: !!checks["litterRemoval"],
      dryClean: !!checks["dryClean"],
      prewash: !!checks["prewash"],
      mainWash: !!checks["mainWash"],
      disinfectantApplied: !!checks["disinfectantApplied"],
      disinfectantContactTimeMet: !!checks["disinfectantContactTimeMet"],
      fumigationCarriedOut: !!checks["fumigationCarriedOut"],
      verminControlChecked: !!checks["verminControlChecked"],
      waterSystemFlushed: !!checks["waterSystemFlushed"],
      feedSystemCleaned: !!checks["feedSystemCleaned"],
      footbathsSetUp: !!checks["footbathsSetUp"],
      biosecuritySignsInPlace: !!checks["biosecuritySignsInPlace"],
      changeRoomSetUp: !!checks["changeRoomSetUp"],
      eggEquipmentCleaned: !!checks["eggEquipmentCleaned"],
      downtime: downtime.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_BIOSECURITY_CLEANOUTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert(
      allDone ? "Cleanout Complete" : "Cleanout Saved",
      allDone
        ? `All ${totalCount} biosecurity checks completed for ${houseName.trim()}. Record saved.`
        : `Cleanout saved with ${completedCount}/${totalCount} checks completed. You can update this record once remaining steps are done.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Poultry Cleanout Biosecurity</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / totalCount) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {completedCount} of {totalCount} steps completed
          </Text>

          {/* House Details */}
          <View style={styles.sectionLabel}>
            <Feather name="home" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>House Details</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="House Name / Number"
              placeholder="e.g. House 1, North Unit"
              value={houseName}
              onChangeText={setHouseName}
              containerStyle={styles.flex}
            />
            <Input
              label="Flock / Batch Ref"
              placeholder="e.g. FL-2025-04"
              value={flockRef}
              onChangeText={setFlockRef}
              containerStyle={styles.flex}
            />
          </View>

          {/* Carried Out By toggle */}
          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Carried Out By</Text>
          </View>
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, !isContractor && styles.toggleBtnActiveGreen]}
              onPress={() => { Haptics.selectionAsync(); setIsContractor(false); }}
            >
              <Feather name="user" size={14} color={!isContractor ? "#fff" : colors.textSecondary} />
              <Text style={[styles.toggleBtnText, !isContractor && styles.toggleBtnTextActive]}>Farm Staff</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, isContractor && styles.toggleBtnActiveAmber]}
              onPress={() => { Haptics.selectionAsync(); setIsContractor(true); }}
            >
              <Feather name="tool" size={14} color={isContractor ? "#fff" : colors.textSecondary} />
              <Text style={[styles.toggleBtnText, isContractor && styles.toggleBtnTextActive]}>Contractor</Text>
            </Pressable>
          </View>

          {isContractor ? (
            <>
              <Input
                label="Contractor Company Name"
                placeholder="e.g. AgriClean Services Ltd"
                value={contractorName}
                onChangeText={setContractorName}
              />
              <Pressable
                style={[styles.checkboxRow, contractorOwnSupplies && styles.checkboxRowActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setContractorOwnSupplies(!contractorOwnSupplies); }}
              >
                <View style={[styles.smallCheckbox, contractorOwnSupplies && styles.smallCheckboxDone]}>
                  {contractorOwnSupplies && <Feather name="check" size={12} color="#fff" />}
                </View>
                <View style={styles.checkboxTextWrap}>
                  <Text style={styles.checkboxLabel}>Contractor supplied their own materials</Text>
                  <Text style={styles.checkboxSub}>Disinfectants, chemicals and PPE supplied by the contractor</Text>
                </View>
              </Pressable>
              <View style={styles.row}>
                <Input
                  label="Verified By"
                  placeholder="Farm supervisor name"
                  value={verifiedBy}
                  onChangeText={setVerifiedBy}
                  containerStyle={styles.flex}
                />
                <Input
                  label="Downtime (days)"
                  placeholder="e.g. 14"
                  value={downtime}
                  onChangeText={setDowntime}
                  keyboardType="number-pad"
                  containerStyle={styles.flex}
                />
              </View>
            </>
          ) : (
            <View style={styles.row}>
              <Input
                label="Completed By"
                value={completedBy}
                onChangeText={setCompletedBy}
                placeholder="Name"
                containerStyle={styles.flex}
              />
              <Input
                label="Verified By"
                placeholder="Supervisor name"
                value={verifiedBy}
                onChangeText={setVerifiedBy}
                containerStyle={styles.flex}
              />
            </View>
          )}

          {!isContractor && (
            <Input
              label="Downtime (days)"
              placeholder="e.g. 14"
              value={downtime}
              onChangeText={setDowntime}
              keyboardType="number-pad"
            />
          )}

          {/* Disinfectant Details */}
          <View style={styles.sectionLabel}>
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Primary Disinfectant</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Disinfectant Used"
              placeholder="e.g. Virkon S, Stalosan F"
              value={primaryDisinfectant}
              onChangeText={setPrimaryDisinfectant}
              containerStyle={styles.flex}
            />
            <Input
              label="DEFRA Approval No."
              placeholder="e.g. UK-BA-2019-0012"
              value={disinfectantApprovalNumber}
              onChangeText={setDisinfectantApprovalNumber}
              containerStyle={styles.flex}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Dilution Rate"
              placeholder="e.g. 1:100"
              value={dilutionRate}
              onChangeText={setDilutionRate}
              containerStyle={styles.flex}
            />
            <Input
              label="Contact Time (mins)"
              placeholder="e.g. 30"
              value={contactTimeMinutes}
              onChangeText={setContactTimeMinutes}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
          </View>

          {/* Biosecurity Checklist */}
          <View style={styles.sectionLabel}>
            <Feather name="check-square" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Biosecurity Checklist</Text>
          </View>

          {CHECKLIST.map((item) => {
            const done = !!checks[item.key as string];
            return (
              <Pressable
                key={item.key as string}
                onPress={() => toggleCheck(item.key as string)}
                style={[styles.checkRow, done && styles.checkRowDone]}
              >
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done && <Feather name="check" size={14} color={colors.textInverse} />}
                </View>
                <View style={styles.checkText}>
                  <Text style={[styles.checkLabel, done && styles.checkLabelDone]}>{item.label}</Text>
                  <Text style={styles.checkSub}>{item.sublabel}</Text>
                </View>
              </Pressable>
            );
          })}

          {/* Notes */}
          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input
            label="Additional Notes"
            placeholder="Any issues encountered, deviations from protocol, remedial actions taken..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title={allDone ? "Save Complete Cleanout Record" : "Save Partial Record"}
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", gap: spacing.md },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleBtnActiveGreen: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  toggleBtnActiveAmber: {
    backgroundColor: "#d97706",
    borderColor: "#d97706",
  },
  toggleBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  toggleBtnTextActive: {
    color: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  checkboxRowActive: {
    borderColor: colors.primary,
    backgroundColor: "#eff6ff",
  },
  smallCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  smallCheckboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTextWrap: { flex: 1 },
  checkboxLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  checkboxSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  checkRowDone: {
    borderColor: colors.success,
    backgroundColor: "#f0fdf4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkText: { flex: 1 },
  checkLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  checkLabelDone: {
    color: colors.success,
  },
  checkSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
