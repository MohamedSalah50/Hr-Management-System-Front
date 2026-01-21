// app/dashboard/user-groups/page.tsx
"use client";

import { useState } from "react";
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
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Shield,
} from "lucide-react";
import {
  useUserGroups,
  useCreateUserGroup,
  useUpdateUserGroup,
  useDeleteUserGroup,
} from "@/lib/hooks/useUserGroup";
import { useUsers } from "@/lib/hooks/useUser";
import { usePermissions } from "@/lib/hooks/useSettings";
import {
  IUserGroup,
  ICreateUserGroup,
  IUser,
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
  const { data: usersData } = useUsers();
  const { data: permissionsData } = usePermissions();
  const { mutate: createGroup, isPending: isCreating } = useCreateUserGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateUserGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteUserGroup();

  const groups = groupsData?.data?.data || [];
  const users = usersData?.data?.data || [];
  const permissions = permissionsData?.data?.data || [];

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("اسم المجموعة مطلوب");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("يجب تحديد الصلاحيات");
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

  const toggleUser = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds?.includes(userId)
        ? prev.userIds.filter((id) => id !== userId)
        : [...(prev.userIds || []), userId],
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة مجموعة مستخدمين جديدة</DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات المجموعة وتحديد الصلاحيات والمستخدمين
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              formData={formData}
              setFormData={setFormData}
              permissions={permissions}
              users={users}
              togglePermission={togglePermission}
              toggleUser={toggleUser}
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
                    <TableHead className="text-right">عدد المستخدمين</TableHead>
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
                      <TableCell>
                        <Badge variant="secondary">
                          {group.userIds?.length || 0} مستخدم
                        </Badge>
                      </TableCell>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل مجموعة المستخدمين</DialogTitle>
            <DialogDescription>
              قم بتحديث بيانات المجموعة والصلاحيات والمستخدمين
            </DialogDescription>
          </DialogHeader>
          <GroupForm
            formData={formData}
            setFormData={setFormData}
            permissions={permissions}
            users={users}
            togglePermission={togglePermission}
            toggleUser={toggleUser}
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
  users,
  togglePermission,
  toggleUser,
  onSubmit,
  isLoading,
  submitLabel,
}: any) {
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
        />
      </div>

      {/* Permissions Section */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          الصلاحيات *
        </Label>
        <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
          {permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا توجد صلاحيات متاحة
            </p>
          ) : (
            <div className="space-y-2">
              {permissions.map((permission: IPermission) => (
                <div key={permission._id} className="flex items-center gap-2">
                  <Checkbox
                    id={`permission-${permission._id}`}
                    checked={formData.permissions.includes(permission._id)}
                    onCheckedChange={() => togglePermission(permission._id)}
                  />
                  <Label
                    htmlFor={`permission-${permission._id}`}
                    className="cursor-pointer flex-1"
                  >
                    {permission.name}
                    <span className="text-xs text-muted-foreground mr-2">
                      ({permission.resource} - {permission.action})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Users Section */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          المستخدمين
        </Label>
        <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              لا يوجد مستخدمين متاحين
            </p>
          ) : (
            <div className="space-y-2">
              {users.map((user: IUser) => (
                <div key={user._id} className="flex items-center gap-2">
                  <Checkbox
                    id={`user-${user._id}`}
                    checked={formData.userIds?.includes(user._id)}
                    onCheckedChange={() => toggleUser(user._id)}
                  />
                  <Label
                    htmlFor={`user-${user._id}`}
                    className="cursor-pointer flex-1"
                  >
                    {user.fullName}
                    <span className="text-xs text-muted-foreground mr-2">
                      ({user.email})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button onClick={onSubmit} disabled={isLoading} className="w-full">
        {isLoading ? "جاري الحفظ..." : submitLabel}
      </Button>
    </div>
  );
}
