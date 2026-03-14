import { useQueryClient } from "@tanstack/react-query";
import { 
  useListFields as useGeneratedListFields,
  useCreateField as useGeneratedCreateField,
  getListFieldsQueryKey,
} from "@workspace/api-client-react/src/generated/api";

// Wrappers to automatically handle cache invalidation on mutations

export function useFields(farmId: number) {
  return useGeneratedListFields(farmId, {
    query: {
      enabled: !!farmId,
    }
  });
}

export function useAddField(farmId: number) {
  const queryClient = useQueryClient();
  
  return useGeneratedCreateField({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFieldsQueryKey(farmId) });
      },
    }
  });
}
