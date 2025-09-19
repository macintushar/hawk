"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function NewMonitorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    threshold: 3,
    cronExpression: "*/10 * * * *",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      createMonitorMutation.mutate(formData);
    } catch (error) {
      console.error("Error creating monitor:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="My Website"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  A friendly name for your monitor
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-sm">
                  The URL to monitor (must include http:// or https://)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Failure Threshold</Label>
                <Select
                  value={formData.threshold.toString()}
                  onValueChange={(value) =>
                    handleInputChange("threshold", parseInt(value))
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
                <p className="text-muted-foreground text-sm">
                  Number of consecutive failures before marking as down
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cron">Check Frequency</Label>
                <Select
                  value={formData.cronExpression}
                  onValueChange={(value) =>
                    handleInputChange("cronExpression", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cronOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
