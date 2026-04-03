import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateLead } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Schema mirrors CreateLeadBody
const formSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  farmCount: z.coerce.number().min(1, "Must have at least 1 farm"),
  modulesInterested: z.array(z.string()).min(1, "Select at least one module"),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AVAILABLE_MODULES = [
  { id: "red-tractor-compliance", label: "Red Tractor Compliance" },
  { id: "field-crop-management", label: "Field & Crop Management" },
  { id: "crop-trials", label: "Crop Trials" },
  { id: "sprays-inputs", label: "Sprays & Inputs" },
  { id: "soil-management", label: "Soil Management" },
  { id: "equipment-workshop", label: "Equipment, Workshop & Fuel" },
  { id: "livestock-management", label: "Livestock & Feed Management" },
  { id: "biosecurity", label: "Biosecurity & Visitors" },
  { id: "staff-training", label: "Staff & Training" },
  { id: "safety-risk-audits", label: "Safety, Risk & Audits" },
  { id: "environment-sustainability", label: "Environment & Sustainability" },
  { id: "water-irrigation", label: "Water & Irrigation Management" },
  { id: "finance-business", label: "Finance & Business" },
  { id: "document-management", label: "Document Management" },
  { id: "weather-tracking", label: "Weather Tracking" },
  { id: "platform-addons", label: "Platform Add-ons (SMS & Advisor Access)" },
  { id: "biofuel-rtfo", label: "Biofuel / RTFO Compliance" },
  { id: "pig-production", label: "Pig Production" },
  { id: "poultry-production", label: "Poultry Production" },
  { id: "horticulture", label: "Horticulture & Fresh Produce" },
  { id: "farm-diversification", label: "Farm Diversification" },
];

export default function Contact() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const mutation = useCreateLead();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmCount: 1,
      modulesInterested: ["red-tractor-compliance"],
    }
  });

  const selectedModules = watch("modulesInterested");

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ data }, {
      onSuccess: () => {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      onError: () => {
        toast({
          title: "Submission Failed",
          description: "There was an error sending your registration. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Layout>
      <div className="bg-earth-cream min-h-[calc(100vh-88px)] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-3xl shadow-xl text-center border border-border"
            >
              <div className="w-20 h-20 bg-brand-pale rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-brand-forest" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Registration Received!</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Thank you for your interest in BDE Farm Trac. Our team will review your requirements and get in touch within 1 business day to set up your account.
              </p>
              <Button onClick={() => window.location.href = '/'} variant="outline" className="h-12 px-8">
                Return to Home
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Register Your Interest</h1>
                <p className="text-muted-foreground text-lg">
                  Fill out the form below and we'll help you configure the perfect setup for your farm.
                </p>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Business / Farm Name *</label>
                      <Input {...register("businessName")} className={`h-12 bg-secondary/30 ${errors.businessName ? 'border-destructive' : ''}`} placeholder="Green Acres Farm" />
                      {errors.businessName && <p className="text-xs text-destructive">{errors.businessName.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Contact Name *</label>
                      <Input {...register("contactName")} className={`h-12 bg-secondary/30 ${errors.contactName ? 'border-destructive' : ''}`} placeholder="John Doe" />
                      {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Email Address *</label>
                      <Input type="email" {...register("email")} className={`h-12 bg-secondary/30 ${errors.email ? 'border-destructive' : ''}`} placeholder="john@example.com" />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Phone Number</label>
                      <Input type="tel" {...register("phone")} className="h-12 bg-secondary/30" placeholder="07700 900000" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="space-y-2 mb-6">
                      <label className="text-sm font-semibold text-foreground">How many farms do you manage? *</label>
                      <Input type="number" {...register("farmCount")} className={`h-12 bg-secondary/30 max-w-[150px] ${errors.farmCount ? 'border-destructive' : ''}`} min="1" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-foreground">Which modules are you interested in? *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AVAILABLE_MODULES.map(mod => (
                          <div key={mod.id} className="flex items-center space-x-3 bg-secondary/20 p-3 rounded-lg border border-border">
                            <Checkbox 
                              id={mod.id} 
                              checked={selectedModules.includes(mod.id)}
                              onCheckedChange={(checked) => {
                                const current = new Set(selectedModules);
                                if (checked) current.add(mod.id);
                                else current.delete(mod.id);
                                setValue("modulesInterested", Array.from(current), { shouldValidate: true });
                              }}
                            />
                            <label htmlFor={mod.id} className="text-sm font-medium leading-none cursor-pointer">
                              {mod.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      {errors.modulesInterested && <p className="text-xs text-destructive">{errors.modulesInterested.message}</p>}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border space-y-2">
                    <label className="text-sm font-semibold text-foreground">Any additional message or questions?</label>
                    <Textarea {...register("message")} className="min-h-[120px] bg-secondary/30" placeholder="Tell us a bit more about your operation..." />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base bg-brand-forest hover:bg-brand-sage shadow-lg"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
