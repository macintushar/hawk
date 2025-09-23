"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IconCheck,
  IconDeviceFloppy,
  IconDotsVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateIncidentSchema } from "@/schemas";
import type { Incident } from "@/types";

export function CreateIncidentDialog() {
  const router = useRouter();
  const createIncidentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    statusPageId: z.string().min(1, "Status page is required"),
    monitorId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof createIncidentSchema>>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      title: "",
      description: "",
      statusPageId: "",
      monitorId: "",
    },
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

  const onSubmit = async (values: z.infer<typeof createIncidentSchema>) => {
    try {
      createIncidentMutation.mutate({
        ...values,
        monitorId: values.monitorId ?? undefined,
      });
    } catch (error) {
      console.error("Error creating incident:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Incident
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Incident</DialogTitle>
          <DialogDescription>Report a new service incident</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        id="title"
                        placeholder="Service Outage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-muted-foreground text-sm">
                A clear, descriptive title for the incident
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
                        placeholder="Describe what's happening..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-muted-foreground text-sm">
                Provide details about the incident
              </p>
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="statusPageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Page</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-muted-foreground text-sm">
                Which status page should this incident appear on
              </p>
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="monitorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Monitor (Optional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-muted-foreground text-sm">
                Link this incident to a specific monitor
              </p>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            isLoading={createIncidentMutation.isPending}
            loadingText="Creating..."
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Create Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UpdateIncidentDialog({ data }: { data: Incident }) {
  const incidentId = data.id;

  const updateIncidentMutation = api.incident.update.useMutation({
    onSuccess: async () => {
      toast.success("Incident updated");
    },
    onError: (e) => {
      toast.error("Failed to update incident", { description: e.message });
    },
  });

  const resolveIncidentMutation = api.incident.resolve.useMutation({
    onSuccess: async () => {
      toast.success("Incident resolved");
    },
    onError: (e) => {
      toast.error("Failed to resolve incident", { description: e.message });
    },
  });

  const deleteIncidentMutation = api.incident.delete.useMutation({
    onSuccess: () => {
      toast.success("Incident deleted");
    },
    onError: (e) => {
      toast.error("Failed to delete incident", { description: e.message });
    },
  });

  const form = useForm<z.infer<typeof updateIncidentSchema>>({
    resolver: zodResolver(updateIncidentSchema),
    defaultValues: {
      id: data.id,
      title: data.title,
      description: data.description ?? "",
      status: data.status,
    },
  });

  const onSubmit = async (values: z.infer<typeof updateIncidentSchema>) => {
    console.log("values", values);
    try {
      await updateIncidentMutation.mutateAsync({
        ...values,
        id: data.id,
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <IconDotsVertical />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Incident</DialogTitle>
          <DialogDescription>
            Update incident details and status
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input id="title" placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea id="description" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigating">
                          Investigating
                        </SelectItem>
                        <SelectItem value="identified">Identified</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-2"></div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteIncidentMutation.isPending}
            loadingText="Deleting..."
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={handleResolve}
            isLoading={resolveIncidentMutation.isPending}
            loadingText="Resolving..."
          >
            <IconCheck className="mr-2 h-4 w-4" />
            Mark Resolved
          </Button>
          <Button
            isLoading={updateIncidentMutation.isPending}
            loadingText="Saving..."
            onClick={form.handleSubmit(onSubmit)}
          >
            <IconDeviceFloppy className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
