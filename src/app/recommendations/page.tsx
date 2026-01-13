import { RecommendationsContent } from "~/components/recommendations-content";

export default async function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">Recommendations</h1>
        <p className="text-muted-foreground body-md">
          Discover movies based on your watch history.
        </p>
      </div>
      <RecommendationsContent />
    </div>
  );
}
