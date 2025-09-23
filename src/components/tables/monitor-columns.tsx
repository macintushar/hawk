import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "../shared/status-badge";
import type { Monitor, MonitorCheck, UptimeStatus } from "@/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { IconExternalLink } from "@tabler/icons-react";
import FormatTimestamp from "../format-timestamp";
import { formatResponseTime } from "@/lib/date-utils";
import MonitorDialog from "@/components/dialogs/monitor";

export const monitorColumns: ColumnDef<Monitor>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row, cell }) => {
      const url = row.original.url;
      return (
        <div className="flex space-x-2">
          <p className="text-md font-semibold">{cell.getValue() as string}</p>
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
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ cell }) => {
      return <StatusBadge status={cell.getValue() as UptimeStatus} />;
    },
  },
  {
    header: "Last Checked",
    accessorKey: "lastChecked",
    cell: ({ cell }) => {
      return <FormatTimestamp timestamp={cell.getValue() as Date} />;
    },
  },
  {
    header: "Actions",
    accessorKey: "id",
    cell: ({ row }) => {
      return (
        <MonitorDialog
          mode="update"
          defaultValues={row.original}
          monitorId={row.original.id}
        />
      );
    },
  },
];

export const monitorHistoryColumns: ColumnDef<MonitorCheck>[] = [
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ cell }) => {
      return <StatusBadge status={cell.getValue() as UptimeStatus} />;
    },
  },
  {
    header: "Checked At",
    accessorKey: "checkedAt",
    cell: ({ cell }) => {
      return <FormatTimestamp timestamp={cell.getValue() as Date} />;
    },
  },
  {
    header: "Response Time",
    accessorKey: "responseTime",
    cell: ({ cell }) => {
      return <p>{formatResponseTime(cell.getValue() as number)}</p>;
    },
  },
  {
    header: "Status Code",
    accessorKey: "statusCode",
    cell: ({ cell }) => {
      const statusCode = cell.getValue() as number;
      return (
        <p>
          HTTP
          <Button variant="link">
            <Link
              href={`https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/${statusCode}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code>{statusCode}</code>
            </Link>
          </Button>
        </p>
      );
    },
  },
];
