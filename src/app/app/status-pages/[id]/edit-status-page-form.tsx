"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type EditStatusPageFormProps = {
  statusPage: {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    monitors?: Array<{
      id: string;
      name: string;
      slug: string;
      url: string;
      status: string;
      lastChecked: Date | null;
      threshold: number;
      cronExpression: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  };
  availableMonitors: Array<{
    id: string;
    name: string;
    slug: string;
    url: string;
    status: string;
    lastChecked: Date | null;
    threshold: number;
    cronExpression: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

export function EditStatusPageForm({
  statusPage,
  availableMonitors,
}: EditStatusPageFormProps) {
  const router = useRouter();
  const editStatusPageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  });
  const form = useForm<z.infer<typeof editStatusPageSchema>>({
    resolver: zodResolver(editStatusPageSchema),
    defaultValues: {
      name: statusPage.name,
      description: statusPage.description ?? "",
    },
  });
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>(
    statusPage.monitors?.map((monitor) => monitor.id) ?? [],
  );

  // Mutations
  const updateStatusPageMutation = api.statusPage.update.useMutation();
  const addMonitorMutation = api.statusPage.addMonitor.useMutation();
  const removeMonitorMutation = api.statusPage.removeMonitor.useMutation();

  const onSubmit = async (values: z.infer<typeof editStatusPageSchema>) => {
    try {
      // Update the status page
      await updateStatusPageMutation.mutateAsync({
        id: statusPage.id,
        name: values.name,
        description: values.description,
      });

      // Handle monitor changes
      const currentMonitorIds = statusPage.monitors?.map((m) => m.id) ?? [];
      const monitorsToAdd = selectedMonitors.filter(
        (id: string) => !currentMonitorIds.includes(id),
      );
      const monitorsToRemove = currentMonitorIds.filter(
        (id: string) => !selectedMonitors.includes(id),
      );

      // Add new monitors
      const addPromises = monitorsToAdd.map((monitorId: string) =>
        addMonitorMutation.mutateAsync({
          statusPageId: statusPage.id,
          monitorId,
        }),
      );

      // Remove monitors
      const removePromises = monitorsToRemove.map((monitorId: string) =>
        removeMonitorMutation.mutateAsync({
          statusPageId: statusPage.id,
          monitorId,
        }),
      );

      await Promise.all([...addPromises, ...removePromises]);

      toast.success("Status page updated successfully");
      router.push("/app/status-pages");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Failed to update status page", {
        description: errorMessage,
      });
    }
  };

  const handleMonitorToggle = (monitorId: string) => {
    setSelectedMonitors((prev) =>
      prev.includes(monitorId)
        ? prev.filter((id) => id !== monitorId)
        : [...prev, monitorId],
    );
  };

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Status Page Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Public Status"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-muted-foreground text-sm">
                  The name of your status page
                </p>
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Our main service status page"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                  isLoading={
                    updateStatusPageMutation.isPending ||
                    addMonitorMutation.isPending ||
                    removeMonitorMutation.isPending
                  }
                  loadingText="Updating..."
                >
                  <IconEdit className="mr-2 h-4 w-4" />
                  Update Status Page
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/app/status-pages">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
