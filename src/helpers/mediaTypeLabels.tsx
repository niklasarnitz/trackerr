"use client";
import type { MediaType } from "@prisma/client";

export const mediaTypeLabels: Record<MediaType, string> = {
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
