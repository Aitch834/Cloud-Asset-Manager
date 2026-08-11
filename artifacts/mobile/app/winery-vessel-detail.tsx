import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet, kvSet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";

// ── Auth helpers (mirrored from useApiFetch) ─────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch {}
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      if (raw) token = JSON.parse(raw) as string;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw) as { tenantSlug?: string; slug?: string };
      headers["x-tenant-slug"] = farm.tenantSlug ?? farm.slug ?? "";
    }
  } catch {}
  return headers;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface BarrelFill {
  id: number;
  fill_number: number | null;
  wine_name: string | null;
  vintage_year: number | null;
  variety: string | null;
  volume_litres: number | null;
  fill_date: string | null;
  rack_out_date: string | null;
  batch_ref: string | null;
  operator_name: string | null;
  notes: string | null;
}

interface BarrelMaintenance {
  id: number;
  maintenance_date: string | null;
  work_type: string | null;
  cooperage_name: string | null;
  cost_pence: number | null;
  notes: string | null;
}

interface BarrelMovement {
  id: number;
  moved_date: string | null;
  from_zone: string | null;
  from_position: string | null;
  to_zone: string | null;
  to_position: string | null;
  reason: string | null;
  operator_name: string | null;
  notes: string | null;
}

// ── Hook: fetch all three sub-resources in parallel ───────────────────────────

interface VesselDetail {
  fills: BarrelFill[];
  maintenance: BarrelMaintenance[];
  movements: BarrelMovement[];
}

