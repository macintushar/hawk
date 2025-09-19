"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function NewIncidentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    statusPageId: "",
    monitorId: "",
  });

  const { data: statusPages = [] } = api.statusPage.list.useQuery({});

  const { data: monitors = [] } = api.monitor.list.useQuery({});

  const createIncidentMutation = api.incident.create.useMutation({
    onSuccess: () => {
      toast.success("Incident created successfully");
      router.push("/app/incidents");
    },
    onError: (error) => {
      toast.error("Failed to create incident", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      createIncidentMutation.mutate({
        ...formData,
        monitorId: formData.monitorId || undefined,
      });
    } catch (error) {
      console.error("Error creating incident:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Create Incident</h1>
          <p className="text-muted-foreground">Report a new service incident</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Service Outage"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  A clear, descriptive title for the incident
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what's happening..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                />
                <p className="text-muted-foreground text-sm">
                  Provide details about the incident
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusPage">Status Page</Label>
                <Select
                  value={formData.statusPageId}
                  onValueChange={(value) =>
                    handleInputChange("statusPageId", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status page" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusPages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">
                  Which status page should this incident appear on
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitor">Affected Monitor (Optional)</Label>
                <Select
                  value={formData.monitorId}
                  onValueChange={(value) =>
                    handleInputChange("monitorId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a monitor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {monitors.map((monitor) => (
                      <SelectItem key={monitor.id} value={monitor.id}>
                        {monitor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-sm">
                  Link this incident to a specific monitor
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  isLoading={createIncidentMutation.isPending}
                  loadingText="Creating..."
                >
                  <IconPlus className="mr-2 h-4 w-4" />
                  Create Incident
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/app/incidents">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
