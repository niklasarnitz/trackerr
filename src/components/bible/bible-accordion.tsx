"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { type BibleBook } from "~/lib/bible-data";
import { ChapterHeatmap } from "./chapter-heatmap";

interface BookProgress extends BibleBook {
  uniqueChaptersRead: number;
  percentage: number;
  completionCount: number;
  chapterStats: Record<number, number>;
  verseStats: Record<number, { read: number; total: number }>;
}

interface BibleAccordionProps {
  books: BookProgress[];
}

const CATEGORIES = [
  { id: "ot", label: "Old Testament" },
  { id: "apocrypha", label: "Apocrypha" },
  { id: "nt", label: "New Testament" },
] as const;

export function BibleAccordion({ books }: BibleAccordionProps) {
  return (
    <div className="space-y-8">
      {CATEGORIES.map((category) => {
        const categoryBooks = books.filter((b) => b.category === category.id);
        if (categoryBooks.length === 0) return null;

        const allBookIds = categoryBooks.map((b) => b.id);

        return (
          <div key={category.id} className="space-y-4">
            <h2 className="text-xl font-semibold">{category.label}</h2>
            <Accordion
              type="multiple"
              defaultValue={allBookIds}
              className="w-full"
            >
              {categoryBooks.map((book) => (
                <AccordionItem key={book.id} value={book.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex w-full items-center justify-between pr-4">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{book.name}</span>
                        <span className="text-muted-foreground text-sm font-normal">
                          {book.uniqueChaptersRead} / {book.chapters} chapters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {book.completionCount > 0 && (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            x{book.completionCount}
                          </Badge>
                        )}
                        <Badge
                          variant={
                            book.percentage === 100 ? "default" : "secondary"
                          }
                        >
                          {book.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4">
                      <ChapterHeatmap
                        totalChapters={book.chapters}
                        chapterStats={book.chapterStats}
                        verseStats={book.verseStats}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
}
