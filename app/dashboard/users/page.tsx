// app/dashboard/users/page.tsx
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRoles } from "@/lib/hooks/useSettings";
import { useUserGroups } from "@/lib/hooks/useUserGroup";
import {
  useCreateUser,
  useDeleteUser,
  useToggleUserStatus,
  useUpdateUser,
  useUsers,
} from "@/lib/hooks/useUser";
import { ICreateUser, IUser } from "@/lib/types";
import { Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data: usersData, isLoading } = useUsers();
  const { data: rolesData } = useRoles();
  const { data: userGroupsData } = useUserGroups(); 
  const { mutate: createUser } = useCreateUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: toggleStatus } = useToggleUserStatus();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ICreateUser>({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    userGroupId: "", 
  });

  const resetForm = () => {
    setFormData({
      fullName: "",
      userName: "",
      email: "",
      password: "",
      userGroupId: "",
    });
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Rules
    if (!formData.fullName.trim()) {
      toast.error("من فضلك ادخل الاسم بالكامل");
      return;
    }

    if (!formData.userName.trim()) {
      toast.error("من فضلك ادخل اسم المستخدم");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("من فضلك ادخل البريد الالكتروني");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("من فضلك ادخل كلمة المرور");
      return;
    }

    if (!formData.userGroupId) {
      toast.error("من فضلك قم بتحديد المجموعة قبل الاضافة");
      return;
    }

    if (editingUser) {
      const { password, ...updateData } = formData;
      updateUser(
        {
          id: editingUser._id,
          data: password ? formData : updateData,
        },
        {
          onSuccess: () => {
            toast.success("تم تعديل المستخدم بنجاح");
            setIsDialogOpen(false);
            resetForm();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "فشل في تعديل المستخدم",
            );
          },
        },
      );
    } else {
      createUser(formData, {
        onSuccess: () => {
          toast.success("تم إضافة المستخدم بنجاح");
          setIsDialogOpen(false);
          resetForm();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "فشل في إضافة المستخدم",
          );
        },
      });
    }
  };

  const handleEdit = (user: IUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      password: "",
      userGroupId:
        typeof user.userGroupId === "string"
          ? user.userGroupId
          : user.userGroupId?._id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteUser(deleteId, {
        onSuccess: () => toast.success("تم حذف المستخدم بنجاح"),
        onError: () => toast.error("فشل في حذف المستخدم"),
      });
      setDeleteId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    toggleStatus(id, {
      onSuccess: () => toast.success("تم تحديث حالة المستخدم"),
      onError: () => toast.error("فشل في تحديث الحالة"),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const users = usersData?.data?.data || [];
  const userGroups = userGroupsData?.data?.data || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مستخدمين النظام</h1>
          <p className="text-muted-foreground mt-1">
            إدارة مستخدمي النظام وصلاحياتهم
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="ml-2 h-4 w-4" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-right">
                {editingUser ? "تعديل مستخدم" : "Add New Admin"}
              </DialogTitle>
              <DialogDescription className="text-right">
                قم بإدخال بيانات المستخدم أدناه
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* الاسم بالكامل */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-right block">
                    الاسم بالكامل
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="الاسم بالكامل"
                    className="text-right"
                    // required
                  />
                </div>

                {/* اسم المستخدم */}
                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-right block">
                    اسم المستخدم
                  </Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    placeholder="اسم المستخدم"
                    className="text-right"
                    // required
                  />
                </div>

                {/* البريد الالكتروني */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    البريد الالكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Example@gmail.com"
                    className="text-right"
                    dir="ltr"
                    // required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* الباسورد */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-right block">
                    الباسورد{" "}
                    {editingUser && "(اتركه فارغاً للإبقاء على الحالي)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="الباسورد"
                    className="text-right"
                    // required={!editingUser}
                  />
                </div>

                {/* الصلاحيات */}
                <div className="space-y-2">
                  <Label htmlFor="userGroupId" className="text-right block">
                    الصلاحيات
                  </Label>
                  <Select
                    value={formData.userGroupId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, userGroupId: value })
                    }
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="الصلاحيات" />
                    </SelectTrigger>
                    <SelectContent>
                      {userGroups.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                  حفظ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">قائمة المستخدمين</CardTitle>
          <CardDescription className="text-right">
            {users.length} مستخدم مسجل في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مستخدمين مسجلين
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم بالكامل</TableHead>
                    <TableHead className="text-right">اسم المستخدم</TableHead>
                    <TableHead className="text-right">
                      البريد الإلكتروني
                    </TableHead>
                    <TableHead className="text-right">المجموعة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    // ✅ استخراج اسم المجموعة بشكل آمن
                    let groupName = "غير محدد";
                    if (user.userGroupId) {
                      if (typeof user.userGroupId === "object") {
                        groupName = user.userGroupId.name || "غير محدد";
                      }
                    }

                    return (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium text-right">
                          {user.fullName}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.userName}
                        </TableCell>
                        <TableCell className="text-right" dir="ltr">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{groupName}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStatus(user._id)}
                              title={user.isActive ? "تعطيل" : "تفعيل"}
                            >
                              {user.isActive ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              هل أنت متأكد؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف المستخدم نهائياً.
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
