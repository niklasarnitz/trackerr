import { describe, test, expect } from "bun:test";
import { searchGoogleBooks } from "~/helpers/google-books-api";
import { searchOpenLibraryByTitle } from "~/helpers/open-library-api";
import { searchBooksByIsbn } from "~/helpers/amazon-scraper";

const QUERY = "The Lord of the Rings";
// A common ISBN for LOTR (J.R.R. Tolkien), usually works.
const LOTR_ISBN = "9780544003415";

describe("Book Search Providers (Integration)", () => {
  test("Google Books should return results for 'The Lord of the Rings'", async () => {
    console.log("Testing Google Books...");
    const results = await searchGoogleBooks(QUERY);
    expect(results).toBeDefined();
    expect(results.items).toBeDefined();
    expect(results.items!.length).toBeGreaterThan(0);

    // Check if any of the first few results match the title
    const found = results
      .items!.slice(0, 5)
      .some((item) =>
        item.volumeInfo.title.toLowerCase().includes("lord of the rings"),
      );
    expect(found).toBeTrue();
  }, 10000);

  test("Open Library should return results for 'The Lord of the Rings'", async () => {
    console.log("Testing Open Library...");
    const results = await searchOpenLibraryByTitle(QUERY);
    expect(results).toBeDefined();
    expect(results?.docs).toBeDefined();
    expect(results?.docs!.length).toBeGreaterThan(0);

    const found = results
      ?.docs!.slice(0, 5)
      .some((doc) => doc.title.toLowerCase().includes("lord of the rings"));
    expect(found).toBeTrue();
  }, 10000);

  test(
    "Amazon should return results for ISBN " + LOTR_ISBN,
    async () => {
      console.log("Testing Amazon...");
      // This test is fragile due to Amazon's anti-bot measures.
      const results = await searchBooksByIsbn(LOTR_ISBN);
      expect(results).toBeDefined();
      // If we get results, check them. If empty, it might be a soft failure (no results found vs error).
      if (results.length > 0) {
        const found = results.some((book) =>
          book.title.toLowerCase().includes("lord of the rings"),
        );
        expect(found).toBeTrue();
      } else {
        console.warn(
          "Amazon returned 0 results. This might be due to regional availability or bot detection.",
        );
      }
    },
    15000,
  );
});
