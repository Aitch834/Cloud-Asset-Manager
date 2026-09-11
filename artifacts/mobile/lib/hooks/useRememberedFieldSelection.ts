import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import type { ApiField } from "./useApiFields";

const storageKeyForFarm = (farmId: string) =>
  `bde_field_inspection_last_field_${farmId}`;

export function useRememberedFieldSelection({
  farmId,
  fields,
  fieldsLoading,
  fieldsLoadedForFarmId,
}: {
  farmId: string | undefined;
  fields: ApiField[];
  fieldsLoading: boolean;
  fieldsLoadedForFarmId: string | undefined;
}) {
  const [fieldName, setFieldName] = useState("");
  const [restoredForFarmId, setRestoredForFarmId] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    setRestoredForFarmId(undefined);
    setFieldName("");
  }, [farmId]);

  useEffect(() => {
    if (!farmId || fieldsLoading || restoredForFarmId === farmId) return;
    if (fieldsLoadedForFarmId !== farmId) return;

    let cancelled = false;

    AsyncStorage.getItem(storageKeyForFarm(farmId)).then((raw) => {
      if (cancelled) return;

      if (raw) {
        try {
          const saved = JSON.parse(raw) as { fieldName?: string };
          const savedFieldStillExists = fields.some(
            (field) =>
              field.isActive !== false && field.name === saved.fieldName,
          );
          if (saved.fieldName && savedFieldStillExists) {
            setFieldName(saved.fieldName);
          }
        } catch {
          // Ignore malformed stored values.
        }
      }

      setRestoredForFarmId(farmId);
    });

    return () => {
      cancelled = true;
    };
  }, [
    farmId,
    fieldsLoading,
    fields,
    fieldsLoadedForFarmId,
    restoredForFarmId,
  ]);

  useEffect(() => {
    if (!farmId || restoredForFarmId !== farmId) return;

    const storageKey = storageKeyForFarm(farmId);
    if (fieldName) {
      AsyncStorage.setItem(storageKey, JSON.stringify({ fieldName }));
    } else {
      AsyncStorage.removeItem(storageKey);
    }
  }, [farmId, restoredForFarmId, fieldName]);

  return { fieldName, setFieldName };
}