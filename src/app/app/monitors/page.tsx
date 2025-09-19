"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MonitorCard,
  MonitorCardSkeleton,
} from "@/components/shared/monitor-card";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconRefresh,
} from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function MonitorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "up" | "down" | "unknown"
  >("all");

  const {
    data: monitors = [],
    isLoading,
    error,
    refetch,
  } = api.monitor.list.useQuery({});

  api.monitor.check.useMutation({
    onSuccess: () => {
      toast.success("Monitor check triggered successfully");
      void refetch();
    },
    onError: (error) => {
      toast.error("Failed to trigger monitor check", {
        description: error.message,
      });
    },
  });

  const filteredMonitors = monitors.filter((monitor) => {
    const matchesSearch =
      monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      monitor.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || monitor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    up: monitors.filter((m) => m.status === "up").length,
    down: monitors.filter((m) => m.status === "down").length,
    unknown: monitors.filter((m) => m.status === "unknown").length,
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitors</h1>
          <p className="text-muted-foreground">
            Monitor your services and track their status
          </p>
        </div>
        <div className="py-8 text-center">
          <p className="text-destructive">
            Error loading monitors: {error.message}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            <IconRefresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitors</h1>
          <p className="text-muted-foreground">
            Manage and monitor your services
          </p>
        </div>
        <Button asChild>
          <Link href="/app/monitors/new">
            <IconPlus className="mr-2 h-4 w-4" />
            Create Monitor
          </Link>
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monitors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.up}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Down</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.down}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unknown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.unknown}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search monitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "up" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("up")}
              >
                <StatusBadge status="up" className="mr-2" />
                Up
              </Button>
              <Button
                variant={statusFilter === "down" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("down")}
              >
                <StatusBadge status="down" className="mr-2" />
                Down
              </Button>
              <Button
                variant={statusFilter === "unknown" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("unknown")}
              >
                <StatusBadge status="unknown" className="mr-2" />
                Unknown
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monitors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <MonitorCardSkeleton key={i} />
          ))
        ) : filteredMonitors.length > 0 ? (
          filteredMonitors.map((monitor) => (
            <MonitorCard key={monitor.id} {...monitor} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No monitors match your filters"
                : "No monitors yet"}
            </p>
            <Button asChild>
              <Link href="/app/monitors/new">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Your First Monitor
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
