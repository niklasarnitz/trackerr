"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DashboardYearSelectorProps {
  currentYear?: number | "all";
}

export function DashboardYearSelector({
  currentYear,
}: DashboardYearSelectorProps) {
  const router = useRouter();
  const today = new Date();
  const thisYear = today.getFullYear();
  const startYear = 2020; // Adjust this as needed

  const years = Array.from(
    { length: thisYear - startYear + 1 },
    (_, i) => thisYear - i,
  );

  const handleYearChange = (year: string) => {
    if (year === "current") {
      router.push("/");
    } else if (year === "all") {
      router.push("/?year=all");
    } else {
      router.push(`/?year=${year}`);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <label htmlFor="year-select" className="text-sm font-medium">
        View Statistics for:
      </label>
      <Select
        value={
          currentYear === undefined
            ? "current"
            : currentYear === "all"
              ? "all"
              : currentYear.toString()
        }
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">{thisYear} (Current)</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
