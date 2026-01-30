// app/dashboard/permissions/page.tsx
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    usePermissions,
    useCreatePermmission,
    useUpdatePermission,
    useDeletePermission,
} from "@/lib/hooks/usePermission";
import { ICreatePermission, IPermission } from "@/lib/types";
import { Shield, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PermissionsPage() {
    const { data: permissionsData, isLoading } = usePermissions();
    const { mutate: createPermission, isPending: isCreating } =
        useCreatePermmission();
    const { mutate: updatePermission, isPending: isUpdating } =
        useUpdatePermission();
    const { mutate: deletePermission, isPending: isDeleting } =
        useDeletePermission();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] =
        useState<IPermission | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ICreatePermission>({
        name: "",
        resource: "",
        action: "",
        description: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            resource: "",
            action: "",
            description: "",
        });
        setEditingPermission(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            return toast.error("من فضلك ادخل اسم الصلاحية");
        }

        if (!formData.resource?.trim()) {
            return toast.error("من فضلك ادخل اسم المورد (Resource)");
        }

        if (!formData.action?.trim()) {
            return toast.error("من فضلك ادخل نوع العملية (Action)");
        }

        if (editingPermission) {
            updatePermission(
                { id: editingPermission._id, data: formData },
                {
                    onSuccess: () => {
                        toast.success("تم تحديث الصلاحية بنجاح");
                        setIsDialogOpen(false);
                        resetForm();
                    },
                    onError: (error: any) => {
                        const errorMsg =
                            error?.response?.data?.message || "فشل في تحديث الصلاحية";
                        toast.error(errorMsg);
                    },
                }
            );
        } else {
            createPermission(formData, {
                onSuccess: () => {
                    toast.success("تم إضافة الصلاحية بنجاح");
                    setIsDialogOpen(false);
                    resetForm();
                },
                onError: (error: any) => {
                    const errorMsg =
                        error?.response?.data?.message || "فشل في إضافة الصلاحية";
                    toast.error(errorMsg);
                },
            });
        }
    };

    const handleEdit = (permission: IPermission) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            resource: permission.resource,
            action: permission.action,
            description: permission.description || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deletePermission(deleteId, {
                onSuccess: () => {
                    toast.success("تم حذف الصلاحية بنجاح");
                    setDeleteId(null);
                },
                onError: (error: any) => {
                    const errorMsg =
                        error?.response?.data?.message || "فشل في حذف الصلاحية";
                    toast.error(errorMsg);
                    setDeleteId(null);
                },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    const permissions = permissionsData?.data?.data || [];

    // ✅ Labels بالعربي
    const actionLabels: Record<string, string> = {
        create: "إضافة",
        read: "عرض",
        update: "تعديل",
        delete: "حذف",
    };

    const resourceLabels: Record<string, string> = {
        employees: "الموظفين",
        departments: "الأقسام",
        attendance: "الحضور والانصراف",
        "salary-reports": "تقارير الرواتب",
        settings: "الإعدادات",
        users: "المستخدمين",
        "user-groups": "مجموعات المستخدمين",
        permissions: "الصلاحيات",
        "official-holidays": "الإجازات الرسمية",
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">الصلاحيات</h1>
                    <p className="text-muted-foreground">
                        إدارة صلاحيات النظام والتحكم في الوصول
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة صلاحية
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg" dir="rtl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPermission ? "تعديل الصلاحية" : "إضافة صلاحية جديدة"}
                            </DialogTitle>
                            <DialogDescription>
                                املأ بيانات الصلاحية أدناه
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">اسم الصلاحية *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="مثال: create_employees"
                                    disabled={isCreating || isUpdating}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resource">المورد (Resource) *</Label>
                                <Input
                                    id="resource"
                                    value={formData.resource}
                                    onChange={(e) =>
                                        setFormData({ ...formData, resource: e.target.value })
                                    }
                                    placeholder="مثال: employees, departments"
                                    disabled={isCreating || isUpdating}
                                />
                                <p className="text-xs text-muted-foreground">
                                    اسم المورد الذي تنطبق عليه الصلاحية
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="action">نوع العملية (Action) *</Label>
                                <Input
                                    id="action"
                                    value={formData.action}
                                    onChange={(e) =>
                                        setFormData({ ...formData, action: e.target.value })
                                    }
                                    placeholder="create, read, update, delete"
                                    disabled={isCreating || isUpdating}
                                />
                                <p className="text-xs text-muted-foreground">
                                    create, read, update, delete
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">الوصف (اختياري)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="وصف الصلاحية..."
                                    rows={3}
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
                                        : editingPermission
                                            ? "تحديث"
                                            : "إضافة"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Permissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>قائمة الصلاحيات</CardTitle>
                    <CardDescription>
                        {permissions.length} صلاحية مسجلة في النظام
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {permissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">لا توجد صلاحيات</h3>
                            <p className="text-sm text-muted-foreground">
                                ابدأ بإضافة أول صلاحية للنظام
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="text-right font-bold">م</TableHead>
                                        <TableHead className="text-right font-bold">
                                            اسم الصلاحية
                                        </TableHead>
                                        <TableHead className="text-right font-bold">
                                            المورد
                                        </TableHead>
                                        <TableHead className="text-right font-bold">
                                            العملية
                                        </TableHead>
                                        <TableHead className="text-right font-bold">
                                            الوصف
                                        </TableHead>
                                        <TableHead className="text-right font-bold">
                                            الإجراءات
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.map((permission, index) => (
                                        <TableRow key={permission._id} className="hover:bg-gray-50">
                                            <TableCell className="text-right">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                    {permission.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {resourceLabels[permission.resource] ||
                                                        permission.resource}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        permission.action === "delete"
                                                            ? "destructive"
                                                            : permission.action === "create"
                                                                ? "default"
                                                                : "outline"
                                                    }
                                                >
                                                    {actionLabels[permission.action] || permission.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {permission.description || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(permission)}
                                                        className="hover:bg-blue-50"
                                                        title="تعديل"
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(permission._id)}
                                                        className="hover:bg-red-50"
                                                        title="حذف"
                                                        disabled={isDeleting}
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
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            لا يمكن التراجع عن هذا الإجراء. سيتم حذف الصلاحية نهائياً.
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