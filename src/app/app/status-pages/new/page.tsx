"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function NewStatusPagePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);

  const { data: availableMonitors = [] } = api.monitor.list.useQuery({});

  const addMonitorMutation = api.statusPage.addMonitor.useMutation();

  const createStatusPageMutation = api.statusPage.create.useMutation({
    onSuccess: async (statusPage) => {
      // Add selected monitors to the status page
      if (selectedMonitors.length > 0 && statusPage) {
        const addMonitorPromises = selectedMonitors.map((monitorId) =>
          addMonitorMutation.mutateAsync({
            statusPageId: statusPage.id,
            monitorId,
          }),
        );
        await Promise.all(addMonitorPromises);
      }

      toast.success("Status page created successfully");
      router.push("/app/status-pages");
    },
    onError: (error) => {
      toast.error("Failed to create status page", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      createStatusPageMutation.mutate(formData);
    } catch (error) {
      console.error("Error creating status page:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMonitorToggle = (monitorId: string) => {
    setSelectedMonitors((prev) =>
      prev.includes(monitorId)
        ? prev.filter((id) => id !== monitorId)
        : [...prev, monitorId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/status-pages">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Status Page
          </h1>
          <p className="text-muted-foreground">
            Set up a new public status page
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Status Page Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Public Status"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  The name of your status page
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Our main service status page"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
                <p className="text-muted-foreground text-sm">
                  A brief description of your status page
                </p>
              </div>

              <div className="space-y-4">
                <Label>Select Monitors</Label>
                <div className="space-y-3">
                  {availableMonitors.map((monitor) => (
                    <div
                      key={monitor.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={monitor.id}
                        checked={selectedMonitors.includes(monitor.id)}
                        onCheckedChange={() => handleMonitorToggle(monitor.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={monitor.id}
                          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {monitor.name}
                        </label>
                        <p className="text-muted-foreground text-sm">
                          {monitor.url}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  Choose which monitors to display on this status page
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createStatusPageMutation.isPending}
                >
                  {createStatusPageMutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <IconPlus className="mr-2 h-4 w-4" />
                      Create Status Page
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/app/status-pages">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
