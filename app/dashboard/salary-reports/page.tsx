"use client";

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
import { useEmployees } from "@/lib/hooks/useEmployee";
import {
  useDeleteSalaryReport,
  useGenerateSalaryReport,
  useSalaryReports,
} from "@/lib/hooks/useSalaryReport";
import { IGenerateReport } from "@/lib/types";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SalaryReportsPage() {
  const { data: reportsData, isLoading } = useSalaryReports();
  const { data: employeesData } = useEmployees();
  const { mutate: generateReport } = useGenerateSalaryReport();
  const { mutate: deleteReport } = useDeleteSalaryReport();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchMonth, setSearchMonth] = useState("all");
  const [searchYear, setSearchYear] = useState("");
  const [formData, setFormData] = useState<IGenerateReport>({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const resetForm = () => {
    setFormData({
      employeeId: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    generateReport(formData, {
      onSuccess: () => {
        toast.success("Report generated successfully");
        setIsDialogOpen(false);
        resetForm();
      },
      onError: () => toast.error("Failed to generate report"),
    });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteReport(deleteId, {
        onSuccess: () => toast.success("Report deleted successfully"),
        onError: () => toast.error("Failed to delete report"),
      });
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const reports = reportsData?.data?.data || [];
  const employees = employeesData?.data?.data || [];

  const filteredReports = reports.filter((report) => {
    if (searchMonth !== "all" && report.month !== parseInt(searchMonth))
      return false;
    if (searchYear && report.year !== parseInt(searchYear)) return false;
    return true;
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salary Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage employee salary reports
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Salary Report</DialogTitle>
              <DialogDescription>
                Select employee and period to generate salary report
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={formData.month.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, month: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    required
                  />
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
                <Button type="submit">Generate</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Select value={searchMonth} onValueChange={setSearchMonth}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Filter by month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {months.map((month, index) => (
              <SelectItem key={month} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Filter by year"
          value={searchYear}
          onChange={(e) => setSearchYear(e.target.value)}
          className="w-50"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Base Salary</TableHead>
              <TableHead>Days Present</TableHead>
              <TableHead>Overtime</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report._id}>
                <TableCell className="font-medium">
                  {typeof report.employeeId === "string"
                    ? report.employeeId
                    : report.employeeId?.fullName}
                </TableCell>
                <TableCell>
                  {months[report.month - 1]} {report.year}
                </TableCell>
                <TableCell>${report.baseSalary.toLocaleString()}</TableCell>
                <TableCell>{report.daysPresent}</TableCell>
                <TableCell>
                  {report.overtimeHours}h (${report.overtimeAmount})
                </TableCell>
                <TableCell className="text-red-600">
                  ${report.deductionAmount}
                </TableCell>
                <TableCell className="font-bold text-green-600">
                  ${report.netSalary.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(report._id)}
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

      {filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border py-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No reports found</h3>
          <p className="text-sm text-muted-foreground">
            Generate your first salary report to get started
          </p>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              salary report.
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
