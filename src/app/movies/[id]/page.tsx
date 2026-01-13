import { Suspense } from "react";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { MovieDetailHeader } from "~/components/movie-detail-header";
import { MovieDetailTabs } from "~/components/movie-detail-tabs";
import { LoadingSkeleton } from "~/components/loading-skeleton";
import { Breadcrumbs } from "~/components/breadcrumbs";

interface MovieDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    addWatch?: string;
  }>;
}

export default async function MovieDetailPage({
  params,
  searchParams,
}: MovieDetailPageProps) {
  const { id } = await params;
  const { addWatch } = await searchParams;

  try {
    const movie = await api.movie.getById({ id });

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Breadcrumbs
            items={[
              { label: "Movies", href: "/movies" },
              { label: movie.title },
            ]}
          />
          <MovieDetailHeader movie={movie} />
          <Suspense fallback={<LoadingSkeleton cards={3} />}>
            <MovieDetailTabs movie={movie} openAddWatch={addWatch === "true"} />
          </Suspense>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
