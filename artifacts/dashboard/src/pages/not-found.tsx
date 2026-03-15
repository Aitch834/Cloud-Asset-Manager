import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">404</h1>
          <p className="text-lg text-muted-foreground">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/select">Select Farm</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
