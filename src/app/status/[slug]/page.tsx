import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconHeartRateMonitor,
} from "@tabler/icons-react";

import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentStatusBadge } from "@/components/shared/incident-status-badge";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import FormatTimestamp from "@/components/format-timestamp";
import { MonitorRuns, MonitorUptime } from "./monitor-runs";

import { PRODUCT_URL } from "@/constants";

import { api } from "@/trpc/server";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;

  return {
    title: `${slug} | Status Page | Hawk`,
    description: `Status Page for ${slug}, powered by Hawk`,
  };
}

export default async function PublicStatusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const statusPageData = await api.statusPage.get({
    slug: (await params).slug,
  });

  const statusPage = {
    name: statusPageData?.name,
    description: statusPageData?.description,
  };

  const monitors = statusPageData?.monitors.map((monitor) => ({
    id: monitor.id,
    name: monitor.name,
    status: monitor.status,
    lastChecked: monitor.lastChecked ?? monitor.updatedAt,
  }));

  const status: string[] = [];
  monitors?.every((m) => status.push(m.status));
  const overallStatus = status.includes("down")
    ? "down"
    : status.includes("unknown")
      ? "unknown"
      : "up";

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-semibold">{statusPage.name}</h1>
          {statusPage.description && (
            <p className="text-muted-foreground">{statusPage.description}</p>
          )}
        </div>

        {/* Overall Status Banner */}
        <div className="bg-muted/30 mb-8 rounded-lg border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {overallStatus === "up" ? (
                <IconCheck className="h-5 w-5 text-green-500" />
              ) : overallStatus === "down" ? (
                <IconX className="h-5 w-5 text-red-500" />
              ) : (
                <IconAlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {overallStatus === "up"
                  ? "All Systems Operational"
                  : "Service Disruption"}
              </span>
            </div>
            <span className="text-muted-foreground text-xs tracking-wide uppercase">
              {new Date().toUTCString().replace(/GMT$/, "(UTC)")}
            </span>
          </div>
        </div>

        {/* Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconHeartRateMonitor className="h-5 w-5" />
              Monitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-10 space-y-6">
              {monitors?.map((monitor) => (
                <div key={monitor.id} className="w-full">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {monitor.status === "up" ? (
                        <IconCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <IconX className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{monitor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Uptime: <MonitorUptime id={monitor.id} />
                      </span>
                    </div>
                  </div>
                  <MonitorRuns id={monitor.id} />
                  <div className="text-muted-foreground mt-1 flex items-center justify-between text-xs">
                    <span>45 days ago</span>
                    <span>Today</span>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents */}
        {statusPageData.incidents.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5" />
                Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusPageData.incidents.map((incident) => (
                  <div key={incident.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          {incident.title}
                        </h3>
                        {incident.monitorName && (
                          <p className="text-muted-foreground text-sm">
                            Affected service: {incident.monitorName}
                          </p>
                        )}
                      </div>
                      <IncidentStatusBadge status={incident.status} />
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {incident.description}
                    </p>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <IconClock className="h-4 w-4" />
                      <span className="text-muted-foreground">Started:</span>
                      <FormatTimestamp timestamp={incident.startedAt} />
                      {incident.resolvedAt && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-muted-foreground">
                            Resolved:
                          </span>
                          <FormatTimestamp timestamp={incident.resolvedAt} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border px-6 py-10 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full border">
              <IconAlertCircle className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="font-medium">No recent incidents</div>
            <p className="text-muted-foreground text-sm">
              There have been no incidents within the last 7 days.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-muted-foreground mt-8 grid grid-cols-3 items-center text-center text-sm">
          <div className="justify-start-safe flex">
            <FormatTimestamp timestamp={new Date()} />
          </div>
          <p>
            Powered by{" "}
            <Link href={PRODUCT_URL} rel="noopener noreferrer" target="_blank">
              Hawk
            </Link>
          </p>
          <div className="flex justify-end-safe">
            <ThemeSwitcher variant="outline" />
          </div>
        </div>
      </div>
    </div>
  );
}
