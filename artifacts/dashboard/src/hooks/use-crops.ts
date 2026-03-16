import { useQueryClient } from "@tanstack/react-query";
import {
  useListCrops as useGeneratedListCrops,
  useCreateCrop as useGeneratedCreateCrop,
  useListFieldCropAssignments as useGeneratedListFieldCropAssignments,
  useCreateFieldCropAssignment as useGeneratedCreateFieldCropAssignment,
  getListCropsQueryKey,
  getListFieldCropAssignmentsQueryKey,
} from "@workspace/api-client-react/src/generated/api";

export function useCrops(farmId: number) {
  return useGeneratedListCrops(farmId, { query: { enabled: !!farmId } });
}

export function useAddCrop(farmId: number) {
  const qc = useQueryClient();
  return useGeneratedCreateCrop({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCropsQueryKey(farmId) });
      },
    },
  });
}

export function useFieldCropAssignments(farmId: number) {
  return useGeneratedListFieldCropAssignments(farmId, { query: { enabled: !!farmId } });
}

export function useAssignCrop(farmId: number) {
  const qc = useQueryClient();
  return useGeneratedCreateFieldCropAssignment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListFieldCropAssignmentsQueryKey(farmId) });
      },
    },
  });
}
