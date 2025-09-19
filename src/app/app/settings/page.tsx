"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconUser,
  IconKey,
  IconSettings,
  IconDownload,
  IconCheck,
} from "@tabler/icons-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [systemSettings, setSystemSettings] = useState({
    defaultThreshold: 3,
    defaultCronExpression: "*/10 * * * *",
    timezone: "UTC",
  });

  const handleSaveProfile = async () => {
    // TODO: Implement profile save
    console.log("Saving profile:", profile);
  };

  const handleChangePassword = async () => {
    // TODO: Implement password change
    console.log("Changing password...");
  };

  const handleSaveSystemSettings = async () => {
    // TODO: Implement system settings save
    console.log("Saving system settings:", systemSettings);
  };

  const handleExportData = async () => {
    // TODO: Implement data export
    console.log("Exporting data...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <Button onClick={handleSaveProfile}>
                <IconCheck className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconKey className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={password.current}
                  onChange={(e) =>
                    setPassword((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password.new}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, new: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={password.confirm}
                  onChange={(e) =>
                    setPassword((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                />
              </div>

              <Button onClick={handleChangePassword}>
                <IconKey className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-5 w-5" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-threshold">
                  Default Failure Threshold
                </Label>
                <Input
                  id="default-threshold"
                  type="number"
                  min="1"
                  max="10"
                  value={systemSettings.defaultThreshold}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      defaultThreshold: parseInt(e.target.value),
                    }))
                  }
                />
                <p className="text-muted-foreground text-sm">
                  Default number of consecutive failures before marking as down
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-cron">Default Check Frequency</Label>
                <Input
                  id="default-cron"
                  value={systemSettings.defaultCronExpression}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      defaultCronExpression: e.target.value,
                    }))
                  }
                />
                <p className="text-muted-foreground text-sm">
                  Default cron expression for new monitors
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={systemSettings.timezone}
                  onChange={(e) =>
                    setSystemSettings((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                />
                <p className="text-muted-foreground text-sm">
                  Timezone for displaying dates and times
                </p>
              </div>

              <Button onClick={handleSaveSystemSettings}>
                <IconCheck className="mr-2 h-4 w-4" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDownload className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Data</Label>
                <p className="text-muted-foreground text-sm">
                  Download all your monitors, status pages, and incidents data
                </p>
                <Button onClick={handleExportData} variant="outline">
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Delete Account</Label>
                <p className="text-muted-foreground text-sm">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
