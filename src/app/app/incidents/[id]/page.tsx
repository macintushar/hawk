"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const editIncidentFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
  });

  const form = useForm<z.infer<typeof editIncidentFormSchema>>({
    resolver: zodResolver(editIncidentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "investigating",
    },
  });

  React.useEffect(() => {
    if (incident) {
      form.reset({
        title: incident.title,
        description: incident.description ?? "",
        status: incident.status,
      });
    }
  }, [incident, form]);

  const onSubmit = async (values: z.infer<typeof editIncidentFormSchema>) => {
    try {
      await updateIncidentMutation.mutateAsync({
        id: incidentId,
        title: values.title,
        description: values.description,
        status: values.status,
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="investigating">
                              Investigating
                            </SelectItem>
                            <SelectItem value="identified">
                              Identified
                            </SelectItem>
                            <SelectItem value="monitoring">
                              Monitoring
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
