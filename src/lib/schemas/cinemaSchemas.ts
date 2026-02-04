import {
  AspectRatio,
  CinemaSoundSystemType,
  LanguageType,
  ProjectionType,
} from "@prisma/client";
import { z } from "zod";

export const aspectRatioSchema = z.enum(AspectRatio);
export const soundSystemTypeSchema = z.enum(CinemaSoundSystemType);
export const projectionTypeSchema = z.enum(ProjectionType);
export const languageTypeSchema = z.enum(LanguageType);

export const cinemaMetadataSchema = z.object({
  cinemaName: z.string().optional(),
  soundSystemType: soundSystemTypeSchema.optional(),
  projectionType: projectionTypeSchema.optional(),
  languageType: languageTypeSchema.optional(),
  aspectRatio: aspectRatioSchema.optional(),
  ticketPrice: z.number().min(0).optional(),
});

export const cinemaSearchSchema = z.object({
  search: z.string().min(1),
});

export type AspectRatioInput = z.infer<typeof aspectRatioSchema>;
export type SoundSystemTypeInput = z.infer<typeof soundSystemTypeSchema>;
export type ProjectionTypeInput = z.infer<typeof projectionTypeSchema>;
export type LanguageTypeInput = z.infer<typeof languageTypeSchema>;
export type CinemaMetadataInput = z.infer<typeof cinemaMetadataSchema>;
export type CinemaSearchInput = z.infer<typeof cinemaSearchSchema>;
