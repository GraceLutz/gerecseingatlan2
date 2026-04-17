import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Mail } from "lucide-react";

interface TeamMember {
  nameHu: string;
  nameEn: string;
  roleHu: string;
  roleEn: string;
  phone?: string;
  email?: string;
}

const teamMembers: TeamMember[] = [
  {
    nameHu: "Gerecsei Tamás",
    nameEn: "Tamás Gerecsei",
    roleHu: "Ügyvezető, ingatlanközvetítő",
    roleEn: "Managing Director, Real Estate Agent",
    phone: "+36 30 123 4567",
    email: "tamas@gerecseingatlan.hu",
  },
  {
    nameHu: "Horváth Katalin",
    nameEn: "Katalin Horváth",
    roleHu: "Ingatlanközvetítő",
    roleEn: "Real Estate Agent",
    phone: "+36 30 234 5678",
    email: "katalin@gerecseingatlan.hu",
  },
  {
    nameHu: "Tóth Gábor",
    nameEn: "Gábor Tóth",
    roleHu: "Értékbecslés, jogi tanácsadás",
    roleEn: "Valuation & Legal Advisory",
    phone: "+36 30 345 6789",
    email: "gabor@gerecseingatlan.hu",
  },
];

/**
 * Team section displaying team member cards with contact info.
 * Uses initials as avatar placeholders.
 */
const TeamSection = () => {
  const { t, lang } = useLanguage();

  return (
    <section id="munkatarsaink" className="py-16 bg-light-bg" aria-labelledby="team-heading">
      <div className="container mx-auto px-4">
        <h2
          id="team-heading"
          className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-3"
        >
          {t.about.team}
        </h2>
        <p className="text-center text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
          {lang === "hu"
            ? "Tapasztalt szakembereink személyre szabott segítséget nyújtanak"
            : "Our experienced professionals provide personalized assistance"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {teamMembers.map((member) => {
            const name = lang === "hu" ? member.nameHu : member.nameEn;
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("");

            return (
              <article
                key={name}
                className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow"
              >
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="text-2xl font-heading font-bold text-primary">
                    {initials}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                  {name}
                </h3>
                <p className="text-sm text-gold font-semibold mb-4">
                  {lang === "hu" ? member.roleHu : member.roleEn}
                </p>
                <div className="space-y-2">
                  {member.phone && (
                    <a
                      href={`tel:${member.phone.replace(/\s/g, "")}`}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${lang === "hu" ? "Telefonszám" : "Phone"}: ${member.phone}`}
                    >
                      <Phone size={14} aria-hidden="true" />
                      {member.phone}
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`${lang === "hu" ? "E-mail" : "Email"}: ${member.email}`}
                    >
                      <Mail size={14} aria-hidden="true" />
                      {member.email}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
