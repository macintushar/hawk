"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  IconBell,
  IconMail,
  IconBrandSlack,
  IconTestPipe,
  IconCheck,
  IconExternalLink,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { api } from "@/trpc/react";

export default function NotificationsPage() {
  const { data: initialSettings, refetch } = api.notifications.get.useQuery(
    undefined,
    { refetchOnWindowFocus: false },
  );
  const saveMutation = api.notifications.save.useMutation();
  const testSlackMutation = api.notifications.testSlack.useMutation();

  const [slackSettings, setSlackSettings] = useState({
    enabled: false,
    webhookUrl: "",
    channel: "#alerts",
  });

  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    toEmails: "",
  });

  const [notificationRules, setNotificationRules] = useState({
    onMonitorDown: true,
    onMonitorUp: false,
    onIncidentCreated: true,
    onIncidentResolved: true,
  });

  useEffect(() => {
    if (!initialSettings) return;
    setSlackSettings({
      enabled: initialSettings.slackEnabled ?? false,
      webhookUrl: initialSettings.slackWebhookUrl ?? "",
      channel: initialSettings.slackChannel ?? "#alerts",
    });
    setNotificationRules({
      onMonitorDown: initialSettings.onMonitorDown ?? true,
      onMonitorUp: initialSettings.onMonitorUp ?? false,
      onIncidentCreated: initialSettings.onIncidentCreated ?? true,
      onIncidentResolved: initialSettings.onIncidentResolved ?? true,
    });
  }, [initialSettings]);

  const handleSlackTest = async () => {
    try {
      await testSlackMutation.mutateAsync({
        message: "Test notification from Hawk",
      });
      toast.success("Slack test notification sent");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to send Slack test";
      toast.error(msg);
    }
  };

  const handleEmailTest = async () => {
    // TODO: Implement email test notification
    console.log("Testing email notification...");
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({
        slackEnabled: slackSettings.enabled,
        slackWebhookUrl: slackSettings.webhookUrl || null,
        slackChannel: slackSettings.channel || null,
        onMonitorDown: notificationRules.onMonitorDown,
        onMonitorUp: notificationRules.onMonitorUp,
        onIncidentCreated: notificationRules.onIncidentCreated,
        onIncidentResolved: notificationRules.onIncidentResolved,
      });
      await refetch();
      toast.success("Notification settings saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save settings";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Configure how you receive alerts and updates
        </p>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">
            <IconBell /> Notification Rules
          </TabsTrigger>
          <TabsTrigger value="slack">
            <IconBrandSlack /> Slack
          </TabsTrigger>
          <TabsTrigger value="email">
            <IconMail /> Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBell className="h-5 w-5" />
                Notification Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Monitor Goes Down</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notification when a monitor fails
                  </p>
                </div>
                <Switch
                  checked={notificationRules.onMonitorDown}
                  onCheckedChange={(checked) =>
                    setNotificationRules((prev) => ({
                      ...prev,
                      onMonitorDown: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Monitor Comes Back Up</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notification when a monitor recovers
                  </p>
                </div>
                <Switch
                  checked={notificationRules.onMonitorUp}
                  onCheckedChange={(checked) =>
                    setNotificationRules((prev) => ({
                      ...prev,
                      onMonitorUp: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Incident Created</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notification when an incident is created
                  </p>
                </div>
                <Switch
                  checked={notificationRules.onIncidentCreated}
                  onCheckedChange={(checked) =>
                    setNotificationRules((prev) => ({
                      ...prev,
                      onIncidentCreated: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Incident Resolved</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notification when an incident is resolved
                  </p>
                </div>
                <Switch
                  checked={notificationRules.onIncidentResolved}
                  onCheckedChange={(checked) =>
                    setNotificationRules((prev) => ({
                      ...prev,
                      onIncidentResolved: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBrandSlack className="h-5 w-5" />
                Slack Integration
              </CardTitle>
              <CardDescription className="flex gap-1">
                Send notifications to Slack channels.{" "}
                <Link
                  href="https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-1 underline">
                    Guide
                    <IconExternalLink className="h-4 w-4" />
                  </span>
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Slack Notifications</Label>
                <Switch
                  checked={slackSettings.enabled}
                  onCheckedChange={(checked) =>
                    setSlackSettings((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>

              {slackSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook">Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackSettings.webhookUrl}
                      onChange={(e) =>
                        setSlackSettings((prev) => ({
                          ...prev,
                          webhookUrl: e.target.value,
                        }))
                      }
                    />
                    <p className="text-muted-foreground text-sm">
                      Create a webhook in your Slack workspace
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slack-channel">Channel</Label>
                    <Input
                      id="slack-channel"
                      placeholder="#alerts"
                      value={slackSettings.channel}
                      onChange={(e) =>
                        setSlackSettings((prev) => ({
                          ...prev,
                          channel: e.target.value,
                        }))
                      }
                    />
                    <p className="text-muted-foreground text-sm">
                      Channel to send notifications to
                    </p>
                  </div>

                  <Button
                    onClick={handleSlackTest}
                    variant="outline"
                    isLoading={testSlackMutation.isPending}
                    loadingText="Testing..."
                  >
                    <IconTestPipe className="mr-2 h-4 w-4" />
                    Test Slack Notification
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMail className="h-5 w-5" />
                Email Settings
                <Badge variant="secondary">Coming Soon!</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-muted-foreground text-sm">
                    Send notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailSettings.enabled}
                  onCheckedChange={(checked) =>
                    setEmailSettings((prev) => ({ ...prev, enabled: checked }))
                  }
                  disabled
                />
              </div>

              {emailSettings.enabled && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">SMTP Host</Label>
                      <Input
                        id="smtp-host"
                        placeholder="smtp.gmail.com"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({
                            ...prev,
                            smtpHost: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">SMTP Port</Label>
                      <Input
                        id="smtp-port"
                        type="number"
                        placeholder="587"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({
                            ...prev,
                            smtpPort: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">SMTP Username</Label>
                      <Input
                        id="smtp-user"
                        placeholder="your-email@gmail.com"
                        value={emailSettings.smtpUser}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({
                            ...prev,
                            smtpUser: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">SMTP Password</Label>
                      <Input
                        id="smtp-password"
                        type="password"
                        placeholder="••••••••"
                        value={emailSettings.smtpPassword}
                        onChange={(e) =>
                          setEmailSettings((prev) => ({
                            ...prev,
                            smtpPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from-email">From Email</Label>
                    <Input
                      id="from-email"
                      type="email"
                      placeholder="alerts@yourcompany.com"
                      value={emailSettings.fromEmail}
                      onChange={(e) =>
                        setEmailSettings((prev) => ({
                          ...prev,
                          fromEmail: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to-emails">Recipient Emails</Label>
                    <Input
                      id="to-emails"
                      placeholder="admin@yourcompany.com, team@yourcompany.com"
                      value={emailSettings.toEmails}
                      onChange={(e) =>
                        setEmailSettings((prev) => ({
                          ...prev,
                          toEmails: e.target.value,
                        }))
                      }
                    />
                    <p className="text-muted-foreground text-sm">
                      Comma-separated list of email addresses
                    </p>
                  </div>

                  <Button onClick={handleEmailTest} variant="outline">
                    <IconTestPipe className="mr-2 h-4 w-4" />
                    Test Email Notification
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saveMutation.isPending}
          loadingText="Saving..."
        >
          <IconCheck className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
