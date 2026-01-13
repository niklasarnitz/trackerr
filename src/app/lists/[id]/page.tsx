import { notFound } from "next/navigation";
import { ListDetailContent } from "~/components/list-detail-content";

interface ListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ListDetailContent listId={id} />
    </div>
  );
}
