"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function NewMonitorPage() {
  const router = useRouter();
  const createMonitorSchema = z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Invalid URL"),
    threshold: z.number().int().min(1).max(10),
    cronExpression: z.string(),
  });

  const form = useForm<z.infer<typeof createMonitorSchema>>({
    resolver: zodResolver(createMonitorSchema),
    defaultValues: {
      name: "",
      url: "",
      threshold: 3,
      cronExpression: "*/10 * * * *",
    },
  });

  const cronOptions = [
    { value: "*/1 * * * *", label: "Every minute" },
    { value: "*/5 * * * *", label: "Every 5 minutes" },
    { value: "*/10 * * * *", label: "Every 10 minutes" },
    { value: "*/15 * * * *", label: "Every 15 minutes" },
    { value: "*/30 * * * *", label: "Every 30 minutes" },
    { value: "0 * * * *", label: "Every hour" },
  ];

  const createMonitorMutation = api.monitor.create.useMutation({
    onSuccess: () => {
      toast.success("Monitor created successfully");
      router.push("/app/monitors");
    },
    onError: (error) => {
      toast.error("Failed to create monitor", {
        description: error.message,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof createMonitorSchema>) => {
    try {
      createMonitorMutation.mutate(values);
    } catch (error) {
      console.error("Error creating monitor:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/monitors">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Monitor</h1>
          <p className="text-muted-foreground">
            Set up a new monitor to track your service
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Monitor Details</CardTitle>
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="My Website"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    A friendly name for your monitor
                  </p>
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    The URL to monitor (must include http:// or https://)
                  </p>
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Failure Threshold</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} consecutive failure{num > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    Number of consecutive failures before marking as down
                  </p>
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="cronExpression"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Frequency</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cronOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-muted-foreground text-sm">
                    How often to check the monitor
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    isLoading={createMonitorMutation.isPending}
                    loadingText="Creating..."
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Monitor
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/app/monitors">Cancel</Link>
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
