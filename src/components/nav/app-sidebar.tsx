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
  useSidebar,
} from "@/components/ui/sidebar";

import { routes } from "@/constants";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Logo } from "../theme/logo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/app/dashboard" className="flex items-center gap-2">
                {state === "expanded" ? (
                  <div className="flex w-full items-center justify-center">
                    <Logo
                      textColor="text-sidebar-foreground"
                      className="fill-sidebar-foreground"
                      width={100}
                      height={100}
                    />
                  </div>
                ) : (
                  <Image src="/logo.svg" alt="Hawk" width={32} height={32} />
                )}
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
