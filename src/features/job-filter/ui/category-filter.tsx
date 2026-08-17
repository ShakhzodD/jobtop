import type { JobCategory } from "@/entities/job/model/types";

export type CategoryFilterValue = "Barchasi" | JobCategory;

type Props = {
  activeCategory: CategoryFilterValue;
  allLabel: string;
  onChange: (category: CategoryFilterValue) => void;
};

const categories: CategoryFilterValue[] = [
  "Barchasi",
  "Kuryer",
  "Xizmat",
  "Yuk tashish",
  "Tozalash",
];

export function CategoryFilter({ activeCategory, allLabel, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${category === activeCategory ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-card text-muted-foreground"}`}
        >
          {category === "Barchasi" ? allLabel : category}
        </button>
      ))}
    </div>
  );
}
