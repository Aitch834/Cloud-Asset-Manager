import { useQueryClient } from "@tanstack/react-query";
import { 
  useListEquipment as useGeneratedListEquipment,
  useCreateEquipment as useGeneratedCreateEquipment,
  getListEquipmentQueryKey,
} from "@workspace/api-client-react/src/generated/api";

export function useEquipment(farmId: number) {
  return useGeneratedListEquipment(farmId, {
    query: {
      enabled: !!farmId,
    } as any
  });
}

export function useAddEquipment(farmId: number) {
  const queryClient = useQueryClient();
  
  return useGeneratedCreateEquipment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEquipmentQueryKey(farmId) });
      },
    }
  });
}
