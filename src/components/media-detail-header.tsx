import { type ReactNode } from "react";
import { OptimizedCoverImage } from "~/components/optimized-cover-image";
import { Film, Tv, BookOpen } from "lucide-react";
import { type RouterOutputs } from "~/trpc/react";

export type MediaType = "movie" | "tvshow" | "book";

interface MediaDetailHeaderProps {
  type: MediaType;
  posterPath?: string | null;
  blurDataUrl?: string | null;
  title: string;
  alt: string;
  actions?: ReactNode;
  book?: RouterOutputs["book"]["getById"];
}

const iconMap = {
  movie: Film,
  tvshow: Tv,
  book: BookOpen,
};

export function MediaDetailHeader({
  type,
  posterPath,
  blurDataUrl,
  title,
  alt,
  actions,
  book,
}: MediaDetailHeaderProps) {
  const Icon = iconMap[type];

  return (
    <div className="lg:sticky lg:top-8">
      <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg">
        {posterPath ? (
          <OptimizedCoverImage
            src={posterPath}
            alt={alt}
            fill
            sizes="300px"
            className="object-cover"
            blurDataUrl={blurDataUrl ?? undefined}
            priority
            {...(type === "book" && book ? { book } : {})}
            {...(type === "book"
              ? { fallbackSrc: "/placeholder-book.jpg" }
              : {})}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Icon className="text-muted-foreground h-24 w-24" />
          </div>
        )}
      </div>

      {actions && <div className="mt-4">{actions}</div>}
    </div>
  );
}
