"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { SourceCategorySchema, type SourceCategory } from "@repo/schemas";
import { Input } from "@repo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";

const ALL = "all";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  );
}

interface CategorySelectProps {
  value: SourceCategory | undefined;
  onChange: (value: SourceCategory | undefined) => void;
  label: string;
  className?: string;
}

export function CategorySelect({ value, onChange, label, className }: CategorySelectProps) {
  const t = useTranslations("sourceMeta");
  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => onChange(next === ALL ? undefined : SourceCategorySchema.parse(next))}
    >
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t("allCategories")}</SelectItem>
        {SourceCategorySchema.options.map((category) => (
          <SelectItem key={category} value={category}>
            {t(`category.${category}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
