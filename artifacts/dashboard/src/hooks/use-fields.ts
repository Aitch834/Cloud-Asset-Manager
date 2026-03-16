import { useQueryClient } from "@tanstack/react-query";
import { 
  useListFields as useGeneratedListFields,
  useCreateField as useGeneratedCreateField,
  useUpdateField as useGeneratedUpdateField,
  useDeleteField as useGeneratedDeleteField,
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

export function useUpdateField(farmId: number) {
  const queryClient = useQueryClient();
  return useGeneratedUpdateField({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFieldsQueryKey(farmId) });
      },
    }
  });
}

export function useDeleteField(farmId: number) {
  const queryClient = useQueryClient();
  return useGeneratedDeleteField({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFieldsQueryKey(farmId) });
      },
    }
  });
}
