"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      classNames={{
        root: "w-fit",
        months: "flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-8 items-center justify-center",
        caption_label: "text-sm font-semibold text-foreground",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-3 top-3 inline-flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        button_next:
          "absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-center text-[0.7rem] font-medium text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "relative size-9 p-0 text-center text-sm",
        day_button:
          "inline-flex size-9 items-center justify-center rounded-xl font-normal transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 aria-selected:bg-primary aria-selected:text-primary-foreground",
        selected: "",
        today: "font-bold text-primary",
        outside: "text-muted-foreground opacity-40",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("size-4", iconClassName)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
