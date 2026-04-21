import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContentBlock } from "@/contexts/ContentContext";
import { Phone, Mail } from "lucide-react";

interface StaffApiMember {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  roleTitle: string;
  photoUrl: string | null;
  bio: string | null;
  focalPointX: number;
  focalPointY: number;
}

interface TeamMember {
  nameHu: string;
  nameEn: string;
  roleHu: string;
  roleEn: string;
  phone?: string;
  email?: string;
  photo?: string;
}

const FALLBACK_MEMBERS: TeamMember[] = [
  {
    nameHu: "Csonka Szilvia",
    nameEn: "Szilvia Csonka",
    roleHu: "Ingatlanközvetítő",
    roleEn: "Real Estate Agent",
    phone: "+36 70 613 2658",
    email: "szilvia.bugany@gmail.com",
    photo: "/team-szilvia.jpg",
  },
];

const TeamSection = () => {
  const { t, lang } = useLanguage();
  const { content: teamTitle } = useContentBlock("/munkatarsaink", "page.title", t.about.team);
  const { content: teamSubtitle } = useContentBlock("/munkatarsaink", "page.subtitle",
    lang === "hu" ? "Tapasztalt szakembereink személyre szabott segítséget nyújtanak" : "Our experienced professionals provide personalized assistance"
  );
  const [apiMembers, setApiMembers] = useState<StaffApiMember[] | null>(null);

  useEffect(() => {
    fetch("/api/staff")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.staff && data.staff.length > 0) {
          setApiMembers(data.staff);
        }
      })
      .catch(() => {
        // Fallback to hardcoded data silently
      });
  }, []);

  const renderApiMembers = (members: StaffApiMember[]) => (
    <>
      {members.map((member) => {
        const initials = member.name
          .split(" ")
          .map((n) => n[0])
          .join("");

        return (
          <article
            key={member.id}
            className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow flex flex-col"
          >
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
                style={{ objectPosition: `${member.focalPointX}% ${member.focalPointY}%` }}
              />
            ) : (
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-2xl font-heading font-bold text-primary">
                  {initials}
                </span>
              </div>
            )}
            <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
              {member.name}
            </h3>
            <p className="text-sm text-gold font-semibold mb-4">
              {member.roleTitle}
            </p>
            <div className="space-y-2 mt-auto pt-2">
              {member.phone && (
                <a
                  href={`tel:${member.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={`${lang === "hu" ? "Telefonszám" : "Phone"}: ${member.phone}`}
                >
                  <Phone size={14} aria-hidden="true" />
                  {member.phone}
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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
    </>
  );

  const renderFallbackMembers = () => (
    <>
      {FALLBACK_MEMBERS.map((member) => {
        const name = lang === "hu" ? member.nameHu : member.nameEn;
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("");

        return (
          <article
            key={name}
            className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow flex flex-col"
          >
            {member.photo ? (
              <img
                src={member.photo}
                alt={name}
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover"
                style={{ objectPosition: "center 25%" }}
              />
            ) : (
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-2xl font-heading font-bold text-primary">
                  {initials}
                </span>
              </div>
            )}
            <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
              {name}
            </h3>
            <p className="text-sm text-gold font-semibold mb-4">
              {lang === "hu" ? member.roleHu : member.roleEn}
            </p>
            <div className="space-y-2 mt-auto pt-2">
              {member.phone && (
                <a
                  href={`tel:${member.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={`${lang === "hu" ? "Telefonszám" : "Phone"}: ${member.phone}`}
                >
                  <Phone size={14} aria-hidden="true" />
                  {member.phone}
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
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
    </>
  );

  return (
    <section id="munkatarsaink" className="py-16 bg-light-bg" aria-labelledby="team-heading">
      <div className="container mx-auto px-4">
        <h2
          id="team-heading"
          data-editable="page.title"
          data-page="/munkatarsaink"
          className="text-3xl md:text-4xl font-heading font-bold text-dark-green text-center mb-3"
        >
          {teamTitle}
        </h2>
        <p data-editable="page.subtitle" data-page="/munkatarsaink" className="text-center text-muted-foreground font-body mb-10 max-w-2xl mx-auto">
          {teamSubtitle}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {apiMembers ? renderApiMembers(apiMembers) : renderFallbackMembers()}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
