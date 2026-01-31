"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useDepartments } from "@/lib/hooks/useDepartment";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useToggleEmployeeStatus,
  useUpdateEmployee,
} from "@/lib/hooks/useEmployee";
import { GenderEnum, ICreateEmployee, IEmployee } from "@/lib/types";
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EmployeesPage() {
  const { data: employeesData, isLoading } = useEmployees();
  const { data: departmentsData } = useDepartments();
  const { mutate: createEmployee } = useCreateEmployee();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const { mutate: deleteEmployee } = useDeleteEmployee();
  const { mutate: toggleStatus } = useToggleEmployeeStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ICreateEmployee>({
    fullName: "",
    nationalId: "",
    phone: "",
    address: "",
    birthDate: "",
    gender: GenderEnum.MALE,
    nationality: "",
    contractDate: "",
    baseSalary: 0,
    checkInTime: "09:00",
    checkOutTime: "17:00",
    departmentId: "",
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      nationalId: "",
      phone: "",
      address: "",
      birthDate: "",
      gender: GenderEnum.MALE,
      nationality: "",
      contractDate: "",
      baseSalary: 0,
      checkInTime: "09:00",
      checkOutTime: "17:00",
      departmentId: "",
    });
    setEditingEmployee(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //validation rules
    if (!formData.fullName.trim()) {
      toast.error("من فضلك ادخل الاسم بالكامل");
      return;
    }

    if (!formData.nationalId.trim()) {
      toast.error("من فضلك ادخل الرقم القومي");
      return;
    }

    if (!/^\d{14}$/.test(formData.nationalId)) {
      toast.error("الرقم القومي يجب أن يكون 14 رقم");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("من فضلك ادخل رقم الهاتف");
      return;
    }

    if (!/^\d{11}$/.test(formData.phone)) {
      toast.error("رقم الهاتف يجب أن يكون 11 رقم");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("من فضلك ادخل العنوان");
      return;
    }

    if (!formData.birthDate) {
      toast.error("من فضلك اختر تاريخ الميلاد");
      return;
    }

    // مثال: تاريخ الميلاد لا يمكن أن يكون بعد 6/6/2005 (لمن هم أقل من 18 سنة)
    const birth = new Date(formData.birthDate);
    const minBirth = new Date("2005-06-06");
    if (birth > minBirth) {
      toast.error("تاريخ الميلاد يجب أن يكون قبل 6/6/2005");
      return;
    }

    if (!formData.nationality.trim()) {
      toast.error("من فضلك ادخل الجنسية");
      return;
    }

    if (!formData.contractDate) {
      toast.error("من فضلك اختر تاريخ التعاقد");
      return;
    }

    if (!formData.baseSalary || formData.baseSalary <= 0) {
      toast.error("من فضلك ادخل الراتب الأساسي بشكل صحيح");
      return;
    }

    if (!formData.checkInTime) {
      toast.error("من فضلك اختر وقت الحضور");
      return;
    }

    if (!formData.checkOutTime) {
      toast.error("من فضلك اختر وقت الانصراف");
      return;
    }

    if (!formData.departmentId) {
      toast.error("من فضلك اختر القسم");
      return;
    }

    if (editingEmployee) {
      updateEmployee(
        { id: editingEmployee._id, data: formData },
        {
          onSuccess: () => {
            toast.success("Employee updated successfully");
            setIsDialogOpen(false);
            resetForm();
          },
          onError: (error: any) =>
            toast.error(
              error?.response?.data?.message || "Failed to update employee",
            ),
        },
      );
    } else {
      createEmployee(formData, {
        onSuccess: () => {
          toast.success("Employee created successfully");
          setIsDialogOpen(false);
          resetForm();
        },
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message || "Failed to create employee",
          ),
      });
    }
  };

  const handleEdit = (employee: IEmployee) => {
    setEditingEmployee(employee);
    setFormData({
      fullName: employee?.fullName,
      nationalId: employee.nationalId,
      phone: employee.phone,
      address: employee.address,
      birthDate: employee.birthDate.split("T")[0],
      gender: employee.gender,
      nationality: employee.nationality,
      contractDate: employee.contractDate.split("T")[0],
      baseSalary: employee.baseSalary,
      checkInTime: employee.checkInTime,
      checkOutTime: employee.checkOutTime,
      departmentId: employee.departmentId,
        // typeof employee.departmentId === "string"
        //   ? employee.departmentId
        //   : employee.departmentId._id,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteEmployee(deleteId, {
        onSuccess: () => toast.success("Employee deleted successfully"),
        onError: () => toast.error("Failed to delete employee"),
      });
      setDeleteId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus(id, {
      onSuccess: () => toast.success("Employee status updated"),
      onError: () => toast.error("Failed to update status"),
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const employees = employeesData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s employees
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription>
                Fill in the employee information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">اسم الموظف</Label>
                  <Input
                    id="fullName"
                    value={formData?.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    // required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractDate">تاريخ التعاقد</Label>
                  <Input
                    id="contractDate"
                    type="date"
                    value={formData.contractDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractDate: e.target.value,
                      })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseSalary">الراتب</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseSalary: parseFloat(e.target.value),
                      })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم التليفون</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkInTime">موعد الحضور</Label>
                  <Input
                    id="checkInTime"
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInTime: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">النوع</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value as GenderEnum })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GenderEnum.MALE}>Male</SelectItem>
                      <SelectItem value={GenderEnum.FEMALE}>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOutTime">موعد الانصراف</Label>
                  <Input
                    id="checkOutTime"
                    type="time"
                    value={formData.checkOutTime}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOutTime: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">الجنسيه</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">الرقم القومي</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) =>
                      setFormData({ ...formData, nationalId: e.target.value })
                    }
                    // required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId">القسم</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, departmentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsData?.data?.data?.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>National ID</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell className="font-medium">
                  {employee?.fullName}
                </TableCell>
                <TableCell>{employee.nationalId}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>
                  {typeof employee.departmentId === "string"
                    ? employee.departmentId
                    : employee.departmentId?.name}
                </TableCell>
                <TableCell>${employee.baseSalary.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(employee._id)}
                      title={employee.isActive ? "Deactivate" : "Activate"}
                    >
                      {employee.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(employee._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              employee and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
