import { AppSidebar } from "@/components/nav/app-sidebar";
import { SiteHeader } from "@/components/nav/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
