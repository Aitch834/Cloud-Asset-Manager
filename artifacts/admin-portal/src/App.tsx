import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Customers from "@/pages/Customers";
import CustomerDetail from "@/pages/CustomerDetail";
import Leads from "@/pages/Leads";
import Referrals from "@/pages/Referrals";
import SupportTickets from "@/pages/SupportTickets";
import Email from "@/pages/Email";
import Database from "@/pages/Database";
import Invoices from "@/pages/Invoices";
import PlatformConfig from "@/pages/PlatformConfig";
import Lookups from "@/pages/Lookups";
import HelpCentre from "@/pages/HelpCentre";
import NotFound from "@/pages/not-found";
import { getSecret } from "@/lib/auth";

const queryClient = new QueryClient();

function PortalRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/customers" component={Customers} />
        <Route path="/customers/:id" component={CustomerDetail} />
        <Route path="/leads" component={Leads} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/support" component={SupportTickets} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/email" component={Email} />
        <Route path="/database" component={Database} />
        <Route path="/lookups" component={Lookups} />
        <Route path="/platform-config" component={PlatformConfig} />
        <Route path="/help-articles" component={HelpCentre} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const s = getSecret();
    if (s) {
      setAuthed(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {authed ? (
          <PortalRouter />
        ) : (
          <Login onLogin={() => setAuthed(true)} />
        )}
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
