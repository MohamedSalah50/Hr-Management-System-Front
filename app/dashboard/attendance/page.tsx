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
  useAttendanceRecords,
  useCreateAttendance,
  useDeleteAttendance,
  useUpdateAttendance,
  useExportAttendance,
  useSearchAttendance,
} from "@/lib/hooks/useAttendance";
import { useEmployees } from "@/lib/hooks/useEmployee";
import { useDepartments } from "@/lib/hooks/useDepartment";
import {
  AttendanceEnum,
  IAttendance,
  ICreateAttendance,
  ISearchAttendance,
} from "@/lib/types";
import {
  FileDown,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AttendancePage() {
  const { data: attendanceData, isLoading, refetch } = useAttendanceRecords();
  const { data: employeesData } = useEmployees();
  const { data: departmentsData } = useDepartments();
  const { mutate: createAttendance, isPending: isCreating } =
    useCreateAttendance();
  const { mutate: updateAttendance, isPending: isUpdating } =
    useUpdateAttendance();
  const { mutate: deleteAttendance } = useDeleteAttendance();
  const { mutate: exportAttendance } = useExportAttendance();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] =
    useState<IAttendance | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Search filters
  const [searchFilters, setSearchFilters] = useState<ISearchAttendance>({
    employeeName: "",
    departmentId: "",
    dateFrom: "",
    dateTo: "",
  });

  // Trigger search when filters change
  const { data: searchData, refetch: searchRefetch } =
    useSearchAttendance(searchFilters);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ICreateAttendance>({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: AttendanceEnum.PRESENT,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split("T")[0],
      checkIn: "",
      checkOut: "",
      status: AttendanceEnum.PRESENT,
      notes: "",
    });
    setEditingAttendance(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.status === AttendanceEnum.PRESENT && !formData.checkIn) {
      toast.error("وقت الحضور مطلوب للموظف الحاضر");
      return;
    }

    // if (formData.year && formData.year < 2008) {
    //   toast.error("من فضلك اختر سنة صحيحه");
    //   return;
    // }

    if (editingAttendance) {
      updateAttendance(
        { id: editingAttendance._id, data: formData },
        {
          onSuccess: () => {
            toast.success("تم تعديل سجل الحضور بنجاح");
            setIsDialogOpen(false);
            resetForm();
            // Force refetch to get updated late/overtime hours
            setTimeout(() => refetch(), 500);
          },
          onError: (error: any) => {
            const errorMsg =
              error?.response?.data?.message || "فشل في تعديل السجل";
            toast.error(errorMsg);
          },
        },
      );
    } else {
      createAttendance(formData, {
        onSuccess: () => {
          toast.success("تم إضافة سجل الحضور بنجاح");
          setIsDialogOpen(false);
          resetForm();
          // Force refetch to get calculated late/overtime hours
          setTimeout(() => refetch(), 500);
        },
        onError: (error: any) => {
          const errorMsg =
            error?.response?.data?.message || "فشل في إضافة السجل";
          toast.error(errorMsg);
        },
      });
    }
  };

  const handleEdit = (attendance: IAttendance) => {
    setEditingAttendance(attendance);
    setFormData({
      employeeId:
        typeof attendance.employeeId === "string"
          ? attendance.employeeId
          : attendance.employeeId._id,
      date: attendance.date.split("T")[0],
      checkIn: attendance.checkIn || "",
      checkOut: attendance.checkOut || "",
      status: attendance.status,
      notes: attendance.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAttendance(deleteId, {
        onSuccess: () => {
          toast.success("تم حذف سجل الحضور بنجاح");
          setDeleteId(null);
        },
        onError: (error: any) => {
          const errorMsg = error?.response?.data?.message || "فشل في حذف السجل";
          toast.error(errorMsg);
        },
      });
    }
  };

  const handleSearch = () => {
    // Check if at least one filter is provided
    if (
      !searchFilters.employeeName &&
      !searchFilters.departmentId &&
      !searchFilters.dateFrom &&
      !searchFilters.dateTo
    ) {
      toast.error("من فضلك أدخل معيار بحث واحد على الأقل");
      return;
    }

    // Validate date range
    if (searchFilters.dateFrom && searchFilters.dateTo) {
      const dateFrom = new Date(searchFilters.dateFrom);
      const dateTo = new Date(searchFilters.dateTo);

      if (dateFrom > dateTo) {
        toast.error("من فضلك ادخل تاريخ صحيح");
        return;
      }
    }

    setIsSearchActive(true);
    searchRefetch();
  };

  const handleClearSearch = () => {
    setSearchFilters({
      employeeName: "",
      departmentId: "",
      dateFrom: "",
      dateTo: "",
    });
    setIsSearchActive(false);
    refetch();
  };

  const handleExport = () => {
    const filters = isSearchActive ? searchFilters : {};
    exportAttendance(filters, {
      onSuccess: () => {
        toast.success("تم تصدير البيانات بنجاح");
      },
      onError: () => {
        toast.error("فشل في تصدير البيانات");
      },
    });
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

  // Use search results if active, otherwise use all records
  const displayData = isSearchActive ? searchData : attendanceData;
  const attendances = displayData?.data?.data || [];
  const employees = employeesData?.data?.data || [];
  const departments = departmentsData?.data?.data || [];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          تقرير حضور و انصراف الموظفين
        </h1>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingAttendance ? "تعديل سجل الحضور" : "إضافة سجل حضور جديد"}
              </DialogTitle>
              <DialogDescription>املأ البيانات التالية</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">الموظف *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employeeId: value })
                  }
                  required
                  disabled={isCreating || isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">التاريخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  disabled={isCreating || isUpdating}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">وقت الحضور</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) =>
                      setFormData({ ...formData, checkIn: e.target.value })
                    }
                    disabled={isCreating || isUpdating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOut">وقت الانصراف</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOut: e.target.value })
                    }
                    disabled={isCreating || isUpdating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as AttendanceEnum,
                    })
                  }
                  disabled={isCreating || isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AttendanceEnum.PRESENT}>حاضر</SelectItem>
                    <SelectItem value={AttendanceEnum.ABSENT}>غائب</SelectItem>
                    <SelectItem value={AttendanceEnum.HOLIDAY}>
                      إجازة
                    </SelectItem>
                    <SelectItem value={AttendanceEnum.SICK_LEAVE}>
                      إجازة مرضية
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="ملاحظات اختيارية..."
                  disabled={isCreating || isUpdating}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  disabled={isCreating || isUpdating}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating
                    ? "جاري الحفظ..."
                    : editingAttendance
                      ? "تعديل"
                      : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleExport}
          variant="outline"
          className="bg-green-50 hover:bg-green-100 border-green-300"
        >
          <FileSpreadsheet className="ml-2 h-4 w-4 text-green-600" />
          Excel
        </Button>

        <Button
          variant="outline"
          className="bg-red-50 hover:bg-red-100 border-red-300"
          onClick={() => toast.info("قريباً...")}
        >
          <FileDown className="ml-2 h-4 w-4 text-red-600" />
          PDF
        </Button>

        <Button
          variant="outline"
          className="bg-gray-50 hover:bg-gray-100"
          onClick={() => window.print()}
        >
          <Printer className="ml-2 h-4 w-4" />
          طباعة
        </Button>

        <Button
          variant="outline"
          className="bg-purple-50 hover:bg-purple-100 border-purple-300 mr-auto"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="ml-2 h-4 w-4 text-purple-600" />
          {showSearch ? "إخفاء البحث" : "بحث متقدم"}
        </Button>
      </div>

      {/* Search Section */}
      {showSearch && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            بحث متقدم
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم الموظف</Label>
              <Input
                placeholder="ابحث باسم الموظف"
                value={searchFilters.employeeName}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    employeeName: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>القسم</Label>
              <Select
                value={searchFilters.departmentId}
                onValueChange={(value) =>
                  setSearchFilters({ ...searchFilters, departmentId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={searchFilters.dateFrom}
                onChange={(e) =>
                  setSearchFilters({
                    ...searchFilters,
                    dateFrom: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={searchFilters.dateTo}
                onChange={(e) =>
                  setSearchFilters({ ...searchFilters, dateTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="ml-2 h-4 w-4" />
              بحث
            </Button>
            {isSearchActive && (
              <Button onClick={handleClearSearch} variant="outline">
                <X className="ml-2 h-4 w-4" />
                إلغاء البحث
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      {isSearchActive && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-blue-800 text-sm">
            📊 تم العثور على <strong>{attendances.length}</strong> سجل
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center font-bold">م</TableHead>
              <TableHead className="text-center font-bold">القسم</TableHead>
              <TableHead className="text-center font-bold">
                اسم الموظف
              </TableHead>
              <TableHead className="text-center font-bold">
                وقت الحضور
              </TableHead>
              <TableHead className="text-center font-bold">
                وقت الانصراف
              </TableHead>
              <TableHead className="text-center font-bold">تأخير (س)</TableHead>
              <TableHead className="text-center font-bold">إضافي (س)</TableHead>
              <TableHead className="text-center font-bold">التاريخ</TableHead>
              <TableHead className="text-center font-bold">العمليات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-12 w-12 text-gray-300" />
                    <p className="text-lg font-medium">لا توجد سجلات حضور</p>
                    {isSearchActive && (
                      <p className="text-sm">جرب تغيير معايير البحث</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance, index) => (
                <TableRow key={attendance._id} className="hover:bg-gray-50">
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="text-center">
                    {typeof attendance.employeeId === "object" &&
                    typeof attendance.employeeId.departmentId === "object"
                      ? attendance.employeeId?.departmentId?.name
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {typeof attendance.employeeId === "string"
                      ? attendance.employeeId
                      : attendance.employeeId?.fullName}
                  </TableCell>
                  <TableCell className="text-center">
                    {attendance.checkIn || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {attendance.checkOut || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {attendance.lateHours > 0 ? (
                      <span className="text-red-600 font-semibold">
                        {attendance.lateHours.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">0.00</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {attendance.overtimeHours > 0 ? (
                      <span className="text-green-600 font-semibold">
                        {attendance.overtimeHours.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">0.00</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {new Date(attendance.date).toLocaleDateString("ar-EG", {
                      weekday: "long",
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(attendance)}
                        className="hover:bg-blue-50"
                        title="تعديل"
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(attendance._id)}
                        className="hover:bg-red-50"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف سجل الحضور نهائياً.
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
