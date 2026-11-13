"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
  CreateCredentialInputSchema,
  RotateCredentialInputSchema,
  type CreateCredentialInput,
  type Credential,
  type RotateCredentialInput,
  type Source,
} from "@repo/schemas";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogConfirm,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import { Button } from "@repo/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Field, fieldDescriptionId } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { toast } from "@repo/ui/components/toaster";
import {
  useCreateCredentialMutation,
  useDeleteCredentialMutation,
  useRotateCredentialMutation,
} from "@/lib/query/credentials";
import { useLocalized } from "@/lib/utils/format";
import { useValidationMessage } from "@/lib/utils/validation";

interface AddCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  byokSources: Source[];
  defaultSourceId?: string;
}

export function AddCredentialDialog({ open, onOpenChange, byokSources, defaultSourceId }: AddCredentialDialogProps) {
  const t = useTranslations("credentials");
  const tCommon = useTranslations("common");
  const localized = useLocalized();
  const message = useValidationMessage();
  const create = useCreateCredentialMutation();
  const form = useForm<CreateCredentialInput>({
    resolver: zodResolver(CreateCredentialInputSchema),
    defaultValues: { sourceId: defaultSourceId ?? "", label: "", value: "" },
  });
  const errors = form.formState.errors;

  const close = (next: boolean) => {
    if (!next) form.reset({ sourceId: defaultSourceId ?? "", label: "", value: "" });
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent closeLabel={tCommon("close")}>
        <DialogHeader>
          <DialogTitle>{t("addDialog.title")}</DialogTitle>
          <DialogDescription>{t("addDialog.description")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit((values) =>
            create.mutate(values, {
              onSuccess: () => {
                toast.success(t("toast.added"));
                close(false);
              },
              onError: () => toast.error(t("toast.error")),
            }),
          )}
        >
          <Controller
            control={form.control}
            name="sourceId"
            render={({ field }) => (
              <Field id="cred-source" label={t("form.source")} error={message(errors.sourceId?.message)}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="cred-source" aria-invalid={Boolean(errors.sourceId)} aria-describedby={fieldDescriptionId("cred-source")}>
                    <SelectValue placeholder={t("form.sourcePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {byokSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {localized(source.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Field id="cred-label" label={t("form.label")} helper={t("form.labelHelper")} error={message(errors.label?.message)}>
            <Input id="cred-label" aria-invalid={Boolean(errors.label)} aria-describedby={fieldDescriptionId("cred-label")} {...form.register("label")} />
          </Field>
          <Field id="cred-value" label={t("form.value")} helper={t("form.valueHelper")} error={message(errors.value?.message)}>
            <Input
              id="cred-value"
              type="password"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              aria-invalid={Boolean(errors.value)}
              aria-describedby={fieldDescriptionId("cred-value")}
              {...form.register("value")}
            />
          </Field>
          <DialogFooter>
            <Button variant="secondary" onClick={() => close(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {create.isPending ? tCommon("saving") : t("addDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RotateCredentialDialogProps {
  credential: Credential | null;
  onOpenChange: (open: boolean) => void;
}

export function RotateCredentialDialog({ credential, onOpenChange }: RotateCredentialDialogProps) {
  const t = useTranslations("credentials");
  const tCommon = useTranslations("common");
  const message = useValidationMessage();
  const rotate = useRotateCredentialMutation();
  const form = useForm<RotateCredentialInput>({
    resolver: zodResolver(RotateCredentialInputSchema),
    values: { id: credential?.id ?? "", value: "" },
  });
  const error = message(form.formState.errors.value?.message);

  return (
    <Dialog open={credential !== null} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={tCommon("close")}>
        <DialogHeader>
          <DialogTitle>{t("rotateDialog.title", { label: credential?.label ?? "" })}</DialogTitle>
          <DialogDescription>{t("rotateDialog.description")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit((values) =>
            rotate.mutate(values, {
              onSuccess: () => {
                toast.success(t("toast.rotated"));
                onOpenChange(false);
              },
              onError: () => toast.error(t("toast.error")),
            }),
          )}
        >
          <Field id="rotate-value" label={t("form.value")} helper={t("form.valueHelper")} error={error}>
            <Input
              id="rotate-value"
              type="password"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              aria-invalid={Boolean(error)}
              aria-describedby={fieldDescriptionId("rotate-value")}
              {...form.register("value")}
            />
          </Field>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={rotate.isPending}>
              {rotate.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {rotate.isPending ? tCommon("saving") : t("rotateDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteCredentialDialogProps {
  credential: Credential | null;
  sourceName: string;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCredentialDialog({ credential, sourceName, onOpenChange }: DeleteCredentialDialogProps) {
  const t = useTranslations("credentials");
  const tCommon = useTranslations("common");
  const remove = useDeleteCredentialMutation();

  return (
    <AlertDialog open={credential !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDialog.title", { label: credential?.label ?? "" })}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteDialog.description", { source: sourceName })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogConfirm
            destructive
            disabled={remove.isPending}
            onClick={() => {
              if (!credential) return;
              remove.mutate(credential.id, {
                onSuccess: () => {
                  toast.success(t("toast.deleted"));
                  onOpenChange(false);
                },
                onError: () => toast.error(t("toast.error")),
              });
            }}
          >
            {remove.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {remove.isPending ? tCommon("deleting") : t("deleteDialog.confirm")}
          </AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
