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
import { Badge } from "@/components/ui/badge";
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
} from "@/lib/hooks/useAttendance";
import { useEmployees } from "@/lib/hooks/useEmployee";
import { AttendanceEnum, IAttendance, ICreateAttendance } from "@/lib/types";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AttendancePage() {
  const { data: attendanceData, isLoading } = useAttendanceRecords();
  const { data: employeesData } = useEmployees();
  const { mutate: createAttendance } = useCreateAttendance();
  const { mutate: updateAttendance } = useUpdateAttendance();
  const { mutate: deleteAttendance } = useDeleteAttendance();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] =
    useState<IAttendance | null>(null);
  const [searchEmployeeName, setSearchEmployeeName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    if (editingAttendance) {
      updateAttendance(
        { id: editingAttendance._id, data: formData },
        {
          onSuccess: () => {
            toast.success("Attendance updated successfully");
            setIsDialogOpen(false);
            resetForm();
          },
          onError: () => toast.error("Failed to update attendance"),
        },
      );
    } else {
      createAttendance(formData, {
        onSuccess: () => {
          toast.success("Attendance recorded successfully");
          setIsDialogOpen(false);
          resetForm();
        },
        onError: () => toast.error("Failed to record attendance"),
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
        onSuccess: () => toast.success("Attendance deleted successfully"),
        onError: () => toast.error("Failed to delete attendance"),
      });
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: AttendanceEnum) => {
    switch (status) {
      case AttendanceEnum.PRESENT:
        return "default";
      case AttendanceEnum.ABSENT:
        return "destructive";
      case AttendanceEnum.HOLIDAY:
        return "secondary";
      case AttendanceEnum.SICK_LEAVE:
        return "outline";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const attendances = attendanceData?.data?.data || [];
  const employees = employeesData?.data?.data || [];

  const filteredAttendances = searchEmployeeName
    ? attendances.filter((att) => {
        const employee =
          typeof att.employeeId === "string" ? null : att.employeeId;
        return employee?.fullName
          .toLowerCase()
          .includes(searchEmployeeName.toLowerCase());
      })
    : attendances;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">
            Track employee attendance records
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Record Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAttendance
                  ? "Edit Attendance"
                  : "Record New Attendance"}
              </DialogTitle>
              <DialogDescription>
                Fill in the attendance information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, employeeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp?.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Time</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) =>
                      setFormData({ ...formData, checkIn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Time</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) =>
                      setFormData({ ...formData, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as AttendanceEnum,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AttendanceEnum.PRESENT}>
                      Present
                    </SelectItem>
                    <SelectItem value={AttendanceEnum.ABSENT}>
                      Absent
                    </SelectItem>
                    <SelectItem value={AttendanceEnum.HOLIDAY}>
                      Holiday
                    </SelectItem>
                    <SelectItem value={AttendanceEnum.SICK_LEAVE}>
                      Sick Leave
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Optional notes..."
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
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAttendance ? "Update" : "Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
            value={searchEmployeeName}
            onChange={(e) => setSearchEmployeeName(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Overtime</TableHead>
              <TableHead>Late</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.map((attendance) => (
              <TableRow key={attendance._id}>
                <TableCell className="font-medium">
                  {typeof attendance.employeeId === "string"
                    ? attendance.employeeId
                    : attendance.employeeId?.fullName}
                </TableCell>
                <TableCell>
                  {new Date(attendance.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{attendance.checkIn || "-"}</TableCell>
                <TableCell>{attendance.checkOut || "-"}</TableCell>
                <TableCell>{attendance.overtimeHours}h</TableCell>
                <TableCell>{attendance.lateHours}h</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(attendance.status)}>
                    {attendance.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(attendance)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(attendance._id)}
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
              attendance record.
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
