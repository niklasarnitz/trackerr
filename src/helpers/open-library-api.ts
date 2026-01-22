import { z } from "zod";

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";

// Open Library schemas
const openLibraryAuthorSchema = z.object({
  key: z.string(),
});

export const openLibraryResponseSchema = z.object({
  title: z.string().optional(),
  authors: z.array(openLibraryAuthorSchema).optional(),
  publishers: z.array(z.string()).optional(),
  publish_date: z.string().optional(),
  covers: z.array(z.number()).optional(),
  number_of_pages: z.number().optional(),
  dewey_decimal_class: z.array(z.string()).optional(),
  isbn_13: z.array(z.string()).optional(),
  isbn_10: z.array(z.string()).optional(),
  description: z
    .union([
      z.string(),
      z.object({
        value: z.string(),
      }),
    ])
    .optional(),
});

// Schema for Open Library search results
export const openLibrarySearchDocSchema = z.object({
  key: z.string(),
  title: z.string(),
  author_name: z.array(z.string()).optional(),
  first_publish_year: z.number().optional(),
  cover_i: z.number().optional(),
  publisher: z.array(z.string()).optional(),
  isbn: z.array(z.string()).optional(),
  description: z.string().optional(),
  dewey_decimal_class: z.array(z.string()).optional(),
});

export const openLibrarySearchResponseSchema = z.object({
  docs: z.array(openLibrarySearchDocSchema).optional(),
});

// Helper to fetch author names from Open Library
export async function getOpenLibraryAuthorNames(
  authorKeys: Array<{ key: string }>,
): Promise<string[]> {
  const authorNames: string[] = [];

  for (const author of authorKeys) {
    try {
      const response = await fetch(
        `${OPEN_LIBRARY_BASE_URL}${author.key}.json`,
      );
      if (response.ok) {
        const authorData = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (authorData.name) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          authorNames.push(authorData.name);
        }
      }
    } catch (error) {
      console.error("Failed to fetch author data:", error);
    }
  }

  return authorNames;
}

export async function searchOpenLibraryByIsbn(isbn: string) {
  const url = `${OPEN_LIBRARY_BASE_URL}/isbn/${isbn}.json`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Book not found
    }
    throw new Error("Failed to search Open Library");
  }

  const data = await response.json();

  try {
    return openLibraryResponseSchema.parse(data);
  } catch (error) {
    console.error("Open Library response validation failed:", error);
    return null;
  }
}

export async function searchOpenLibraryByTitle(title: string) {
  const searchUrl = new URL(`${OPEN_LIBRARY_BASE_URL}/search.json`);
  searchUrl.searchParams.set("title", title);
  searchUrl.searchParams.set("limit", "10");

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`Open Library API error: ${response.status}`);
  }

  const data = await response.json();
  try {
    return openLibrarySearchResponseSchema.parse(data);
  } catch (error) {
    console.error("Open Library title search validation failed:", error);
    return null;
  }
}
