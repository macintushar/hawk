"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconHeartRateMonitor,
  IconAppWindow,
  IconAlertCircle,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Button
            asChild
            className="flex h-auto flex-col items-center gap-2 p-4"
          >
            <Link href="/app/monitors/new">
              <IconHeartRateMonitor className="h-6 w-6" />
              <span>Create Monitor</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 p-4"
          >
            <Link href="/app/status-pages/new">
              <IconAppWindow className="h-6 w-6" />
              <span>Create Status Page</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 p-4"
          >
            <Link href="/app/incidents/new">
              <IconAlertCircle className="h-6 w-6" />
              <span>Create Incident</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="flex h-auto flex-col items-center gap-2 p-4"
          >
            <Link href="/app/settings">
              <IconSettings className="h-6 w-6" />
              <span>Settings</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
