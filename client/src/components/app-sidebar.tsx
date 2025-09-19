import * as React from "react"
import {
  BarChart3,
  Bot,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Shield,
  Target,
  User,
  AlertTriangle,
  Building,
  Settings,
  LogOut,
  ChevronUp,
  TestTube,
  BookOpen,
  Building2,
} from "lucide-react"
import { useLocation } from "wouter"
import { useQuery } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"

interface FrameworkProgress {
  frameworkId: string;
  frameworkName: string;
  displayName: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  status: 'excellent' | 'good' | 'needs_attention' | 'critical';
}

// Navigation data
const data = {
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: BarChart3,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: CheckSquare,
        },
      ],
    },
    {
      title: "Compliance",
      items: [
        {
          title: "Evidence",
          url: "/evidence",
          icon: FileText,
        },
        {
          title: "Risks",
          url: "/risks",
          icon: AlertTriangle,
        },
        {
          title: "Frameworks",
          url: "/compliance-insights",
          icon: Shield,
        },
        {
          title: "Documents",
          url: "/documents",
          icon: FolderOpen,
        },
      ],
    },
    {
      title: "Tools",
      items: [
        {
          title: "Audit Calendar",
          url: "/audit-calendar",
          icon: Calendar,
        },
        {
          title: "Learning Hub",
          url: "/learning-hub",
          icon: BookOpen,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Company Profile",
          url: "/company-profile",
          icon: Building,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [location, navigate] = useLocation()
  const { user, logout } = useAuth()

  // Fetch framework progress data
  const { data: frameworkProgress = [] } = useQuery({
    queryKey: ["/api/framework-progress"],
    queryFn: async () => {
      const response = await fetch("/api/framework-progress", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Sidebar data-testid="app-sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Venzip</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Compliance Platform
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Framework Progress Section */}
        {frameworkProgress.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Framework Progress</SidebarGroupLabel>
            <div className="px-2 space-y-3">
              {frameworkProgress.map((framework: FrameworkProgress) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
                    case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
                    case 'needs_attention': return 'text-orange-600 bg-orange-50 border-orange-200';
                    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
                    default: return 'text-gray-600 bg-gray-50 border-gray-200';
                  }
                };

                const getProgressColor = (percentage: number) => {
                  if (percentage >= 80) return 'bg-green-500';
                  if (percentage >= 60) return 'bg-blue-500';
                  if (percentage >= 40) return 'bg-orange-500';
                  return 'bg-red-500';
                };

                return (
                  <div key={framework.frameworkId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {framework.displayName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0.5 ${getStatusColor(framework.status)}`}
                      >
                        {Math.round(framework.completionPercentage)}%
                      </Badge>
                    </div>
                    <div className="relative">
                      <Progress
                        value={framework.completionPercentage}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{framework.completedTasks}</span>
                        <span>{framework.totalTasks}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SidebarGroup>
        )}

        {/* Navigation Groups */}
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <a href={item.url} onClick={(e) => {
                        e.preventDefault()
                        navigate(item.url)
                      }}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        {/* Test Notifications Link */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/test-notifications" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/test-notifications' ? 'bg-venzip-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`} data-testid="nav-test-notifications">
              <TestTube className="h-4 w-4" />
              <span>Test Notifications</span>
            </a>
          </SidebarMenuButton>
          <SidebarMenuButton asChild>
            <a href="/test-documents" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/test-documents' ? 'bg-venzip-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`} data-testid="nav-test-documents">
              <FileText className="h-4 w-4" />
              <span>Test Documents</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarContent>
      <SidebarFooter>
        {/* AI Chat Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-chat'))}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group"
            data-testid="ai-chat-button"
          >
            <div className="relative">
              <Bot className="h-4 w-4 group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <span className="font-medium text-sm">Ask Claude</span>
            <div className="ml-auto">
              <div className="w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            </div>
          </button>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.profilePicture || undefined}
                      alt={user?.fullName || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.fullName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.fullName || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.profilePicture || undefined}
                        alt={user?.fullName || "User"}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.fullName || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/company-profile")}>
                  <Settings />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}