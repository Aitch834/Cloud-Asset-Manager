import { aA as useListCrops, aB as useListFieldCropAssignments, c as useQueryClient, aC as useCreateCrop, aD as useCreateFieldCropAssignment, X as getListCropsQueryKey, Y as getListFieldCropAssignmentsQueryKey } from "./index-DX6E55cF.js";
function useCrops(farmId) {
  return useListCrops(farmId, { query: { enabled: !!farmId } });
}
function useAddCrop(farmId) {
  const qc = useQueryClient();
  return useCreateCrop({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListCropsQueryKey(farmId) });
      }
    }
  });
}
function useFieldCropAssignments(farmId) {
  return useListFieldCropAssignments(farmId, { query: { enabled: !!farmId } });
}
function useAssignCrop(farmId) {
  const qc = useQueryClient();
  return useCreateFieldCropAssignment({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListFieldCropAssignmentsQueryKey(farmId) });
      }
    }
  });
}
export {
  useFieldCropAssignments as a,
  useAddCrop as b,
  useAssignCrop as c,
  useCrops as u
};
