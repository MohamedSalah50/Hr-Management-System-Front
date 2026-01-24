"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useSalaryReports,
  useGenerateReport,
  useDeleteReport,
  useSearchSalaryReports,
} from "@/lib/hooks/useSalaryReport";
import { useEmployees } from "@/lib/hooks/useEmployee";
import {
  ISalaryReport,
  IGenerateReport,
  ISearchReport,
} from "@/lib/types";
import {
  Pencil,
  Printer,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SalaryReportsPage() {
  const { data: salaryReportsData, isLoading, refetch } = useSalaryReports();
  const { data: employeesData } = useEmployees();
  const { mutate: generateReport } = useGenerateReport();
  const { mutate: deleteReport } = useDeleteReport();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search filters
  const [searchFilters, setSearchFilters] = useState<ISearchReport>({
    employeeId: "",
    month: undefined,
    year: undefined,
  });

  const { data: searchData, refetch: searchRefetch } =
    useSearchSalaryReports(searchFilters);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Months array
  const months = [
    { value: 1, label: "يناير" },
    { value: 2, label: "فبراير" },
    { value: 3, label: "مارس" },
    { value: 4, label: "أبريل" },
    { value: 5, label: "مايو" },
    { value: 6, label: "يونيو" },
    { value: 7, label: "يوليو" },
    { value: 8, label: "أغسطس" },
    { value: 9, label: "سبتمبر" },
    { value: 10, label: "أكتوبر" },
    { value: 11, label: "نوفمبر" },
    { value: 12, label: "ديسمبر" },
  ];

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteReport(deleteId, {
        onSuccess: () => {
          toast.success("تم حذف التقرير بنجاح");
          setDeleteId(null);
          refetch();
        },
        onError: (error: any) => {
          const errorMsg = error?.response?.data?.message || "فشل في حذف التقرير";
          toast.error(errorMsg);
        },
      });
    }
  };

  const handleSearch = () => {
    if (!searchFilters.month && !searchFilters.year && !searchFilters.employeeId) {
      toast.error("من فضلك اختر معيار بحث واحد على الأقل");
      return;
    }

    if (searchFilters.year && searchFilters.year < 2008) {
      toast.error("من فضلك اختر سنة صحيحه");
      return;
    }

    setIsSearchActive(true);
    searchRefetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const displayData = isSearchActive ? searchData : salaryReportsData;
  const reports = displayData?.data?.data || [];
  const employees = employeesData?.data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            رواتب الموظفين
          </h1>
        </div>

        {/* Search Section */}
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          {/* Search Input */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Input
                placeholder="ابحث باسم الموظف"
                value={
                  searchFilters.employeeId
                    ? employees.find((e) => e._id === searchFilters.employeeId)
                        ?.fullName || ""
                    : ""
                }
                readOnly
                className="pr-10 h-12 text-right border-2 border-gray-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Month Select */}
            <Select
              value={searchFilters.month?.toString() || ""}
              onValueChange={(value) =>
                setSearchFilters({
                  ...searchFilters,
                  month: value ? parseInt(value) : undefined,
                })
              }
            >
              <SelectTrigger className="w-[140px] h-12 border-2 border-gray-300">
                <SelectValue placeholder="شهر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Select */}
            <Select
              value={searchFilters.year?.toString() || ""}
              onValueChange={(value) =>
                setSearchFilters({
                  ...searchFilters,
                  year: value ? parseInt(value) : undefined,
                })
              }
            >
              <SelectTrigger className="w-[140px] h-12 border-2 border-gray-300">
                <SelectValue placeholder="سنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Employee Select */}
            <Select
              value={searchFilters.employeeId || ""}
              onValueChange={(value) =>
                setSearchFilters({
                  ...searchFilters,
                  employeeId: value || undefined,
                })
              }
            >
              <SelectTrigger className="w-[180px] h-12 border-2 border-gray-300">
                <SelectValue placeholder="اختر الموظف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              بحث
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  اسم الموظف
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  القسم
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  الراتب الأساسي
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  عدد أيام الحضور
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  عدد أيام الغياب
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  الإضافي بالساعات
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  التأخير بالساعات
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  إجمالي الخصم
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  إجمالي الإضافي
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800 border-l border-gray-300">
                  الصافي
                </TableHead>
                <TableHead className="text-center font-bold text-gray-800">
                  العمليات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-12 w-12 text-gray-300" />
                      <p className="text-lg font-medium">لا توجد تقارير رواتب</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow
                    key={report._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="text-center border-l border-gray-200 font-medium">
                      {typeof report.employeeId === "string"
                        ? report.employeeId
                        : report.employeeId?.fullName}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {typeof report.employeeId === "object" &&
                      typeof report.employeeId.departmentId === "object"
                        ? report.employeeId?.departmentId?.name
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200 font-semibold">
                      {report.baseSalary.toLocaleString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {report.daysPresent}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {report.daysAbsent}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {report.overtimeHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {report.lateHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {report.deductionAmount.toLocaleString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200">
                      {report.overtimeAmount.toLocaleString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-center border-l border-gray-200 font-bold">
                      {report.netSalary.toLocaleString("ar-EG")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.print()}
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toast.info("قريباً...")}
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {reports.length > 0 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-gray-300"
            >
              &lt;
            </Button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">
              صفحة 1
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-gray-300"
            >
              &gt;
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف تقرير الراتب نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}