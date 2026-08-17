"use client";

import { CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disableFuture?: boolean;
};

function parseDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function DatePicker({
  value,
  onChange,
  placeholder = "Sanani tanlang",
  disableFuture = false,
}: DatePickerProps) {
  const selectedDate = parseDate(value);

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-2xl border border-border bg-background px-3 text-left text-sm font-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !selectedDate && "text-muted-foreground",
        )}
        type="button"
      >
        <CalendarDays className="size-4 shrink-0" />
        {selectedDate
          ? new Intl.DateTimeFormat("uz-UZ", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(selectedDate)
          : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 overflow-hidden p-0">
        <Calendar
          disabled={disableFuture ? { after: new Date() } : undefined}
          mode="single"
          onSelect={(date) => date && onChange(formatDateValue(date))}
          selected={selectedDate}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
