import { type ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Calendar, Clock, Eye, BookOpen, Tv } from "lucide-react";

interface MetadataBadge {
  icon?: ReactNode;
  label: string | number;
  variant?: "default" | "secondary" | "outline" | "destructive";
}

interface MediaTitleSectionProps {
  title: string;
  originalTitle?: string | null;
  subtitle?: string | null;
  badges: MetadataBadge[];
}

export function MediaTitleSection({
  title,
  originalTitle,
  subtitle,
  badges,
}: MediaTitleSectionProps) {
  return (
    <div>
      <div className="mb-4">
        <h1 className="heading-lg mb-2">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-lg">{subtitle}</p>
        )}
        {originalTitle && originalTitle !== title && (
          <p className="text-muted-foreground">{originalTitle}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <Badge key={index} variant={badge.variant ?? "secondary"}>
            {badge.icon && <span className="mr-1">{badge.icon}</span>}
            {badge.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Helper function to create common metadata badges
export function createMetadataBadges(data: {
  year?: string | number | null;
  runtime?: number | null;
  pages?: number | null;
  watchCount?: number;
  status?: string;
  network?: string | null;
}) {
  const badges: MetadataBadge[] = [];

  if (data.year) {
    badges.push({
      icon: <Calendar className="h-3 w-3" />,
      label: data.year,
    });
  }

  if (data.runtime) {
    badges.push({
      icon: <Clock className="h-3 w-3" />,
      label: `${data.runtime}m`,
    });
  }

  if (data.pages) {
    badges.push({
      icon: <BookOpen className="h-3 w-3" />,
      label: `${data.pages} pages`,
    });
  }

  if (data.status) {
    badges.push({
      label: data.status,
      variant: "outline",
    });
  }

  if (data.network) {
    badges.push({
      icon: <Tv className="h-3 w-3" />,
      label: data.network,
      variant: "outline",
    });
  }

  if (data.watchCount !== undefined && data.watchCount > 0) {
    badges.push({
      icon: <Eye className="h-3 w-3" />,
      label: `${data.watchCount} watch${data.watchCount !== 1 ? "es" : ""}`,
    });
  }

  return badges;
}
