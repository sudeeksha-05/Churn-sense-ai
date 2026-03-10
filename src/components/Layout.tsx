import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full mesh-bg">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 bg-white/60 backdrop-blur-md px-5 shrink-0 shadow-sm">
            <SidebarTrigger className="mr-4 hover:bg-primary/10 transition-colors rounded-lg" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Churn Sense
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full gradient-primary text-white font-medium">AI</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
