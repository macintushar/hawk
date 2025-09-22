"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Incident, IncidentStatus } from "@/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { IconEdit } from "@tabler/icons-react";
import FormatTimestamp from "../format-timestamp";
import { IncidentStatusBadge } from "../shared/incident-status-badge";
import { formatDuration } from "@/lib/date-utils";

export const incidentsColumns: ColumnDef<Incident>[] = [
  {
    header: "Title",
    accessorKey: "title",
  },
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ cell }) => {
      return <IncidentStatusBadge status={cell.getValue() as IncidentStatus} />;
    },
  },
  {
    header: "Started At",
    accessorKey: "startedAt",
    cell: ({ cell }) => {
      return <FormatTimestamp timestamp={cell.getValue() as Date} />;
    },
  },
  {
    header: "Resolved At",
    accessorKey: "resolvedAt",
    cell: ({ cell }) => {
      return <FormatTimestamp timestamp={cell.getValue() as Date} />;
    },
  },
  {
    header: "Duration",
    accessorKey: "startedAt",
    cell: ({ row }) => {
      return (
        <p>{formatDuration(row.original.startedAt, row.original.resolvedAt)}</p>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell: ({ row }) => {
      return (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/app/incidents/${row.original.id}`}>
            <IconEdit className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];
