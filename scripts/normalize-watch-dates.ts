#!/usr/bin/env bun
import { PrismaClient } from "@prisma/client";
import { normalizeWatchDate } from "../src/lib/watch-date";

const db = new PrismaClient({ log: ["query", "info", "warn", "error"] });

async function normalizeWatchDates() {
  const watches = await db.movieWatch.findMany({
    select: {
      id: true,
      watchedAt: true,
    },
  });

  let updated = 0;
  let unchanged = 0;

  for (const watch of watches) {
    const normalized = normalizeWatchDate(watch.watchedAt);

    if (normalized.getTime() === watch.watchedAt.getTime()) {
      unchanged++;
      continue;
    }

    await db.movieWatch.update({
      where: { id: watch.id },
      data: { watchedAt: normalized },
    });

    updated++;
  }

  console.log(`✓ Normalized watch dates: ${updated}`);
  console.log(`• Already normalized: ${unchanged}`);
}

normalizeWatchDates()
  .catch((error) => {
    console.error("❌ Failed to normalize watch dates", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
