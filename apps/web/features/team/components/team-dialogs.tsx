"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { AssignableRoleSchema, InviteMemberInputSchema, type InviteMemberInput, type TeamMember } from "@repo/schemas";
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
import { ServiceError } from "@/lib/services";
import { useInviteMemberMutation, useRemoveMemberMutation } from "@/lib/query/team";
import { useValidationMessage } from "@/lib/utils/validation";

const DEFAULTS: InviteMemberInput = { email: "", role: "member" };

export function InviteMemberDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const message = useValidationMessage();
  const invite = useInviteMemberMutation();
  const form = useForm<InviteMemberInput>({ resolver: zodResolver(InviteMemberInputSchema), defaultValues: DEFAULTS });
  const errors = form.formState.errors;

  const close = (next: boolean) => {
    if (!next) form.reset(DEFAULTS);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent closeLabel={tCommon("close")}>
        <DialogHeader>
          <DialogTitle>{t("inviteDialog.title")}</DialogTitle>
          <DialogDescription>{t("inviteDialog.description")}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={form.handleSubmit((values) =>
            invite.mutate(values, {
              onSuccess: (member) => {
                toast.success(t("toast.invited", { email: member.email }));
                close(false);
              },
              onError: (error) => {
                if (error instanceof ServiceError && error.code === "conflict") {
                  form.setError("email", { message: "conflict" });
                  toast.error(t("toast.duplicate"));
                } else {
                  toast.error(t("toast.error"));
                }
              },
            }),
          )}
        >
          <Field
            id="invite-email"
            label={t("inviteDialog.email")}
            error={errors.email?.message === "conflict" ? t("toast.duplicate") : message(errors.email?.message)}
          >
            <Input
              id="invite-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder={t("inviteDialog.emailPlaceholder")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={fieldDescriptionId("invite-email")}
              {...form.register("email")}
            />
          </Field>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <Field id="invite-role" label={t("inviteDialog.role")} helper={t(`roleHelp.${field.value}`)}>
                <Select value={field.value} onValueChange={(value) => field.onChange(AssignableRoleSchema.parse(value))}>
                  <SelectTrigger id="invite-role" aria-describedby={fieldDescriptionId("invite-role")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AssignableRoleSchema.options.map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${role}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => close(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={invite.isPending}>
              {invite.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {t("inviteDialog.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RemoveMemberDialog({ member, onOpenChange }: { member: TeamMember | null; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const remove = useRemoveMemberMutation();
  return (
    <AlertDialog open={member !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeDialog.title", { name: member?.name ?? "" })}</AlertDialogTitle>
          <AlertDialogDescription>{t("removeDialog.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogConfirm
            destructive
            disabled={remove.isPending}
            onClick={() => {
              if (!member) return;
              remove.mutate(member.id, {
                onSuccess: () => {
                  toast.success(t("toast.removed", { name: member.name }));
                  onOpenChange(false);
                },
                onError: () => toast.error(t("toast.error")),
              });
            }}
          >
            {remove.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
            {t("removeDialog.confirm")}
          </AlertDialogConfirm>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
