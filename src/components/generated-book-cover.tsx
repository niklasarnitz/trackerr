import { clsx } from "clsx";

// Function to generate a pseudo-random color based on book data
export function generateBookColor(bookId: string, index = 0) {
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }

  hash += index * 10000;

  const c = Math.abs(hash) % 360;

  return c;
}

interface GeneratedBookCoverProps {
  title: string;
  subtitle?: string | null;
  authors?: string[];
  seriesName?: string | null;
  seriesNumber?: number | null;
  bookId: string;
  className?: string;
}

export function GeneratedBookCover({
  title,
  subtitle,
  authors,
  seriesName,
  seriesNumber,
  bookId,
  className,
}: GeneratedBookCoverProps) {
  const baseHue = generateBookColor(bookId);
  const secondHue = (baseHue + 40) % 360; // Complementary color

  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-[hsl(var(--hue),70%,80%)] to-[hsl(var(--secondary-hue),60%,60%)] p-4 text-center shadow-md dark:from-[hsl(var(--hue),60%,30%)] dark:to-[hsl(var(--secondary-hue),50%,20%)]",
        className,
      )}
      style={
        {
          "--hue": `${baseHue}deg`,
          "--secondary-hue": `${secondHue}deg`,
        } as React.CSSProperties
      }
    >
      <div className="mt-2 flex-1">
        <h3 className="text-foreground line-clamp-3 mb-2 text-lg font-bold">
          {title}
        </h3>

        {subtitle && (
          <p className="text-muted-foreground line-clamp-2 mb-3 text-sm">
            {subtitle}
          </p>
        )}

        {seriesName && (
          <p className="text-muted-foreground line-clamp-3 mb-1 text-sm italic">
            {seriesName}
            {seriesNumber !== null && seriesNumber !== undefined && ` #${seriesNumber}`}
          </p>
        )}
      </div>

      <div className="mb-2 w-full">
        {authors && authors.length > 0 && (
          <p className="text-muted-foreground line-clamp-3 text-xs">
            {authors.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
