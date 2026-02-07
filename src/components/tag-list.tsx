import { Badge } from "~/components/ui/badge";

interface TagListProps {
  tags: string[];
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export function TagList({ tags, variant = "secondary" }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant={variant}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}
