import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

const STORAGE_KEY_READER_NAME = "rfid_reader_name";
const MAX_RECENT_SCANS = 20;

interface RFIDContextValue {
  readerName: string;
  setReaderName: (name: string) => Promise<void>;
  recentScans: string[];
  addScan: (tag: string) => void;
  clearRecentScans: () => void;
  isScanModeActive: boolean;
  activateScanMode: () => void;
  deactivateScanMode: () => void;
}

const RFIDContext = createContext<RFIDContextValue | null>(null);

export function RFIDProvider({ children }: { children: React.ReactNode }) {
  const [readerName, setReaderNameState] = useState("");
  const [recentScans, setRecentScans] = useState<string[]>([]);
  const [isScanModeActive, setIsScanModeActive] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    getItem<string>(STORAGE_KEY_READER_NAME).then((name) => {
      if (name) setReaderNameState(name);
    });
  }, []);

  const setReaderName = useCallback(async (name: string) => {
    setReaderNameState(name);
    await setItem(STORAGE_KEY_READER_NAME, name);
  }, []);

  const addScan = useCallback((tag: string) => {
    const trimmed = tag.trim().toUpperCase();
    if (!trimmed) return;
    setRecentScans((prev) => [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, MAX_RECENT_SCANS));
  }, []);

  const clearRecentScans = useCallback(() => setRecentScans([]), []);
  const activateScanMode = useCallback(() => setIsScanModeActive(true), []);
  const deactivateScanMode = useCallback(() => setIsScanModeActive(false), []);

  const value = useMemo<RFIDContextValue>(
    () => ({
      readerName,
      setReaderName,
      recentScans,
      addScan,
      clearRecentScans,
      isScanModeActive,
      activateScanMode,
      deactivateScanMode,
    }),
    [readerName, setReaderName, recentScans, addScan, clearRecentScans, isScanModeActive, activateScanMode, deactivateScanMode]
  );

  return <RFIDContext.Provider value={value}>{children}</RFIDContext.Provider>;
}

export function useRFID(): RFIDContextValue {
  const ctx = useContext(RFIDContext);
  if (!ctx) throw new Error("useRFID must be used within RFIDProvider");
  return ctx;
}