function useVesselDetail(farmId: string | undefined, vesselId: string | undefined) {
  const [data, setData] = useState<VesselDetail>({ fills: [], maintenance: [], movements: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!farmId || !vesselId) { setLoading(false); return; }
    cancelRef.current = false;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured — check connection settings.");
      const headers = await getAuthHeaders();
      const base = `${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}`;
      const [fillsRes, maintRes, movRes] = await Promise.all([
        fetch(`${base}/fills`, { headers }),
        fetch(`${base}/maintenance`, { headers }),
        fetch(`${base}/movements`, { headers }),
      ]);
      if (!fillsRes.ok || !maintRes.ok || !movRes.ok) throw new Error("Server error loading vessel details.");
      const [fillsJson, maintJson, movJson] = await Promise.all([
        fillsRes.json() as Promise<{ records: BarrelFill[] }>,
        maintRes.json() as Promise<{ records: BarrelMaintenance[] }>,
        movRes.json() as Promise<{ records: BarrelMovement[] }>,
      ]);
      if (!cancelRef.current) {
        setData({
          fills: fillsJson.records ?? [],
          maintenance: maintJson.records ?? [],
          movements: movJson.records ?? [],
        });
      }
    } catch (err) {
      if (!cancelRef.current) setError(err instanceof Error ? err.message : "Failed to load vessel details.");
    } finally {
      if (!cancelRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [farmId, vesselId]);

  useEffect(() => {
    void load();
    return () => { cancelRef.current = true; };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  return { data, loading, refreshing, error, refresh };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pence(p: number | null): string {
  if (p == null) return "—";
  return `£${(p / 100).toFixed(2)}`;
}

// ── Log Movement Form ─────────────────────────────────────────────────────────

interface MovementFormState {
  movedDate: string;
  fromZone: string;
  fromPosition: string;
  toZone: string;
  toPosition: string;
  reason: string;
  operatorName: string;
  notes: string;
}

function todayIso(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

interface LogMovementModalProps {
  visible: boolean;
  farmId: string;
  vesselId: string;
  initialFromZone?: string;
  initialFromPosition?: string;
  onClose: () => void;
  onSuccess: (toZone: string, toPosition: string) => void;
}

function LogMovementModal({ visible, farmId, vesselId, initialFromZone, initialFromPosition, onClose, onSuccess }: LogMovementModalProps) {
  const [form, setForm] = useState<MovementFormState>({
    movedDate: todayIso(),
    fromZone: initialFromZone ?? "",
    fromPosition: initialFromPosition ?? "",
    toZone: "",
    toPosition: "",
    reason: "",
    operatorName: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form each time the modal opens so it picks up the latest from-zone/position
  useEffect(() => {
    if (visible) {
      setForm({
        movedDate: todayIso(),
        fromZone: initialFromZone ?? "",
        fromPosition: initialFromPosition ?? "",
        toZone: "",
        toPosition: "",
        reason: "",
        operatorName: "",
        notes: "",
      });
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function set(field: keyof MovementFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.movedDate.trim()) { setError("Date moved is required."); return; }
    if (!form.toZone.trim()) { setError("To zone is required."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured.");
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}/movements`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          movedDate: form.movedDate.trim(),
          fromZone: form.fromZone.trim() || null,
          fromPosition: form.fromPosition.trim() || null,
          toZone: form.toZone.trim(),
          toPosition: form.toPosition.trim() || null,
          reason: form.reason.trim() || null,
          operatorName: form.operatorName.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      const submittedToZone = form.toZone.trim();
      const submittedToPosition = form.toPosition.trim();
      setForm({ movedDate: todayIso(), fromZone: initialFromZone ?? "", fromPosition: initialFromPosition ?? "", toZone: "", toPosition: "", reason: "", operatorName: "", notes: "" });
      onSuccess(submittedToZone, submittedToPosition);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save movement.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setError(null);
    setError(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={formStyles.sheet}>
          {/* Modal header */}
          <View style={formStyles.sheetHeader}>
            <Text style={formStyles.sheetTitle}>Log Movement</Text>
            <Pressable onPress={handleClose} style={formStyles.closeBtn} disabled={submitting}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={formStyles.body} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={formStyles.errorBanner}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={formStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Date moved */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Date moved <Text style={formStyles.required}>*</Text></Text>
              <TextInput
                style={formStyles.input}
                value={form.movedDate}
                onChangeText={v => set("movedDate", v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
              />
            </View>

            {/* From zone / To zone */}
            <View style={formStyles.row}>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>From zone</Text>
                <TextInput
                  style={formStyles.input}
                  value={form.fromZone}
                  onChangeText={v => set("fromZone", v)}
                  placeholder="e.g. Cave A"
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="next"
                />
              </View>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>To zone <Text style={formStyles.required}>*</Text></Text>
                <TextInput
                  style={formStyles.input}
                  value={form.toZone}
                  onChangeText={v => set("toZone", v)}
                  placeholder="e.g. Cave B"
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* From position / To position */}
            <View style={formStyles.row}>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>From position</Text>
                <TextInput
                  style={formStyles.input}
                  value={form.fromPosition}
                  onChangeText={v => set("fromPosition", v)}
                  placeholder="e.g. Row 1, Bay 4"
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="next"
                />
              </View>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>To position</Text>
                <TextInput
                  style={formStyles.input}
                  value={form.toPosition}
                  onChangeText={v => set("toPosition", v)}
                  placeholder="e.g. Row 3, Bay 2"
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Reason */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Reason</Text>
              <TextInput
                style={formStyles.input}
                value={form.reason}
                onChangeText={v => set("reason", v)}
                placeholder="e.g. Racking, Temperature"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Operator */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Operator name</Text>
              <TextInput
                style={formStyles.input}
                value={form.operatorName}
                onChangeText={v => set("operatorName", v)}
                placeholder="Name of person moving barrel"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Notes */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Notes</Text>
              <TextInput
                style={[formStyles.input, formStyles.multiline]}
                value={form.notes}
                onChangeText={v => set("notes", v)}
                placeholder="Any additional notes…"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                returnKeyType="default"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[formStyles.submitBtn, submitting && formStyles.submitBtnDisabled]}
              onPress={() => { void handleSubmit(); }}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={formStyles.submitBtnText}>Save movement</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Log Maintenance Form ──────────────────────────────────────────────────────

interface MaintenanceFormState {
  maintenanceDate: string;
  workType: string;
  cooperageName: string;
  costPounds: string; // user enters £, we convert to pence
  notes: string;
}

interface LogMaintenanceModalProps {
  visible: boolean;
  farmId: string;
  vesselId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function LogMaintenanceModal({ visible, farmId, vesselId, onClose, onSuccess }: LogMaintenanceModalProps) {
  const [form, setForm] = useState<MaintenanceFormState>({
    maintenanceDate: todayIso(),
    workType: "",
    cooperageName: "",
    costPounds: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form synchronously when the modal opens, then patch in the stored cooperage name
  useEffect(() => {
    if (!visible) return;
    // Synchronous reset so the form is clean before the user can type anything
    setForm({
      maintenanceDate: todayIso(),
      workType: "",
      cooperageName: "",
      costPounds: "",
      notes: "",
    });
    setError(null);
    // Asynchronously prefill cooperage name; only apply if the user hasn't typed yet
    let cancelled = false;
    void (async () => {
      const stored = await kvGet("last_cooperage_name");
      if (!cancelled && stored) {
        // Only patch cooperageName — never touch other fields — and only if the
        // user hasn't already started typing their own value
        setForm(prev => prev.cooperageName === "" ? { ...prev, cooperageName: stored } : prev);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function set(field: keyof MaintenanceFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.maintenanceDate.trim()) { setError("Maintenance date is required."); return; }
    if (!form.workType.trim()) { setError("Work type is required."); return; }
    let costPence: number | null = null;
    if (form.costPounds.trim()) {
      const parsed = parseFloat(form.costPounds.trim().replace(/^£/, ""));
      if (isNaN(parsed) || parsed < 0) { setError("Cost must be a valid positive number."); return; }
      costPence = Math.round(parsed * 100);
    }
    setError(null);
    setSubmitting(true);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured.");
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}/maintenance`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          maintenanceDate: form.maintenanceDate.trim(),
          workType: form.workType.trim(),
          cooperageName: form.cooperageName.trim() || null,
          costPence,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      setForm({ maintenanceDate: todayIso(), workType: "", cooperageName: "", costPounds: "", notes: "" });
      // Persist cooperage name best-effort after a successful save; storage failure must not affect the success flow
      if (form.cooperageName.trim()) {
        kvSet("last_cooperage_name", form.cooperageName.trim()).catch(() => undefined);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save maintenance record.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setError(null);
    setForm({ maintenanceDate: todayIso(), workType: "", cooperageName: "", costPounds: "", notes: "" });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={formStyles.sheet}>
          {/* Modal header */}
          <View style={formStyles.sheetHeader}>
            <Text style={formStyles.sheetTitle}>Log Maintenance</Text>
            <Pressable onPress={handleClose} style={formStyles.closeBtn} disabled={submitting}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={formStyles.body} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={formStyles.errorBanner}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={formStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Maintenance date */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Maintenance date <Text style={formStyles.required}>*</Text></Text>
              <TextInput
                style={formStyles.input}
                value={form.maintenanceDate}
                onChangeText={v => set("maintenanceDate", v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
              />
            </View>

            {/* Work type */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Work type <Text style={formStyles.required}>*</Text></Text>
              <TextInput
                style={formStyles.input}
                value={form.workType}
                onChangeText={v => set("workType", v)}
                placeholder="e.g. Retoasting, Bung replacement, Leak repair"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Cooperage name */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Cooperage name</Text>
              <TextInput
                style={formStyles.input}
                value={form.cooperageName}
                onChangeText={v => set("cooperageName", v)}
                placeholder="e.g. Radoux, François Frères"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Cost */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Cost (£)</Text>
              <TextInput
                style={formStyles.input}
                value={form.costPounds}
                onChangeText={v => set("costPounds", v)}
                placeholder="e.g. 120.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>

            {/* Notes */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Notes</Text>
              <TextInput
                style={[formStyles.input, formStyles.multiline]}
                value={form.notes}
                onChangeText={v => set("notes", v)}
                placeholder="Any additional notes…"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                returnKeyType="default"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[formStyles.submitBtn, submitting && formStyles.submitBtnDisabled]}
              onPress={() => { void handleSubmit(); }}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={formStyles.submitBtnText}>Save maintenance record</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Edit Maintenance Modal ────────────────────────────────────────────────────

interface EditMaintenanceModalProps {
  visible: boolean;
  farmId: string;
  vesselId: string;
  record: BarrelMaintenance | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EditMaintenanceModal({ visible, farmId, vesselId, record, onClose, onSuccess }: EditMaintenanceModalProps) {
  const [form, setForm] = useState<MaintenanceFormState>({
    maintenanceDate: "",
    workType: "",
    cooperageName: "",
    costPounds: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill when record changes or modal opens
  useEffect(() => {
    if (visible && record) {
      setForm({
        maintenanceDate: record.maintenance_date ?? "",
        workType: record.work_type ?? "",
        cooperageName: record.cooperage_name ?? "",
        costPounds: record.cost_pence != null ? (record.cost_pence / 100).toFixed(2) : "",
        notes: record.notes ?? "",
      });
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record]);

  function set(field: keyof MaintenanceFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.maintenanceDate.trim()) { setError("Maintenance date is required."); return; }
    if (!form.workType.trim()) { setError("Work type is required."); return; }
    let costPence: number | null = null;
    if (form.costPounds.trim()) {
      const parsed = parseFloat(form.costPounds.trim().replace(/^£/, ""));
      if (isNaN(parsed) || parsed < 0) { setError("Cost must be a valid positive number."); return; }
      costPence = Math.round(parsed * 100);
    }
    if (!record) return;
    setError(null);
    setSubmitting(true);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured.");
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}/maintenance/${record.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          maintenanceDate: form.maintenanceDate.trim(),
          workType: form.workType.trim(),
          cooperageName: form.cooperageName.trim() || null,
          costPence,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setError(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={formStyles.sheet}>
          <View style={formStyles.sheetHeader}>
            <Text style={formStyles.sheetTitle}>Edit Maintenance</Text>
            <Pressable onPress={handleClose} style={formStyles.closeBtn} disabled={submitting}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={formStyles.body} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={formStyles.errorBanner}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={formStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={formStyles.field}>
              <Text style={formStyles.label}>Maintenance date <Text style={formStyles.required}>*</Text></Text>
              <TextInput
                style={formStyles.input}
                value={form.maintenanceDate}
                onChangeText={v => set("maintenanceDate", v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
                returnKeyType="next"
              />
            </View>

            <View style={formStyles.field}>
              <Text style={formStyles.label}>Work type <Text style={formStyles.required}>*</Text></Text>
              <TextInput
                style={formStyles.input}
                value={form.workType}
                onChangeText={v => set("workType", v)}
                placeholder="e.g. Retoasting, Bung replacement, Leak repair"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            <View style={formStyles.field}>
              <Text style={formStyles.label}>Cooperage name</Text>
              <TextInput
                style={formStyles.input}
                value={form.cooperageName}
                onChangeText={v => set("cooperageName", v)}
                placeholder="e.g. Radoux, François Frères"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            <View style={formStyles.field}>
              <Text style={formStyles.label}>Cost (£)</Text>
              <TextInput
                style={formStyles.input}
                value={form.costPounds}
                onChangeText={v => set("costPounds", v)}
                placeholder="e.g. 120.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>

            <View style={formStyles.field}>
              <Text style={formStyles.label}>Notes</Text>
              <TextInput
                style={[formStyles.input, formStyles.multiline]}
                value={form.notes}
                onChangeText={v => set("notes", v)}
                placeholder="Any additional notes…"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                returnKeyType="default"
              />
            </View>

            <TouchableOpacity
              style={[formStyles.submitBtn, submitting && formStyles.submitBtnDisabled]}
              onPress={() => { void handleSubmit(); }}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={formStyles.submitBtnText}>Save changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Section components ────────────────────────────────────────────────────────

function SectionHeader({ title, count, action }: { title: string; count: number; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
      {action ? <View style={styles.sectionAction}>{action}</View> : null}
    </View>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <View style={styles.emptySection}>
      <Text style={styles.emptySectionText}>{label}</Text>
    </View>
  );
}

function FillCard({ fill }: { fill: BarrelFill }) {
  const title = [fill.wine_name, fill.variety].filter(Boolean).join(" · ") || "Unnamed fill";
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.fillBadge]}>
          <Text style={styles.fillBadgeText}>Fill {fill.fill_number ?? "?"}</Text>
        </View>
        {fill.vintage_year ? (
          <Text style={styles.cardMeta}>{fill.vintage_year}</Text>
        ) : null}
        {fill.batch_ref ? (
          <Text style={styles.cardMeta}>{fill.batch_ref}</Text>
        ) : null}
      </View>

      <Text style={styles.cardTitle}>{title}</Text>

      <View style={styles.cardRow}>
        <View style={styles.cardField}>
          <Text style={styles.fieldLabel}>Rack in</Text>
          <Text style={styles.fieldValue}>{fmt(fill.fill_date)}</Text>
        </View>
        <View style={styles.cardField}>
          <Text style={styles.fieldLabel}>Rack out</Text>
          <Text style={styles.fieldValue}>{fill.rack_out_date ? fmt(fill.rack_out_date) : "Current"}</Text>
        </View>
        {fill.volume_litres ? (
          <View style={styles.cardField}>
            <Text style={styles.fieldLabel}>Volume</Text>
            <Text style={styles.fieldValue}>{fill.volume_litres} L</Text>
          </View>
        ) : null}
      </View>

      {fill.operator_name ? (
        <Text style={styles.cardFooter}>
          <Feather name="user" size={11} color={colors.textTertiary} /> {fill.operator_name}
        </Text>
      ) : null}
      {fill.notes ? <Text style={styles.cardNotes}>{fill.notes}</Text> : null}
    </View>
  );
}

function MaintenanceCard({
  record,
  onEdit,
  onDelete,
}: {
  record: BarrelMaintenance;
  onEdit: (record: BarrelMaintenance) => void;
  onDelete: (record: BarrelMaintenance) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{record.work_type ?? "Maintenance"}</Text>
        <Text style={styles.cardMeta}>{fmt(record.maintenance_date)}</Text>
        <TouchableOpacity
          style={styles.cardIconBtn}
          onPress={() => onEdit(record)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          activeOpacity={0.6}
        >
          <Feather name="edit-2" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cardIconBtn}
          onPress={() => onDelete(record)}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          activeOpacity={0.6}
        >
          <Feather name="trash-2" size={14} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardRow}>
        {record.cooperage_name ? (
          <View style={styles.cardField}>
            <Text style={styles.fieldLabel}>Cooperage</Text>
            <Text style={styles.fieldValue}>{record.cooperage_name}</Text>
          </View>
        ) : null}
        <View style={styles.cardField}>
          <Text style={styles.fieldLabel}>Cost</Text>
          <Text style={styles.fieldValue}>{pence(record.cost_pence)}</Text>
        </View>
      </View>

      {record.notes ? <Text style={styles.cardNotes}>{record.notes}</Text> : null}
    </View>
  );
}

// ── Edit Movement Modal ───────────────────────────────────────────────────────

interface EditMovementModalProps {
  visible: boolean;
  farmId: string | undefined;
  vesselId: string | undefined;
  record: BarrelMovement;
  onClose: () => void;
  onSuccess: () => void;
}

function EditMovementModal({ visible, farmId, vesselId, record, onClose, onSuccess }: EditMovementModalProps) {
  const [form, setForm] = useState<MovementFormState>({
    movedDate: record.moved_date?.slice(0, 10) ?? todayIso(),
    fromZone: record.from_zone ?? "",
    fromPosition: record.from_position ?? "",
    toZone: record.to_zone ?? "",
    toPosition: record.to_position ?? "",
    reason: record.reason ?? "",
    operatorName: record.operator_name ?? "",
    notes: record.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setForm({
        movedDate: record.moved_date?.slice(0, 10) ?? todayIso(),
        fromZone: record.from_zone ?? "",
        fromPosition: record.from_position ?? "",
        toZone: record.to_zone ?? "",
        toPosition: record.to_position ?? "",
        reason: record.reason ?? "",
        operatorName: record.operator_name ?? "",
        notes: record.notes ?? "",
      });
      setError(null);
    }
  }, [visible, record]);

  async function handleSave() {
    if (!form.toZone.trim()) { setError("Destination zone is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured.");
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}/movements/${record.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          movedDate: form.movedDate,
          fromZone: form.fromZone.trim() || null,
          fromPosition: form.fromPosition.trim() || null,
          toZone: form.toZone.trim(),
          toPosition: form.toPosition.trim() || null,
          reason: form.reason.trim() || null,
          operatorName: form.operatorName.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={formStyles.sheetHeader}>
          <Text style={formStyles.sheetTitle}>Edit Movement</Text>
          <Pressable onPress={onClose} style={formStyles.closeBtn}>
            <Feather name="x" size={20} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={formStyles.body} keyboardShouldPersistTaps="handled">
          {!!error && (
            <View style={formStyles.errorBanner}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={formStyles.errorText}>{error}</Text>
            </View>
          )}
          <View style={formStyles.row}>
            <View style={[formStyles.field, { flex: 1 }]}>
              <Text style={formStyles.label}>Date <Text style={formStyles.required}>*</Text></Text>
              <TextInput style={formStyles.input} value={form.movedDate} onChangeText={t => setForm(f => ({ ...f, movedDate: t }))} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} keyboardType="numbers-and-punctuation" returnKeyType="next" />
            </View>
            <View style={[formStyles.field, { flex: 1 }]}>
              <Text style={formStyles.label}>Reason</Text>
              <TextInput style={formStyles.input} value={form.reason} onChangeText={t => setForm(f => ({ ...f, reason: t }))} placeholder="e.g. Rotation" placeholderTextColor={colors.textTertiary} returnKeyType="next" />
            </View>
          </View>
          <View style={formStyles.row}>
            <View style={[formStyles.field, { flex: 1 }]}>
              <Text style={formStyles.label}>From Zone</Text>
              <TextInput style={formStyles.input} value={form.fromZone} onChangeText={t => setForm(f => ({ ...f, fromZone: t }))} placeholder="e.g. Barrel Store A" placeholderTextColor={colors.textTertiary} returnKeyType="next" />
            </View>
            <View style={[formStyles.field, { flex: 1 }]}>
              <Text style={formStyles.label}>From Position</Text>
              <TextInput style={formStyles.input} value={form.fromPosition} onChangeText={t => setForm(f => ({ ...f, fromPosition: t }))} placeholder="e.g. Row 3" placeholderTextColor={colors.textTertiary} returnKeyType="next" />
            </View>
          </View>
          <View style={formStyles.row}>
            <View style={[formStyles.field, { flex: 1 }]}>
              <Text style={formStyles.label}>To Zone <Text style={formStyles.required}>*</Text></Text>
              <TextInput style={formStyles.input} value={form.toZone} onChangeText={t => setForm(f => ({ ...f, toZone: t }))} placeholder="e.g. Barrel Store B" placeholderTextColor={colors.textTertiary} returnKeyType="next" />
            </View>
            <View style={[formStyles.field, { flex: 1 }]}>
              <Text style={formStyles.label}>To Position</Text>
              <TextInput style={formStyles.input} value={form.toPosition} onChangeText={t => setForm(f => ({ ...f, toPosition: t }))} placeholder="e.g. Row 1" placeholderTextColor={colors.textTertiary} returnKeyType="next" />
            </View>
          </View>
          <View style={formStyles.field}>
            <Text style={formStyles.label}>Operator Name</Text>
            <TextInput style={formStyles.input} value={form.operatorName} onChangeText={t => setForm(f => ({ ...f, operatorName: t }))} placeholder="e.g. J. Smith" placeholderTextColor={colors.textTertiary} returnKeyType="next" />
          </View>
          <View style={formStyles.field}>
            <Text style={formStyles.label}>Notes</Text>
            <TextInput style={[formStyles.input, formStyles.multiline]} value={form.notes} onChangeText={t => setForm(f => ({ ...f, notes: t }))} placeholder="Optional notes…" placeholderTextColor={colors.textTertiary} multiline numberOfLines={3} />
          </View>
          <Pressable style={[formStyles.submitBtn, saving && formStyles.submitBtnDisabled]} onPress={handleSave} disabled={saving}>
            <Text style={formStyles.submitBtnText}>{saving ? "Saving…" : "Save movement"}</Text>
          </Pressable>
          <Pressable
            style={{ alignItems: "center", paddingVertical: spacing.sm, marginTop: 4 }}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary }}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MovementCard({ record, onEdit, onDelete }: { record: BarrelMovement; onEdit?: (r: BarrelMovement) => void; onDelete?: (r: BarrelMovement) => void }) {
  const fromLabel = [record.from_zone, record.from_position].filter(Boolean).join(" · ") || "Unknown";
  const toLabel = [record.to_zone, record.to_position].filter(Boolean).join(" · ") || "—";

  return (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { justifyContent: "space-between" }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{fmt(record.moved_date)}</Text>
          {record.reason ? <Text style={styles.cardMeta}>{record.reason}</Text> : null}
        </View>
        {(onEdit || onDelete) && (
          <View style={{ flexDirection: "row", gap: 4, marginLeft: 8 }}>
            {onEdit && (
              <TouchableOpacity onPress={() => onEdit(record)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.cardActionBtn}>
                <Feather name="edit-2" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={() => onDelete(record)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.cardActionBtn}>
                <Feather name="trash-2" size={14} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.movementRoute}>
        <Text style={styles.movementZone}>{fromLabel}</Text>
        <Feather name="arrow-right" size={14} color={colors.textTertiary} />
        <Text style={styles.movementZone}>{toLabel}</Text>
      </View>

      {record.operator_name ? (
        <Text style={styles.cardFooter}>
          <Feather name="user" size={11} color={colors.textTertiary} /> {record.operator_name}
        </Text>
      ) : null}
      {record.notes ? <Text style={styles.cardNotes}>{record.notes}</Text> : null}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WineryVesselDetailScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const params = useLocalSearchParams<{
    vesselId: string;
    vesselRef: string;
    vesselType?: string;
    notes?: string;
    cellarZone?: string;
    cellarPosition?: string;
  }>();

  const { data, loading, refreshing, error, refresh } = useVesselDetail(
    currentFarm?.id,
    params.vesselId
  );

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<BarrelMaintenance | null>(null);
  const [editingMovement, setEditingMovement] = useState<BarrelMovement | null>(null);

  // Track current vessel location so sequential movements pre-fill the right origin
  const [currentZone, setCurrentZone] = useState(params.cellarZone ?? "");
  const [currentPosition, setCurrentPosition] = useState(params.cellarPosition ?? "");

  function handleDeleteMovement(record: BarrelMovement) {
    Alert.alert(
      "Delete movement?",
      `This will permanently remove the movement recorded on ${fmt(record.moved_date)}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const apiBase = getApiBase();
              if (!apiBase) throw new Error("No API domain configured.");
              const headers = await getAuthHeaders();
              const res = await fetch(
                `${apiBase}/api/farms/${currentFarm!.id}/winery-vessels/${params.vesselId}/movements/${record.id}`,
                { method: "DELETE", headers },
              );
              if (!res.ok) {
                const body = await res.json().catch(() => ({})) as { error?: string };
                Alert.alert("Error", body.error ?? `Server error (${res.status})`);
                return;
              }
              refresh();
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete movement.");
            }
          },
        },
      ],
    );
  }

  function handleDeleteMaintenance(record: BarrelMaintenance) {
    Alert.alert(
      "Delete record?",
      `This will permanently remove the "${record.work_type ?? "maintenance"}" record dated ${fmt(record.maintenance_date)}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const apiBase = getApiBase();
              if (!apiBase) throw new Error("No API domain configured.");
              const headers = await getAuthHeaders();
              const res = await fetch(
                `${apiBase}/api/farms/${currentFarm!.id}/winery-vessels/${params.vesselId}/maintenance/${record.id}`,
                { method: "DELETE", headers },
              );
              if (!res.ok) {
                const body = await res.json().catch(() => ({})) as { error?: string };
                Alert.alert("Error", body.error ?? `Server error (${res.status})`);
                return;
              }
              refresh();
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "Failed to delete record.");
            }
          },
        },
      ],
    );
  }

  const subtitle = params.vesselType ?? "Vessel";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Feather
          name="arrow-left"
          size={20}
          color={colors.text}
          onPress={() => router.back()}
          style={styles.backBtn}
        />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{params.vesselRef ?? "Vessel"}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vessel record…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Error banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="wifi-off" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Vessel notes */}
          {params.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{params.notes}</Text>
            </View>
          ) : null}

          {/* Fill history */}
          <SectionHeader title="Fill History" count={data.fills.length} />
          {data.fills.length === 0 ? (
            <EmptySection label="No fill history recorded for this vessel." />
          ) : (
            data.fills.map(f => <FillCard key={f.id} fill={f} />)
          )}

          {/* Cooperage / maintenance log */}
          <SectionHeader
            title="Cooperage & Maintenance"
            count={data.maintenance.length}
            action={
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setMaintenanceModalOpen(true)}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={13} color={colors.primary} />
                <Text style={styles.addBtnText}>Log maintenance</Text>
              </TouchableOpacity>
            }
          />
          {data.maintenance.length === 0 ? (
            <EmptySection label="No cooperage or maintenance records." />
          ) : (
            data.maintenance.map(m => (
              <MaintenanceCard
                key={m.id}
                record={m}
                onEdit={r => setEditingMaintenance(r)}
                onDelete={handleDeleteMaintenance}
              />
            ))
          )}

          {/* Movements */}
          <SectionHeader
            title="Movements"
            count={data.movements.length}
            action={
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setMovementModalOpen(true)}
                activeOpacity={0.7}
              >
                <Feather name="plus" size={13} color={colors.primary} />
                <Text style={styles.addBtnText}>Log movement</Text>
              </TouchableOpacity>
            }
          />
          {data.movements.length === 0 ? (
            <EmptySection label="No movement records logged." />
          ) : (
            data.movements.map(mv => (
              <MovementCard
                key={mv.id}
                record={mv}
                onEdit={r => setEditingMovement(r)}
                onDelete={handleDeleteMovement}
              />
            ))
          )}
        </ScrollView>
      )}

      {currentFarm?.id && params.vesselId ? (
        <>
          <LogMaintenanceModal
            visible={maintenanceModalOpen}
            farmId={currentFarm.id}
            vesselId={params.vesselId}
            onClose={() => setMaintenanceModalOpen(false)}
            onSuccess={() => { setMaintenanceModalOpen(false); refresh(); }}
          />
          <EditMaintenanceModal
            visible={editingMaintenance !== null}
            farmId={currentFarm.id}
            vesselId={params.vesselId}
            record={editingMaintenance}
            onClose={() => setEditingMaintenance(null)}
            onSuccess={() => { setEditingMaintenance(null); refresh(); }}
          />
          {editingMovement !== null && (
            <EditMovementModal
              visible={editingMovement !== null}
              farmId={String(currentFarm.id)}
              vesselId={params.vesselId}
              record={editingMovement}
              onClose={() => setEditingMovement(null)}
              onSuccess={() => { setEditingMovement(null); refresh(); }}
            />
          )}
          <LogMovementModal
            visible={movementModalOpen}
            farmId={currentFarm.id}
            vesselId={params.vesselId}
            initialFromZone={currentZone}
            initialFromPosition={currentPosition}
            onClose={() => setMovementModalOpen(false)}
            onSuccess={(toZone, toPosition) => {
              setCurrentZone(toZone);
              setCurrentPosition(toPosition);
              setMovementModalOpen(false);
              refresh();
            }}
          />
        </>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.error,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  notesLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  notesText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  sectionAction: {
    flex: 1,
    alignItems: "flex-end",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  addBtnText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  // Empty section
  emptySection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptySectionText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
    textAlign: "center",
  },
  // Generic card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  cardActionBtn: {
    padding: 4,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
  },
  cardMeta: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  cardField: {
    minWidth: 80,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  cardFooter: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
  },
  cardNotes: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: "italic",
  },
  // Card icon action buttons (edit / delete)
  cardIconBtn: {
    padding: 2,
  },
  // Fill badge
  fillBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  fillBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  // Movement route
  movementRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  movementZone: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    flex: 1,
  },
});

// ── Form styles ───────────────────────────────────────────────────────────────

const formStyles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.error,
  },
  field: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: "#fff",
  },
});
