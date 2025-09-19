"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import {
  IconExternalLink,
  IconClock,
  IconActivity,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import type { RouterOutputs } from "@/trpc/react";

type Monitor = RouterOutputs["monitor"]["list"][0];

export function MonitorCard({
  id,
  name,
  url,
  status,
  lastChecked,
  threshold,
}: Monitor) {
  const formatLastChecked = (date: Date | null | undefined) => {
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
    <Card className="min-w-[240px] transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex space-x-2">
            <CardTitle className="text-lg">{name}</CardTitle>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <Button
                variant="link"
                size="icon"
                className="text-muted-foreground"
                asChild
              >
                <IconExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <IconClock className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Last checked:</span>
              <span>{formatLastChecked(lastChecked)}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconActivity className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{status}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-muted-foreground text-sm">
              Threshold: {threshold} failures
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/app/monitors/${id}`}>
                  <IconSettings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonitorCardSkeleton() {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Loading...</CardTitle>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <IconExternalLink className="h-4 w-4" />
              <span className="max-w-[200px] truncate">Loading...</span>
            </div>
          </div>
          <StatusBadge status="unknown" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <IconClock className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Last checked:</span>
              <span>Loading...</span>
            </div>
            <div className="flex items-center gap-2">
              <IconActivity className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">Loading...</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-muted-foreground text-sm">
              Threshold: Loading... failures
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <IconSettings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
