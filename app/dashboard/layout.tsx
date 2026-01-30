// app/dashboard/layout.tsx
"use client";

import { useAuth } from "@/lib/context/auth-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  FileText,
  Settings,
  UserCog,
  LogOut,
  Calendar1,
  PercentDiamondIcon,
} from "lucide-react";
import { useLogout } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "permissions", href: "/dashboard/permissions", icon: PercentDiamondIcon },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
  { name: "Attendance", href: "/dashboard/attendance", icon: Calendar },
  { name: "Salary Reports", href: "/dashboard/salary-reports", icon: FileText },
  { name: "Users", href: "/dashboard/users", icon: UserCog },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "UserGroups", href: "/dashboard/user-group", icon: Users },
  { name: "Official Holidays", href: "/dashboard/official-holidays", icon: Calendar1 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authIsLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout } = useLogout();

  // Initialize to false to match server render and prevent hydration mismatch
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // After mounting, sync with the actual auth loading state
    setIsLoading(authIsLoading);
  }, [authIsLoading]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        router.push("/login");
      },
      onError: () => {
        toast.error("Logout failed");
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white">
        <div className="flex h-full flex-col">
          <div className="border-b p-6">
            <h1 className="text-xl font-bold">HR System</h1>
            {isLoading ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Loading user...
              </p>
            ) : user ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {user?.fullName}
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Not logged in
              </p>
            )}
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-primary/10 text-primary",
                    )}
                    disabled={isLoading}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
