import { Card, CardContent, CardHeader } from "~/components/ui/card";

interface LoadingSkeletonProps {
  cards?: number;
  variant?: "card" | "list" | "grid";
}

export function LoadingSkeleton({
  cards = 6,
  variant = "grid",
}: LoadingSkeletonProps) {
  if (variant === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="bg-card flex animate-pulse gap-4 rounded-lg border p-4"
          >
            <div className="bg-muted h-24 w-16 shrink-0 rounded" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-5 w-3/4 rounded" />
              <div className="bg-muted h-4 w-1/2 rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-6 w-16 rounded" />
                <div className="bg-muted h-6 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="space-y-2">
            <div className="bg-muted h-4 w-3/4 rounded" />
            <div className="bg-muted h-3 w-1/2 rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted h-20 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
