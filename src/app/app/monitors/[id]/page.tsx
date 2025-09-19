"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { IncidentStatusBadge } from "@/components/shared/incident-status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconClock,
  IconActivity,
  IconAlertCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monitorId = params.id as string;

  const {
    data: monitor,
    isLoading: isLoadingMonitor,
    error: monitorError,
    refetch: refetchMonitor,
  } = api.monitor.get.useQuery({ id: monitorId });

  const { data: checkHistory = [] } = api.monitor.getCheckHistory.useQuery({
    monitorId,
    limit: 50,
  });

  const { data: incidents = [] } = api.incident.list.useQuery({});

  const checkMonitorMutation = api.monitor.check.useMutation({
    onSuccess: () => {
      toast.success("Monitor check triggered successfully");
      void refetchMonitor();
    },
    onError: (error) => {
      toast.error("Failed to trigger monitor check", {
        description: error.message,
      });
    },
  });

  const deleteMonitorMutation = api.monitor.delete.useMutation({
    onSuccess: () => {
      toast.success("Monitor deleted successfully");
      router.push("/app/monitors");
    },
    onError: (error) => {
      toast.error("Failed to delete monitor", {
        description: error.message,
      });
    },
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this monitor?")) {
      deleteMonitorMutation.mutate({ id: monitorId });
    }
  };

  const handleCheck = async () => {
    checkMonitorMutation.mutate({ monitorId });
  };

  const [isRetrying, setIsRetrying] = React.useState(false);

  if (monitorError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/monitors">
              <IconArrowLeft className="h-4 w-4" />
              Back to Monitors
            </Link>
          </Button>
        </div>
        <div className="py-8 text-center">
          <p className="text-destructive">
            Error loading monitor: {monitorError.message}
          </p>
          <Button
            onClick={async () => {
              setIsRetrying(true);
              try {
                await refetchMonitor();
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

  if (isLoadingMonitor || !monitor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/monitors">
              <IconArrowLeft className="h-4 w-4" />
              Back to Monitors
            </Link>
          </Button>
        </div>
        <div className="py-8 text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">
            Loading monitor details...
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatResponseTime = (time: number | null) => {
    if (!time) return "N/A";
    return `${time}ms`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/monitors">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {monitor.name}
            </h1>
            <p className="text-muted-foreground">{monitor.url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCheck}
            isLoading={checkMonitorMutation.isPending}
            loadingText="Checking..."
          >
            <IconRefresh className="mr-2 h-4 w-4" />
            Check Now
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/app/monitors/${monitorId}/edit`}>
              <IconEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteMonitorMutation.isPending}
            loadingText="Deleting..."
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Monitor Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={monitor.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Checked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {monitor.lastChecked ? formatDate(monitor.lastChecked) : "Never"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {formatResponseTime(checkHistory[0]?.responseTime ?? null)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{monitor.threshold} failures</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Check History</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="h-5 w-5" />
                Check History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkMonitorMutation.isPending ? (
                <TableSkeleton rows={5} />
              ) : (
                <div className="space-y-4">
                  {checkHistory.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <StatusBadge status={check.status} />
                        <div>
                          <div className="font-medium">
                            {check.statusCode
                              ? `HTTP ${check.statusCode}`
                              : "Error"}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {formatDate(check.checkedAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatResponseTime(check.responseTime)}
                        </div>
                        {check.error && (
                          <div className="text-sm text-red-600">
                            {check.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconAlertCircle className="h-5 w-5" />
                Related Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incidents.filter((incident) => incident.monitorId === monitorId)
                .length > 0 ? (
                <div className="space-y-4">
                  {incidents
                    .filter((incident) => incident.monitorId === monitorId)
                    .map((incident) => (
                      <div key={incident.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">{incident.title}</h3>
                          <IncidentStatusBadge status={incident.status} />
                        </div>
                        <p className="text-muted-foreground mb-2 text-sm">
                          {incident.description}
                        </p>
                        <div className="text-muted-foreground text-sm">
                          Started: {formatDate(incident.startedAt)}
                          {incident.resolvedAt && (
                            <span>
                              {" "}
                              • Resolved: {formatDate(incident.resolvedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No incidents for this monitor
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-5 w-5" />
                Monitor Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <div className="text-muted-foreground text-sm">
                    {monitor.name}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <div className="text-muted-foreground text-sm">
                    {monitor.url}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Check Frequency</label>
                  <div className="text-muted-foreground text-sm">
                    {monitor.cronExpression}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Failure Threshold
                  </label>
                  <div className="text-muted-foreground text-sm">
                    {monitor.threshold} consecutive failures
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <div className="text-muted-foreground text-sm">
                    {formatDate(monitor.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
