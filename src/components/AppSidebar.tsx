import { Home, Upload, BarChart3, LayoutDashboard, Brain, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home, desc: "Overview" },
  { title: "Upload Data", url: "/upload", icon: Upload, desc: "Import CSV" },
  { title: "Predictions", url: "/predictions", icon: BarChart3, desc: "ML Results" },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, desc: "Analytics" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-lg pulse-glow">
            <Brain className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Churn Sense
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">AI Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-4 mb-1">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {items.map((item) => {
                const isActive = item.url === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "gradient-primary text-white shadow-md"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`} />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium leading-tight">{item.title}</span>
                            <span className={`text-[10px] leading-tight ${isActive ? "text-white/70" : "text-sidebar-foreground/40"}`}>
                              {item.desc}
                            </span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="p-4 border-t border-sidebar-border/50">
          <div className="rounded-xl bg-sidebar-accent/60 p-3 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-sidebar-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-sidebar-foreground">Pro Tip</p>
              <p className="text-[10px] text-sidebar-foreground/50 mt-0.5 leading-relaxed">
                Upload any customer CSV to get AI predictions in seconds.
              </p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
