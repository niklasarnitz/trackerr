import { type Metadata } from "next";
import { api } from "~/trpc/server";
import { BibleAccordion } from "~/components/bible/bible-accordion";
import { ReadingTrackerForm } from "~/components/bible/reading-tracker";
import { ReadingHistoryList } from "~/components/bible/reading-history";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";

export const metadata: Metadata = {
  title: "Bible Reading | Trackerr",
  description: "Track your Bible reading progress",
};

export default async function BiblePage() {
  const data = await api.bible.getProgress();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="heading-lg mb-2">Bible Tracker</h1>
        <p className="text-muted-foreground body-md">
          Track your reading progress through the Bible.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar / Top Section (Tracker & History) */}
        <div className="space-y-8 lg:col-span-1">
          {/* Tracking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Log Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadingTrackerForm />
            </CardContent>
          </Card>

           {/* Overall Progress */}
           <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Overall Progress</CardTitle>
                <span className="text-xl font-bold">
                  {data.overallPercentage.toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={data.overallPercentage} className="h-3" />
              <p className="text-muted-foreground mt-2 text-sm">
                {data.totalUniqueChaptersRead} / {data.totalChaptersInBible}{" "}
                chapters read
              </p>
            </CardContent>
          </Card>

          {/* History List */}
          <Card>
             <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ReadingHistoryList />
            </CardContent>
          </Card>
        </div>

        {/* Main Content (Accordion) */}
        <div className="lg:col-span-2">
            <BibleAccordion books={data.bookProgress} />
        </div>
      </div>
    </div>
  );
}
