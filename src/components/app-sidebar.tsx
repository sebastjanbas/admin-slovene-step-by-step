"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_DATA } from "@/lib/docs";
import { IconUserHexagon } from "@tabler/icons-react";
import { NavSecondary } from "./nav-secondary";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-default pointer-events-none -translate-x-1">
              <IconUserHexagon className="!w-6 !h-6" />
              <span className="font-bold truncate text-nowrap">
                ADMIN | Slovenščina Korak za Korakom
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={SIDEBAR_DATA.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={SIDEBAR_DATA.navSecondary} className="mt-auto" />
      </SidebarFooter>
    </Sidebar>
  );
}
