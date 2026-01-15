import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findTmdbIdByTvdbId(tvdbId: string): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB API key not configured");
  }
  const url = new URL("https://api.themoviedb.org/3/find/" + tvdbId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("external_source", "tvdb_id");

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`TMDB find failed for TVDB ${tvdbId}: ${res.statusText}`);
    return null;
  }
  const data = await res.json();
  const tvResults = (data?.tv_results ?? []) as Array<{ id: number }>;
  const first = tvResults[0]?.id;
  return first ? String(first) : null;
}

async function main() {
  const shows = await prisma.tvShow.findMany({
    where: { tmdbId: null },
    select: { id: true, tvdbId: true },
  });

  let updated = 0;
  for (const show of shows) {
    if (!show.tvdbId) continue;
    const tmdbId = await findTmdbIdByTvdbId(show.tvdbId);
    if (!tmdbId) {
      console.warn(`No TMDB match for TVDB ${show.tvdbId}`);
      continue;
    }
    await prisma.tvShow.update({
      where: { id: show.id },
      data: { tmdbId },
    });
    updated++;
    console.log(`Updated ${show.id} -> tmdbId=${tmdbId}`);
  }

  console.log(`Backfill complete. Updated ${updated} shows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
