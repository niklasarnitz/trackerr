"use client";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Copy, CheckCircle2, Circle, RotateCw } from "lucide-react";

export function JellyfinWebhookSettings() {
  const utils = api.useUtils();
  const { data: webhookConfig, isLoading } =
    api.userPreferences.getWebhookConfig.useQuery();
  const [usernameFilter, setUsernameFilter] = useState(
    webhookConfig?.usernameFilter ?? "",
  );
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const enableWebhook = api.userPreferences.enableWebhook.useMutation({
    onSuccess: async () => {
      toast.success("Webhook enabled successfully!");
      await utils.userPreferences.getWebhookConfig.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const disableWebhook = api.userPreferences.disableWebhook.useMutation({
    onSuccess: async () => {
      toast.success("Webhook disabled successfully!");
      await utils.userPreferences.getWebhookConfig.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateUsernameFilter =
    api.userPreferences.updateWebhookUsernameFilter.useMutation({
      onSuccess: async () => {
        toast.success("Username filter updated!");
        await utils.userPreferences.getWebhookConfig.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const regenerateApiKey =
    api.userPreferences.regenerateWebhookApiKey.useMutation({
      onSuccess: async () => {
        toast.success("API key regenerated successfully!");
        setCopied(false);
        await utils.userPreferences.getWebhookConfig.invalidate();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleCopyApiKey = () => {
    if (webhookConfig?.webhookApiKey) {
      navigator.clipboard.writeText(webhookConfig.webhookApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("API key copied to clipboard!");
    }
  };

  const handleToggleWebhook = () => {
    if (webhookConfig?.isEnabled) {
      disableWebhook.mutate();
    } else {
      enableWebhook.mutate({ usernameFilter: usernameFilter || undefined });
    }
  };

  const handleUpdateUsernameFilter = () => {
    updateUsernameFilter.mutate({
      usernameFilter: usernameFilter || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground">
        Loading webhook configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Jellyfin Webhook</CardTitle>
              <CardDescription>
                Automatically track movies watched in Jellyfin
              </CardDescription>
            </div>
            <Badge
              variant={webhookConfig?.isEnabled ? "default" : "secondary"}
              className="ml-4"
            >
              {webhookConfig?.isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Webhook Status Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Webhook Status</Label>
              <p className="text-muted-foreground text-sm">
                {webhookConfig?.isEnabled
                  ? "Your webhook is active and ready to receive events from Jellyfin"
                  : "Enable webhook to start auto-tracking Jellyfin watches"}
              </p>
            </div>
            <Button
              onClick={handleToggleWebhook}
              variant={webhookConfig?.isEnabled ? "destructive" : "default"}
              disabled={enableWebhook.isPending || disableWebhook.isPending}
            >
              {enableWebhook.isPending || disableWebhook.isPending
                ? "Updating..."
                : webhookConfig?.isEnabled
                  ? "Disable"
                  : "Enable"}
            </Button>
          </div>

          {/* API Key Section */}
          {webhookConfig && (
            <>
              <div className="border-t pt-6">
                <Label>Webhook API Key</Label>
                <p className="text-muted-foreground mb-3 text-sm">
                  Use this API key in your Jellyfin webhook configuration. Keep
                  it secret!
                </p>
                <div className="flex gap-2">
                  <div className="bg-muted flex-1 rounded-md border px-3 py-2">
                    <code className="font-mono text-sm break-all">
                      {webhookConfig.webhookApiKey}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyApiKey}
                    title="Copy API key"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Generate new API key"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will create a new API key and invalidate the old
                          one. You'll need to update your Jellyfin webhook
                          configuration with the new key.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => regenerateApiKey.mutate()}
                          disabled={regenerateApiKey.isPending}
                        >
                          {regenerateApiKey.isPending
                            ? "Regenerating..."
                            : "Regenerate"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Username Filter Section */}
              <div className="border-t pt-6">
                <Label htmlFor="username-filter">
                  Username Filter (Optional)
                </Label>
                <p className="text-muted-foreground mb-3 text-sm">
                  Leave empty to track watches from all Jellyfin users, or
                  specify a username to only track watches from a specific user.
                </p>
                <div className="flex gap-2">
                  <Input
                    id="username-filter"
                    placeholder="e.g., john_doe"
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                  />
                  <Button
                    onClick={handleUpdateUsernameFilter}
                    disabled={updateUsernameFilter.isPending}
                    variant="outline"
                  >
                    {updateUsernameFilter.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
                {webhookConfig.usernameFilter && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    Currently filtering watches from:{" "}
                    <strong>{webhookConfig.usernameFilter}</strong>
                  </p>
                )}
              </div>
            </>
          )}

          {/* Setup Guide */}
          <div className="border-t pt-6">
            <Button
              variant="outline"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full justify-start"
            >
              {showGuide ? "Hide" : "Show"} Setup Guide
            </Button>

            {showGuide && (
              <div className="bg-muted/50 border-primary mt-4 space-y-4 rounded-md border-l-4 p-4">
                <div>
                  <h3 className="mb-2 font-semibold">
                    Jellyfin Webhook Setup Guide
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Follow these steps to set up automatic movie tracking from
                    your Jellyfin server:
                  </p>

                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold">1.</span>
                      <div>
                        <p className="font-semibold">
                          Install Jellyfin Webhook Plugin
                        </p>
                        <p className="text-muted-foreground">
                          In Jellyfin: Settings → Plugins → Catalog → Search
                          "Webhook" → Install the Jellyfin Plugin Webhook plugin
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold">2.</span>
                      <div>
                        <p className="font-semibold">Configure Webhook URL</p>
                        <p className="text-muted-foreground mb-2">
                          In Jellyfin: Settings → Plugins → Webhook
                        </p>
                        <p className="text-muted-foreground">
                          Enter your webhook URL:
                        </p>
                        <code className="bg-background mt-1 block rounded border px-2 py-1 font-mono text-xs">
                          {typeof window !== "undefined"
                            ? `${window.location.origin}/api/webhooks/jellyfin`
                            : "https://your-trackerr-instance.com/api/webhooks/jellyfin"}
                        </code>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold">3.</span>
                      <div>
                        <p className="font-semibold">Add API Key Header</p>
                        <p className="text-muted-foreground mb-2">
                          Add the following custom header:
                        </p>
                        <div className="space-y-1 text-xs">
                          <p>
                            <strong>Header Name:</strong>{" "}
                            <code className="bg-background rounded border px-1">
                              x-api-key
                            </code>
                          </p>
                          <p>
                            <strong>Header Value:</strong> Copy the API key from
                            above
                          </p>
                        </div>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold">4.</span>
                      <div>
                        <p className="font-semibold">
                          Configure Webhook Template
                        </p>
                        <p className="text-muted-foreground mb-2">
                          In the Jellyfin webhook plugin, set the body/content
                          template to:
                        </p>
                        <code className="bg-background mt-1 block overflow-auto rounded border px-2 py-1 font-mono text-xs">
                          {`{
  "tmdbId": "{{Provider_tmdb}}",
  "playedToCompletion": "{{PlayedToCompletion}}",
  "timestamp": "{{Timestamp}}",
  "totalRunTimeInTicks": "{{RunTimeTicks}}",
  "currentRunTimeInTicks": "{{PlaybackPositionTicks}}"
}`}
                        </code>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold">5.</span>
                      <div>
                        <p className="font-semibold">Select Events</p>
                        <p className="text-muted-foreground">
                          Enable the <strong>Playback Stop</strong> event to
                          track when users stop watching movies
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-primary font-semibold">6.</span>
                      <div>
                        <p className="font-semibold">Test & Save</p>
                        <p className="text-muted-foreground">
                          Click "Send Test Notification" to verify the webhook
                          is working, then save your configuration
                        </p>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-4 rounded-md border border-blue-500/20 bg-blue-500/10 p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      <strong>Note:</strong> Movies are automatically marked as{" "}
                      <strong>"On Demand"</strong> with{" "}
                      <strong>"Home Media Library"</strong> as the streaming
                      service. If the movie doesn't exist in your collection, it
                      will be automatically added from TMDB.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
