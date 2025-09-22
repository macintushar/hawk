"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentStatusBadge } from "@/components/shared/incident-status-badge";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconRefresh,
} from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { DataTable } from "@/components/data-table";
import { incidentsColumns } from "@/components/tables/incidents-columns";

export default function IncidentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "investigating" | "identified" | "monitoring" | "resolved"
  >("all");

  const { data: incidents = [], isLoading } = api.incident.list.useQuery({
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            Track and manage service incidents
          </p>
        </div>
        <Button asChild>
          <Link href="/app/incidents/new">
            <IconPlus className="mr-2 h-4 w-4" />
            Create Incident
          </Link>
        </Button>
      </div>

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search incidents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={
                  statusFilter === "investigating" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setStatusFilter("investigating")}
              >
                <IncidentStatusBadge status="investigating" className="mr-2" />
                Investigating
              </Button>
              <Button
                variant={statusFilter === "identified" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("identified")}
              >
                <IncidentStatusBadge status="identified" className="mr-2" />
                Identified
              </Button>
              <Button
                variant={statusFilter === "monitoring" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("monitoring")}
              >
                <IncidentStatusBadge status="monitoring" className="mr-2" />
                Monitoring
              </Button>
              <Button
                variant={statusFilter === "resolved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("resolved")}
              >
                <IncidentStatusBadge status="resolved" className="mr-2" />
                Resolved
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <IconRefresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <Button asChild>
              <Link href="/app/incidents/new">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Your First Incident
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
