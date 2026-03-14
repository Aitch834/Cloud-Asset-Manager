import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <div className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Born from British Agriculture.</h1>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  BDE Farm Trac was created with a simple mission: to significantly reduce the administrative burden placed on UK farmers by compliance schemes.
                </p>
                <p>
                  We know that Red Tractor compliance is essential for market access, but the paperwork shouldn't keep you out of the field. Traditional spreadsheets and paper binders are prone to errors, easy to lose, and stressful during inspection time.
                </p>
                <p>
                  Our team combines deep agricultural knowledge with modern software engineering to build tools that farmers actually want to use. We focus on modularity, offline reliability, and absolute simplicity.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "UK Based Team & Support",
                  "Secure Cloud Infrastructure",
                  "Built for Offline Use",
                  "Constantly Updated for Red Tractor"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-forest" />
                    <span className="font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* scenic view of a UK farm estate with rolling hills */}
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&h=1200&fit=crop" 
                alt="UK Farm Estate" 
                className="rounded-3xl shadow-2xl object-cover w-full h-[600px]"
              />
              <div className="absolute -bottom-8 -left-8 bg-brand-forest text-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <h3 className="font-bold text-xl mb-2">Our Promise</h3>
                <p className="text-brand-pale/90 text-sm">We will never lock you into modules you don't need, and your data remains 100% yours.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
