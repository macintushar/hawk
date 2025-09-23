"use client";

import { toast } from "sonner";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";

import Filter from "@/components/filter";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import TitleBar from "@/components/shared/title-bar";
import MonitorDialog from "@/components/dialogs/monitor";
import { monitorColumns } from "@/components/tables/monitor-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { api } from "@/trpc/react";

export default function MonitorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "up" | "down" | "unknown"
  >("all");

  const router = useRouter();

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

  const [isRetrying, setIsRetrying] = React.useState(false);
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
          <Button
            onClick={async () => {
              setIsRetrying(true);
              try {
                await refetch();
              } finally {
                setIsRetrying(false);
              }
            }}
            className="mt-4"
            isLoading={isRetrying}
            loadingText="Retrying..."
          >
            <IconRefresh className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TitleBar title="Monitors" description="Manage and monitor your services">
        <MonitorDialog mode="create" />
      </TitleBar>

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
      <Filter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={() => void refetch()}
        badgeType="monitor"
        filterButtons={[
          { label: "All", value: "all" },
          { label: "Up", value: "up" },
          { label: "Down", value: "down" },
          { label: "Unknown", value: "unknown" },
        ]}
        filter={statusFilter}
        setFilter={(filter) =>
          setStatusFilter(filter as "up" | "down" | "unknown" | "all")
        }
      />

      {/* Monitors Grid */}
      <div className="w-full">
        {isLoading ? (
          <h1>Loading...</h1>
        ) : filteredMonitors.length > 0 ? (
          <DataTable
            columns={monitorColumns}
            data={filteredMonitors}
            onRowClick={(row) => router.push(`/app/monitors/${row.id}`)}
          />
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No monitors match your filters"
                : "No monitors yet"}
            </p>
            {monitors.length === 0 && <MonitorDialog mode="create" />}
          </div>
        )}
      </div>
    </div>
  );
}
