"use client";

import { CalendarDays, Clock3 } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function parseDateTime(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateTimeValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getTime(value?: string) {
  return value?.split("T")[1]?.slice(0, 5) ?? "09:00";
}

function DateTimePicker({
  value,
  onChange,
  placeholder,
}: DateTimePickerProps) {
  const selectedDate = parseDateTime(value);

  const handleDateSelect = (date?: Date) => {
    if (!date) return;

    const [hours, minutes] = getTime(value).split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(formatDateTimeValue(date));
  };

  const handleTimeChange = (time: string) => {
    const date = selectedDate ?? new Date();
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    onChange(formatDateTimeValue(date));
  };

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
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(selectedDate)
          : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 overflow-hidden p-0">
        <Calendar
          mode="single"
          onSelect={handleDateSelect}
          selected={selectedDate}
        />
        <label className="flex items-center gap-2 border-t border-border p-3 text-sm font-medium text-foreground">
          <Clock3 className="size-4 text-muted-foreground" />
          Vaqt
          <Input
            className="ml-auto w-28"
            onChange={event => handleTimeChange(event.target.value)}
            type="time"
            value={getTime(value)}
          />
        </label>
      </PopoverContent>
    </Popover>
  );
}

export { DateTimePicker };
