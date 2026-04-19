import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  tenantSlug: string | null;
  farmId: number | null;
  setTenantSlug: (slug: string) => void;
  setFarmId: (id: number | null) => void;
  clearState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      tenantSlug: null,
      farmId: null,
      setTenantSlug: (slug) => {
        // We also need to set this in localStorage directly so the fetch patch can read it sync
        localStorage.setItem('farmtrac_tenantSlug', slug);
        set({ tenantSlug: slug, farmId: null }); // Reset farm when tenant changes
      },
      setFarmId: (id) => set({ farmId: id }),
      clearState: () => {
        localStorage.removeItem('farmtrac_tenantSlug');
        set({ tenantSlug: null, farmId: null });
      },
    }),
    {
      name: 'farmtrac-storage',
    }
  )
);
