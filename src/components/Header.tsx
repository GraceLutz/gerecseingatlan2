import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/newlogo.png";

const Header = () => {
  const { lang, t, setLanguage, localePath } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const aboutTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const aboutSubLinks = [
    { label: lang === "hu" ? "Bemutatkozás" : "Introduction", path: "/bemutatkozas" },
    { label: lang === "hu" ? "Munkatársaink" : "Our Team", path: "/munkatarsaink" },
    { label: lang === "hu" ? "Vélemények" : "Testimonials", path: "/velemenyek" },
  ];

  const serviceSubLinks = [
    { label: t.services.salesTitle, path: "/ingatlan-ertekesites-berbeadas" },
    { label: t.services.appraisalTitle, path: "/ertekbecsles-ertekmeghatrozas" },
    { label: t.services.interiorTitle, path: "/belsoepiteszet-latvanyterv" },
    { label: t.services.legalTitle, path: "/teljeskoru-jogi-hatter" },
    { label: t.services.loanTitle, path: "/hitel-allami-tamogatasok" },
    { label: t.services.energyTitle, path: "/energetikai-tanusitvany" },
    { label: t.services.electricalTitle, path: "/villamos-biztonsagi-felulvizsgalat" },
  ];


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setAboutOpen(false);
    setMobileAboutOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  // Close menus on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (aboutOpen) setAboutOpen(false);
      if (servicesOpen) setServicesOpen(false);
      if (menuOpen) setMenuOpen(false);
    }
  }, [menuOpen, aboutOpen, servicesOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close desktop dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAboutMouseEnter = () => {
    clearTimeout(aboutTimeoutRef.current);
    setAboutOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => setAboutOpen(false), 150);
  };

  const handleServicesMouseEnter = () => {
    clearTimeout(servicesTimeoutRef.current);
    setServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => setServicesOpen(false), 150);
  };

  const navLinks = [
    { label: t.nav.home, path: "/" },
    { label: t.nav.properties, path: "/ingatlanok" },
    { label: t.nav.contact, path: "/kapcsolat" },
    { label: t.nav.faq, path: "/gyik" },
  ];

  const isAboutActive = aboutSubLinks.some((s) => location.pathname === localePath(s.path));

  const langLabel = lang === "hu" ? "Switch to English" : "Váltás magyarra";
  const currencyLabel = currency === "HUF" ? "Switch to EUR" : "Váltás HUF-ra";

  // Shared focus-visible ring for keyboard users (WCAG 2.1 AA — 2.4.7 Focus Visible).
  // Ring offset matches the header bg (#FFFFF0) so the ring reads clearly against it.
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2340] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFF0] rounded-sm";

  // Dark navy on #8FBC8F → ~11:1 contrast (WCAG AA for normal text ≥4.5:1 satisfied).
  const linkClass = (isActive: boolean) =>
    `text-base md:text-lg font-body font-semibold uppercase tracking-wider transition-colors hover:text-gold ${focusRing} ${
      isActive ? "text-gold" : "text-[#0B2340]"
    }`;

  const mobileLinkClass = (isActive: boolean) =>
    `text-base font-semibold uppercase tracking-wider py-3 px-2 transition-colors hover:text-gold ${focusRing} ${
      isActive ? "text-gold" : "text-[#0B2340]"
    }`;

  const mobileSubLinkClass =
    `text-sm text-[#0B2340]/85 hover:text-gold py-2 px-2 transition-colors ${focusRing}`;

  const isServicesActive = serviceSubLinks.some((s) => location.pathname === localePath(s.path));

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#FFFFF0] shadow-lg" : "bg-[#FFFFF0]"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 md:h-28">
          <Link to={localePath("/")} className={`flex items-center gap-2 mr-auto -ml-20 md:-ml-32 ${focusRing}`}>
            <img
              src={logo}
              alt={lang === "hu" ? "Gerecse Ingatlan — Kezdőlap" : "Gerecse Ingatlan — Home"}
              className="h-40 md:h-56 -my-6 md:-my-10 rounded"
            />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label={lang === "hu" ? "Fő navigáció" : "Main navigation"} className="hidden lg:flex items-center gap-6">
            {/* Home link */}
            <Link
              to={localePath("/")}
              aria-current={location.pathname === localePath("/") || location.pathname === "/en" ? "page" : undefined}
              className={linkClass(location.pathname === localePath("/") || location.pathname === "/en")}
            >
              {t.nav.home}
            </Link>

            {/* Rólunk dropdown */}
            <div
              ref={aboutDropdownRef}
              className="relative"
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                aria-expanded={aboutOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1 ${linkClass(isAboutActive)}`}
              >
                {t.nav.about}
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`transition-transform duration-200 ${aboutOpen ? "rotate-180" : ""}`}
                />
              </button>

              {aboutOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-dark-navy border border-primary-foreground/15 rounded-lg shadow-xl py-2"
                >
                  {aboutSubLinks.map((sub) => (
                    <Link
                      key={sub.path}
                      to={localePath(sub.path)}
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-primary-foreground/85 hover:text-gold hover:bg-primary-foreground/5 transition-colors focus-visible:outline-none focus-visible:bg-primary-foreground/10 focus-visible:text-gold"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.filter(l => l.path !== "/").map((link) => {
              const href = localePath(link.path);
              const isActive =
                location.pathname === href ||
                (link.path === "/" && location.pathname === "/en");

              // Insert services dropdown after properties
              if (link.path === "/ingatlanok") {
                return (
                  <Fragment key={link.path}>
                    <Link
                      to={href}
                      aria-current={isActive ? "page" : undefined}
                      className={linkClass(isActive)}
                    >
                      {link.label}
                    </Link>

                    {/* Services dropdown */}
                    <div
                      ref={servicesDropdownRef}
                      className="relative"
                      onMouseEnter={handleServicesMouseEnter}
                      onMouseLeave={handleServicesMouseLeave}
                    >
                      <button
                        onClick={() => setServicesOpen(!servicesOpen)}
                        aria-expanded={servicesOpen}
                        aria-haspopup="menu"
                        className={`flex items-center gap-1 ${linkClass(isServicesActive)}`}
                      >
                        {t.nav.services}
                        <ChevronDown
                          size={14}
                          aria-hidden="true"
                          className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {servicesOpen && (
                        <div
                          role="menu"
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-dark-navy border border-primary-foreground/15 rounded-lg shadow-xl py-2"
                        >
                          {serviceSubLinks.map((sub) => (
                            <Link
                              key={sub.path}
                              to={localePath(sub.path)}
                              role="menuitem"
                              className="block px-4 py-2.5 text-sm text-primary-foreground/85 hover:text-gold hover:bg-primary-foreground/5 transition-colors focus-visible:outline-none focus-visible:bg-primary-foreground/10 focus-visible:text-gold"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </Fragment>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={href}
                  aria-current={isActive ? "page" : undefined}
                  className={linkClass(isActive)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop controls */}
          <div className="hidden lg:flex items-center gap-1 ml-auto">
            <button
              onClick={() => setLanguage(lang === "hu" ? "en" : "hu")}
              aria-label={langLabel}
              className={`px-3 py-2 text-sm font-semibold uppercase border-2 border-[#0B2340]/40 rounded text-[#0B2340] hover:bg-[#0B2340]/10 transition-colors ${focusRing}`}
            >
              {lang === "hu" ? "EN" : "HU"}
            </button>
            <button
              onClick={toggleCurrency}
              aria-label={currencyLabel}
              className={`px-3 py-2 text-sm font-semibold uppercase border-2 border-[#0B2340]/40 rounded text-[#0B2340] hover:bg-[#0B2340]/10 transition-colors ${focusRing}`}
            >
              {currency === "HUF" ? "EUR" : "HUF"}
            </button>

            {/* Contact info */}
            <div className="flex flex-col gap-1 ml-6 pl-6 border-l border-[#0B2340]/20">
              <a href="mailto:info@gerecseingatlan.hu" className={`text-sm font-semibold text-[#0B2340] hover:text-gold transition-colors ${focusRing}`}>
                info@gerecseingatlan.hu
              </a>
              <a href="tel:+36706132658" className={`text-sm font-semibold text-[#0B2340] hover:text-gold transition-colors ${focusRing}`}>
                +36 70 613 2658
              </a>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`lg:hidden text-[#0B2340] p-2 ${focusRing}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen
              ? (lang === "hu" ? "Menü bezárása" : "Close menu")
              : (lang === "hu" ? "Menü megnyitása" : "Open menu")
            }
          >
            {menuOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden pb-4 border-t border-[#0B2340]/15"
          >
            <nav aria-label={lang === "hu" ? "Mobil navigáció" : "Mobile navigation"} className="flex flex-col gap-2 pt-4">
              {/* Home */}
              <Link
                to={localePath("/")}
                onClick={() => setMenuOpen(false)}
                aria-current={location.pathname === localePath("/") || location.pathname === "/en" ? "page" : undefined}
                className={mobileLinkClass(location.pathname === localePath("/") || location.pathname === "/en")}
              >
                {t.nav.home}
              </Link>

              {/* Rólunk accordion */}
              <div>
                <button
                  onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                  aria-expanded={mobileAboutOpen}
                  className={`flex items-center justify-between w-full ${mobileLinkClass(isAboutActive)}`}
                >
                  {t.nav.about}
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${mobileAboutOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileAboutOpen && (
                  <div className="pl-4 flex flex-col gap-1">
                    {aboutSubLinks.map((sub) => (
                      <Link
                        key={sub.path}
                        to={localePath(sub.path)}
                        onClick={() => setMenuOpen(false)}
                        className={mobileSubLinkClass}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {navLinks.filter(l => l.path !== "/").map((link) => {
                const href = localePath(link.path);
                const isActive =
                  location.pathname === href ||
                  (link.path === "/" && location.pathname === "/en");

                // Insert services accordion after properties in mobile
                if (link.path === "/ingatlanok") {
                  return (
                    <div key={link.path}>
                      <Link
                        to={href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`block ${mobileLinkClass(isActive)}`}
                      >
                        {link.label}
                      </Link>

                      {/* Services expandable section */}
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        aria-expanded={mobileServicesOpen}
                        className={`flex items-center justify-between w-full ${mobileLinkClass(isServicesActive)}`}
                      >
                        {t.nav.services}
                        <ChevronDown
                          size={16}
                          aria-hidden="true"
                          className={`transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {mobileServicesOpen && (
                        <div className="pl-4 flex flex-col gap-1">
                          {serviceSubLinks.map((sub) => (
                            <Link
                              key={sub.path}
                              to={localePath(sub.path)}
                              onClick={() => setMenuOpen(false)}
                              className={mobileSubLinkClass}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={mobileLinkClass(isActive)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex gap-3 mt-4 px-2">
              <button
                onClick={() => setLanguage(lang === "hu" ? "en" : "hu")}
                aria-label={langLabel}
                className={`px-3 py-1.5 text-xs font-semibold uppercase border border-primary-foreground/30 rounded text-foreground ${focusRing}`}
              >
                {lang === "hu" ? "EN" : "HU"}
              </button>
              <button
                onClick={toggleCurrency}
                aria-label={currencyLabel}
                className={`px-3 py-1.5 text-xs font-semibold uppercase border border-accent/50 rounded text-gold ${focusRing}`}
              >
                {currency === "HUF" ? "EUR" : "HUF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
