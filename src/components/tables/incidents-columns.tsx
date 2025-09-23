"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Incident, IncidentStatus } from "@/types";

import FormatTimestamp from "../format-timestamp";
import { IncidentStatusBadge } from "../shared/incident-status-badge";
import { formatDuration } from "@/lib/date-utils";
import { UpdateIncidentDialog } from "../dialogs/incident";

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
    cell: ({ row }) => {
      return <FormatTimestamp timestamp={row.original.startedAt} />;
    },
  },
  {
    header: "Resolved At",
    cell: ({ row }) => {
      return <FormatTimestamp timestamp={row.original.resolvedAt} />;
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
      return <UpdateIncidentDialog data={row.original} />;
    },
  },
];
