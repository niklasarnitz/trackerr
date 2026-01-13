-- CreateTable
CREATE TABLE
    "public"."ExternalActionMetadataTag" (
        "id" TEXT NOT NULL,
        "movieWatchId" TEXT NOT NULL,
        "via" "public"."ExternalActionMetadataTagVia" NOT NULL,
        "from" "public"."ExternalActionMetadataTagFrom" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "ExternalActionMetadataTag_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."JellyfinWebhookConfig" (
        "id" TEXT NOT NULL,
        "userPreferencesId" TEXT NOT NULL,
        "webhookApiKey" TEXT NOT NULL,
        "isEnabled" BOOLEAN NOT NULL DEFAULT false,
        "usernameFilter" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "JellyfinWebhookConfig_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE INDEX "ExternalActionMetadataTag_movieWatchId_idx" ON "public"."ExternalActionMetadataTag" ("movieWatchId");

-- CreateIndex
CREATE UNIQUE INDEX "JellyfinWebhookConfig_userPreferencesId_key" ON "public"."JellyfinWebhookConfig" ("userPreferencesId");

-- CreateIndex
CREATE UNIQUE INDEX "JellyfinWebhookConfig_webhookApiKey_key" ON "public"."JellyfinWebhookConfig" ("webhookApiKey");

-- CreateIndex
CREATE INDEX "JellyfinWebhookConfig_userPreferencesId_idx" ON "public"."JellyfinWebhookConfig" ("userPreferencesId");

-- AddForeignKey
ALTER TABLE "public"."ExternalActionMetadataTag" ADD CONSTRAINT "ExternalActionMetadataTag_movieWatchId_fkey" FOREIGN KEY ("movieWatchId") REFERENCES "public"."MovieWatch" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JellyfinWebhookConfig" ADD CONSTRAINT "JellyfinWebhookConfig_userPreferencesId_fkey" FOREIGN KEY ("userPreferencesId") REFERENCES "public"."UserPreferences" ("id") ON DELETE CASCADE ON UPDATE CASCADE;