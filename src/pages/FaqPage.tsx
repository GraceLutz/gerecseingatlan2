import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FaqPage = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <section className="pt-28 pb-16 bg-light-bg">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-dark-navy text-center mb-4">
              {t.faq.title}
            </h1>
            <p className="text-center text-gray-600 font-body mb-10">
              {t.faq.subtitle}
            </p>

            <div className="space-y-3">
              {t.faq.items.map((item: { q: string; a: string }, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                    aria-expanded={openIndex === index}
                  >
                    <span className="font-heading font-semibold text-dark-navy pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-primary transition-transform duration-200 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-5 pt-1">
                      <p className="font-body text-gray-600 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FaqPage;
