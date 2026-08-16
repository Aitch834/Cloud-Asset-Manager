import { aB as useListCrops, aC as useListFieldCropAssignments, c as useQueryClient, aD as useCreateCrop, aE as useCreateFieldCropAssignment, Z as getListCropsQueryKey, Q as getListFieldCropAssignmentsQueryKey } from "./index-1TyBJonr.js";
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
