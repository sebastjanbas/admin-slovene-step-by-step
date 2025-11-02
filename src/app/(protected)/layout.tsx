import {AppSidebar} from "@/components/app-sidebar";
import {SiteHeader} from "@/components/site-header";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import React from "react";
import {currentUser} from "@clerk/nextjs/server";
import {notFound} from "next/navigation";

const ProtectedLayout = async ({children}: { children: React.ReactNode }) => {

  const user = await currentUser();
  if (!user) {
    throw notFound();
  }

  const adminUsers = process.env.ADMIN_USERS?.split(",");
  const isAdmin = adminUsers?.includes(user.emailAddresses[0].emailAddress);

  if (!isAdmin) {
    throw notFound();
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar"/>
      <SidebarInset>
        <SiteHeader/>
        <div className={"h-[calc(100vh-var(--header-height))]"}>
          {children}
        </div>
        {/*<div className="flex flex-1 flex-col">*/}
        {/*  <div className="@container/main flex flex-1 flex-col gap-2">*/}
        {/*    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 bg-green-200">*/}
        {/*      {children}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
