"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconHeartRateMonitor,
  IconAlertCircle,
  IconTrendingUp,
  IconClock,
} from "@tabler/icons-react";
import { OverviewCardSkeleton } from "@/components/shared/loading-skeleton";
import type { OverviewCardsProps } from "@/types";

export function OverviewCards({ data, isLoading }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <OverviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const formatLastChecked = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Monitors</CardTitle>
          <IconHeartRateMonitor className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.totalMonitors ?? 0}</div>
          <p className="text-muted-foreground text-xs">
            Active monitoring endpoints
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Incidents
          </CardTitle>
          <IconAlertCircle className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data?.activeIncidents ?? 0}
          </div>
          <p className="text-muted-foreground text-xs">Ongoing issues</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
          <IconTrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data?.averageUptime ? formatUptime(data.averageUptime) : "0%"}
          </div>
          <p className="text-muted-foreground text-xs">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Checked</CardTitle>
          <IconClock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.lastChecked ? formatLastChecked(data.lastChecked) : "Never"}
          </div>
          <p className="text-muted-foreground text-xs">Most recent check</p>
        </CardContent>
      </Card>
    </div>
  );
}
