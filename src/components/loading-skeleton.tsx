import { Card, CardContent, CardHeader } from "~/components/ui/card";

interface LoadingSkeletonProps {
  cards?: number;
}

export function LoadingSkeleton({ cards = 6 }: LoadingSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cards }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
          </CardHeader>
          <CardContent>
            <div className="h-20 rounded bg-gray-200"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
