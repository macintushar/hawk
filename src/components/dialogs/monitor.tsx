"use client";
import type { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { IconEdit, IconPlus } from "@tabler/icons-react";
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
import { createMonitorSchema } from "@/schemas";

type MonitorDialogProps = {
  mode: "create" | "update";
  defaultValues?: z.input<typeof createMonitorSchema>;
  monitorId?: string;
};

export default function MonitorDialog({
  mode = "create",
  defaultValues = {
    name: "",
    url: "",
    threshold: 3,
    cronExpression: "*/10 * * * *",
  },
  monitorId,
}: MonitorDialogProps) {
  const router = useRouter();

  const form = useForm<z.input<typeof createMonitorSchema>>({
    resolver: zodResolver(createMonitorSchema),
    defaultValues,
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

  const updateMonitorMutation = api.monitor.update.useMutation({
    onSuccess: () => {
      toast.success("Monitor updated successfully");
      router.push("/app/monitors");
    },
    onError: (error) => {
      toast.error("Failed to update monitor", {
        description: error.message,
      });
    },
  });

  const onSubmit = async (values: z.input<typeof createMonitorSchema>) => {
    try {
      if (mode === "create") {
        createMonitorMutation.mutate(values);
      } else {
        updateMonitorMutation.mutate({ id: monitorId!, ...values });
      }
    } catch (error) {
      console.error("Error creating monitor:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={mode === "create" ? "default" : "outline"}>
          {mode === "create" ? (
            <IconPlus className="mr-2 h-4 w-4" />
          ) : (
            <IconEdit className="mr-2 h-4 w-4" />
          )}
          {mode === "create" ? "Create Monitor" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Monitor" : "Edit Monitor"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Set up a new monitor to track your service"
              : "Edit the details of your monitor"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="max-w-2xl">
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
                                {num} consecutive failure
                                {num > 1 ? "s" : ""}
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
              </form>
            </Form>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            type="submit"
            isLoading={createMonitorMutation.isPending}
            loadingText="Creating..."
            onClick={form.handleSubmit(onSubmit)}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            {mode === "create" ? "Create Monitor" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
