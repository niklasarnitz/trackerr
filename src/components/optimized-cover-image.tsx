import Image from "next/image";
import { GeneratedBookCover } from "~/components/generated-book-cover";

// Tiny blur placeholder for cover images (10x10 gray placeholder)
const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

interface OptimizedCoverImageProps {
  src: string | null;
  alt: string;
  blurDataUrl?: string | null;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackSrc?: string;
  book?: {
    id: string;
    title: string;
    subtitle?: string | null;
    bookAuthors: { author: { name: string } }[];
    series?: { name: string } | null;
    seriesNumber?: number | null;
  };
}

/**
 * Optimized cover image component for movie posters and book covers
 * - Uses blur placeholder for smooth loading (from DB if available)
 * - Lazy loads by default (unless priority is set)
 * - Properly sized for Next.js image optimization
 * - Generates a cover if no image source is provided and book data is available
 */
export function OptimizedCoverImage({
  src,
  alt,
  blurDataUrl,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className = "object-cover",
  fallbackSrc = "/placeholder-movie.jpg",
  book,
}: OptimizedCoverImageProps) {
  // If no source but book data is available, render generated cover
  if (!src && book) {
    const authors = book.bookAuthors.map((ba) => ba.author.name);
    
    // If fill is true, we want the generated cover to fill the parent
    if (fill) {
      return (
        <GeneratedBookCover
          title={book.title}
          subtitle={book.subtitle}
          authors={authors}
          seriesName={book.series?.name}
          seriesNumber={book.seriesNumber}
          bookId={book.id}
          className={className.replace("object-cover", "")}
        />
      );
    }
    
    // Otherwise wrap it in a div with dimensions
    return (
      <div style={{ width, height }} className="overflow-hidden rounded-md">
        <GeneratedBookCover
          title={book.title}
          subtitle={book.subtitle}
          authors={authors}
          seriesName={book.series?.name}
          seriesNumber={book.seriesNumber}
          bookId={book.id}
          className={className.replace("object-cover", "")}
        />
      </div>
    );
  }

  const imageSrc = src ?? fallbackSrc;
  const placeholder = blurDataUrl ?? BLUR_DATA_URL;

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        loading={priority ? undefined : "lazy"}
        priority={priority}
        placeholder="blur"
        blurDataURL={placeholder}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      loading={priority ? undefined : "lazy"}
      priority={priority}
      placeholder="blur"
      blurDataURL={placeholder}
    />
  );
}
