import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { EditBookButton } from "~/components/edit-book-button";
import type { RouterOutputs } from "~/trpc/react";

interface BookDetailHeaderProps {
  book: RouterOutputs["book"]["getById"];
}

export function BookDetailHeader({ book }: BookDetailHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <Link href="/books">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </Link>
      <EditBookButton book={book} />
    </div>
  );
}
