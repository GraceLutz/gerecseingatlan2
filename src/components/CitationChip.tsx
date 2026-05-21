import { MapPin } from "lucide-react";

export interface Citation {
  name: string;
  address?: string;
  placeId: string;
  lat: number;
  lng: number;
}

interface CitationChipProps {
  citation: Citation;
}

const CitationChip: React.FC<CitationChipProps> = ({ citation }) => {
  const href = `https://www.google.com/maps/place/?q=place_id:${citation.placeId}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      role="link"
      aria-label={`${citation.name} megnyitása Google Térképen`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <MapPin size={12} aria-hidden="true" className="text-dark-green shrink-0" />
      <span className="truncate max-w-[150px]">{citation.name}</span>
    </a>
  );
};

export default CitationChip;
