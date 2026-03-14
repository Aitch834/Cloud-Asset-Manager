import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-forest text-brand-pale pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group inline-block">
              <img
                src={`${import.meta.env.BASE_URL}bde-farm-trac-logo.png`}
                alt="BDE Farm Trac"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-brand-pale/80 text-sm leading-relaxed mt-4 max-w-xs">
              Reducing the administrative burden for UK farmers. Simplifying Red Tractor compliance, field management, and farm operations in one cloud-based platform.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-brand-pale/80 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/features" className="text-brand-pale/80 hover:text-white transition-colors">Features & Modules</Link></li>
              <li><Link href="/pricing" className="text-brand-pale/80 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-brand-pale/80 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal & Support</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-brand-pale/80 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-brand-pale/80 hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/contact" className="text-brand-pale/80 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/login" className="text-brand-pale/80 hover:text-white transition-colors">Client Login</Link></li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new Event("bde:open-cookie-settings"))}
                  className="text-brand-pale/80 hover:text-white transition-colors text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-brand-pale/80">
                <Mail className="w-5 h-5 text-brand-light shrink-0" />
                <span>hello@bdefarmtrac.co.uk</span>
              </li>
              <li className="flex items-start gap-3 text-brand-pale/80">
                <Phone className="w-5 h-5 text-brand-light shrink-0" />
                <span>+44 (0) 1632 960123</span>
              </li>
              <li className="flex items-start gap-3 text-brand-pale/80">
                <MapPin className="w-5 h-5 text-brand-light shrink-0" />
                <span>Innovation Centre,<br/>Agri-Tech Park,<br/>Lincolnshire, UK</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-brand-light/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-brand-pale/60 text-sm">
            &copy; {currentYear} BDE Farm Trac Ltd. All rights reserved.
          </p>
          <div className="text-brand-pale/60 text-sm">
            Proudly built for UK Agriculture
          </div>
        </div>
      </div>
    </footer>
  );
}
