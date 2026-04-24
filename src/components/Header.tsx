import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useContent, useContentBlock } from "@/contexts/ContentContext";
import { getCsrfToken } from "@/lib/csrf";
import { Menu, X, ChevronDown, Minus, Plus, Save, GripVertical } from "lucide-react";
import logo from "@/assets/newlogo.png";

interface LogoSettings {
  height?: number;
  offsetX?: number;
  offsetY?: number;
}

function parseLogoSettings(raw: string): LogoSettings {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return {
        height: typeof parsed.height === "number" && isFinite(parsed.height) ? parsed.height : undefined,
        offsetX: typeof parsed.offsetX === "number" && isFinite(parsed.offsetX) ? parsed.offsetX : undefined,
        offsetY: typeof parsed.offsetY === "number" && isFinite(parsed.offsetY) ? parsed.offsetY : undefined,
      };
    }
  } catch { /* use defaults */ }
  return {};
}

const Header = () => {
  const { lang, t, setLanguage, localePath } = useLanguage();
  const { currency, toggleCurrency } = useCurrency();
  const { isAdmin } = useContent();
  const location = useLocation();

  const { content: logoSettingsRaw } = useContentBlock("/", "header.logoSettings", "{}");
  const adminLogo = parseLogoSettings(logoSettingsRaw);

  const [logoEditorOpen, setLogoEditorOpen] = useState(false);
  const [draftLogo, setDraftLogo] = useState<LogoSettings>({});
  const [logoSaving, setLogoSaving] = useState(false);
  const logoEditorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftLogo(adminLogo);
  }, [logoSettingsRaw]);

  const saveLogoSettings = useCallback(async (settings: LogoSettings) => {
    setLogoSaving(true);
    try {
      const csrf = getCsrfToken();
      const res = await fetch("/api/admin/content/by-path", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "x-csrf-token": csrf } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          pagePath: "/",
          blockKey: "header.logoSettings",
          content: JSON.stringify(settings),
          contentType: "json",
        }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
    } finally {
      setLogoSaving(false);
    }
  }, []);

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
    { label: t.nav.introduction, path: "/bemutatkozas" },
    { label: t.nav.team, path: "/munkatarsaink" },
    { label: t.nav.testimonials, path: "/velemenyek" },
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
    setLogoEditorOpen(false);
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
      if (logoEditorOpen) setLogoEditorOpen(false);
      if (aboutOpen) setAboutOpen(false);
      if (servicesOpen) setServicesOpen(false);
      if (menuOpen) setMenuOpen(false);
    }
  }, [menuOpen, aboutOpen, servicesOpen, logoEditorOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close desktop dropdowns and logo editor on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (logoEditorRef.current && !logoEditorRef.current.contains(e.target as Node)) {
        setLogoEditorOpen(false);
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

  const langLabel = lang === "hu" ? t.common.switchToEnglish : t.common.switchToHungarian;
  const currencyLabel = currency === "HUF" ? t.common.switchToEur : t.common.switchToHuf;

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
          <div className="relative mr-auto" ref={logoEditorRef}>
            <Link
              to={localePath("/")}
              className={`flex items-center gap-2 -ml-6 sm:-ml-10 md:-ml-20 lg:-ml-32 ${focusRing}`}
              data-editable="header.logoSettings"
              data-page="/"
              onClick={isAdmin ? (e) => { e.preventDefault(); setLogoEditorOpen(!logoEditorOpen); } : undefined}
            >
              <img
                src={logo}
                alt={t.common.logoAlt}
                className={`h-28 sm:h-36 md:h-44 lg:h-56 -my-2 sm:-my-4 md:-my-6 lg:-my-10 rounded object-contain ${isAdmin ? "ring-2 ring-dashed ring-blue-400/50" : ""}`}
                style={
                  adminLogo.height
                    ? {
                        height: `${adminLogo.height * 4}px`,
                        marginLeft: adminLogo.offsetX ? `${adminLogo.offsetX * 4}px` : undefined,
                        marginTop: adminLogo.offsetY ? `${adminLogo.offsetY * 4}px` : undefined,
                        marginBottom: adminLogo.offsetY ? `${adminLogo.offsetY * 4}px` : undefined,
                      }
                    : undefined
                }
              />
            </Link>

            {isAdmin && logoEditorOpen && (
              <div
                className="absolute top-full left-0 mt-2 z-[60] bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-64"
                role="dialog"
                aria-label="Logo beállítások"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                    <GripVertical className="h-3 w-3" aria-hidden="true" />
                    Logo beállítások
                  </span>
                  <button
                    type="button"
                    onClick={() => setLogoEditorOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Bezárás"
                  >
                    <X className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Méret (magasság)</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Kisebb"
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        onClick={() => setDraftLogo((prev) => ({ ...prev, height: Math.max(20, (prev.height ?? 56) - 4) }))}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-mono text-gray-700 min-w-[3rem] text-center">
                        {(draftLogo.height ?? 56) * 4}px
                      </span>
                      <button
                        type="button"
                        aria-label="Nagyobb"
                        className="p-1.5 border border-gray-300 rounded hover:bg-gray-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        onClick={() => setDraftLogo((prev) => ({ ...prev, height: Math.min(80, (prev.height ?? 56) + 4) }))}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Vízszintes eltolás</label>
                    <input
                      type="range"
                      min={-40}
                      max={10}
                      step={1}
                      value={draftLogo.offsetX ?? 0}
                      onChange={(e) => setDraftLogo((prev) => ({ ...prev, offsetX: Number(e.target.value) }))}
                      className="w-full h-2 accent-blue-500"
                      aria-label="Vízszintes eltolás"
                    />
                    <span className="text-xs text-gray-400">{(draftLogo.offsetX ?? 0) * 4}px</span>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Függőleges eltolás</label>
                    <input
                      type="range"
                      min={-15}
                      max={5}
                      step={1}
                      value={draftLogo.offsetY ?? 0}
                      onChange={(e) => setDraftLogo((prev) => ({ ...prev, offsetY: Number(e.target.value) }))}
                      className="w-full h-2 accent-blue-500"
                      aria-label="Függőleges eltolás"
                    />
                    <span className="text-xs text-gray-400">{(draftLogo.offsetY ?? 0) * 4}px</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await saveLogoSettings(draftLogo);
                      setLogoEditorOpen(false);
                    }}
                    disabled={logoSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors min-h-[44px]"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {logoSaving ? "Mentés..." : "Mentés"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop navigation */}
          <nav aria-label={t.common.mainNavigation} className="hidden lg:flex items-center gap-6">
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
                aria-controls="about-menu"
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
                  id="about-menu"
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
                        aria-controls="services-menu"
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
                          id="services-menu"
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
            aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
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
            <nav aria-label={t.common.mobileNavigation} className="flex flex-col gap-2 pt-4">
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
                  aria-controls="mobile-about-menu"
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
                  <div id="mobile-about-menu" className="pl-4 flex flex-col gap-1">
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
                        aria-controls="mobile-services-menu"
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
                        <div id="mobile-services-menu" className="pl-4 flex flex-col gap-1">
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
                className={`px-3 py-2 text-xs font-semibold uppercase border-2 border-[#0B2340]/40 rounded text-[#0B2340] hover:bg-[#0B2340]/10 transition-colors ${focusRing}`}
              >
                {lang === "hu" ? "EN" : "HU"}
              </button>
              <button
                onClick={toggleCurrency}
                aria-label={currencyLabel}
                className={`px-3 py-2 text-xs font-semibold uppercase border-2 border-[#0B2340]/40 rounded text-[#0B2340] hover:bg-[#0B2340]/10 transition-colors ${focusRing}`}
              >
                {currency === "HUF" ? "EUR" : "HUF"}
              </button>
            </div>

            {/* Mobile contact info */}
            <div className="flex flex-col gap-1.5 mt-4 px-2 pt-4 border-t border-[#0B2340]/15">
              <a
                href="mailto:info@gerecseingatlan.hu"
                className={`text-sm font-semibold text-[#0B2340] hover:text-gold transition-colors ${focusRing}`}
              >
                info@gerecseingatlan.hu
              </a>
              <a
                href="tel:+36706132658"
                className={`text-sm font-semibold text-[#0B2340] hover:text-gold transition-colors ${focusRing}`}
              >
                +36 70 613 2658
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
