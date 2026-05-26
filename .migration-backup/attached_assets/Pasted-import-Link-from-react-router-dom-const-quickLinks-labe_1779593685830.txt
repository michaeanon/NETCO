import { Link } from "react-router-dom";
const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Pricing", path: "/pricing" },
  { label: "How to Connect", path: "/how-to-connect" },
  { label: "Server Status", path: "/server-status" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Check Expiry", path: "/check-expiry" },
];
const supportLinks = [
  { label: "FAQs", path: "/faqs" },
  { label: "Terms of Service", path: "/terms" },
  { label: "Contact Us", path: "/contact" },
  { label: "Admin Panel", path: "/admin" },
];
export default function Footer() {
  return (
    <footer className="relative bg-netco-darker border-t border-netco-border/30">
      <div className="absolute inset-0 cyber-grid-bg opacity-20" />
    <br>
      <div className="relative z-10 w-full px-4 md:px-8 lg:px-16 xl:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-netco-cyan to-netco-purple flex items-center justify-center">
                <i className="ri-global-line text-netco-darker text-lg"></i>
              </div>
              <span className="font-heading text-xl font-bold gradient-text">
                NETCO
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Premium VPN internet configs for Kenya. Unlimited data on Safaricom, Airtel & Telkom. Fast, secure, and reliable.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/254782829321"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-netco-card border border-netco-border/50 flex items-center justify-center text-gray-400 hover:text-netco-success hover:border-netco-success/30 transition-all"
              >
                <i className="ri-whatsapp-line text-lg"></i>
              </a>
              <a
                href="https://t.me/netco"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-netco-card border border-netco-border/50 flex items-center justify-center text-gray-400 hover:text-netco-cyan hover:border-netco-cyan/30 transition-all"
              >
                <i className="ri-telegram-line text-lg"></i>
              </a>
              <a
                href="mailto:netco@anonymiketech.online"
                className="w-10 h-10 rounded-lg bg-netco-card border border-netco-border/50 flex items-center justify-center text-gray-400 hover:text-netco-purple hover:border-netco-purple/30 transition-all"
              >
                <i className="ri-mail-line text-lg"></i>
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-netco-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 text-sm hover:text-netco-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <i className="ri-whatsapp-line text-netco-success mt-0.5"></i>
                <div>
                  <p className="text-gray-400 text-sm">WhatsApp Support</p>
                  <a
                    href="https://wa.me/254782829321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white text-sm hover:text-netco-success transition-colors"
                  >
                    +254 782 829 321
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-mail-line text-netco-purple mt-0.5"></i>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <a
                    href="mailto:netco@anonymiketech.online"
                    className="text-white text-sm hover:text-netco-purple transition-colors"
                  >
                    netco@anonymiketech.online
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-time-line text-netco-cyan mt-0.5"></i>
                <div>
                  <p className="text-gray-400 text-sm">Support Hours</p>
                  <p className="text-white text-sm">24 / 7 / 365</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-netco-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} NETCO. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs uppercase tracking-wider">
            Systems managed by ANONYMIKETECH
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}