import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Redirect } from "wouter";
import { DairySuppliesTab } from "@/components/DairySuppliesTab";

import { MilkRecordsTab } from "./MilkRecordsTab";
import { MastitisTab } from "./MastitisTab";
import { CalvingTab } from "./CalvingTab";
import { BcsTab } from "./BcsTab";
import { MobilityTab } from "./MobilityTab";
import { AbrKitStockSection } from "./AbrKitStockSection";
import { BulkTankTab } from "./BulkTankTab";
import { DctTab } from "./DctTab";
import { RecordingVisitsTab } from "./RecordingVisitsTab";
import { AbrProcurementSection } from "./DairyAbrProcurementSection";
import { DairyEnterpriseReport } from "./DairyEnterpriseReport";
import { SccEquipmentSection } from "./SccEquipmentSection";
import { DairyJohnesTab } from "./DairyJohnesTab";

// Re-export tab/section components that other dairy pages import from "@/pages/DairyPage".
export { MilkRecordsTab } from "./MilkRecordsTab";
export { MastitisTab } from "./MastitisTab";
export { CalvingTab } from "./CalvingTab";
export { BcsTab } from "./BcsTab";
export { MobilityTab } from "./MobilityTab";
export { AbrKitStockSection } from "./AbrKitStockSection";
export { BulkTankTab } from "./BulkTankTab";
export { DctTab } from "./DctTab";
export { RecordingVisitsTab } from "./RecordingVisitsTab";
export { AbrProcurementSection } from "./DairyAbrProcurementSection";
export { DairyEnterpriseReport } from "./DairyEnterpriseReport";
export { SccEquipmentSection } from "./SccEquipmentSection";
export { DairyJohnesTab } from "./DairyJohnesTab";

type Tab = "milk" | "mastitis" | "calving" | "bcs" | "mobility" | "tank" | "dct" | "johnes" | "recording" | "enterprise" | "abr-kit" | "scc-equipment" | "supplies";

export default function DairyPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({ page: "dairy", farmId, validIds: ["milk", "mastitis", "calving", "bcs", "mobility", "tank", "dct", "johnes", "recording", "enterprise", "abr-kit", "scc-equipment", "supplies"], defaultTab: "milk" });

  if (!farmId) return <Redirect to="/select" />;

  return (
    <AppLayout title="Dairy Records">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dairy Records</h1>
          <p className="text-gray-500 text-sm mt-1">Red Tractor Dairy scheme compliance — milk recording, mastitis, calving, body condition, mobility, bulk tank, and dry cow therapy. Supports dairy cattle and water buffalo herds (both regulated as bovines under BCMS).</p>
        </div>

        <TabBar>
          <TabButton active={tab === "milk"} onClick={() => setTab("milk")}>Milk Records</TabButton>
          <TabButton active={tab === "mastitis"} onClick={() => setTab("mastitis")}>Mastitis</TabButton>
          <TabButton active={tab === "calving"} onClick={() => setTab("calving")}>Calving</TabButton>
          <TabButton active={tab === "bcs"} onClick={() => setTab("bcs")}>Body Condition</TabButton>
          <TabButton active={tab === "mobility"} onClick={() => setTab("mobility")}>Mobility Scoring</TabButton>
          <TabButton active={tab === "tank"} onClick={() => setTab("tank")}>Bulk Tank</TabButton>
          <TabButton active={tab === "dct"} onClick={() => setTab("dct")}>Dry Cow Therapy</TabButton>
          <TabButton active={tab === "johnes"} onClick={() => setTab("johnes")}>Johne's Monitoring</TabButton>
          <TabButton active={tab === "recording"} onClick={() => setTab("recording")}>Recording Visits</TabButton>
          <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}>Enterprise Report</TabButton>
          <TabButton active={tab === "abr-kit"} onClick={() => setTab("abr-kit")}>ABR Kit Stock</TabButton>
          <TabButton active={tab === "scc-equipment"} onClick={() => setTab("scc-equipment")}>SCC Equipment</TabButton>
          <TabButton active={tab === "supplies"} onClick={() => setTab("supplies")}>Supplies</TabButton>
        </TabBar>

        <div className="mt-6">
          {tab === "milk" && <MilkRecordsTab farmId={farmId} />}
          {tab === "mastitis" && <MastitisTab farmId={farmId} />}
          {tab === "calving" && <CalvingTab farmId={farmId} />}
          {tab === "bcs" && <BcsTab farmId={farmId} />}
          {tab === "mobility" && <MobilityTab farmId={farmId} />}
          {tab === "tank" && <BulkTankTab farmId={farmId} />}
          {tab === "dct" && <DctTab farmId={farmId} />}
          {tab === "johnes" && <DairyJohnesTab farmId={farmId} />}
          {tab === "recording" && <RecordingVisitsTab farmId={farmId} />}
          {tab === "enterprise" && <DairyEnterpriseReport farmId={farmId} />}
          {tab === "abr-kit" && <div className="space-y-6"><AbrKitStockSection farmId={farmId} /><AbrProcurementSection farmId={farmId} /></div>}
          {tab === "scc-equipment" && <SccEquipmentSection farmId={farmId} species="cattle" />}
          {tab === "supplies" && <DairySuppliesTab farmId={farmId} dairyType="cattle" />}
        </div>
      </div>
    </AppLayout>
  );
}
