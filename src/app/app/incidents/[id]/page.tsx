"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowLeft,
  IconTrash,
  IconDeviceFloppy,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function EditIncidentPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  const {
    data: incident,
    isLoading,
    error,
    refetch,
  } = api.incident.get.useQuery({ id: incidentId });

  const updateIncidentMutation = api.incident.update.useMutation({
    onSuccess: async () => {
      toast.success("Incident updated");
      await refetch();
    },
    onError: (e) => {
      toast.error("Failed to update incident", { description: e.message });
    },
  });

  const resolveIncidentMutation = api.incident.resolve.useMutation({
    onSuccess: async () => {
      toast.success("Incident resolved");
      await refetch();
    },
    onError: (e) => {
      toast.error("Failed to resolve incident", { description: e.message });
    },
  });

  const deleteIncidentMutation = api.incident.delete.useMutation({
    onSuccess: () => {
      toast.success("Incident deleted");
      router.push("/app/incidents");
    },
    onError: (e) => {
      toast.error("Failed to delete incident", { description: e.message });
    },
  });

  const [form, setForm] = React.useState({
    title: "",
    description: "",
    status: "investigating" as
      | "investigating"
      | "identified"
      | "monitoring"
      | "resolved",
  });

  React.useEffect(() => {
    if (incident) {
      setForm({
        title: incident.title,
        description: incident.description ?? "",
        status: incident.status,
      });
    }
  }, [incident]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateIncidentMutation.mutateAsync({
        id: incidentId,
        title: form.title,
        description: form.description,
        status: form.status,
      });
    } catch {
      // no-op, handled in onError
    }
  };

  const handleResolve = async () => {
    try {
      await resolveIncidentMutation.mutateAsync({ id: incidentId });
    } catch {
      // handled
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this incident?")) return;
    try {
      await deleteIncidentMutation.mutateAsync({ id: incidentId });
    } catch {
      // handled
    }
  };

  const [isRetrying, setIsRetrying] = React.useState(false);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/incidents">
              <IconArrowLeft className="h-4 w-4" />
              Back to Incidents
            </Link>
          </Button>
        </div>
        <div className="py-8 text-center">
          <p className="text-destructive">
            Error loading incident: {error.message}
          </p>
          <Button
            className="mt-4"
            onClick={async () => {
              setIsRetrying(true);
              try {
                await refetch();
              } finally {
                setIsRetrying(false);
              }
            }}
            isLoading={isRetrying}
            loadingText="Retrying..."
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !incident) {
    return (
      <div className="py-8 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
        <p className="text-muted-foreground mt-2">Loading incident...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/incidents">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Incident</h1>
          <p className="text-muted-foreground">Update details and status</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((p) => ({ ...p, status: value as typeof p.status }))
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  isLoading={updateIncidentMutation.isPending}
                  loadingText="Saving..."
                >
                  <IconDeviceFloppy className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResolve}
                  isLoading={resolveIncidentMutation.isPending}
                  loadingText="Resolving..."
                >
                  <IconCheck className="mr-2 h-4 w-4" />
                  Mark Resolved
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  isLoading={deleteIncidentMutation.isPending}
                  loadingText="Deleting..."
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
