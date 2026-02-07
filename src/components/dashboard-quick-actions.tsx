import { AddMovieButton } from "~/components/add-movie-button";
import { AddTvShowButton } from "~/components/add-tv-show-button";
import { AddBookButton } from "~/components/add-book-button";

export function DashboardQuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <AddMovieButton className="w-full" />
      <AddTvShowButton className="w-full" />
      <AddBookButton className="w-full" />
    </div>
  );
}
