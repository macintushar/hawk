"use client";

import { useState } from "react";

import Filter from "@/components/filter";
import { DataTable } from "@/components/data-table";
import TitleBar from "@/components/shared/title-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { incidentsColumns } from "@/components/tables/incidents-columns";

import { api } from "@/trpc/react";
import { CreateIncidentDialog } from "@/components/dialogs/incident";

export default function IncidentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "investigating" | "identified" | "monitoring" | "resolved"
  >("all");

  const {
    data: incidents = [],
    isLoading,
    refetch,
  } = api.incident.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || incident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    investigating: incidents.filter((i) => i.status === "investigating").length,
    identified: incidents.filter((i) => i.status === "identified").length,
    monitoring: incidents.filter((i) => i.status === "monitoring").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <TitleBar
        title="Incidents"
        description="Track and manage service incidents"
      >
        <CreateIncidentDialog />
      </TitleBar>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statusCounts.investigating}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Identified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.identified}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statusCounts.monitoring}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.resolved}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Filter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={() => void refetch()}
        badgeType="incident"
        filterButtons={[
          { label: "All", value: "all" },
          { label: "Investigating", value: "investigating" },
          { label: "Identified", value: "identified" },
          { label: "Monitoring", value: "monitoring" },
          { label: "Resolved", value: "resolved" },
        ]}
        filter={statusFilter}
        setFilter={(filter) =>
          setStatusFilter(
            filter as
              | "investigating"
              | "identified"
              | "monitoring"
              | "resolved"
              | "all",
          )
        }
      />

      {/* Incidents Grid */}
      <div className="w-full">
        {isLoading ? (
          <h1>Loading...</h1>
        ) : filteredIncidents.length > 0 ? (
          <DataTable columns={incidentsColumns} data={filteredIncidents} />
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No incidents match your filters"
                : "No incidents yet"}
            </p>
            <CreateIncidentDialog />
          </div>
        )}
      </div>
    </div>
  );
}
