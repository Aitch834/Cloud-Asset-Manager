import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Register Interest" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <img 
              src="/bde-farm-trac-logo.png" 
              alt="BDE Farm Trac" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                // Fallback if logo isn't in public yet
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <span className="hidden font-heading font-bold text-2xl tracking-tight text-brand-forest">
              BDE Farm Trac
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-forest ${
                  location === link.href ? "text-brand-forest" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-earth-brown hover:text-brand-forest hover:bg-brand-pale" asChild>
              <Link href="/login">Client Login</Link>
            </Button>
            <Button className="bg-brand-forest hover:bg-brand-sage text-white rounded-full px-6 shadow-md shadow-brand-forest/20" asChild>
              <Link href="/contact">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border shadow-lg overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    location === link.href 
                      ? "bg-brand-pale text-brand-forest" 
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-center h-12" asChild>
                  <Link href="/login">Client Login</Link>
                </Button>
                <Button className="w-full justify-center h-12 bg-brand-forest hover:bg-brand-sage" asChild>
                  <Link href="/contact">Register Interest</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
