import { expect, test, describe } from "bun:test";
import { BIBLE_VERSE_COUNTS } from "../../src/lib/bible-verses-data";

// Mock Data
const mockReadings = [
  { bookId: "gen", chapter: 1, startVerse: 1, endVerse: 5 }, // Read 5 verses
  { bookId: "gen", chapter: 1, startVerse: 3, endVerse: 8 }, // Read 6 verses (Overlap 3-5)
  { bookId: "gen", chapter: 1, startVerse: 20, endVerse: 25 }, // Read 6 verses
];

describe("Bible Logic", () => {
  test("calculates unique verses and intensity correctly with overlap", () => {
    const uniqueStats: Record<string, Record<number, Set<number>>> = {};
    const intensityStats: Record<string, Record<number, number>> = {};

    for (const entry of mockReadings) {
      if (!uniqueStats[entry.bookId]) {
        uniqueStats[entry.bookId] = {};
        intensityStats[entry.bookId] = {};
      }
      
      const bookUnique = uniqueStats[entry.bookId]!;
      const bookIntensity = intensityStats[entry.bookId]!;

      if (!bookUnique[entry.chapter]) bookUnique[entry.chapter] = new Set();
      if (!bookIntensity[entry.chapter]) bookIntensity[entry.chapter] = 0;

      // Accumulate Intensity
      const count = entry.endVerse - entry.startVerse + 1;
      bookIntensity[entry.chapter] += count;

      // Accumulate Unique
      for (let i = entry.startVerse; i <= entry.endVerse; i++) {
        bookUnique[entry.chapter]!.add(i);
      }
    }

    const gen1Unique = uniqueStats["gen"][1];
    const gen1Intensity = intensityStats["gen"][1];
    
    // Check Unique (Coverage)
    // 1-5 (5) + 6-8 (3 new) + 20-25 (6 new) = 14 unique
    expect(gen1Unique?.size).toBe(14);
    
    // Check Intensity (Total Read Volume)
    // 5 + 6 + 6 = 17 total verses read
    expect(gen1Intensity).toBe(17);
    
    // Verify Intensity Ratio
    // Gen 1 has 31 verses. 
    // Intensity Score = 17 / 31 = ~0.548
    const gen1TotalVerses = BIBLE_VERSE_COUNTS["gen"]![0]; // 31
    const intensityScore = gen1Intensity! / gen1TotalVerses;
    expect(intensityScore).toBeCloseTo(17/31, 5);
  });

  test("calculates completion count > 1", () => {
      const totalVersesInBook = 100;
      const accumulatedVersesRead = 250; // Read 2.5x volume
      
      const completionCount = totalVersesInBook > 0 ? Math.floor(accumulatedVersesRead / totalVersesInBook) : 0;
      expect(completionCount).toBe(2);
  });
});
