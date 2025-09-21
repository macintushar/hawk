"use client";

import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { api } from "@/trpc/react";

export default function Dashboard() {
  const {
    data: monitorsData,
    isLoading: isLoadingMonitors,
    error: monitorsError,
  } = api.monitor.list.useQuery({ limit: 4 });
  const {
    data: incidentsData,
    isLoading: isLoadingIncidents,
    error: incidentsError,
  } = api.incident.list.useQuery({});

  if (isLoadingMonitors || isLoadingIncidents) {
    return <div>Loading...</div>;
  }

  if (monitorsError || incidentsError) {
    return <div>Error loading data</div>;
  }

  // At this point, we know data is available since we checked for errors
  const stats = {
    totalMonitors: (monitorsData as unknown[])?.length ?? 0,
    activeIncidents:
      (incidentsData as unknown[])?.filter(
        (i: unknown) => (i as { status: string }).status !== "resolved",
      ).length ?? 0,
    averageUptime: 99.2,
    lastChecked: monitorsData?.[0]?.lastChecked ?? new Date(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your services and track their status
        </p>
      </div>

      <OverviewCards
        data={stats}
        isLoading={isLoadingMonitors || isLoadingIncidents}
      />

      <RecentActivity
        monitors={monitorsData ?? []}
        incidents={incidentsData ?? []}
        isLoading={isLoadingMonitors || isLoadingIncidents}
      />

      <QuickActions />
    </div>
  );
}
