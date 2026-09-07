import { SALES_MODULES } from "@workspace/shared-assets/modules";
import { MODULES as PRICING_MODULES } from "../src/lib/pricing-data";
import { REGISTER_INTEREST_MODULE_DETAILS } from "../src/pages/RegisterInterest";

const errors: string[] = [];
const ids = new Set<string>();

for (const module of SALES_MODULES) {
  if (!module.id.trim()) errors.push("Shared module catalogue contains a blank ID");
  if (!module.label.trim()) errors.push(`Module "${module.id}" has no readable label`);
  if (ids.has(module.id)) errors.push(`Duplicate shared module ID: ${module.id}`);
  ids.add(module.id);
}

const pricingById = new Map(PRICING_MODULES.map((module) => [module.id, module]));
const detailsById = new Map(REGISTER_INTEREST_MODULE_DETAILS.map((module) => [module.id, module]));

for (const module of SALES_MODULES) {
  const pricing = pricingById.get(module.id);
  if (!pricing) {
    errors.push(`Shared module "${module.id}" is missing from pricing`);
  } else if (pricing.name.replace(" (Required)", "") !== module.label) {
    errors.push(`Pricing label drift for "${module.id}": "${pricing.name}" != "${module.label}"`);
  }

  if (!detailsById.get(module.id)?.summary.trim()) {
    errors.push(`Register Interest summary missing for "${module.id}"`);
  }
}

for (const module of PRICING_MODULES) {
  if (!ids.has(module.id)) errors.push(`Priced module "${module.id}" is missing from the shared catalogue`);
}

for (const module of REGISTER_INTEREST_MODULE_DETAILS) {
  if (!ids.has(module.id)) errors.push(`Register Interest module "${module.id}" is missing from the shared catalogue`);
}

if (errors.length) {
  console.error(["Module label check failed:", ...errors.map((error) => `- ${error}`)].join("\n"));
  process.exit(1);
}

console.log(`Module label check passed for ${SALES_MODULES.length} modules.`);