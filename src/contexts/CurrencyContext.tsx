import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { formatPrice as formatPriceUtil, DEFAULT_EUR_RATE } from "@/lib/currencyConverter";

/** Supported display currencies */
type Currency = "HUF" | "EUR";

/** Shape of the currency context consumed by useContext */
interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (hufPrice: number) => string;
  toggleCurrency: () => void;
  /** Current exchange rate: HUF per 1 EUR */
  exchangeRate: number;
  /** Update the exchange rate (e.g., from MNB API) */
  setExchangeRate: (rate: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

/**
 * Fetches the current HUF/EUR exchange rate from a public API.
 * Falls back to DEFAULT_EUR_RATE on any error.
 *
 * TODO: Replace with server-side /api/exchange-rate endpoint backed by
 * MNB API + Redis cache (Upstash) once the server endpoint is implemented.
 */
async function fetchExchangeRate(): Promise<number> {
  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/EUR",
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return DEFAULT_EUR_RATE;
    const data = await res.json();
    const hufRate = data?.rates?.HUF;
    return typeof hufRate === "number" && hufRate > 0 ? Math.round(hufRate) : DEFAULT_EUR_RATE;
  } catch {
    return DEFAULT_EUR_RATE;
  }
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>("HUF");
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EUR_RATE);

  useEffect(() => {
    fetchExchangeRate().then(setExchangeRate);
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency(c => c === "HUF" ? "EUR" : "HUF");
  }, []);

  const formatPrice = useCallback((hufPrice: number) => {
    return formatPriceUtil(hufPrice, currency, exchangeRate);
  }, [currency, exchangeRate]);

  const value = useMemo(
    () => ({ currency, setCurrency, formatPrice, toggleCurrency, exchangeRate, setExchangeRate }),
    [currency, setCurrency, formatPrice, toggleCurrency, exchangeRate, setExchangeRate],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
