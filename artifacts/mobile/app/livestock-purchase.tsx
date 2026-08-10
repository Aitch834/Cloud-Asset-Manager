import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { getApiBase, getAuthToken, postRecordAttachment, uploadPhotoToStorage } from "@/lib/uploadPhoto";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";

const SPECIES_OPTIONS = ["Cattle", "Sheep", "Pigs", "Goats", "Horses", "Deer", "Poultry", "Other"];

const SPECIES_HERD_KEYWORDS: Record<string, string[]> = {
  Cattle:  ["cattle", "beef", "dairy", "suckler", "heifer", "cow", "bull", "bovine"],
  Sheep:   ["sheep", "flock", "ewe", "lamb", "ram", "ovine"],
  Pigs:    ["pig", "swine", "sow", "boar", "pork", "porcine"],
  Goats:   ["goat", "caprine", "nanny", "billy"],
  Horses:  ["horse", "equine", "pony", "mare", "stallion"],
  Deer:    ["deer", "stag", "cervine", "hind"],
  Poultry: ["poultry", "chicken", "hen", "turkey", "duck", "goose", "broiler", "layer"],
  Other:   [],
};

const UK_LIVESTOCK_MARKETS = [
  "Skipton Auction Mart",
  "Carlisle Borderway Mart",
  "Hexham & Northern Marts",
  "Longtown Auction Mart",
  "Penrith Auction Mart",
  "Kirkby Stephen Mart",
  "Appleby Mart",
  "Northallerton Livestock Market",
  "Malton Livestock Market",
  "Thirsk Auction Mart",
  "Otley Auction Mart",
  "Bakewell Livestock Market",
  "Newark Livestock Market",
  "Melton Mowbray Livestock Market",
  "Chelford Livestock Market",
  "Welshpool Livestock Sales",
  "Shrewsbury Auction Centre",
  "Hereford Livestock Market",
  "Oswestry Livestock Market",
  "Ludlow Livestock Market",
  "Exeter Livestock Centre",
  "Sedgemoor Auction Centre",
  "Holsworthy Livestock Market",
  "Hatherleigh Livestock Market",
  "Truro Livestock Market",
  "Frome Livestock Market",
  "Thame Livestock Market",
  "Banbury Livestock Market",
  "Stirling Agricultural Centre",
  "St Boswells Livestock Market",
  "Ayr Livestock Market",
  "Inverurie Mart",
  "Dingwall & Highland Marts",
  "Lairg Livestock Sales",
  "Builth Wells Livestock Sales",
  "Carmarthen Livestock Market",
  "Aberystwyth Livestock Market",
  "Ballymena Livestock Market",
  "Markethill Livestock Market",
  "Other",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ChipRow({ options, value, onSelect }: { options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => { Haptics.selectionAsync(); onSelect(o); }}
          style={[styles.chip, value === o && styles.chipSelected]}>
          <Text style={[styles.chipText, value === o && styles.chipTextSelected]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function PickerRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(!open)} style={styles.pickerTrigger}>
        <Text style={[styles.pickerValue, !value && { color: colors.textTertiary }]}>
          {value || "— Select —"}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.textTertiary} />
      </Pressable>
      {open && (
        <View style={styles.pickerList}>
          <Pressable onPress={() => { onChange(""); setOpen(false); }} style={styles.pickerItem}>
            <Text style={[styles.pickerItemText, { color: colors.textTertiary }]}>— None —</Text>
          </Pressable>
          {options.map((o) => (
            <Pressable key={o} onPress={() => { onChange(o); setOpen(false); Haptics.selectionAsync(); }} style={styles.pickerItem}>
              <Text style={styles.pickerItemText}>{o}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function LivestockPurchaseScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().slice(0, 10));
  const [species, setSpecies] = useState("Cattle");
  const [supplierName, setSupplierName] = useState("");
  const [supplierCph, setSupplierCph] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierList, setShowSupplierList] = useState(false);
  const [suppliers, setSuppliers] = useState<{ id: number; name: string; cph?: string }[]>([]);
  const [marketChoice, setMarketChoice] = useState("");
  const [marketOther, setMarketOther] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [numberOfHead, setNumberOfHead] = useState("");
  const [herdId, setHerdId] = useState("");
  const [herds, setHerds] = useState<{ id: number; name: string; type: string }[]>([]);
  const [pricePerHead, setPricePerHead] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [vatAmount, setVatAmount] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");

  const apiBase = getApiBase();
  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("purchase", farmId);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  useEffect(() => {
    if (!farmId) return;
    (async () => {
      try {
        const token = await getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const [sRes, hRes] = await Promise.all([
          fetch(`${apiBase}/api/farms/${farmId}/livestock-suppliers`, { headers }),
          fetch(`${apiBase}/api/farms/${farmId}/herds`, { headers }),
        ]);
        if (sRes.ok) { const d = await sRes.json(); setSuppliers(d.records ?? []); }
        if (hRes.ok) { const d = await hRes.json(); setHerds(d.records ?? []); }
      } catch { /* offline — proceed without lookups */ }
    })();
  }, [farmId]);

  const filteredSuppliers = suppliers.filter((s) =>
    !supplierSearch || s.name.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const speciesKw = SPECIES_HERD_KEYWORDS[species] ?? [];
  const herdsForSpecies = speciesKw.length === 0
    ? herds
    : herds.filter((h) => { const t = (h.type || h.name || "").toLowerCase(); return speciesKw.some((k) => t.includes(k)); });

  const marketName = marketChoice === "Other" ? marketOther : marketChoice;

  const handleSave = async () => {
    if (!species) { Alert.alert("Required", "Please select a species."); return; }
    if (!numberOfHead) { Alert.alert("Required", "Please enter number of head."); return; }
    if (!totalAmount) { Alert.alert("Required", "Please enter the total invoice amount."); return; }
    if (!invoiceDate) { Alert.alert("Required", "Please enter an invoice date."); return; }

    try {
      setSaving(true);
      const token = await getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body = {
        invoiceDate,
        arrivalDate: arrivalDate || null,
        supplierName: supplierName || "Unknown",
        supplierCph: supplierCph || null,
        marketName: marketName || null,
        invoiceRef: invoiceRef || null,
        species,
        numberOfHead: parseInt(numberOfHead) || 0,
        pricePerHeadPence: pricePerHead ? Math.round(parseFloat(pricePerHead) * 100) : null,
        totalAmountPence: Math.round(parseFloat(totalAmount) * 100),
        vatAmountPence: vatAmount ? Math.round(parseFloat(vatAmount) * 100) : null,
        paymentTermsDays: parseInt(paymentTerms) || 30,
        herdId: herdId ? parseInt(herdId) : null,
        paymentMethod,
        notes: notes || null,
        paymentStatus: "outstanding",
      };

      const res = await fetch(`${apiBase}/api/farms/${farmId}/livestock-purchases`, {
        method: "POST", headers, body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Server error");
      const { record } = await res.json();

      if (photo && record?.id) {
        const objectPath = await uploadPhotoToStorage(photo, apiBase, "invoice-document.jpg");
        if (objectPath) {
          await postRecordAttachment(apiBase, farmId!, "livestock-purchase", String(record.id), objectPath, "invoice-document.jpg");
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Livestock purchase invoice recorded.", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Error", "Failed to save. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Livestock Purchase Invoice</Text>
        <View style={{ width: 36 }} />
      </View>

      {justSaved && !missingIdentifiers && !identifiersLoading && (
        <Pressable onPress={clearJustSaved} style={[styles.identifierBanner, styles.identifierBannerSaved]}>
          <Feather name="check-circle" size={15} color="#166534" />
          <Text style={[styles.identifierBannerText, styles.identifierBannerSavedText]}>
            Identifiers saved successfully. Tap to dismiss.
          </Text>
        </Pressable>
      )}

      {missingIdentifiers && !bannerDismissed && (
        <Pressable
          onPress={() => router.push("/(tabs)/more")}
          style={styles.identifierBanner}
        >
          <Feather name="alert-triangle" size={15} color="#92400e" />
          <Text style={styles.identifierBannerText}>
            {!cphNumber && !sbiNumber
              ? "CPH and SBI are missing from your farm profile — required for livestock records."
              : !cphNumber
              ? "CPH number is missing from your farm profile — required for livestock records."
              : "SBI number is missing from your farm profile — required for livestock records."}
            {" "}Tap to go to Settings.
          </Text>
          <Pressable
            onPress={(e) => { e.stopPropagation(); dismissBanner(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss warning"
          >
            <Feather name="x" size={15} color="#92400e" />
          </Pressable>
        </Pressable>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 100 }} keyboardShouldPersistTaps="handled">

        <Section title="Invoice Details">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Invoice date *</Text>
              <Input value={invoiceDate} onChangeText={setInvoiceDate} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Arrival date</Text>
              <Input value={arrivalDate} onChangeText={setArrivalDate} placeholder="YYYY-MM-DD" />
            </View>
          </View>
          <Text style={styles.label}>Invoice / lot ref</Text>
          <Input value={invoiceRef} onChangeText={setInvoiceRef} placeholder="e.g. INV-2024-001" />
        </Section>

        <Section title="Supplier">
          <Text style={styles.label}>Supplier name</Text>
          <View style={{ position: "relative", marginBottom: spacing.sm }}>
            <Input
              value={supplierName}
              onChangeText={(v) => { setSupplierName(v); setSupplierSearch(v); setShowSupplierList(true); }}
              onFocus={() => setShowSupplierList(true)}
              onBlur={() => setTimeout(() => setShowSupplierList(false), 200)}
              placeholder="Search existing or enter name…"
            />
            {showSupplierList && filteredSuppliers.length > 0 && (
              <View style={styles.dropdown}>
                {filteredSuppliers.slice(0, 6).map((s) => (
                  <Pressable key={s.id} onPress={() => { setSupplierName(s.name); setSupplierCph(s.cph || ""); setSupplierSearch(""); setShowSupplierList(false); }} style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{s.name}</Text>
                    {s.cph ? <Text style={styles.dropdownItemSub}>CPH: {s.cph}</Text> : null}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <Text style={styles.label}>Supplier CPH no.</Text>
          <Input value={supplierCph} onChangeText={setSupplierCph} placeholder="XX/XXX/XXXX" autoCapitalize="characters" />
        </Section>

        <Section title="Market / Auction">
          <PickerRow label="Market" options={UK_LIVESTOCK_MARKETS} value={marketChoice} onChange={setMarketChoice} />
          {marketChoice === "Other" && (
            <>
              <Text style={styles.label}>Market name</Text>
              <Input value={marketOther} onChangeText={setMarketOther} placeholder="Enter market name…" />
            </>
          )}
        </Section>

        <Section title="Animal Details">
          <Text style={styles.label}>Species *</Text>
          <ChipRow options={SPECIES_OPTIONS} value={species} onSelect={(v) => { setSpecies(v); setHerdId(""); }} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>No. of head *</Text>
              <Input value={numberOfHead} onChangeText={setNumberOfHead} keyboardType="number-pad" placeholder="0" />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 2 }}>
              <PickerRow
                label="Herd / flock"
                options={herdsForSpecies.map((h) => `${h.id}:${h.name}`)}
                value={herdId ? `${herdId}:${herds.find((h) => String(h.id) === herdId)?.name ?? ""}` : ""}
                onChange={(v) => { const [id] = v.split(":"); setHerdId(id); }}
              />
            </View>
          </View>
        </Section>

        <Section title="Financial">
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Price / head (£)</Text>
              <Input value={pricePerHead} onChangeText={setPricePerHead} keyboardType="decimal-pad" placeholder="0.00" />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Total ex-VAT (£) *</Text>
              <Input value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" placeholder="0.00" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>VAT amount (£)</Text>
              <Input value={vatAmount} onChangeText={setVatAmount} keyboardType="decimal-pad" placeholder="0.00" />
            </View>
            <View style={{ width: spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Payment terms (days)</Text>
              <Input value={paymentTerms} onChangeText={setPaymentTerms} keyboardType="number-pad" placeholder="30" />
            </View>
          </View>
          <PickerRow
            label="Payment method"
            options={["Bank Transfer", "Direct Debit", "Cheque", "Cash", "Card", "BACS", "Other"]}
            value={paymentMethod}
            onChange={setPaymentMethod}
          />
        </Section>

        <Section title="Notes">
          <Input value={notes} onChangeText={setNotes} placeholder="Additional notes…" multiline numberOfLines={3} style={{ minHeight: 72, textAlignVertical: "top" }} />
        </Section>

        <Section title="Document / Photo">
          <Text style={styles.helperText}>Attach a photo of the purchase invoice or movement document.</Text>
          <PhotoAttachButton
            photoUri={photo}
            onPhotoSelected={setPhoto}
            label="Attach invoice photo"
            promptTitle="Attach Purchase Invoice"
          />
        </Section>

        <Button title="Save Purchase Invoice" onPress={handleSave} loading={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.text },
  identifierBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  identifierBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  identifierBannerSaved: {
    backgroundColor: colors.successBg,
    borderColor: "#86EFAC",
  },
  identifierBannerSavedText: {
    color: "#166534",
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  label: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary, marginBottom: 4, marginTop: spacing.xs },
  helperText: { fontSize: fontSize.xs, color: colors.textTertiary, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "flex-start" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.xs },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.background },
  chipSelected: { backgroundColor: "#166534", borderColor: "#166534" },
  chipText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
    marginBottom: 4,
  },
  pickerValue: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },
  pickerList: {
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: radius.md,
    backgroundColor: colors.surface, marginBottom: spacing.xs,
    maxHeight: 200, overflow: "scroll",
  },
  pickerItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  pickerItemText: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text },
  dropdown: {
    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight,
    borderRadius: radius.md, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dropdownItemText: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text },
  dropdownItemSub: { fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 1 },
  saveBtn: { marginTop: spacing.sm, backgroundColor: "#166534" },
});
