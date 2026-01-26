"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import {
  useUserGroups,
  useCreateUserGroup,
  useUpdateUserGroup,
  useDeleteUserGroup,
} from "@/lib/hooks/useUserGroup";
import { usePermissions } from "@/lib/hooks/useSettings";
import {
  IUserGroup,
  ICreateUserGroup,
  IPermission,
} from "@/lib/types/api.types";
import { Checkbox } from "@/components/ui/checkbox";

export default function UserGroupsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<IUserGroup | null>(null);
  const [formData, setFormData] = useState<ICreateUserGroup>({
    name: "",
    description: "",
    permissions: [],
    userIds: [],
  });

  const { data: groupsData, isLoading: isLoadingGroups } = useUserGroups();
  const { data: permissionsData } = usePermissions();
  const { mutate: createGroup, isPending: isCreating } = useCreateUserGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateUserGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteUserGroup();

  const groups = groupsData?.data?.data || [];
  const permissions = permissionsData?.data?.data || [];

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("من فضلك ادخل اسم المجموعه");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("من فضلك قم بتحديد صلاحيات المجموعه قبل الاضافه");
      return;
    }

    createGroup(formData, {
      onSuccess: () => {
        toast.success("تم إضافة المجموعة بنجاح");
        setIsCreateDialogOpen(false);
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "حدث خطأ");
      },
    });
  };

  const handleUpdate = () => {
    if (!selectedGroup) return;

    if (!formData.name.trim()) {
      toast.error("اسم المجموعة مطلوب");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("من فضلك قم بتحديد صلاحيات المجموعه");
      return;
    }

    updateGroup(
      { id: selectedGroup._id, data: formData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المجموعة بنجاح");
          setIsEditDialogOpen(false);
          resetForm();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "حدث خطأ");
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المجموعة؟")) {
      deleteGroup(id, {
        onSuccess: () => {
          toast.success("تم حذف المجموعة بنجاح");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "حدث خطأ");
        },
      });
    }
  };

  const openEditDialog = (group: IUserGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      permissions: group.permissions || [],
      userIds: group.userIds || [],
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: [],
      userIds: [],
    });
    setSelectedGroup(null);
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مجموعات المستخدمين</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وتنظيم المستخدمين في مجموعات مع صلاحيات محددة
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة مجموعة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle>إضافة مجموعة مستخدمين جديدة</DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات المجموعة وتحديد الصلاحيات
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              formData={formData}
              setFormData={setFormData}
              permissions={permissions}
              togglePermission={togglePermission}
              onSubmit={handleCreate}
              isLoading={isCreating}
              submitLabel="إضافة المجموعة"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المجموعات</CardTitle>
          <CardDescription>
            {groups.length} مجموعة مسجلة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingGroups ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مجموعات مسجلة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المجموعة</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    {/* <TableHead className="text-right">عدد المستخدمين</TableHead> */}
                    <TableHead className="text-right">عدد الصلاحيات</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {group.name}
                        </div>
                      </TableCell>
                      <TableCell>{group.description || "-"}</TableCell>
                      {/* <TableCell>
                        <Badge variant="secondary">
                          {group.userIds?.length || 0} مستخدم
                        </Badge>
                      </TableCell>*/}
                      <TableCell>
                        <Badge variant="outline">
                          {group.permissions?.length || 0} صلاحية
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(group)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(group._id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>تعديل مجموعة المستخدمين</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات المجموعة والصلاحيات
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            formData={formData}
            setFormData={setFormData}
            permissions={permissions}
            togglePermission={togglePermission}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
            submitLabel="حفظ التغييرات"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Group Form Component
function GroupForm({
  formData,
  setFormData,
  permissions,
  togglePermission,
  onSubmit,
  isLoading,
  submitLabel,
}: any) {
  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const grouped: Record<
      string,
      Record<string, { id: string; name: string }>
    > = {};

    permissions.forEach((permission: IPermission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = {};
      }
      grouped[permission.resource][permission.action] = {
        id: permission._id,
        name: permission.name,
      };
    });

    return grouped;
  }, [permissions]);

  const resources = Object.keys(groupedPermissions);
  const actions = ["create", "read", "update", "delete"];

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

  const isPermissionChecked = (permissionId: string | undefined) => {
    if (!permissionId) return false;
    return formData.permissions.includes(permissionId);
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="space-y-2">
        <Label htmlFor="name">اسم المجموعة *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="أدخل اسم المجموعة"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="أدخل وصف المجموعة (اختياري)"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Permissions Table */}
      <div className="space-y-2">
        <Label>الصلاحيات *</Label>
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold w-[200px]">
                    الصفحة
                  </TableHead>
                  {actions.map((action) => (
                    <TableHead key={action} className="text-center font-bold">
                      {actionLabels[action]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={actions.length + 1}
                      className="text-center text-muted-foreground py-8"
                    >
                      لا توجد صلاحيات متاحة
                    </TableCell>
                  </TableRow>
                ) : (
                  resources.map((resource) => (
                    <TableRow key={resource} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {resourceLabels[resource] || resource}
                      </TableCell>
                      {actions.map((action) => {
                        const permission = groupedPermissions[resource][action];
                        return (
                          <TableCell key={action} className="text-center">
                            {permission ? (
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={isPermissionChecked(permission.id)}
                                  onCheckedChange={() =>
                                    togglePermission(permission.id)
                                  }
                                  disabled={isLoading}
                                />
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          اختر الصلاحيات المطلوبة لهذه المجموعة
        </p>
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className="w-full">
        {isLoading ? "جاري الحفظ..." : submitLabel}
      </Button>
    </div>
  );
}
