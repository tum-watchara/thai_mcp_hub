"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ExternalLink, Loader2, Plug, ShieldCheck } from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { buttonVariants } from "@repo/ui/components/button-variants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { toast } from "@repo/ui/components/toaster";
import { ErrorState } from "@/components/states";
import { pluginIntegrations, siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { useConnectedClientsQuery, useInstallPluginMutation } from "@/lib/query/workspace";
import { SETUP_CLIENTS, type SetupClient } from "../lib/client-configs";

interface ClientSetupTabsProps {
  workspaceName?: string;
  defaultClient?: SetupClient;
  onClientChange?: (client: SetupClient) => void;
}

function InstallPluginButton({ client, workspaceName }: { client: SetupClient; workspaceName: string }) {
  const t = useTranslations("plugins");
  const common = useTranslations("common");
  const install = useInstallPluginMutation();
  const connections = useConnectedClientsQuery();
  const [open, setOpen] = useState(false);
  const platform = pluginIntegrations[client].name;
  const connected = connections.data?.some((entry) => entry.client === client) ?? false;

  const connect = () => install.mutate(client, {
    onSuccess: () => {
      toast.success(t("connectedToast", { platform }));
      setOpen(false);
    },
    onError: () => toast.error(t("failed")),
  });

  return (
    <div className="grid gap-3">
      {connections.isError ? <ErrorState error={connections.error} onRetry={() => connections.refetch()} retrying={connections.isFetching} compact /> : null}
      {connected ? <p className="flex items-center gap-2 text-sm text-success-text"><Check className="size-4" aria-hidden />{t("connected", { platform })}</p> : null}
      <Button variant="primary" className="w-fit" onClick={() => { install.reset(); setOpen(true); }} disabled={connections.isPending || connections.isError}>
        <Plug aria-hidden />{connected ? t("reconnect", { platform }) : t("install", { platform })}
      </Button>
      <Dialog open={open} onOpenChange={(value) => { if (!install.isPending) setOpen(value); }}>
        <DialogContent closeLabel={common("close")}>
          <DialogHeader>
            <DialogTitle>{t("dialog.title", { platform })}</DialogTitle>
            <DialogDescription>{t("dialog.description", { product: siteConfig.name, workspace: workspaceName })}</DialogDescription>
          </DialogHeader>
          <Badge tone="outline" className="w-fit">{t("demoBadge")}</Badge>
          <div className="grid gap-3 rounded-md border border-border bg-subtle p-4">
            <p className="flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4" aria-hidden />{t("dialog.permissions")}</p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("dialog.tools")}</li><li>{t("dialog.logs")}</li><li>{t("dialog.credentials")}</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">{t("demoNotice")}</p>
          {install.isError ? <ErrorState error={install.error} compact /> : null}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={install.isPending}>{common("cancel")}</Button>
            <Button variant="primary" onClick={connect} disabled={install.isPending}>
              {install.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
              {install.isPending ? common("saving") : t("dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Plugin-first setup shared by marketing, onboarding and the connection card. */
export function ClientSetupTabs({ workspaceName, defaultClient = "chatgpt", onClientChange }: ClientSetupTabsProps) {
  const t = useTranslations("clients");
  const plugins = useTranslations("plugins");
  const setup = useTranslations("onboarding.plugin");
  return (
    <Tabs defaultValue={defaultClient} onValueChange={(value) => {
      const client = SETUP_CLIENTS.find((item) => item === value);
      if (client) onClientChange?.(client);
    }} className="min-w-0">
      <TabsList aria-label={setup("chooseClient")}>
        {SETUP_CLIENTS.map((client) => <TabsTrigger key={client} value={client}>{t(`tabs.${client}`)}</TabsTrigger>)}
      </TabsList>
      {SETUP_CLIENTS.map((client) => (
        <TabsContent key={client} value={client} className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2"><Badge tone="outline">{plugins("label")}</Badge><Badge tone="outline">{plugins("demoBadge")}</Badge></div>
          <ol className="grid gap-3 text-sm">
            {(["one", "two", "three"] as const).map((step, index) => (
              <li key={step} className="flex gap-3"><span aria-hidden className="font-mono text-muted-foreground">{index + 1}.</span><span>{t(`steps.${client}.${step}`, { product: siteConfig.name })}</span></li>
            ))}
          </ol>
          {workspaceName ? <InstallPluginButton client={client} workspaceName={workspaceName} /> : (
            <Link href="/login" className={buttonVariants({ variant: "primary" })}><Plug aria-hidden />{plugins("getStarted", { platform: pluginIntegrations[client].name })}</Link>
          )}
          <p className="text-sm text-muted-foreground">{plugins("demoNotice")}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href={`/docs/connect/${client === "claude" ? "claude-desktop" : client}`} className="inline-flex min-h-10 items-center text-accent hover:underline">{plugins("guide")}</Link>
            <a href={pluginIntegrations[client].guideUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 text-accent hover:underline">{plugins("platformGuide")}<ExternalLink className="size-3.5" aria-hidden /></a>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
