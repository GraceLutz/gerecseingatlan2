import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", toggle);
    return () => window.removeEventListener("scroll", toggle);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      aria-label={isEnglish ? "Scroll to top" : "Vissza az oldal tetejére"}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
};

export default ScrollToTop;
