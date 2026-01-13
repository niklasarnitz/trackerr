"use client";

import { MovieSearchDialog } from "~/components/movie-search-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Plus } from "lucide-react";

export function DashboardAddMovieCard() {
  return (
    <MovieSearchDialog>
      <Card className="cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Add Movie</CardTitle>
          <Plus className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <CardDescription>
            Search for movies and add them to your collection
          </CardDescription>
        </CardContent>
      </Card>
    </MovieSearchDialog>
  );
}
