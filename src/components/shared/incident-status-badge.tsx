"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentStatus } from "@/types";

type IncidentStatusBadgeProps = {
  status: IncidentStatus;
  className?: string;
};

export function IncidentStatusBadge({
  status,
  className,
}: IncidentStatusBadgeProps) {
  const variants = {
    investigating: "bg-orange-100 text-orange-800 border-orange-200",
    identified: "bg-blue-100 text-blue-800 border-blue-200",
    monitoring: "bg-purple-100 text-purple-800 border-purple-200",
    resolved: "bg-green-100 text-green-800 border-green-200",
  };

  const labels = {
    investigating: "Investigating",
    identified: "Identified",
    monitoring: "Monitoring",
    resolved: "Resolved",
  };

  return (
    <Badge variant="outline" className={cn(variants[status], className)}>
      {labels[status]}
    </Badge>
  );
}
