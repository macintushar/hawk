import type { Icon } from "@tabler/icons-react";
import type { RouterOutputs } from "@/trpc/react";

export type NavItem = {
  title: string;
  url: string;
  icon: Icon;
};

export type NavGroup = {
  main: NavItem[];
  secondary: NavItem[];
};

// Monitor types
export type Monitor = RouterOutputs["monitor"]["list"][0];
export type MonitorWithChecks = RouterOutputs["monitor"]["get"];
export type MonitorCheck = RouterOutputs["monitor"]["getCheckHistory"][0];

// Status Page types
export type StatusPage = RouterOutputs["statusPage"]["list"][0];
export type StatusPageWithMonitors = RouterOutputs["statusPage"]["get"];

// Incident types
export type Incident = RouterOutputs["incident"]["list"][0];
export type IncidentWithDetails = RouterOutputs["incident"]["get"];

// Dashboard types
export type DashboardStats = {
  totalMonitors: number;
  activeIncidents: number;
  averageUptime: number;
  lastChecked: Date | null;
};

export type UptimeStatus = "up" | "down" | "unknown";
export type IncidentStatus =
  | "investigating"
  | "identified"
  | "monitoring"
  | "resolved";

// Component prop types
export type MonitorCardProps = {
  id: string;
  name: string;
  url: string;
  status: UptimeStatus;
  lastChecked?: Date | null;
  responseTime?: number | null;
  threshold: number;
};

export type IncidentCardProps = {
  id: string;
  title: string;
  description?: string | null;
  status: IncidentStatus;
  startedAt: Date;
  resolvedAt?: Date | null;
  statusPageName?: string | null;
  monitorName?: string | null;
};

export type RecentActivityProps = {
  monitors?: Monitor[];
  incidents?: Incident[];
  isLoading?: boolean;
};

export type OverviewCardsProps = {
  data?: DashboardStats;
  isLoading?: boolean;
};
