import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { StatCard } from "~/components/stat-card";
import {
  BookOpen,
  BookText,
  Calendar,
  HandHelping,
  List,
  Quote as QuoteIcon,
  Tags,
} from "lucide-react";
import type { RouterOutputs } from "~/trpc/react";

interface LibraryInsightsPanelProps {
  stats: RouterOutputs["libraryStats"]["getOverview"];
}

export function LibraryInsightsPanel({ stats }: LibraryInsightsPanelProps) {
  const { tags, lists, loans, quotes, readingProgress, bible } = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookText className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Library Insights</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Tags"
          value={tags.totalTags}
          description={`${tags.totalTagUses} total uses`}
          icon={<Tags className="h-4 w-4" />}
        />
        <StatCard
          title="Lists"
          value={lists.totalLists}
          description={`${lists.totalEntries} entries • ${lists.publicLists} public`}
          icon={<List className="h-4 w-4" />}
        />
        <StatCard
          title="Loans"
          value={loans.activeLoans}
          description={`${loans.totalLoans} total • ${loans.returnedLoans} returned`}
          icon={<HandHelping className="h-4 w-4" />}
        />
        <StatCard
          title="Quotes"
          value={quotes.totalQuotes}
          description={`${quotes.booksWithQuotes} books quoted`}
          icon={<QuoteIcon className="h-4 w-4" />}
        />
        <StatCard
          title="Reading Progress"
          value={readingProgress.booksInProgress}
          description={`${readingProgress.totalEntries} updates • ${readingProgress.avgPagesRead} avg pages`}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Bible Reading"
          value={bible.totalReadings}
          description={`${bible.uniqueBooks} books • ${bible.readingDays} days`}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tags.topTags.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No tagged items yet
              </p>
            ) : (
              tags.topTags.map((tag, index) => (
                <div
                  key={tag.name}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">
                    #{index + 1} {tag.name}
                  </span>
                  <span className="text-sm font-semibold">{tag.totalUses}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Lists</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lists.topLists.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No lists created yet
              </p>
            ) : (
              lists.topLists.map((list, index) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">
                    #{index + 1} {list.name}
                  </span>
                  <span className="text-sm font-semibold">{list.size}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Top Quoted Books
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quotes.topBooks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No quotes yet</p>
            ) : (
              quotes.topBooks.map((book, index) => (
                <div
                  key={`${book.title}-${index}`}
                  className="flex items-center justify-between"
                >
                  <span className="truncate text-sm" title={book.title}>
                    #{index + 1} {book.title}
                  </span>
                  <span className="text-sm font-semibold">{book.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
