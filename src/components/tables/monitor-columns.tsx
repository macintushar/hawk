import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "../shared/status-badge";
import type { Monitor, UptimeStatus } from "@/types";
import Link from "next/link";
import { Button } from "../ui/button";
import { IconExternalLink, IconSettings } from "@tabler/icons-react";
import FormatTimestamp from "../format-timestamp";

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
        <Button variant="outline" size="sm" asChild>
          <Link href={`/app/monitors/${row.original.id}`}>
            <IconSettings className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];
