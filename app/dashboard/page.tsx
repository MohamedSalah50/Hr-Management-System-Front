// app/dashboard/page.tsx
"use client";

import { useEmployees } from "@/lib/hooks/useEmployee";
import { useDepartments } from "@/lib/hooks/useDepartment";
import { useUsers } from "@/lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  UserCog,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// تأكد من أن الـ hooks تُعيد حالات التحميل والخطأ
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={`rounded-lg p-2 ${bgColor} transition-all duration-200 group-hover:scale-105`}
          aria-hidden="true"
        >
          <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20 rounded-md" />
        ) : (
          <div
            className="text-2xl font-bold tracking-tight text-foreground"
            role="status"
            aria-live="polite"
          >
            {value.toLocaleString("ar-EG")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    error: employeesError,
  } = useEmployees();

  const {
    data: departmentsData,
    isLoading: isLoadingDepartments,
    error: departmentsError,
  } = useDepartments();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsers();

  const isLoading =
    isLoadingEmployees || isLoadingDepartments || isLoadingUsers;
  const hasError = Boolean(employeesError || departmentsError || usersError);

  const activeEmployeesCount =
    employeesData?.data?.data?.filter((e) => e.isActive)?.length || 0;

  const stats = [
    {
      title: "إجمالي الموظفين",
      value: employeesData?.data?.total || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "الأقسام",
      value: departmentsData?.data?.total || 0,
      icon: Building2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "مستخدمي النظام",
      value: usersData?.data?.total || 0,
      icon: UserCog,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
    {
      title: "الموظفين النشطين",
      value: activeEmployeesCount,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <main className="space-y-6" dir="rtl">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          لوحة التحكم
        </h1>
        <p className="text-sm text-muted-foreground">
          مرحباً بك في نظام إدارة الموارد البشرية
        </p>
      </header>

      {hasError && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>حدث خطأ في تحميل بعض البيانات. يرجى المحاولة لاحقاً.</span>
        </div>
      )}

      <section
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        aria-label="إحصائيات النظام"
      >
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              لا يوجد نشاط حديث لعرضه
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              استخدم الشريط الجانبي للتنقل بين الأقسام المختلفة
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
