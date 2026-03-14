import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type CookiePreferences = {
  analytics: boolean;
  marketing: boolean;
};

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("bde_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => { clearTimeout(timer); };
    }
    return undefined;
  }, []);

  const handleAccept = () => {
    localStorage.setItem("bde_cookie_consent", "accepted");
    localStorage.setItem("bde_cookie_preferences", JSON.stringify({ analytics: true, marketing: true }));
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("bde_cookie_consent", "rejected");
    localStorage.setItem("bde_cookie_preferences", JSON.stringify({ analytics: false, marketing: false }));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("bde_cookie_consent", "custom");
    localStorage.setItem("bde_cookie_preferences", JSON.stringify(preferences));
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
          <div className="max-w-5xl mx-auto bg-white border border-border shadow-2xl rounded-2xl p-6 pointer-events-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-foreground">We value your privacy</h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your browsing experience and analyse our traffic.
                  By clicking "Accept All", you consent to our use of cookies in accordance with our{" "}
                  <Link href="/cookies" className="text-brand-forest hover:underline font-medium">Cookie Policy</Link>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Manage Preferences
                </Button>
                <Button variant="outline" onClick={handleReject} className="border-border text-muted-foreground hover:bg-secondary">
                  Reject Non-Essential
                </Button>
                <Button onClick={handleAccept} className="bg-brand-forest hover:bg-brand-sage text-white">
                  Accept All
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Essential Cookies</p>
                        <p className="text-xs text-muted-foreground">Required for the website to function. Cannot be disabled.</p>
                      </div>
                      <div className="bg-brand-forest/10 text-brand-forest text-xs font-medium px-3 py-1 rounded-full">Always On</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Analytics Cookies</p>
                        <p className="text-xs text-muted-foreground">Help us understand how visitors interact with our website.</p>
                      </div>
                      <button
                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${preferences.analytics ? "bg-brand-forest" : "bg-gray-300"}`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.analytics ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Marketing Cookies</p>
                        <p className="text-xs text-muted-foreground">Used to deliver relevant advertisements and track campaigns.</p>
                      </div>
                      <button
                        onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                        className={`w-11 h-6 rounded-full transition-colors relative ${preferences.marketing ? "bg-brand-forest" : "bg-gray-300"}`}
                      >
                        <span className={`block w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${preferences.marketing ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={handleSavePreferences} className="bg-brand-forest hover:bg-brand-sage text-white">
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
