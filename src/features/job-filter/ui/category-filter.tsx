import type { JobCategory } from "@/entities/job/model/types";

export type CategoryFilterValue = "Barchasi" | JobCategory;

type Props = {
  activeCategory: CategoryFilterValue;
  allLabel: string;
  onChange: (category: CategoryFilterValue) => void;
};

const categories: CategoryFilterValue[] = ["Barchasi", "Kuryer", "Xizmat", "Yuk tashish", "Tozalash"];

export function CategoryFilter({ activeCategory, allLabel, onChange }: Props) {
  return <div className="jt-categories">{categories.map((category) => <button key={category} type="button" onClick={() => onChange(category)} className={category === activeCategory ? "active" : ""}>{category === "Barchasi" ? allLabel : category}</button>)}</div>;
}
