import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

const BASE_FEE = 15;

const MODULES = [
  { id: "core", name: "Red Tractor Core (Required)", price: 20, required: true },
  { id: "field", name: "Field & Crop Management", price: 15 },
  { id: "livestock", name: "Livestock Management", price: 25 },
  { id: "equipment", name: "Equipment & Calibration", price: 10 },
  { id: "stock", name: "Stock & Suppliers", price: 10 },
  { id: "financial", name: "Financial & Exports", price: 15 },
  { id: "weather", name: "Weather Tracking", price: 5 },
  { id: "documents", name: "Advanced Document Storage", price: 10 },
];

export default function Pricing() {
  const [selectedModules, setSelectedModules] = useState<string[]>(["core", "field", "equipment"]);
  const [farmCount, setFarmCount] = useState(1);

  const toggleModule = (id: string, required?: boolean) => {
    if (required) return;
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const perFarmMonthly = BASE_FEE + MODULES.filter(m => selectedModules.includes(m.id)).reduce((acc, m) => acc + m.price, 0);
  const totalMonthly = perFarmMonthly * farmCount;

  return (
    <Layout>
      <div className="bg-brand-forest text-white py-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Transparent, Module-Based Pricing</h1>
          <p className="text-brand-pale/80 text-lg max-w-2xl mx-auto">
            Pay a low base platform fee plus only the specific modules you need for each farm.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-24">
        <div className="bg-white rounded-3xl shadow-2xl border border-border p-6 md:p-10 flex flex-col lg:flex-row gap-12">
          
          {/* Builder Side */}
          <div className="flex-1 space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4">1. Number of Farms</h3>
              <div className="flex items-center gap-4">
                <button 
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary"
                  onClick={() => setFarmCount(Math.max(1, farmCount - 1))}
                >-</button>
                <span className="text-2xl font-semibold w-8 text-center">{farmCount}</span>
                <button 
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-secondary"
                  onClick={() => setFarmCount(farmCount + 1)}
                >+</button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">2. Select Modules (per farm)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map(mod => {
                  const isSelected = selectedModules.includes(mod.id);
                  return (
                    <div 
                      key={mod.id}
                      onClick={() => toggleModule(mod.id, mod.required)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? "border-brand-forest bg-brand-pale/50" 
                          : "border-border hover:border-brand-light"
                      } ${mod.required ? "opacity-80 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-foreground pr-6">{mod.name}</span>
                        <span className="text-muted-foreground font-mono">£{mod.price}/mo</span>
                      </div>
                      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? "bg-brand-forest border-brand-forest" : "border-muted-foreground"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pricing Summary Side */}
          <div className="w-full lg:w-96 bg-earth-cream rounded-2xl p-8 sticky top-24 h-fit border border-earth-tan/20">
            <h3 className="text-lg font-bold text-earth-brown mb-6">Estimated Cost</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-earth-tan/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Base Fee</span>
                <span className="font-medium">£{BASE_FEE}</span>
              </div>
              {MODULES.filter(m => selectedModules.includes(m.id)).map(mod => (
                <div key={mod.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{mod.name}</span>
                  <span className="font-medium">£{mod.price}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end mb-2">
              <span className="font-semibold">Cost per Farm</span>
              <span className="text-2xl font-bold">£{perFarmMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
            </div>
            
            <div className="flex justify-between items-end mb-8 text-brand-forest">
              <span className="font-bold text-lg">Total ({farmCount} farms)</span>
              <span className="text-4xl font-extrabold tracking-tight">£{totalMonthly}<span className="text-base font-normal opacity-80">/mo</span></span>
            </div>

            <Button className="w-full h-14 text-base bg-brand-forest hover:bg-brand-sage shadow-lg" asChild>
              <Link href="/contact">Start Custom Setup</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" /> All prices exclude VAT.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
