import { ListsContent } from "~/components/lists-content";

export default async function ListsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="heading-lg mb-2">Lists</h1>
        <p className="text-muted-foreground body-md">
          Create custom lists and organize your movies.
        </p>
      </div>
      <ListsContent />
    </div>
  );
}
