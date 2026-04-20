import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import CookieConsent from "./CookieConsent";
import SEOHead from "./SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

interface LayoutProps {
  children: React.ReactNode;
  /** Page title for SEO (appended to site name) */
  title?: string;
  /** Meta description for SEO */
  description?: string;
  /** Canonical path for SEO (without locale prefix) */
  canonicalPath?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description, canonicalPath }) => {
  const { t } = useLanguage();
  const skipLabel = t.common.skipToContent;

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-gold focus:text-accent-foreground focus:rounded focus:font-semibold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      >
        {skipLabel}
      </a>
      <SEOHead title={title} description={description} canonicalPath={canonicalPath} />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-20 md:pt-28 focus:outline-none">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
};

export default Layout;
