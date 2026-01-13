import { z } from "zod";
import { type cinemaMetadataSchema, movieWatchFormSchema } from "./api-schemas";

export const movieWatchSchema = movieWatchFormSchema;

export type MovieWatchFormData = z.infer<typeof movieWatchSchema>;
export type CinemaWatchMetadataFormData = z.infer<typeof cinemaMetadataSchema>;

export const mediaEntrySchema = z.object({
  medium: z.enum([
    "BLURAY",
    "BLURAY4K",
    "DVD",
    "DIGITAL",
    "LASERDISC",
    "STREAM",
    "FILE",
    "VHS",
    "OTHER",
  ]),
  version: z.string().optional().or(z.literal("")),
  note: z.string().optional().or(z.literal("")),
  isVirtual: z.boolean(),
  isRipped: z.boolean(),
});

export type MediaEntryFormData = z.infer<typeof mediaEntrySchema>;

export const WATCH_LOCATIONS = [
  { value: "ON_DEMAND", label: "On Demand" },
  { value: "CINEMA", label: "Cinema" },
  { value: "TV", label: "TV" },
  { value: "OTHER", label: "Other" },
] as const;

export const STREAMING_SERVICES = [
  { value: "APPLE_TV_PLUS", label: "Apple TV+" },
  { value: "CRUNCHYROLL", label: "Crunchyroll" },
  { value: "DISNEY_PLUS", label: "Disney+" },
  { value: "HBO_MAX", label: "HBO Max" },
  { value: "HOME_MEDIA_LIBRARY", label: "Home Media Library" },
  { value: "HULU", label: "Hulu" },
  { value: "MAX", label: "Max" },
  { value: "NETFLIX", label: "Netflix" },
  { value: "OTHER", label: "Other" },
  { value: "PARAMOUNT_PLUS", label: "Paramount+" },
  { value: "PEACOCK", label: "Peacock" },
  { value: "PRIME_VIDEO", label: "Prime Video" },
  { value: "YOUTUBE_PREMIUM", label: "YouTube Premium" },
] as const;

export const SOUND_SYSTEM_TYPES = [
  { value: "MONO", label: "Mono" },
  { value: "STEREO", label: "Stereo" },
  { value: "DOLBY_SURROUND", label: "Dolby Surround" },
  { value: "DOLBY_DIGITAL", label: "Dolby Digital" },
  { value: "DOLBY_5_1", label: "Dolby 5.1" },
  { value: "DOLBY_7_1", label: "Dolby 7.1" },
  { value: "DOLBY_ATMOS", label: "Dolby Atmos" },
  { value: "DTS", label: "DTS" },
  { value: "DTS_X", label: "DTS:X" },
  { value: "DTS_70MM", label: "DTS 70mm" },
  { value: "SDDS", label: "SDDS" },
  { value: "IMAX", label: "IMAX" },
  { value: "OTHER", label: "Other" },
] as const;

export const PROJECTION_TYPES = [
  { value: "DIGITAL_2D", label: "Digital 2D" },
  { value: "DIGITAL_3D", label: "Digital 3D" },
  { value: "DIGITAL_IMAX", label: "IMAX 2D" },
  { value: "IMAX_3D", label: "IMAX 3D" },
  { value: "ANALOG_16MM", label: "16mm Film" },
  { value: "ANALOG_35MM", label: "35mm Film" },
  { value: "ANALOG_70MM", label: "70mm Film" },
  { value: "OTHER", label: "Other" },
] as const;

export const LANGUAGE_TYPES = [
  { value: "ORIGINAL", label: "Original Language" },
  { value: "ORIGINAL_WITH_SUBTITLES", label: "Original with Subtitles" },
  { value: "DUBBED", label: "Dubbed" },
  { value: "OTHER", label: "Other" },
] as const;

export const ASPECT_RATIOS = [
  { value: "ACADEMY_4_3", label: "Academy (1.33:1, 4:3) - Academy standard" },
  { value: "IMAX_143_1", label: "IMAX (1.43:1) - IMAX Digital/Film" },
  { value: "RATIO_147_1", label: "1.47:1 - Ultra Panavision" },
  { value: "EUROPEAN_166_1", label: "European (1.66:1) - European standard" },
  { value: "STANDARD_16_9", label: "Standard (1.78:1, 16:9) - HD/TV standard" },
  { value: "FLAT_185_1", label: "Flat (1.85:1) - American Flat" },
  { value: "IMAX_190_1", label: "IMAX Digital (1.90:1) - IMAX Digital" },
  { value: "VISTAVISION_196_1", label: "VistaVision (1.96:1) - VistaVision" },
  { value: "TODD_AO_221_1", label: "Todd-AO (2.21:1) - Todd-AO" },
  { value: "SCOPE_235_1", label: "Scope (2.35:1) - CinemaScope/Panavision" },
  { value: "SCOPE_239_1", label: "Anamorphic (2.39:1) - Modern Anamorphic" },
  { value: "SUPER_35_240_1", label: "Super 35 (2.40:1) - Super 35 Anamorphic" },
  { value: "CINERAMA_276_1", label: "Cinerama (2.76:1) - Cinerama" },
  { value: "OTHER", label: "Other" },
] as const;

export const MEDIA_TYPES = [
  { value: "BLURAY", label: "Blu-ray" },
  { value: "BLURAY4K", label: "4K UHD Blu-ray" },
  { value: "DVD", label: "DVD" },
  { value: "DIGITAL", label: "Digital" },
  { value: "LASERDISC", label: "LaserDisc" },
  { value: "STREAM", label: "Stream" },
  { value: "FILE", label: "File" },
  { value: "VHS", label: "VHS" },
  { value: "OTHER", label: "Other" },
] as const;
