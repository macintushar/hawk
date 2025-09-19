"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MonitorCard } from "@/components/shared/monitor-card";
import { IncidentCard } from "@/components/shared/incident-card";
import {
  MonitorCardSkeleton,
  IncidentCardSkeleton,
} from "@/components/shared/loading-skeleton";
import { IconPlus, IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type { RouterOutputs } from "@/trpc/react";

type Monitor = RouterOutputs["monitor"]["list"][0];
type Incident = RouterOutputs["incident"]["list"][0];

interface RecentActivityProps {
  monitors?: Monitor[];
  incidents?: Incident[];
  isLoading?: boolean;
}

export function RecentActivity({
  monitors,
  incidents,
  isLoading,
}: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Monitors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <MonitorCardSkeleton key={i} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <IncidentCardSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Monitors</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/monitors">
              View All
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {monitors && monitors.length > 0 ? (
            monitors.slice(0, 3).map((monitor) => {
              if (!monitor?.id) return null;
              return <MonitorCard key={monitor.id} {...monitor} />;
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No monitors yet</p>
              <Button asChild>
                <Link href="/app/monitors/new">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Monitor
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Incidents</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/incidents">
              View All
              <IconArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {incidents && incidents.length > 0 ? (
            incidents.slice(0, 3).map((incident) => {
              if (!incident?.id) return null;
              return <IncidentCard key={incident.id} {...incident} />;
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No incidents yet</p>
              <Button asChild>
                <Link href="/app/incidents/new">
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Incident
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
