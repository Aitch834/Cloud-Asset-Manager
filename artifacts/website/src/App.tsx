import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // Fire-and-forget visit tracking — never blocks the UI
    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).catch(() => {});
  }, [location]);
  return null;
}

// Page Imports
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Terms from "./pages/Terms";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import HelpCentre from "./pages/HelpCentre";
import RegisterInterest from "./pages/RegisterInterest";
import Sectors from "./pages/Sectors";
import Partners from "./pages/Partners";
import Resources from "./pages/Resources";

const queryClient = new QueryClient();
const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/features": {
    title: "Farm Management Features | BDE Farm Trac",
    description: "Explore configurable farm record, planning, compliance, livestock, crop, equipment, finance and reporting modules from BDE Farm Trac.",
  },
  "/pricing": {
    title: "Module-Based Farm Software Pricing | BDE Farm Trac",
    description: "Build a per-holding BDE Farm Trac estimate from the platform base, required compliance module, optional modules and included bundles.",
  },
  "/help": {
    title: "Farm Software Help Centre | BDE Farm Trac",
    description: "Find practical answers about BDE Farm Trac setup, mobile and offline records, farming sectors, reporting, integrations and compliance boundaries.",
  },
  "/register-interest": {
    title: "Register Interest in BDE Farm Trac",
    description: "Tell us about your farm, holdings and modules of interest to discuss a tailored introduction and 30-day BDE Farm Trac trial.",
  },
};
const DEFAULT_META = {
  title: "BDE Farm Trac | Farm Records, Planning & Compliance",
  description: "BDE Farm Trac brings farm records, planning, evidence and reporting together in configurable modules for UK farming businesses.",
};

function setMetaProperty(property: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.content = content;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/terms" component={Terms} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/help" component={HelpCentre} />
      <Route path="/register-interest" component={RegisterInterest} />
      <Route path="/sectors" component={Sectors} />
      <Route path="/partners" component={Partners} />
      <Route path="/resources" component={Resources} />
      <Route component={NotFound} />
    </Switch>
  );
}

function RouteMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    const path = location.split("?")[0];
    const meta = ROUTE_META[path] ?? DEFAULT_META;
    document.title = meta.title;
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }
    description.content = meta.description;
    setMetaProperty("og:title", meta.title);
    setMetaProperty("og:description", meta.description);
  }, [location]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ScrollToTop />
            <RouteMetadata />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
