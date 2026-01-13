import { Card, CardContent } from "~/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
}

export function ErrorDisplay({
  title = "Error loading data",
  message = "Please try again later or contact support.",
}: ErrorDisplayProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="py-8 text-center">
        <AlertCircle className="text-destructive mx-auto mb-2 h-8 w-8" />
        <p className="text-destructive font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}
