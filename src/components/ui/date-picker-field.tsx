"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { formatDate, datePickerConstraints } from "~/lib/date-utils";

interface DatePickerFieldProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  disablePastDates?: boolean;
  disableFutureDates?: boolean;
  customDisabled?: (date: Date) => boolean;
  autoFocus?: boolean;
}

export function DatePickerField({
  value,
  onChange,
  label = "Date",
  placeholder = "Pick a date",
  disabled = false,
  className,
  align = "start",
  disablePastDates = false,
  disableFutureDates = true, // Default: no future dates (for watch dates)
  customDisabled,
  autoFocus = true,
}: DatePickerFieldProps) {
  const getDisabledFunction = () => {
    if (customDisabled) {
      return customDisabled;
    }

    return (date: Date) => {
      if (disableFutureDates && date > new Date()) {
        return true;
      }
      if (disablePastDates && date < new Date()) {
        return true;
      }
      if (date < datePickerConstraints.minDate) {
        return true;
      }
      return false;
    };
  };

  return (
    <FormItem className={cn("flex flex-col", className)}>
      <FormLabel>{label}</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !value && "text-muted-foreground",
              )}
            >
              {value ? formatDate(value) : <span>{placeholder}</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={getDisabledFunction()}
            autoFocus={autoFocus}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}
