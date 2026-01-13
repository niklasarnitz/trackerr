import { z } from "zod";

const HUGENDUBEL_BASE_URL = "https://www.hugendubel.de/rest/v1";
const HUGENDUBEL_CLIENT = "Hudu-Mobile-Shop-Vollsortiment";
const JWT_CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

let cachedToken: { token: string; expiresAt: number } | null = null;

// Zod schemas for authentication
const HugendubeLAuthenticationResponseSchema = z.object({
  result: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    version: z.string(),
  }),
  resultText: z.string(),
  resultCode: z.number(),
});

// Schema for articles in search results
const HugendubeLArticleSchema = z.object({
  active: z.boolean().optional(),
  articleAttributeView: z.object({
    authorList: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
  }),
});

// Schema for search results
const HugendubeLSearchResponseSchema = z.object({
  result: z.object({
    articles: z.array(HugendubeLArticleSchema).optional(),
    totalResults: z.number().optional(),
  }),
  resultText: z.string(),
  resultCode: z.number(),
});

export interface HugendubeLBook {
  title: string;
  subtitle?: string;
  authors?: string;
}

/**
 * Get JWT token for Hugendubel API access with caching
 * @returns JWT access token
 */
async function getHugendubeLAuthToken(): Promise<string> {
  try {
    // Return cached token if still valid
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      console.log("Using cached Hugendubel JWT token");
      return cachedToken.token;
    }

    console.log(
      "Authenticating with Hugendubel API using client:",
      HUGENDUBEL_CLIENT,
    );

    // Use form-encoded POST body for authentication
    const authUrl = `${HUGENDUBEL_BASE_URL}/authentication/anonymousloginjwt`;
    const body = new URLSearchParams();
    body.set("username", HUGENDUBEL_CLIENT);

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorMsg = `Failed to authenticate with Hugendubel: ${response.status}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const validatedData = HugendubeLAuthenticationResponseSchema.parse(data);

    if (validatedData.resultCode !== 0) {
      throw new Error(
        `Authentication returned error code: ${validatedData.resultCode}`,
      );
    }

    const token = validatedData.result.accessToken;

    // Cache the token
    cachedToken = {
      token,
      expiresAt: Date.now() + JWT_CACHE_DURATION_MS,
    };

    console.log("Successfully authenticated with Hugendubel API");
    return token;
  } catch (error) {
    console.error("Error authenticating with Hugendubel:", error);
    throw new Error(
      "Failed to authenticate with Hugendubel API. Please try again later.",
    );
  }
}

/**
 * Search for books on Hugendubel using ISBN
 * @param isbn - The ISBN number to search for
 * @returns Array of book results
 */
export async function searchHugendubeLByIsbn(
  isbn: string,
): Promise<HugendubeLBook[]> {
  try {
    console.log(`Searching Hugendubel for books with ISBN: ${isbn}`);

    // Get authentication token
    const token = await getHugendubeLAuthToken();

    // Build search using form-encoded POST data
    // Using /articlesearch/advanced endpoint with query parameter
    const params = new URLSearchParams();
    params.set("query", `isbn:${isbn}`);
    params.set("offset", "0");
    params.set("maxResults", "5");
    params.set("filterFacets", "");
    params.set("ascending", "false");
    params.set("sortField", "score");

    console.log(
      `Fetching from endpoint: ${HUGENDUBEL_BASE_URL}/articlesearch/advanced`,
    );

    const response = await fetch(
      `${HUGENDUBEL_BASE_URL}/articlesearch/advanced`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Authorization: `Bearer ${token}`,
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      const errorMsg = `Failed to search Hugendubel: ${response.status}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const validatedData = HugendubeLSearchResponseSchema.parse(data);

    if (validatedData.resultCode !== 0) {
      throw new Error(
        `Search returned error code: ${validatedData.resultCode}`,
      );
    }

    if (
      !validatedData.result.articles ||
      validatedData.result.articles.length === 0
    ) {
      console.log(`No results found for ISBN: ${isbn}`);
      return [];
    }

    // Map articles to book format
    const books: HugendubeLBook[] = validatedData.result.articles.map(
      (article) => ({
        title: article.articleAttributeView.title,
        subtitle: article.articleAttributeView.subtitle,
        authors: article.articleAttributeView.authorList,
      }),
    );

    console.log(`Found ${books.length} results for ISBN: ${isbn}`);
    return books;
  } catch (error) {
    console.error(`Error searching Hugendubel for ISBN ${isbn}:`, error);
    throw new Error(
      "Failed to search Hugendubel books. Please try again later.",
    );
  }
}

/**
 * Search for books on Hugendubel by title
 * @param title - The book title to search for
 * @returns Array of book results
 */
export async function searchHugendubeLByTitle(
  title: string,
): Promise<HugendubeLBook[]> {
  try {
    console.log(`Searching Hugendubel for books with title: ${title}`);

    // Get authentication token
    const token = await getHugendubeLAuthToken();

    // Build search using form-encoded POST data
    const params = new URLSearchParams();
    params.set("query", title);
    params.set("offset", "0");
    params.set("maxResults", "10");
    params.set("filterFacets", "");
    params.set("ascending", "false");
    params.set("sortField", "score");

    console.log(
      `Fetching from endpoint: ${HUGENDUBEL_BASE_URL}/articlesearch/advanced`,
    );

    const response = await fetch(
      `${HUGENDUBEL_BASE_URL}/articlesearch/advanced`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Authorization: `Bearer ${token}`,
        },
        body: params.toString(),
      },
    );

    if (!response.ok) {
      const errorMsg = `Failed to search Hugendubel: ${response.status}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const validatedData = HugendubeLSearchResponseSchema.parse(data);

    if (validatedData.resultCode !== 0) {
      throw new Error(
        `Search returned error code: ${validatedData.resultCode}`,
      );
    }

    if (
      !validatedData.result.articles ||
      validatedData.result.articles.length === 0
    ) {
      console.log(`No results found for title: ${title}`);
      return [];
    }

    // Map articles to book format
    const books: HugendubeLBook[] = validatedData.result.articles.map(
      (article) => ({
        title: article.articleAttributeView.title,
        subtitle: article.articleAttributeView.subtitle,
        authors: article.articleAttributeView.authorList,
      }),
    );

    console.log(`Found ${books.length} results for title: ${title}`);
    return books;
  } catch (error) {
    console.error(`Error searching Hugendubel for title ${title}:`, error);
    throw new Error(
      "Failed to search Hugendubel books. Please try again later.",
    );
  }
}
