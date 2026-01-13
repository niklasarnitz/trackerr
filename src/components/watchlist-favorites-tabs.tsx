import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { MoviesGrid } from "~/components/movies-grid";
import { Bookmark, Heart } from "lucide-react";

export function WatchlistFavoritesTabs() {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Movies</TabsTrigger>
        <TabsTrigger value="watchlist">
          <Bookmark className="mr-2 h-4 w-4" />
          Watchlist
        </TabsTrigger>
        <TabsTrigger value="favorites">
          <Heart className="mr-2 h-4 w-4" />
          Favorites
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <MoviesGrid search={undefined} sort="title" page={1} />
      </TabsContent>
      <TabsContent value="watchlist">
        <MoviesGrid search={undefined} sort="title" page={1} watchlist={true} />
      </TabsContent>
      <TabsContent value="favorites">
        <MoviesGrid search={undefined} sort="title" page={1} favorites={true} />
      </TabsContent>
    </Tabs>
  );
}
