import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
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
import Admin from "./pages/Admin";
import HelpCentre from "./pages/HelpCentre";
import RegisterInterest from "./pages/RegisterInterest";
import Sectors from "./pages/Sectors";
import Partners from "./pages/Partners";
import Resources from "./pages/Resources";

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "bottom" as const,
  },
  variables: {
    colorPrimary: "#2D6A2E",
    colorForeground: "#1F2937",
    colorMutedForeground: "#526071",
    colorDanger: "#B42318",
    colorBackground: "#FFFFFF",
    colorInput: "#FFFFFF",
    colorInputForeground: "#1F2937",
    colorNeutral: "#D9D1C5",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden border border-[#e5ddd2] shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#1f2937] font-bold",
    headerSubtitle: "text-[#526071]",
    socialButtonsBlockButtonText: "text-[#1f2937]",
    formFieldLabel: "text-[#1f2937] font-medium",
    footerActionLink: "text-[#2d6a2e] font-semibold",
    footerActionText: "text-[#526071]",
    dividerText: "text-[#526071]",
    identityPreviewEditButton: "text-[#2d6a2e]",
    formFieldSuccessText: "text-[#2d6a2e]",
    alertText: "text-[#1f2937]",
    logoBox: "mb-3",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "border-[#d9d1c5] hover:bg-[#f5f0e8]",
    formButtonPrimary: "bg-[#2d6a2e] hover:bg-[#1f4f1f] text-white",
    formFieldInput: "border-[#d9d1c5] text-[#1f2937] focus:border-[#2d6a2e]",
    footerAction: "bg-[#f5f0e8]",
    dividerLine: "bg-[#d9d1c5]",
    alert: "border-[#d9d1c5] bg-[#f5f0e8]",
    otpCodeFieldInput: "border-[#d9d1c5] text-[#1f2937]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}
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
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/terms" component={Terms} />
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

function DashboardRedirect() {
  useEffect(() => {
    window.location.assign("/dashboard/");
  }, []);

  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <DashboardRedirect />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-earth-cream px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-earth-cream px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener]);

  return null;
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
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </ErrorBoundary>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to access BDE Farm Trac." } },
        signUp: { start: { title: "Create your account", subtitle: "Get started with BDE Farm Trac." } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <ScrollToTop />
          <RouteMetadata />
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
