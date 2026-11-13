import { z } from "zod";

/** Text that exists in both supported languages. */
export const LocalizedTextSchema = z.object({
  th: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export const LocaleSchema = z.enum(["th", "en"]);
export type Locale = z.infer<typeof LocaleSchema>;

export const IsoDateTimeSchema = z.iso.datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

export const IsoDateSchema = z.iso.date();
export type IsoDate = z.infer<typeof IsoDateSchema>;

export const SortDirectionSchema = z.enum(["asc", "desc"]);
export type SortDirection = z.infer<typeof SortDirectionSchema>;

export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
  pageCount: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/** Builds the schema for a paginated response of any item schema. */
export const paginatedSchema = <T extends z.ZodType>(item: T) =>
  PaginationMetaSchema.extend({ items: z.array(item) });

export type Paginated<T> = PaginationMeta & { items: T[] };

/** Any JSON-serialisable value (tool inputs and outputs). */
export const JsonValueSchema = z.json();
export type JsonValue = z.infer<typeof JsonValueSchema>;

export const JsonObjectSchema = z.record(z.string(), JsonValueSchema);
export type JsonObject = z.infer<typeof JsonObjectSchema>;
