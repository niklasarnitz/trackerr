import { z } from "zod";

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

// Google Books API response schemas
const googleBooksIndustryIdentifierSchema = z.object({
  type: z.string(),
  identifier: z.string(),
});

const googleBooksImageLinksSchema = z.object({
  smallThumbnail: z.string().optional(),
  thumbnail: z.string().optional(),
  small: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
  extraLarge: z.string().optional(),
});

const googleBooksVolumeInfoSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  authors: z.array(z.string()).optional(),
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  description: z.string().optional(),
  industryIdentifiers: z.array(googleBooksIndustryIdentifierSchema).optional(),
  pageCount: z.number().optional(),
  categories: z.array(z.string()).optional(),
  imageLinks: googleBooksImageLinksSchema.optional(),
  language: z.string().optional(),
});

const googleBooksItemSchema = z.object({
  id: z.string(),
  volumeInfo: googleBooksVolumeInfoSchema,
});

export const googleBooksResponseSchema = z.object({
  kind: z.string(),
  totalItems: z.number(),
  items: z.array(googleBooksItemSchema).optional(),
});

export type GoogleBooksResponse = z.infer<typeof googleBooksResponseSchema>;

// Helper to extract ISBN from industry identifiers
export function extractIsbn(
  industryIdentifiers?: Array<{ type: string; identifier: string }>,
): string | null {
  if (!industryIdentifiers || !industryIdentifiers.length) return null;

  const isbn13 = industryIdentifiers.find((i) => i.type === "ISBN_13");
  if (isbn13) return isbn13.identifier;

  const isbn10 = industryIdentifiers.find((i) => i.type === "ISBN_10");
  if (isbn10) return isbn10.identifier;

  return null;
}

// Helper to get the largest cover image
export function getLargestCover(
  imageLinks?: Record<string, string>,
): string | null {
  if (!imageLinks || Object.keys(imageLinks).length === 0) return null;

  // Priority order for image sizes
  const sizeOrder = [
    "extraLarge",
    "large",
    "medium",
    "small",
    "thumbnail",
    "smallThumbnail",
  ];

  for (const size of sizeOrder) {
    if (imageLinks[size]) {
      // Convert http to https
      return imageLinks[size]!.replace(/^http:/, "https:");
    }
  }

  return null;
}

export async function searchGoogleBooksByIsbn(isbn: string) {
  const url = new URL(GOOGLE_BOOKS_BASE_URL);
  url.searchParams.set("q", `isbn:${isbn}`);
  url.searchParams.set("country", "US");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to search Google Books by ISBN");
  }

  const data = await response.json();

  try {
    return googleBooksResponseSchema.parse(data);
  } catch (error) {
    console.error("Google Books ISBN search validation failed:", error);
    throw new Error("Invalid response from Google Books API");
  }
}

export async function searchGoogleBooks(title: string, author?: string) {
  const url = new URL(GOOGLE_BOOKS_BASE_URL);

  let queryString = `intitle:${title}`;
  if (author) {
    queryString += `+inauthor:${author}`;
  }

  url.searchParams.set("q", queryString);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("country", "US");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to search Google Books");
  }

  const data = await response.json();

  try {
    return googleBooksResponseSchema.parse(data);
  } catch (error) {
    console.error("Google Books API response validation failed:", error);
    throw new Error("Invalid response from Google Books API");
  }
}
