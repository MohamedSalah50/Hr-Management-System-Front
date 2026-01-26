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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useGenerateAllReports,
  useDeleteReport,
  useSearchSalaryReports,
  useSalarySummary,
  useReportForPrint,
} from "@/lib/hooks/useSalaryReport";
import { useEmployees } from "@/lib/hooks/useEmployee";
import {
  IGenerateReport,
  ISearchReport,
  MONTHS_AR,
  formatCurrency,
} from "@/lib/types";
import { Plus, Search, Trash2, FileText, Users, Printer, X } from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { salaryReportService } from "@/lib";

const buildSalarySearchPayload = (
  filters: ISearchReport,
): Partial<ISearchReport> => {
  const payload: Partial<ISearchReport> = {};

  if (filters.employeeId && filters.employeeId !== "all") {
    payload.employeeId = filters.employeeId;
  }

  if (filters.month && filters.month !== 0) {
    payload.month = filters.month;
  }

  if (filters.year && filters.year !== 0) {
    payload.year = filters.year;
  }

  return payload;
};

export default function SalaryReportPage() {
  const [isPrinting, setIsPrinting] = useState(false);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: reportsData, isLoading } = useSalaryReports();
  const { data: employeesData } = useEmployees();
  const { mutate: generateReport, isPending: isGenerating } =
    useGenerateReport();
  const { mutate: generateAll, isPending: isGeneratingAll } =
    useGenerateAllReports();
  const { mutate: deleteReport } = useDeleteReport();

  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [formData, setFormData] = useState<IGenerateReport>({
    employeeId: "",
    month: currentMonth,
    year: currentYear,
  });

  const [bulkData, setBulkData] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const [searchFilters, setSearchFilters] = useState<ISearchReport>({
    employeeId: "",
    month: 0,
    year: 0,
  });

  const searchPayload = buildSalarySearchPayload(searchFilters);

  const { data: searchData, refetch: searchRefetch } =
    useSearchSalaryReports(searchPayload);

  const { data: summaryData } = useSalarySummary(
    searchFilters.month || currentMonth,
    searchFilters.year || currentYear,
  );


  const resetForm = () => {
    setFormData({
      employeeId: "",
      month: currentMonth,
      year: currentYear,
    });
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast.error("من فضلك اختر موظف");
      return;
    }

    if (formData.year < 2008) {
      toast.error("من فضلك اختر سنة صحيحه");
      return;
    }

    generateReport(formData, {
      onSuccess: () => {
        toast.success("تم إنشاء تقرير الراتب بنجاح");
        setIsGenerateDialogOpen(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "فشل في إنشاء التقرير");
      },
    });
  };

  const handleGenerateAll = () => {
    if (bulkData.year < 2008) {
      toast.error("من فضلك اختر سنة صحيحه");
      return;
    }

    generateAll(bulkData, {
      onSuccess: (data) => {
        const successCount = data.data?.success?.length || 0;
        const failedCount = data.data?.failed?.length || 0;
        toast.success(
          `تم إنشاء ${successCount} تقرير بنجاح. فشل: ${failedCount}`,
        );
        setIsBulkDialogOpen(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "فشل في إنشاء التقارير");
      },
    });
  };

  const handleSearch = () => {
    if (Object.keys(searchPayload).length === 0) {
      toast.error("من فضلك أدخل معيار بحث واحد على الأقل");
      return;
    }

    if (searchFilters.year && searchFilters.year < 2008) {
      toast.error("من فضلك اختر سنة صحيحه");
      return;
    }

    setIsSearchActive(true);
    searchRefetch();
  };

  const handleClearSearch = () => {
    setSearchFilters({ employeeId: "", month: 0, year: 0 });
    setIsSearchActive(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteReport(deleteId, {
        onSuccess: () => {
          toast.success("تم حذف التقرير بنجاح");
          setDeleteId(null);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "فشل في حذف التقرير");
        },
      });
    }
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

  const displayData = isSearchActive ? searchData : reportsData;
  const reports = displayData?.data?.data || [];
  const employees = employeesData?.data?.data || [];
  // const summary = summaryData?.data;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">تقارير الرواتب</h1>
        <p className="text-center text-green-50 mt-2">
          إدارة وإنشاء تقارير رواتب الموظفين
        </p>
      </div>

      {/* Statistics */}
      {/* {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">إجمالي التقارير</span>
              <Users className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalEmployees}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">إجمالي الرواتب</span>
              <DollarSign className="text-green-600" size={24} />
            </div>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(summary.totalNetSalary)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">إجمالي الإضافات</span>
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(summary.totalOvertimeAmount)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">إجمالي الخصومات</span>
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(summary.totalDeductionAmount)}
            </p>
          </div>
        </div>
      )} */}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow">
        <Dialog
          open={isGenerateDialogOpen}
          onOpenChange={setIsGenerateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="ml-2 h-4 w-4" />
              إنشاء تقرير
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء تقرير راتب</DialogTitle>
              <DialogDescription>اختر الموظف والشهر والسنة</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label>الموظف *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, employeeId: v })
                  }
                  required
                  disabled={isGenerating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الشهر *</Label>
                  <Select
                    value={formData.month.toString()}
                    onValueChange={(v) =>
                      setFormData({ ...formData, month: Number(v) })
                    }
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS_AR.map((m, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>السنة *</Label>
                  <Input
                    type="number"
                    min={2008}
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                    required
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? "جاري الإنشاء..." : "إنشاء"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateDialogOpen(false)}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Users className="ml-2 h-4 w-4" />
              إنشاء جماعي
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء تقارير لجميع الموظفين</DialogTitle>
              <DialogDescription>
                سيتم إنشاء تقارير لجميع الموظفين النشطين
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الشهر *</Label>
                  <Select
                    value={bulkData.month.toString()}
                    onValueChange={(v) =>
                      setBulkData({ ...bulkData, month: Number(v) })
                    }
                    disabled={isGeneratingAll}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS_AR.map((m, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>السنة *</Label>
                  <Input
                    type="number"
                    min={2008}
                    value={bulkData.year}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, year: Number(e.target.value) })
                    }
                    required
                    disabled={isGeneratingAll}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ سيتم إنشاء تقارير لجميع الموظفين النشطين
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateAll}
                  disabled={isGeneratingAll}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isGeneratingAll ? "جاري الإنشاء..." : "إنشاء التقارير"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBulkDialogOpen(false)}
                  disabled={isGeneratingAll}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="bg-blue-50 hover:bg-blue-100 border-blue-300 mr-auto"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
        >
          <Search className="ml-2 h-4 w-4 text-blue-600" />
          {isSearchOpen ? "إخفاء البحث" : "بحث"}
        </Button>
      </div>

      {/* Search */}
      {isSearchOpen && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">بحث في التقارير</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الموظف</Label>
              <Select
                value={searchFilters.employeeId || ""}
                onValueChange={(v) =>
                  setSearchFilters({ ...searchFilters, employeeId: v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e._id} value={e._id}>
                      {e.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الشهر</Label>
              <Select
                value={searchFilters.month?.toString() || "0"}
                onValueChange={(v) =>
                  setSearchFilters({ ...searchFilters, month: Number(v) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الشهر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">الكل</SelectItem>
                  {MONTHS_AR.map((m, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>السنة</Label>
              <Input
                type="number"
                min={2008}
                placeholder="السنة"
                value={searchFilters.year || ""}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    year: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSearch}>
              <Search className="ml-2 h-4 w-4" />
              بحث
            </Button>
            {isSearchActive && (
              <Button onClick={handleClearSearch} variant="outline">
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center font-bold">م</TableHead>
              <TableHead className="text-center font-bold">الموظف</TableHead>
              <TableHead className="text-center font-bold">القسم</TableHead>
              <TableHead className="text-center font-bold">
                عدد أيام الحضور
              </TableHead>
              <TableHead className="text-center font-bold">
                عدد أيام الغياب
              </TableHead>
              <TableHead className="text-center font-bold">
                الإضافي (س)
              </TableHead>
              <TableHead className="text-center font-bold">الخصم (س)</TableHead>

              <TableHead className="text-center font-bold">
                الراتب الأساسي
              </TableHead>
              <TableHead className="text-center font-bold">الخصومات</TableHead>
              <TableHead className="text-center font-bold">الإضافات</TableHead>
              <TableHead className="text-center font-bold">
                صافي الراتب
              </TableHead>
              <TableHead className="text-center font-bold">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">لا توجد تقارير</p>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report, i) => {
                const empData =
                  typeof report.employeeId === "object"
                    ? report.employeeId
                    : null;
                const deptData =
                  empData?.departmentId &&
                  typeof empData.departmentId === "object"
                    ? empData.departmentId
                    : null;

                return (
                  <TableRow key={report._id} className="hover:bg-gray-50">
                    <TableCell className="text-center">{i + 1}</TableCell>
                    <TableCell className="text-center font-medium">
                      {empData?.fullName || report.employeeId}
                    </TableCell>
                    <TableCell className="text-center">
                      {deptData?.name || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {report.daysPresent}
                    </TableCell>

                    <TableCell className="text-center">
                      {report.daysAbsent}
                    </TableCell>

                    <TableCell className="text-center">
                      {report.overtimeHours > 0 ? (
                        <span className="text-green-600 font-semibold">
                          {report.overtimeHours.toFixed(2)}
                        </span>
                      ) : (
                        "0.00"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {report.lateHours > 0 ? (
                        <span className="text-red-600 font-semibold">
                          {report.lateHours.toFixed(2)}
                        </span>
                      ) : (
                        "0.00"
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {formatCurrency(report.baseSalary)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-red-600 font-semibold">
                        {formatCurrency(report.deductionAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(report.overtimeAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {formatCurrency(report.netSalary)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          try {
                            setIsPrinting(true);
                            console.log("🖨️ PRINT ID 👉", report._id);

                            const response =
                              await salaryReportService.getForPrint(report._id);

                            console.log("📄 PRINT DATA 👉", response.data);

                            if (!response.data) {
                              toast.error("فشل في تحميل بيانات التقرير");
                              return;
                            }

                            const printData = response.data;
                            const printWindow = window.open("", "_blank");

                            if (!printWindow) {
                              toast.error("فشل في فتح نافذة الطباعة");
                              return;
                            }

                            printWindow.document.write(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>تقرير راتب - ${printData.employeeName}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Arial', sans-serif; padding: 40px; direction: rtl; }
      .container { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
      .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px; }
      h1 { font-size: 28px; margin-bottom: 10px; color: #1a56db; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 2px solid #333; padding: 12px; text-align: center; }
      th { background: #1a56db; color: white; font-weight: bold; }
      .total-row { background: #dbeafe; font-weight: bold; font-size: 18px; }
      @media print { body { padding: 20px; } .container { border: none; } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>تقرير راتب موظف</h1>
        <p>الشهر: ${printData.month}/${printData.year}</p>
        <p>تاريخ الطباعة: ${printData.generatedDate}</p>
      </div>
      
      <table>
        <tbody>
          <tr><th>اسم الموظف</th><td>${printData.employeeName}</td></tr>
          <tr><th>الرقم القومي</th><td>${printData.nationalId}</td></tr>
          <tr><th>القسم</th><td>${printData.department}</td></tr>
          <tr><th>الراتب الأساسي</th><td>${printData.baseSalary.toLocaleString("ar-EG")} جنيه</td></tr>
          <tr><th>عدد أيام الحضور</th><td>${printData.daysPresent} يوم</td></tr>
          <tr><th>عدد أيام الغياب</th><td>${printData.daysAbsent} يوم</td></tr>
          <tr><th>ساعات العمل الإضافي</th><td>${printData.overtimeHours.toFixed(2)} ساعة</td></tr>
          <tr><th>ساعات التأخير</th><td>${printData.lateHours.toFixed(2)} ساعة</td></tr>
          <tr style="background: #dcfce7;">
            <th>إجمالي الإضافات</th>
            <td style="color: #16a34a; font-weight: bold;">+ ${printData.overtimeAmount.toLocaleString("ar-EG")} جنيه</td>
          </tr>
          <tr style="background: #fee2e2;">
            <th>إجمالي الخصومات</th>
            <td style="color: #dc2626; font-weight: bold;">- ${printData.deductionAmount.toLocaleString("ar-EG")} جنيه</td>
          </tr>
          <tr class="total-row">
            <th>صافي الراتب</th>
            <td style="color: #1a56db;">${printData.netSalary.toLocaleString("ar-EG")} جنيه</td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
      `);

                            printWindow.document.close();
                            setTimeout(() => {
                              printWindow.print();
                              setIsPrinting(false);
                            }, 500);

                            toast.success("تم تحضير التقرير للطباعة");
                          } catch (error) {
                            console.error("❌ PRINT ERROR:", error);
                            toast.error("فشل في طباعة التقرير");
                            setIsPrinting(false);
                          }
                        }}
                        disabled={isPrinting}
                        className="h-8 w-8 hover:bg-blue-50"
                      >
                        <Printer className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(report._id)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف التقرير نهائياً
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
