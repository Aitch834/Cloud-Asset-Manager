import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Platform } from "react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { kvGet, kvSet } from "@/lib/database";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { ThirdPartyGrainOutloadingMobile } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { grainOutloadingDocketHtml } from "@/lib/printTemplates";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SS = await import("expo-secure-store");
      const t = await SS.getItemAsync("auth_session_token");
      if (t) return t;
    } else {
      try { const t = localStorage.getItem("auth_session_token"); if (t) return t; } catch { }
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) { const f = JSON.parse(raw); return f.tenantSlug || f.slug || ""; }
  } catch { }
  return "";
}

interface ActiveIntake {
  id: number;
  lotReference: string | null;
  customerName: string;
  commodity: string;
  intakeDate: string;
  quantityTonnes: string;
  bayOrBin: string | null;
}

const MOVEMENT_TYPES = [
  { key: "outloading" as const, label: "Outloading" },
  { key: "sample" as const, label: "Sample" },
  { key: "return" as const, label: "Return to Customer" },
  { key: "transfer" as const, label: "Internal Transfer" },
];

type MovementType = "outloading" | "sample" | "return" | "transfer";
type TransportBy = "customer" | "holding";

export default function ThirdPartyGrainOutloadingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [intakes, setIntakes] = useState<ActiveIntake[]>([]);
  const [loadingIntakes, setLoadingIntakes] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const [selectedIntake, setSelectedIntake] = useState<ActiveIntake | null>(null);
  const [manualLotRef, setManualLotRef] = useState("");
  const [manualCustomerName, setManualCustomerName] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [movementDate, setMovementDate] = useState(today);
  const [movementType, setMovementType] = useState<MovementType>("outloading");
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [haulier, setHaulier] = useState("");
  const [transportArrangedBy, setTransportArrangedBy] = useState<TransportBy>("customer");
  const [deliveryNoteRef, setDeliveryNoteRef] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedBy, setRecordedBy] = useState(user?.name ?? "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);

  useEffect(() => {
    if (!currentFarm?.id) return;
    const cacheKey = `active_grain_intakes_${currentFarm.id}`;

    (async () => {
      try {
        const cached = await kvGet(cacheKey);
        if (cached) {
          const parsed: ActiveIntake[] = JSON.parse(cached);
          if (parsed.length > 0) setIntakes(parsed);
        }
      } catch { }

      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      if (!apiDomain) { setIsOffline(true); setLoadingIntakes(false); return; }

      try {
        const [token, slug] = await Promise.all([getAuthToken(), getTenantSlug()]);
        if (!slug) { setIsOffline(true); setLoadingIntakes(false); return; }

        const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(
          `https://${apiDomain}/api/farms/${currentFarm.id}/grain-intakes?status=in_store,partial`,
          { headers },
        );
        if (!res.ok) { setIsOffline(true); setLoadingIntakes(false); return; }

        const data = await res.json() as { records?: ActiveIntake[] };
        const records = data.records ?? [];
        setIntakes(records);
        await kvSet(cacheKey, JSON.stringify(records));
      } catch {
        setIsOffline(true);
      } finally {
        setLoadingIntakes(false);
      }
    })();
  }, [currentFarm?.id]);

  const effectiveLotRef = selectedIntake?.lotReference ?? selectedIntake?.id?.toString() ?? manualLotRef;
  const effectiveCustomerName = selectedIntake?.customerName ?? manualCustomerName;

  const handleSave = async () => {
    const intakeId = selectedIntake?.id ?? null;
    if (!intakeId && !manualLotRef.trim()) {
      Alert.alert("Required", "Please select a grain lot or enter a lot reference manually.");
      return;
    }
    if (!quantityTonnes.trim()) {
      Alert.alert("Required", "Please enter the quantity in tonnes.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: ThirdPartyGrainOutloadingMobile = {
      id: generateId(),
      farmId: currentFarm?.id ? String(currentFarm.id) : "",
      intakeId,
      intakeLotRef: effectiveLotRef,
      intakeCustomerName: effectiveCustomerName,
      movementDate,
      movementType,
      quantityTonnes: quantityTonnes.trim(),
      destination: destination.trim(),
      vehicleReg: vehicleReg.trim(),
      haulier: haulier.trim(),
      transportArrangedBy,
      deliveryNoteRef: deliveryNoteRef.trim(),
      notes: notes.trim(),
      recordedBy: recordedBy.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.THIRD_PARTY_GRAIN_OUTLOADINGS, record);
      await refreshPendingCount();
      const farmName = currentFarm?.name ?? "Unknown Farm";
      Alert.alert(
        "Outloading Recorded",
        intakeId
          ? "Movement saved and queued to sync against the linked lot."
          : "Movement saved offline. Connect to sync — the lot reference will be matched on the server.",
        [
          {
            text: "Print Docket",
            onPress: async () => { await print(grainOutloadingDocketHtml(record, farmName)); router.back(); },
          },
          {
            text: "Share PDF",
            onPress: async () => { await savePdf(grainOutloadingDocketHtml(record, farmName), "Grain Outloading Docket"); router.back(); },
          },
          { text: "Done", onPress: () => router.back() },
        ],
      );
    } catch {
      Alert.alert("Error", "Failed to save outloading record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Grain Outloading</Text>
            <Text style={styles.subtitle}>Record grain leaving customer's lot</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Select Grain Lot *</Text>

          {loadingIntakes ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading active lots…</Text>
            </View>
          ) : isOffline && intakes.length === 0 ? (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color="#92400e" />
              <Text style={styles.offlineText}>
                No connection — enter lot reference manually below
              </Text>
            </View>
          ) : intakes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="package" size={20} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No active lots in store</Text>
              <Text style={styles.emptySubtext}>Book in grain first using the Third-Party Grain Intake form, or enter a reference manually below.</Text>
            </View>
          ) : (
            <>
              {intakes.map((intake) => {
                const isSelected = selectedIntake?.id === intake.id;
                return (
                  <Pressable
                    key={intake.id}
                    style={[styles.intakeCard, isSelected && styles.intakeCardSelected]}
                    onPress={() => setSelectedIntake(isSelected ? null : intake)}
                  >
                    <View style={styles.intakeCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.intakeLotRef}>
                          {intake.lotReference ?? `#${intake.id}`}
                        </Text>
                        <Text style={styles.intakeCustomer}>{intake.customerName}</Text>
                        <Text style={styles.intakeMeta}>
                          {intake.commodity} · {parseFloat(intake.quantityTonnes ?? "0").toFixed(2)}t
                          {intake.bayOrBin ? ` · ${intake.bayOrBin}` : ""}
                        </Text>
                      </View>
                      <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
                        {isSelected && <Feather name="check" size={14} color="#fff" />}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </>
          )}

          {!selectedIntake && (
            <>
              <Text style={styles.manualLabel}>Or enter lot reference manually (offline / unlisted)</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Lot / Batch Ref"
                    value={manualLotRef}
                    onChangeText={setManualLotRef}
                    placeholder="e.g. LOT-2025-001"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Customer Name"
                    value={manualCustomerName}
                    onChangeText={setManualCustomerName}
                    placeholder="e.g. Smith Farm"
                  />
                </View>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Movement Type</Text>
          <View style={styles.chipRow}>
            {MOVEMENT_TYPES.map((m) => (
              <Pressable
                key={m.key}
                style={[styles.chip, movementType === m.key && styles.chipActive]}
                onPress={() => setMovementType(m.key)}
              >
                <Text style={[styles.chipText, movementType === m.key && styles.chipTextActive]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Movement Details</Text>
          <Input
            label="Movement Date"
            maxDate="today"
            value={movementDate}
            onChangeText={setMovementDate}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="Quantity (tonnes) *"
            value={quantityTonnes}
            onChangeText={setQuantityTonnes}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          {movementType === "outloading" && (
            <Input
              label="Destination"
              value={destination}
              onChangeText={setDestination}
              placeholder="e.g. Frontier Agriculture, Ipswich"
            />
          )}
          <Input
            label="Delivery / Uplift Note Ref"
            value={deliveryNoteRef}
            onChangeText={setDeliveryNoteRef}
            placeholder="Document reference number"
          />

          <Text style={styles.sectionTitle}>Transport</Text>
          <Text style={styles.label}>Transport Arranged By</Text>
          <View style={styles.chipRow}>
            {([
              { key: "customer", label: "Customer's Lorry" },
              { key: "holding", label: "We Booked Haulier" },
            ] as { key: TransportBy; label: string }[]).map((opt) => (
              <Pressable
                key={opt.key}
                style={[styles.chip, transportArrangedBy === opt.key && styles.chipActive]}
                onPress={() => setTransportArrangedBy(opt.key)}
              >
                <Text style={[styles.chipText, transportArrangedBy === opt.key && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Vehicle Reg"
                value={vehicleReg}
                onChangeText={setVehicleReg}
                placeholder="e.g. AV23 XYZ"
                autoCapitalize="characters"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Haulier"
                value={haulier}
                onChangeText={setHaulier}
                placeholder="e.g. Smith's Haulage"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sign-off</Text>
          <LookupPicker label="Recorded By" options={staffOptions} value={recordedBy} onSelect={(_id, l) => setRecordedBy(l)} allowFreeText />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Loading condition, any short-loading, issues…"
            multiline
            numberOfLines={3}
          />

          <View style={styles.infoCard}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.infoText}>
              {selectedIntake
                ? `Linked to lot ${selectedIntake.lotReference ?? `#${selectedIntake.id}`} for ${selectedIntake.customerName}. This movement will appear in Farm Services on the dashboard once synced and outloading charges calculated automatically.`
                : "Once synced, the server will match this movement to the correct lot by reference. Outloading charges are calculated automatically from the service agreement."}
            </Text>
          </View>

          <Button
            title={saving ? "Saving…" : "Save Outloading Record"}
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  loadingText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#fcd34d",
    backgroundColor: "#fefce8",
    marginBottom: spacing.sm,
  },
  offlineText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
  emptyCard: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  emptyText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  emptySubtext: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  intakeCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  intakeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "08",
  },
  intakeCardRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  intakeLotRef: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  intakeCustomer: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  intakeMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  selectCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  manualLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    backgroundColor: colors.primary + "08",
    marginTop: spacing.sm,
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.primary, flex: 1, lineHeight: 20 },
  saveButton: { marginTop: spacing.lg },
});
