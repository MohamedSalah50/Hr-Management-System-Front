// app/dashboard/settings/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useOvertimeDeductionSettings,
  useSaveOvertimeDeduction,
  useSaveWeekend,
  useWeekendSettings,
} from "@/lib/hooks/useSettings";
import { IOvertimeDeductionSettings, IWeekendSettings } from "@/lib/types";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const weekDays = [
  { name: "Monday", nameAr: "الإثنين", disabled: true },
  { name: "Tuesday", nameAr: "الثلاثاء", disabled: true },
  { name: "Wednesday", nameAr: "الأربعاء", disabled: true },
  { name: "Thursday", nameAr: "الخميس", disabled: true },
  { name: "Friday", nameAr: "الجمعة", disabled: false },
  { name: "Saturday", nameAr: "السبت", disabled: false },
  { name: "Sunday", nameAr: "الأحد", disabled: true },
];

export default function SettingsPage() {
  const { data: overtimeData, isLoading: overtimeLoading } =
    useOvertimeDeductionSettings();
  const { data: weekendData, isLoading: weekendLoading } = useWeekendSettings();
  const { mutate: saveOvertime, isPending: isSavingOvertime } =
    useSaveOvertimeDeduction();
  const { mutate: saveWeekend, isPending: isSavingWeekend } = useSaveWeekend();

  const [showOvertimeConfirm, setShowOvertimeConfirm] = useState(false);
  const [showWeekendConfirm, setShowWeekendConfirm] = useState(false);

  const [overtimeSettings, setOvertimeSettings] =
    useState<IOvertimeDeductionSettings>({
      overtimeHoursMultiplier: 1.5,
      deductionHoursMultiplier: 2,
      workingHoursPerDay: 8,
    });

  const [weekendSettings, setWeekendSettings] = useState<IWeekendSettings>({
    weekendDays: [],
  });

  // Update state when data is loaded
  useEffect(() => {
    if (overtimeData?.data) {
      setOvertimeSettings({
        overtimeHoursMultiplier:
          overtimeData.data.overtimeHoursMultiplier ?? 1.5,
        deductionHoursMultiplier:
          overtimeData.data.deductionHoursMultiplier ?? 2,
        workingHoursPerDay: overtimeData.data.workingHoursPerDay ?? 8,
      });
    }
  }, [overtimeData]);

  useEffect(() => {
    if (weekendData?.data) {
      setWeekendSettings({
        weekendDays: weekendData.data.weekendDays || [],
      });
    }
  }, [weekendData]);

  // Validation Rule #3: Pop up for confirmation
  const handleSaveOvertimeClick = () => {
    // Validation Rule #2: Check if fields are empty
    // if (
    //   overtimeSettings.deductionHoursMultiplier === undefined ||
    //   overtimeSettings.deductionHoursMultiplier === null ||
    //   overtimeSettings.overtimeHoursMultiplier === undefined ||
    //   overtimeSettings.overtimeHoursMultiplier === null ||
    //   overtimeSettings.workingHoursPerDay === undefined ||
    //   overtimeSettings.workingHoursPerDay === null
    // ) {
    //   toast.error("من فضلك ادخال بيانات الحقل");
    //   return;
    // }

    if (
      overtimeSettings.overtimeHoursMultiplier < 0 ||
      overtimeSettings.deductionHoursMultiplier < 0 ||
      overtimeSettings.workingHoursPerDay <= 0
    ) {
      toast.error("من فضلك ادخال بيانات صحيحة");
      return;
    }

    setShowOvertimeConfirm(true);
  };

  const confirmSaveOvertime = () => {
    console.log("PAYLOAD 👉", overtimeSettings);
    saveOvertime(overtimeSettings, {
      onSuccess: () => {
        toast.success("تم الحفظ بنجاح");
        setShowOvertimeConfirm(false);
      },
      onError: (error: any) => {
        console.log("ERROR 👉", error?.response?.data);
        toast.error(error?.response?.data?.message || "فشل في حفظ الإعدادات");
        setShowOvertimeConfirm(false);
      },
    });
  };

  const handleSaveWeekendClick = () => {
    // Validation Rule #2: Check if weekend days selected
    if (
      !weekendSettings.weekendDays ||
      weekendSettings.weekendDays.length === 0
    ) {
      toast.error("من فضلك ادخال بيانات الحقل");
      return;
    }

    setShowWeekendConfirm(true);
  };

  const confirmSaveWeekend = () => {
    saveWeekend(weekendSettings, {
      onSuccess: () => {
        toast.success("تم الحفظ بنجاح");
        setShowWeekendConfirm(false);
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "فشل في حفظ الإعدادات");
        setShowWeekendConfirm(false);
      },
    });
  };

  const toggleWeekendDay = (day: string) => {
    setWeekendSettings((prev) => ({
      weekendDays: prev.weekendDays.includes(day)
        ? prev.weekendDays.filter((d) => d !== day)
        : [...prev.weekendDays, day],
    }));
  };

  if (overtimeLoading || weekendLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإعدادات العامة</h1>
          <p className="text-muted-foreground mt-1">
            إدارة إعدادات النظام والإضافات والخصومات
          </p>
        </div>
      </div>

      <Tabs defaultValue="overtime" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overtime">اعدادات الإضافة والخصم</TabsTrigger>
          <TabsTrigger value="weekend">اعدادات الإجازات الأسبوعية</TabsTrigger>
        </TabsList>

        {/* اعدادات الإضافة والخصم */}
        <TabsContent value="overtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">
                اعدادات الإضافة والخصم
              </CardTitle>
              <CardDescription className="text-right">
                تحديد ثمن الساعة الإضافية وثمن ساعة التأخير
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="overtimeRate" className="text-right block">
                    الإضافة للساعة الواحدة (جنيه)
                  </Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={overtimeSettings.overtimeHoursMultiplier}
                    onChange={(e) =>
                      setOvertimeSettings({
                        ...overtimeSettings,
                        overtimeHoursMultiplier:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="مثال: 50.00"
                    className="text-right"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    المبلغ الذي يضاف للموظف عن كل ساعة إضافية
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductionRate" className="text-right block">
                    الخصم للساعة الواحدة (جنيه)
                  </Label>
                  <Input
                    id="deductionRate"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={overtimeSettings.deductionHoursMultiplier}
                    onChange={(e) =>
                      setOvertimeSettings({
                        ...overtimeSettings,
                        deductionHoursMultiplier:
                          parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="مثال: 30.00"
                    className="text-right"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    المبلغ الذي يخصم من الموظف عن كل ساعة تأخير
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="workingHoursPerDay"
                    className="text-right block"
                  >
                    عدد ساعات العمل في اليوم
                  </Label>
                  <Input
                    id="workingHoursPerDay"
                    type="number"
                    min="1"
                    required
                    value={overtimeSettings.workingHoursPerDay}
                    onChange={(e) =>
                      setOvertimeSettings({
                        ...overtimeSettings,
                        workingHoursPerDay: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="مثال: 8"
                    className="text-right"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    عدد ساعات العمل الرسمية في اليوم
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveOvertimeClick}
                  disabled={isSavingOvertime}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isSavingOvertime ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* اعدادات الإجازات الأسبوعية */}
        <TabsContent value="weekend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">
                اعدادات الإجازات الأسبوعية
              </CardTitle>
              <CardDescription className="text-right">
                تحديد أيام الإجازة الأسبوعية (الجمعة و/أو السبت)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {weekDays.map((day) => (
                  <div
                    key={day.name}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      day.disabled
                        ? "bg-gray-50 opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Label
                      htmlFor={day.name}
                      className={`text-right flex-1 ${
                        day.disabled ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{day.nameAr}</span>
                        <span className="text-sm text-muted-foreground">
                          {day.name}
                        </span>
                      </div>
                    </Label>
                    <Checkbox
                      id={day.name}
                      checked={weekendSettings.weekendDays.includes(day.name)}
                      onCheckedChange={() => toggleWeekendDay(day.name)}
                      disabled={day.disabled}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm font-medium text-blue-900 text-right mb-2">
                  أيام الإجازة المختارة:
                </p>
                <p className="text-sm text-blue-700 text-right">
                  {weekendSettings.weekendDays.length > 0
                    ? weekendSettings.weekendDays
                        .map(
                          (d) =>
                            weekDays.find((day) => day.name === d)?.nameAr || d,
                        )
                        .join(" و ")
                    : "لم يتم اختيار أيام"}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveWeekendClick}
                  disabled={isSavingWeekend}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isSavingWeekend ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog - Overtime */}
      <AlertDialog
        open={showOvertimeConfirm}
        onOpenChange={setShowOvertimeConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد حفظ الإعدادات
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حفظ إعدادات الإضافة والخصم؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowOvertimeConfirm(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSaveOvertime}
              className="bg-green-600 hover:bg-green-700"
            >
              تأكيد الحفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog - Weekend */}
      <AlertDialog
        open={showWeekendConfirm}
        onOpenChange={setShowWeekendConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              تأكيد حفظ الإعدادات
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حفظ إعدادات الإجازات الأسبوعية؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowWeekendConfirm(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSaveWeekend}
              className="bg-green-600 hover:bg-green-700"
            >
              تأكيد الحفظ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
