import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ContentProvider } from "@/contexts/ContentContext";
import Analytics from "./components/Analytics";

// Load editor bridge in edit mode
if (new URLSearchParams(window.location.search).get("editMode") === "1") {
  import("./admin/editorBridge");
}
import Index from "./pages/Index";
import IntroductionPage from "./pages/IntroductionPage";
import TeamPage from "./pages/TeamPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import NotFound from "./pages/NotFound";

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const LoginPage = lazy(() => import("./pages/admin/LoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminContentPage = lazy(() => import("./pages/admin/ContentPage"));
const AdminContentListPage = lazy(() => import("./pages/admin/ContentListPage"));
const AdminNewsletterPage = lazy(() => import("./pages/admin/NewsletterPage"));
const AdminStaffPage = lazy(() => import("./pages/admin/StaffPage"));
const AdminCalendarPage = lazy(() => import("./pages/admin/CalendarPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const AdminAiAgentPage = lazy(() => import("./pages/admin/AiAgentPage"));

/* Legal / compliance pages — lazy-loaded since they are rarely visited */
const ImpresszumPage = lazy(() => import("./pages/ImpresszumPage"));
const AdatkezelesiPage = lazy(() => import("./pages/AdatkezelesiPage"));
const CookieTajekoztato = lazy(() => import("./pages/CookieTajekoztato"));
const ASZFPage = lazy(() => import("./pages/ASZFPage"));

/** Minimal loading fallback for lazy-loaded pages */
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Betöltés...">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const queryClient = new QueryClient();

/**
 * React Error Boundary — catches runtime errors in the component tree
 * and shows a Hungarian error page instead of a white screen.
 * Placed outside BrowserRouter so it cannot use router hooks.
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isEn = typeof window !== "undefined" && (window.location.pathname === "/en" || window.location.pathname.startsWith("/en/"));
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <h1 className="mb-4 text-7xl font-heading font-bold text-dark-navy" aria-label={isEn ? "Error 500" : "Hiba 500"}>
              500
            </h1>
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {isEn ? "An unexpected error occurred" : "Váratlan hiba történt"}
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              {isEn
                ? "Something went wrong. Please try again later."
                : "Valami hiba történt. Kérjük, próbálja újra később."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={isEn ? "/en" : "/"}
                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {isEn ? "Return to Home" : "Vissza a kezdőlapra"}
              </a>
              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="inline-block px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              >
                {isEn ? "Try again" : "Próbáld újra"}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppRoutes = () => (
  <LanguageProvider>
    <CurrencyProvider>
      <ContentProvider>
      <Analytics />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Hungarian routes */}
          <Route path="/" element={<Index />} />
          <Route path="/bemutatkozas" element={<IntroductionPage />} />
          <Route path="/munkatarsaink" element={<TeamPage />} />
          <Route path="/ingatlanok" element={<PropertiesPage />} />
          <Route path="/ingatlan/:id" element={<PropertyDetailPage />} />
          <Route path="/velemenyek" element={<TestimonialsPage />} />
          <Route path="/kapcsolat" element={<ContactPage />} />
          <Route path="/gyik" element={<FaqPage />} />
          {/* Hungarian legal / compliance pages */}
          <Route path="/impresszum" element={<ImpresszumPage />} />
          <Route path="/adatkezelesi-tajekoztato" element={<AdatkezelesiPage />} />
          <Route path="/cookie-tajekoztato" element={<CookieTajekoztato />} />
          <Route path="/aszf" element={<ASZFPage />} />

          {/* Admin routes — must be before /:slug catch-all */}
          <Route path="/admin/login" element={<AuthProvider><LoginPage /></AuthProvider>} />
          <Route path="/admin" element={<AuthProvider><AdminLayout /></AuthProvider>}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="felhasznalok" element={<AdminUsersPage />} />
            <Route path="tartalom" element={<AdminContentPage />} />
            <Route path="tartalom-lista" element={<AdminContentListPage />} />
            <Route path="hirlevel" element={<AdminNewsletterPage />} />
            <Route path="munkatarsak" element={<AdminStaffPage />} />
            <Route path="naptar" element={<AdminCalendarPage />} />
            <Route path="beallitasok" element={<AdminSettingsPage />} />
            <Route path="ai-agent" element={<AdminAiAgentPage />} />
            <Route index element={<AdminDashboardPage />} />
          </Route>

          {/* Typo redirects */}
          <Route path="/ergetikai-tanusitvany" element={<Navigate to="/energetikai-tanusitvany" replace />} />

          {/* Hungarian catch-all for service detail pages (must be after named routes) */}
          <Route path="/:slug" element={<ServiceDetailPage />} />

          {/* English routes — translated slugs matching localePath() output */}
          <Route path="/en" element={<Index />} />
          <Route path="/en/introduction" element={<IntroductionPage />} />
          <Route path="/en/our-team" element={<TeamPage />} />
          <Route path="/en/testimonials" element={<TestimonialsPage />} />
          <Route path="/en/properties" element={<PropertiesPage />} />
          <Route path="/en/property/:id" element={<PropertyDetailPage />} />
          <Route path="/en/contact" element={<ContactPage />} />
          <Route path="/en/faq" element={<FaqPage />} />
          {/* English legal / compliance pages */}
          <Route path="/en/impresszum" element={<ImpresszumPage />} />
          <Route path="/en/privacy-policy" element={<AdatkezelesiPage />} />
          <Route path="/en/cookie-policy" element={<CookieTajekoztato />} />
          <Route path="/en/terms" element={<ASZFPage />} />

          {/* Redirects: old /en/hungarian-slug → /en/english-slug */}
          <Route path="/en/ingatlan-ertekesites-berbeadas" element={<Navigate to="/en/property-sales-and-rental" replace />} />
          <Route path="/en/ertekbecsles-ertekmeghatrozas" element={<Navigate to="/en/appraisal-and-valuation" replace />} />
          <Route path="/en/belsoepiteszet-latvanyterv" element={<Navigate to="/en/interior-design-and-visualization" replace />} />
          <Route path="/en/teljeskoru-jogi-hatter" element={<Navigate to="/en/full-legal-support" replace />} />
          <Route path="/en/hitel-allami-tamogatasok" element={<Navigate to="/en/credit-and-state-support" replace />} />
          <Route path="/en/ergetikai-tanusitvany" element={<Navigate to="/en/energy-performance-certificate" replace />} />
          <Route path="/en/energetikai-tanusitvany" element={<Navigate to="/en/energy-performance-certificate" replace />} />
          <Route path="/en/villamos-biztonsagi-felulvizsgalat" element={<Navigate to="/en/electrical-safety-inspection" replace />} />

          {/* Redirects: old /en/english-slug → new /en/english-slug */}
          <Route path="/en/energy-certificate" element={<Navigate to="/en/energy-performance-certificate" replace />} />
          <Route path="/en/property-sales-and-rentals" element={<Navigate to="/en/property-sales-and-rental" replace />} />
          <Route path="/en/interior-design" element={<Navigate to="/en/interior-design-and-visualization" replace />} />
          <Route path="/en/loans-and-subsidies" element={<Navigate to="/en/credit-and-state-support" replace />} />

          {/* English catch-all for service detail pages */}
          <Route path="/en/:slug" element={<ServiceDetailPage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ContentProvider>
    </CurrencyProvider>
  </LanguageProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
