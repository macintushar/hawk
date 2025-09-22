"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UptimeStatus } from "@/types";

interface StatusBadgeProps {
  status: UptimeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    up: "bg-green-100 text-green-800 border-green-200",
    down: "bg-red-100 text-red-800 border-red-200",
    unknown: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const labels = {
    up: "Up",
    down: "Down",
    unknown: "Unknown",
  };

  return (
    <Badge variant="outline" className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  );
}
