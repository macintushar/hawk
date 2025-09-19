"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentStatusBadge } from "./incident-status-badge";
import { Button } from "@/components/ui/button";
import {
  IconAlertCircle,
  IconClock,
  IconExternalLink,
  IconEdit,
} from "@tabler/icons-react";
import Link from "next/link";
import type { RouterOutputs } from "@/trpc/react";

type Incident = RouterOutputs["incident"]["list"][0];

export function IncidentCard({
  id,
  title,
  description,
  status,
  startedAt,
  resolvedAt,
  statusPageName,
  monitorName,
}: Incident) {
  const formatDuration = (start: Date, end?: Date | null) => {
    const endTime = end ?? new Date();
    const diff = endTime.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconAlertCircle className="h-5 w-5 text-orange-500" />
              {title}
            </CardTitle>
            {description && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {description}
              </p>
            )}
          </div>
          <IncidentStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <IconClock className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Started:</span>
              <span>{formatDate(startedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconExternalLink className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Duration:</span>
              <span>{formatDuration(startedAt, resolvedAt)}</span>
            </div>
          </div>

          {(statusPageName ?? monitorName) && (
            <div className="text-muted-foreground text-sm">
              {statusPageName && <span>Status Page: {statusPageName}</span>}
              {statusPageName && monitorName && <span> • </span>}
              {monitorName && <span>Monitor: {monitorName}</span>}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-muted-foreground text-sm">
              {status === "resolved" && resolvedAt
                ? `Resolved ${formatDate(resolvedAt)}`
                : "Ongoing"}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/app/incidents/${id}`}>
                <IconEdit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IncidentCardSkeleton() {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconAlertCircle className="h-5 w-5 text-orange-500" />
              Loading...
            </CardTitle>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              Loading...
            </p>
          </div>
          <IncidentStatusBadge status="resolved" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <IconClock className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Started:</span>
              <span>Loading...</span>
            </div>
            <div className="flex items-center gap-2">
              <IconExternalLink className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Duration:</span>
              <span>Loading...</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-muted-foreground text-sm">Loading...</div>
            <Button variant="outline" size="sm" asChild>
              <IconEdit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
