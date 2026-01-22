"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Moon, Sun, Monitor } from "lucide-react";
import type { Session } from "next-auth";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { JellyfinWebhookSettings } from "~/components/jellyfin-webhook-settings";
import { BookCategorySettings } from "~/components/book-category-settings";

interface SettingsContentProps {
  user: Session["user"];
}

export function SettingsContent({ user }: SettingsContentProps) {
  const { theme, setTheme } = useTheme();

  const utils = api.useUtils();
  const { data: tags } = api.tag.getAll.useQuery();

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("");

  const createTag = api.tag.create.useMutation({
    onSuccess: async () => {
      toast.success("Tag created");
      setNewTagName("");
      setNewTagColor("");
      await utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteTag = api.tag.delete.useMutation({
    onSuccess: async () => {
      toast.success("Tag deleted");
      await utils.tag.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const exportData = api.export.exportData.useQuery(undefined, {
    enabled: false,
  });
  const exportCsv = api.export.exportCSV.useQuery(undefined, {
    enabled: false,
  });

  const downloadFile = (
    filename: string,
    content: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <p className="text-muted-foreground mt-1 text-sm">
              {user.name ?? "Not set"}
            </p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="text-muted-foreground mt-1 text-sm">
              {user.email ?? "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value)}>
              <SelectTrigger id="theme" className="mt-2">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-muted-foreground mt-2 text-xs">
              Choose how Trackerr looks to you. System will match your device
              settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
          <CardDescription>
            Create and manage tags for your movies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="new-tag-name">Tag name</Label>
              <Input
                id="new-tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g. Rewatch, Atmos, Director"
              />
            </div>
            <div>
              <Label htmlFor="new-tag-color">Color</Label>
              <Input
                id="new-tag-color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                placeholder="#22c55e"
              />
            </div>
          </div>

          <Button
            onClick={() =>
              createTag.mutate({
                name: newTagName.trim(),
                ...(newTagColor.trim() ? { color: newTagColor.trim() } : {}),
              })
            }
            disabled={!newTagName.trim() || createTag.isPending}
          >
            {createTag.isPending ? "Creating..." : "Create Tag"}
          </Button>

          <div className="flex flex-wrap gap-2">
            {(tags ?? []).map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 rounded-md border px-2 py-1"
              >
                <Badge
                  variant="secondary"
                  style={
                    tag.color
                      ? { backgroundColor: tag.color, color: "white" }
                      : undefined
                  }
                >
                  {tag.name}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {tag._count.movieTags}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => deleteTag.mutate({ id: tag.id })}
                  disabled={deleteTag.isPending}
                >
                  Delete
                </Button>
              </div>
            ))}
            {(tags ?? []).length === 0 && (
              <p className="text-muted-foreground text-sm">No tags yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <BookCategorySettings />

      {/* Jellyfin Webhook */}
      <JellyfinWebhookSettings />

      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>Export your data as JSON or CSV</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={async () => {
              const res = await exportData.refetch();
              if (!res.data) {
                toast.error("Export failed");
                return;
              }
              downloadFile(
                `trackerr-export-${new Date().toISOString().split("T")[0]}.json`,
                JSON.stringify(res.data, null, 2),
                "application/json",
              );
            }}
            disabled={exportData.isFetching}
          >
            {exportData.isFetching ? "Exporting..." : "Export JSON"}
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const res = await exportCsv.refetch();
              if (!res.data) {
                toast.error("Export failed");
                return;
              }
              downloadFile(res.data.filename, res.data.content, "text/csv");
            }}
            disabled={exportCsv.isFetching}
          >
            {exportCsv.isFetching ? "Exporting..." : "Export CSV"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
