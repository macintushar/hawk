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
import { IconArrowLeft, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function NewIncidentPage() {
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
        monitorId: values.monitorId || undefined,
      });
    } catch (error) {
      console.error("Error creating incident:", error);
    }
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
