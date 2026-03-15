import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-brand-forest/10 rounded-2xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-brand-forest" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
            <p className="text-lg text-muted-foreground">
              Page not found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The page you are looking for does not exist or has been moved.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild className="bg-brand-forest hover:bg-brand-sage text-white">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
