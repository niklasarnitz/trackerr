import { StreamingService, WatchLocation } from "@prisma/client";
import { z } from "zod";

export const watchLocationSchema = z.enum(WatchLocation);
export const streamingServiceSchema = z.enum(StreamingService);

export type WatchLocationInput = z.infer<typeof watchLocationSchema>;
export type StreamingServiceInput = z.infer<typeof streamingServiceSchema>;
