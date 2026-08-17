import type { Language } from "@/shared/config/locale";

type Props = { language: Language; onChange: (language: Language) => void };

export function LanguageSwitch({ language, onChange }: Props) {
  return <button className="jt-language" type="button" aria-label="Tilni o‘zgartirish" onClick={() => onChange(language === "uz" ? "ru" : "uz")}>{language.toUpperCase()}</button>;
}
