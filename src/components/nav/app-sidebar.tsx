"use client";

import Link from "next/link";
import * as React from "react";

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

import { routes } from "@/constants";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();
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
                <Image src="/logo.svg" alt="Hawk" width={32} height={32} />
                <span className="text-base font-semibold">Hawk</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={routes.main} path={path} />
        <NavGroup items={routes.secondary} className="mt-auto" path={path} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
