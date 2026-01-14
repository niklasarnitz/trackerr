import { z } from "zod";
import { type cinemaMetadataSchema, movieWatchFormSchema } from "./api-schemas";
import {
  MediaType,
  type AspectRatio,
  type CinemaSoundSystemType,
  type LanguageType,
  type ProjectionType,
  type StreamingService,
  type WatchLocation,
} from "@prisma/client";

export const movieWatchSchema = movieWatchFormSchema;

export type MovieWatchFormData = z.infer<typeof movieWatchSchema>;
export type CinemaWatchMetadataFormData = z.infer<typeof cinemaMetadataSchema>;

export const mediaEntrySchema = z.object({
  medium: z.enum(MediaType),
  version: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
  isVirtual: z.boolean(),
  isRipped: z.boolean(),
});

export type MediaEntryFormData = z.infer<typeof mediaEntrySchema>;

export const WATCH_LOCATIONS: Record<WatchLocation, string> = {
  ON_DEMAND: "On Demand",
  CINEMA: "Cinema",
  TV_BROADCAST: "TV Broadcast",
  TV: "TV",
  OTHER: "Other",
};

export const STREAMING_SERVICES: Record<StreamingService, string> = {
  APPLE_TV_PLUS: "Apple TV+",
  CRUNCHYROLL: "Crunchyroll",
  DISNEY_PLUS: "Disney+",
  HBO_MAX: "HBO Max",
  HOME_MEDIA_LIBRARY: "Home Media Library",
  HULU: "Hulu",
  MAX: "Max",
  NETFLIX: "Netflix",
  OTHER: "Other",
  PARAMOUNT_PLUS: "Paramount+",
  PEACOCK: "Peacock",
  PRIME_VIDEO: "Prime Video",
  YOUTUBE_PREMIUM: "YouTube Premium",
};

export const SOUND_SYSTEM_TYPES: Record<CinemaSoundSystemType, string> = {
  MONO: "Mono",
  STEREO: "Stereo",
  DOLBY_SURROUND: "Dolby Surround",
  DOLBY_DIGITAL: "Dolby Digital",
  DOLBY_5_1: "Dolby 5.1",
  DOLBY_7_1: "Dolby 7.1",
  DOLBY_ATMOS: "Dolby Atmos",
  DTS: "DTS",
  DTS_X: "DTS:X",
  DTS_70MM: "DTS 70mm",
  SDDS: "SDDS",
  IMAX: "IMAX",
  OTHER: "Other",
};

export const PROJECTION_TYPES: Record<ProjectionType, string> = {
  DIGITAL_2D: "Digital 2D",
  DIGITAL_3D: "Digital 3D",
  DIGITAL_IMAX: "IMAX 2D",
  IMAX_3D: "IMAX 3D",
  ANALOG_16MM: "16mm Film",
  ANALOG_35MM: "35mm Film",
  ANALOG_70MM: "70mm Film",
  OTHER: "Other",
};

export const LANGUAGE_TYPES: Record<LanguageType, string> = {
  ORIGINAL: "Original Language",
  ORIGINAL_WITH_SUBTITLES: "Original with Subtitles",
  DUBBED: "Dubbed",
  OTHER: "Other",
};

export const ASPECT_RATIOS: Record<AspectRatio, string> = {
  ACADEMY_4_3: "Academy (1.33:1, 4:3) - Academy standard",
  IMAX_143_1: "IMAX (1.43:1) - IMAX Digital/Film",
  RATIO_147_1: "1.47:1 - Ultra Panavision",
  EUROPEAN_166_1: "European (1.66:1) - European standard",
  STANDARD_16_9: "Standard (1.78:1, 16:9) - HD/TV standard",
  FLAT_185_1: "Flat (1.85:1) - American Flat",
  IMAX_190_1: "IMAX Digital (1.90:1) - IMAX Digital",
  VISTAVISION_196_1: "VistaVision (1.96:1) - VistaVision",
  TODD_AO_221_1: "Todd-AO (2.21:1) - Todd-AO",
  SCOPE_235_1: "Scope (2.35:1) - CinemaScope/Panavision",
  SCOPE_239_1: "Anamorphic (2.39:1) - Modern Anamorphic",
  SUPER_35_240_1: "Super 35 (2.40:1) - Super 35 Anamorphic",
  CINERAMA_276_1: "Cinerama (2.76:1) - Cinerama",
  OTHER: "Other",
};

export const MEDIA_TYPES: Record<MediaType, string> = {
  BLURAY: "Blu-ray",
  BLURAY4K: "4K UHD Blu-ray",
  DVD: "DVD",
  DIGITAL: "Digital",
  LASERDISC: "LaserDisc",
  STREAM: "Stream",
  FILE: "File",
  VHS: "VHS",
  OTHER: "Other",
};
