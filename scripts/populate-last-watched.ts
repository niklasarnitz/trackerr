
import { db } from "../src/server/db";

async function main() {
  console.log("Starting backfill of lastWatchedAt for movies...");

  try {
    const BATCH_SIZE = 100;
    let skip = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    while (true) {
      // Get movies in batches
      const movies = await db.movie.findMany({
        include: {
          watches: {
            orderBy: {
              watchedAt: "desc",
            },
            take: 1,
          },
        },
        orderBy: { id: "asc" },
        skip,
        take: BATCH_SIZE,
      });

      if (movies.length === 0) {
        break;
      }

      console.log(`Processing batch of ${movies.length} movies...`);

      for (const movie of movies) {
        if (movie.watches.length > 0) {
          const lastWatch = movie.watches[0];

          if (lastWatch?.watchedAt) {
            await db.movie.update({
              where: { id: movie.id },
              data: {
                lastWatchedAt: lastWatch.watchedAt,
              },
            });
            updatedCount++;
          }
        } else {
          skippedCount++;
        }
      }

      skip += BATCH_SIZE;
    }

    console.log(`Successfully backfilled lastWatchedAt for ${updatedCount} movies.`);
    console.log(`Skipped ${skippedCount} movies with no watches.`);
  } catch (error) {
    console.error("Error during backfill:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
