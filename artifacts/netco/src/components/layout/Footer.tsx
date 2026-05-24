import { Link } from "wouter";
import { Shield, Twitter, MessageCircle, Github, Mail, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group inline-flex" data-testid="link-footer-logo">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-foreground">
                NETCO
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Premium VPN configurations for Kenyan power users. Fast, secure, and unrestricted internet access across Safaricom, Airtel, and Telkom networks.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" data-testid="link-social-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" data-testid="link-social-telegram">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors" data-testid="link-social-github">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-foreground tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-pricing">Pricing Plans</Link>
              </li>
              <li>
                <Link href="/how-to-connect" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-guide">Connection Guide</Link>
              </li>
              <li>
                <Link href="/server-status" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-status">Server Status</Link>
              </li>
              <li>
                <Link href="/check-expiry" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-check">Check Plan Expiry</Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-foreground tracking-wide">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-faqs">FAQs</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-terms">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-foreground tracking-wide">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">WhatsApp Support</p>
                  <p className="text-sm text-muted-foreground">+254 700 000000</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">support@netco.co.ke</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Working Hours</p>
                  <p className="text-sm text-muted-foreground">8:00 AM - 10:00 PM (EAT)</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NETCO VPN. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
