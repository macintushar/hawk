"use client";

import { Bar, BarChart, XAxis, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from "@/trpc/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const description = "Monitor daily activity heatmap";

const chartConfig = {
  day: {
    label: "Day",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type MonitorRunsProps = {
  id: string;
};

const DAYS = 45;

export function MonitorRuns({ id }: MonitorRunsProps) {
  const { data: checkHistory = [] } = api.monitor.getCheckHistory.useQuery({
    monitorId: id,
    days: DAYS,
  });

  // Build a map of YYYY-MM-DD -> { total, failed }
  const countsByDay = new Map<string, { total: number; failed: number }>();
  for (const check of checkHistory) {
    const key = dayjs(check.checkedAt).utc().format("YYYY-MM-DD");
    const current = countsByDay.get(key) ?? { total: 0, failed: 0 };
    current.total += 1;
    if (check.status === "down") current.failed += 1;
    countsByDay.set(key, current);
  }

  // Generate last N days, oldest -> newest, with value=1 for uniform-height bars
  const series = Array.from({ length: DAYS }).map((_, i) => {
    const date = dayjs()
      .utc()
      .startOf("day")
      .subtract(DAYS - 1 - i, "day");
    const key = date.format("YYYY-MM-DD");
    const counts = countsByDay.get(key) ?? { total: 0, failed: 0 };
    const isFailed = counts.failed > 0;
    const hasRequests = counts.total > 0;
    const fill = isFailed ? "#ef4444" : hasRequests ? "#22c55e" : "#334155"; // red / green / gray
    return {
      date: date.toDate(),
      dayKey: key,
      value: 1,
      total: counts.total,
      failed: counts.failed,
      fill,
      statusLabel: isFailed ? "Degraded" : "Operational",
    };
  });

  return (
    <div className="h-16 w-full">
      <ChartContainer className="h-full w-full" config={chartConfig}>
        <BarChart
          accessibilityLayer
          data={series}
          margin={{ left: 12, right: 12, top: 0, bottom: 0 }}
          barCategoryGap={4}
          barSize={14}
        >
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => dayjs(value as Date).format("MMM D")}
            interval={43}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(_value, _name, _item, _index, payload) => {
                  const d = payload as unknown as (typeof series)[number];
                  return (
                    <div className="flex min-w-[10rem] flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{d.statusLabel}</span>
                        <span className="text-muted-foreground">
                          {dayjs(d.date).format("MMM D")}
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center justify-between">
                        <span>{d.total} requests</span>
                        <span
                          className={d.failed > 0 ? "text-red-500" : undefined}
                        >
                          {d.failed} failed
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
            }
          />
          <Bar dataKey="value" radius={6} barSize={14}>
            {series.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

export function MonitorUptime({ id }: { id: string }) {
  const { data: checkHistory = [] } = api.monitor.getCheckHistory.useQuery({
    monitorId: id,
    days: DAYS,
  });

  const total = checkHistory.length;
  const failed = checkHistory.filter((c) => c.status === "down").length;
  const success = total - failed;
  const uptime = total === 0 ? 100 : (success / total) * 100;

  return (
    <span className="text-muted-foreground text-xs">{uptime.toFixed(2)}%</span>
  );
}
