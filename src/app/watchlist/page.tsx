import { WatchlistContent } from "~/components/watchlist-content";

export const metadata = {
  title: "Watchlist | Trackerr",
  description: "Your complete watchlist and wishlist across all media types",
};

export default function WatchlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <WatchlistContent />
    </div>
  );
}
