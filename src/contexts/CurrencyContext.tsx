import React, { createContext, useContext, useState, useCallback } from "react";
import { formatPrice as formatPriceUtil } from "@/lib/currencyConverter";

type Currency = "HUF" | "EUR";

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

/** Default HUF/EUR exchange rate */
const DEFAULT_EUR_RATE = 400;

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>("HUF");
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EUR_RATE);

  const toggleCurrency = useCallback(() => {
    setCurrency(c => c === "HUF" ? "EUR" : "HUF");
  }, []);

  const formatPrice = useCallback((hufPrice: number) => {
    return formatPriceUtil(hufPrice, currency, exchangeRate);
  }, [currency, exchangeRate]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, toggleCurrency, exchangeRate, setExchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
