import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface MediaDetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function MediaDetailSection({
  title,
  children,
  className,
}: MediaDetailSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
