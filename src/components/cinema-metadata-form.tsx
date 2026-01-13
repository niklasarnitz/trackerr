"use client";

import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { CinemaSearch } from "~/components/cinema-search";
import {
  SOUND_SYSTEM_TYPES,
  PROJECTION_TYPES,
  LANGUAGE_TYPES,
  ASPECT_RATIOS,
} from "~/lib/form-schemas";
import type { Control } from "react-hook-form";
import type { MovieWatchFormData } from "~/lib/form-schemas";

interface CinemaMetadataFormProps {
  readonly control: Control<MovieWatchFormData>;
}

export function CinemaMetadataForm({ control }: CinemaMetadataFormProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Cinema Details</div>

      <FormField
        control={control}
        name="cinemaMetadata.cinemaName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cinema Name</FormLabel>
            <FormControl>
              <CinemaSearch
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Enter or search cinema name..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cinemaMetadata.soundSystemType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sound System (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select sound system" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SOUND_SYSTEM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cinemaMetadata.projectionType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Projection Type (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select projection type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PROJECTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cinemaMetadata.languageType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Language (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select language type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LANGUAGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cinemaMetadata.aspectRatio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Aspect Ratio (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cinemaMetadata.ticketPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ticket Price (Optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value === "" ? undefined : parseFloat(value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
