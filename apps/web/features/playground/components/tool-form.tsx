"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, Play, RotateCcw } from "lucide-react";
import type { JsonObject, Tool } from "@repo/schemas";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, fieldDescriptionId } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { useLocalized } from "@/lib/utils/format";
import { useValidationMessage } from "@/lib/utils/validation";
import { buildFormSchema, toFormValues, toToolInput, type ToolFormValues } from "../lib/schema-form";

interface ToolFormProps {
  tool: Tool;
  /** Input to prefill (from history); defaults to the tool's example input. */
  initialInput?: JsonObject;
  running: boolean;
  onRun: (input: JsonObject) => void;
  submitLabel?: string;
  idPrefix?: string;
}

/**
 * Form generated from the tool's input schema.
 * The parent remounts it (via `key`) when the tool or prefilled input changes.
 */
export function ToolForm({ tool, initialInput, running, onRun, submitLabel, idPrefix = "param" }: ToolFormProps) {
  const t = useTranslations("playground");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const validationMessage = useValidationMessage();
  const schema = useMemo(() => buildFormSchema(tool.inputSchema), [tool.inputSchema]);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(tool.inputSchema, initialInput ?? tool.exampleInput),
    mode: "onTouched",
  });

  const entries = Object.entries(tool.inputSchema.properties);

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => onRun(toToolInput(tool.inputSchema, values)))}
    >
      {entries.map(([name, param]) => {
        const id = `${idPrefix}-${name}`;
        const required = tool.inputSchema.required.includes(name);
        const error = validationMessage(form.formState.errors[name]?.message);
        const helper = localized(param.description);
        const label = <code className="font-mono text-[13px]">{name}</code>;

        if (param.type === "boolean") {
          return (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={id}
                    disabled={running}
                    className="mt-1"
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-describedby={fieldDescriptionId(id)}
                  />
                  <div className="grid gap-0.5">
                    <label htmlFor={id} className="cursor-pointer">
                      {label}
                    </label>
                    <p id={fieldDescriptionId(id)} className="text-xs text-muted-foreground">
                      {helper}
                    </p>
                  </div>
                </div>
              )}
            />
          );
        }

        if (param.enum) {
          return (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <Field id={id} label={label} helper={helper} error={error} optionalLabel={required ? undefined : tCommon("optional")}>
                  <Select value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange} disabled={running}>
                    <SelectTrigger id={id} aria-invalid={Boolean(error)} aria-describedby={fieldDescriptionId(id)} onBlur={field.onBlur}>
                      <SelectValue placeholder={t("selectOption")} />
                    </SelectTrigger>
                    <SelectContent>
                      {param.enum?.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span className="font-mono text-[13px]">{option}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          );
        }

        const numeric = param.type === "number" || param.type === "integer";
        return (
          <Field key={name} id={id} label={label} helper={helper} error={error} optionalLabel={required ? undefined : tCommon("optional")}>
            <Input
              id={id}
              disabled={running}
              inputMode={numeric ? "decimal" : undefined}
              type={param.format === "date" ? "date" : "text"}
              placeholder={param.default !== undefined ? String(param.default) : undefined}
              aria-invalid={Boolean(error)}
              aria-describedby={fieldDescriptionId(id)}
              autoComplete="off"
              className={param.format === "date" ? undefined : "font-mono text-[13px]"}
              {...form.register(name)}
            />
          </Field>
        );
      })}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" variant="primary" disabled={running}>
          {running ? <Loader2 className="animate-spin" aria-hidden /> : <Play aria-hidden />}
          {running ? t("running") : (submitLabel ?? t("run"))}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => form.reset(toFormValues(tool.inputSchema, tool.exampleInput))}
          disabled={running}
        >
          <RotateCcw aria-hidden />
          {t("useExample")}
        </Button>
      </div>
    </form>
  );
}
