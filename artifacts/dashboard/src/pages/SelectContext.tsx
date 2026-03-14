import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  useGetMyTenants, 
  useListFarms 
} from "@workspace/api-client-react/src/generated/api";
import { useAppStore } from "@/hooks/use-app-store";
import { Map, Building2, ArrowRight, Loader2 } from "lucide-react";

export default function SelectContext() {
  const [_, setLocation] = useLocation();
  const { tenantSlug, farmId, setTenantSlug, setFarmId } = useAppStore();

  const { data: tenantsData, isLoading: loadingTenants } = useGetMyTenants();
  
  // Only fetch farms if a tenant is selected
  const { data: farmsData, isLoading: loadingFarms } = useListFarms({
    query: { enabled: !!tenantSlug }
  });

  // Auto-select if only 1 option
  useEffect(() => {
    if (tenantsData?.tenants && tenantsData.tenants.length === 1 && !tenantSlug) {
      setTenantSlug(tenantsData.tenants[0].tenantSlug);
    }
  }, [tenantsData, tenantSlug, setTenantSlug]);

  useEffect(() => {
    if (farmsData?.farms && farmsData.farms.length === 1 && !farmId) {
      setFarmId(farmsData.farms[0].id);
      setLocation('/dashboard');
    }
  }, [farmsData, farmId, setFarmId, setLocation]);

  const handleSelectFarm = (id: number) => {
    setFarmId(id);
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            {!tenantSlug ? "Select your Organization" : "Select a Farm"}
          </h1>
          <p className="mt-2 text-foreground/60">
            {!tenantSlug 
              ? "Choose the business account you want to access." 
              : "Choose which farm you want to manage today."}
          </p>
        </div>

        {!tenantSlug ? (
          <div className="space-y-4">
            {loadingTenants ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : tenantsData?.tenants.map(t => (
              <Card 
                key={t.tenantId}
                className="p-6 cursor-pointer hover:border-primary transition-all group flex items-center justify-between"
                onClick={() => setTenantSlug(t.tenantSlug)}
              >
                <div>
                  <h3 className="font-bold text-lg">{t.tenantName}</h3>
                  <p className="text-sm text-foreground/50">{t.isSuperAdmin ? "Admin Access" : "Member"}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setTenantSlug("")} 
              className="text-sm font-medium text-primary hover:underline mb-4 block"
            >
              &larr; Back to Organizations
            </button>
            
            {loadingFarms ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : farmsData?.farms.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <p className="text-foreground/60 mb-4">No farms found in this organization.</p>
                <Button>Create a Farm</Button>
              </Card>
            ) : farmsData?.farms.map(f => (
              <Card 
                key={f.id}
                className="p-6 cursor-pointer hover:border-primary transition-all group flex items-center justify-between"
                onClick={() => handleSelectFarm(f.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Map className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{f.name}</h3>
                    <p className="text-sm text-foreground/50">{f.totalAcreage ? `${f.totalAcreage} acres` : 'Setup pending'}</p>
                  </div>
                </div>
                <Button variant="secondary" className="group-hover:bg-primary group-hover:text-white transition-colors">
                  Open Dashboard
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
