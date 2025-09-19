import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { IncidentStatusBadge } from "@/components/shared/incident-status-badge";
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react";
import { api } from "@/trpc/server";
import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import FormatTimestamp from "@/components/format-timestamp";
import Link from "next/link";
import { PRODUCT_URL } from "@/constants";

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

  const incidents =
    statusPageData?.incidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      startedAt: incident.startedAt,
      resolvedAt: incident.resolvedAt,
      monitorName: incident.monitorName,
    })) ?? [];

  const status: string[] = [];
  monitors?.every((m) => status.push(m.status));
  const overallStatus = status.includes("down")
    ? "down"
    : status.includes("unknown")
      ? "unknown"
      : "up";

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">{statusPage.name}</h1>
          {statusPage.description && (
            <p className="text-muted-foreground text-lg">
              {statusPage.description}
            </p>
          )}
        </div>

        {/* Overall Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-3">
              {overallStatus === "up" ? (
                <IconCheck className="h-8 w-8 text-green-600" />
              ) : overallStatus === "down" ? (
                <IconX className="h-8 w-8 text-red-600" />
              ) : (
                <IconAlertCircle className="h-8 w-8 text-yellow-600" />
              )}
              <span className="text-2xl">
                {overallStatus === "up"
                  ? "All Systems Operational"
                  : "Service Disruption"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <StatusBadge status={overallStatus} className="px-4 py-2 text-lg" />
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monitors?.map((monitor) => (
                <div
                  key={monitor.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {monitor.status === "up" ? (
                      <IconCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <IconX className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{monitor.name}</div>
                      <div className="text-muted-foreground text-sm">
                        <span className="text-muted-foreground">
                          Last checked:
                          <FormatTimestamp timestamp={monitor.lastChecked} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={monitor.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents */}
        {incidents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5" />
                Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
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
        )}

        {/* Footer */}
        <div className="text-muted-foreground mt-8 flex items-center justify-between gap-2 text-center text-sm">
          <FormatTimestamp timestamp={new Date()} />
          <p>
            Powered by{" "}
            <Link href={PRODUCT_URL} rel="noopener noreferrer" target="_blank">
              Hawk
            </Link>
          </p>
          <ThemeSwitcher variant="outline" />
        </div>
      </div>
    </div>
  );
}
