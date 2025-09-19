import {
  IconAlertCircle,
  IconAppWindow,
  IconNotification,
  IconDashboard,
  IconHeartRateMonitor,
  IconHelp,
  IconSettings,
} from "@tabler/icons-react";
import type { NavGroup } from "./types";

export const GITHUB_URL = "https://github.com/macintushar/hawk";
export const PRODUCT_URL = GITHUB_URL;

export const routes: NavGroup = {
  main: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Monitors",
      url: "/app/monitors",
      icon: IconHeartRateMonitor,
    },
    {
      title: "Status Pages",
      url: "/app/status-pages",
      icon: IconAppWindow,
    },
    {
      title: "Notifications",
      url: "/app/notifications",
      icon: IconNotification,
    },
    {
      title: "Incidents",
      url: "/app/incidents",
      icon: IconAlertCircle,
    },
  ],
  secondary: [
    {
      title: "Settings",
      url: "/app/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: GITHUB_URL,
      icon: IconHelp,
    },
  ],
};
