import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bde_cookie_consent");
    if (!consent) {
      // Small delay so it doesn't immediately pop up jarringly
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("bde_cookie_consent", "accepted");
    setIsVisible(false);
    // Here you would initialize analytics
  };

  const handleReject = () => {
    localStorage.setItem("bde_cookie_consent", "rejected");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto bg-white border border-border shadow-2xl rounded-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground">We value your privacy</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies in accordance with our{" "}
                <Link href="/cookies" className="text-brand-forest hover:underline font-medium">Cookie Policy</Link>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button variant="outline" onClick={handleReject} className="border-border text-muted-foreground hover:bg-secondary">
                Reject Non-Essential
              </Button>
              <Button onClick={handleAccept} className="bg-brand-forest hover:bg-brand-sage text-white">
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
