"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconEdit, IconPlus } from "@tabler/icons-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { api } from "@/trpc/react";

import type { createStatusPageSchema } from "@/schemas";

type StatusPageDialogProps = {
  mode: "create" | "update";
  defaultValues?: z.input<typeof createStatusPageSchema>;
  statusPageId?: string;
  monitors?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
};

export default function StatusPageDialog({
  mode = "create",
  defaultValues = { name: "", description: "" },
  statusPageId,
  monitors = [],
}: StatusPageDialogProps) {
  const createStatusPageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  });
  const form = useForm<z.infer<typeof createStatusPageSchema>>({
    resolver: zodResolver(createStatusPageSchema),
    defaultValues: {
      name: defaultValues.name,
      description: defaultValues.description,
    },
  });
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>(
    monitors.map((monitor) => monitor.id),
  );

  const { data: availableMonitors = [] } = api.monitor.list.useQuery({});

  const addMonitorMutation = api.statusPage.addMonitor.useMutation();
  const removeMonitorMutation = api.statusPage.removeMonitor.useMutation();

  const updateStatusPageMutation = api.statusPage.update.useMutation({
    onSuccess: async (statusPage) => {
      toast.success("Status page updated successfully");
      if (selectedMonitors.length > 0 && statusPage) {
        const monitorsToAdd = selectedMonitors.filter(
          (monitorId) => !monitors.some((monitor) => monitor.id === monitorId),
        );
        const monitorsToRemove = monitors.filter(
          (monitor) => !selectedMonitors.includes(monitor.id),
        );

        console.log(monitorsToAdd, monitorsToRemove);

        const addMonitorPromises = monitorsToAdd.map((monitorId) =>
          addMonitorMutation.mutateAsync({
            statusPageId: statusPage.id,
            monitorId,
          }),
        );
        const removeMonitorPromises = monitorsToRemove.map((monitorId) =>
          removeMonitorMutation.mutateAsync({
            statusPageId: statusPage.id,
            monitorId: monitorId.id,
          }),
        );
        await Promise.all([...addMonitorPromises, ...removeMonitorPromises]);
      }
    },
    onError: (error) => {
      toast.error("Failed to update status page", {
        description: error.message,
      });
    },
  });

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
    },
    onError: (error) => {
      toast.error("Failed to create status page", {
        description: error.message,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof createStatusPageSchema>) => {
    try {
      if (mode === "create") {
        createStatusPageMutation.mutate(values);
      } else {
        updateStatusPageMutation.mutate({ id: statusPageId!, ...values });
      }
    } catch (error) {
      console.error("Error creating status page:", error);
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
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={mode === "create" ? "default" : "outline"}
          size={mode === "create" ? "default" : "sm"}
        >
          {mode === "create" ? (
            <IconPlus className="h-4 w-4" />
          ) : (
            <IconEdit className="h-4 w-4" />
          )}
          {mode === "create" ? "Create Status Page" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Status Page" : "Edit Status Page"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Set up a new public status page"
              : "Edit the details of your status page"}
          </DialogDescription>
        </DialogHeader>
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
                      <Input id="name" placeholder="Public Status" {...field} />
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

            <div className="space-y-2">
              <Label>Select Monitors</Label>
              <FormDescription>
                Choose which monitors to display on this status page
              </FormDescription>
              <div className="h-fit max-h-60 space-y-3 overflow-y-auto">
                {availableMonitors.map((monitor) => (
                  <div key={monitor.id} className="flex items-center space-x-3">
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
            </div>
          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            isLoading={createStatusPageMutation.isPending}
            loadingText="Creating..."
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {mode === "create" ? "Create Status Page" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
