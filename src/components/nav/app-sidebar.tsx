"use client";

import * as React from "react";
import { IconInnerShadowTop } from "@tabler/icons-react";

import { NavUser } from "@/components/nav/nav-user";
import { NavGroup } from "@/components/nav/nav-group";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { routes } from "@/constants";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/app/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Hawk</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={routes.main} />
        <NavGroup items={routes.secondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
