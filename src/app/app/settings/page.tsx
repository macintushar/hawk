"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconUser, IconKey, IconCheck } from "@tabler/icons-react";
import { updateUser, changePassword, useSession } from "@/lib/auth-client";
import { HiddenInput } from "@/components/ui/hidden-input";
import { toast } from "sonner";

export default function SettingsPage() {
  const session = useSession();
  const [profile, setProfile] = useState({
    name: session.data?.user.name ?? "",
    email: session.data?.user.email ?? "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleSaveProfile = async () => {
    try {
      await updateUser({ name: profile.name });
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) return;
    try {
      await changePassword({
        currentPassword: password.current,
        newPassword: password.new,
      });
      setPassword({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
    }
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
          <TabsTrigger value="profile">
            <IconUser /> Profile
          </TabsTrigger>
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
                <HiddenInput
                  id="current-password"
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
                <HiddenInput
                  id="new-password"
                  value={password.new}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, new: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <HiddenInput
                  id="confirm-password"
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
      </Tabs>
    </div>
  );
}
