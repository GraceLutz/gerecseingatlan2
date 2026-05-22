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
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-foreground shadow-sm hover:shadow-md hover:bg-muted/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
    >
      <MapPin size={13} aria-hidden="true" className="text-dark-green shrink-0" />
      <span className="truncate max-w-[180px]">{citation.name}</span>
    </a>
  );
};

export default CitationChip;
