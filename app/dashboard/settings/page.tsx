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
import { useState } from "react";
import { toast } from "sonner";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SettingsPage() {
  const { data: overtimeData } = useOvertimeDeductionSettings();
  const { data: weekendData } = useWeekendSettings();
  const { mutate: saveOvertime } = useSaveOvertimeDeduction();
  const { mutate: saveWeekend } = useSaveWeekend();

  // Initialize state directly from query data to avoid setState in useEffect
  const [overtimeSettings, setOvertimeSettings] =
    useState<IOvertimeDeductionSettings>({
      overtimeRatePerHour: overtimeData?.data?.overtimeRatePerHour ?? 0,
      deductionRatePerHour: overtimeData?.data?.deductionRatePerHour ?? 0,
    });

  const [weekendSettings, setWeekendSettings] = useState<IWeekendSettings>({
    weekendDays: weekendData?.data?.weekendDays ?? [],
  });

  // Update local state when query data changes (after mutations)
  // Using functional updates to avoid dependencies
  const handleSaveOvertime = () => {
    saveOvertime(overtimeSettings, {
      onSuccess: (data) => {
        if (data?.data) {
          setOvertimeSettings(data.data);
        }
        toast.success("Overtime and deduction settings saved successfully");
      },
      onError: () => {
        toast.error("Failed to save overtime settings");
      },
    });
  };

  const handleSaveWeekend = () => {
    saveWeekend(weekendSettings, {
      onSuccess: (data) => {
        if (data?.data) {
          setWeekendSettings(data.data);
        }
        toast.success("Weekend settings saved successfully");
      },
      onError: () => {
        toast.error("Failed to save weekend settings");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="overtime" className="w-full">
        <TabsList>
          <TabsTrigger value="overtime">Overtime & Deductions</TabsTrigger>
          <TabsTrigger value="weekend">Weekend Days</TabsTrigger>
        </TabsList>

        <TabsContent value="overtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overtime & Deduction Rates</CardTitle>
              <CardDescription>
                Set the hourly rates for overtime compensation and late
                deductions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="overtimeRate">
                    Overtime Rate per Hour ($)
                  </Label>
                  <Input
                    id="overtimeRate"
                    type="number"
                    step="0.01"
                    value={overtimeSettings.overtimeRatePerHour}
                    onChange={(e) =>
                      setOvertimeSettings({
                        ...overtimeSettings,
                        overtimeRatePerHour: parseFloat(e.target.value),
                      })
                    }
                    placeholder="e.g., 15.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Amount paid per hour of overtime worked
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deductionRate">
                    Deduction Rate per Hour ($)
                  </Label>
                  <Input
                    id="deductionRate"
                    type="number"
                    step="0.01"
                    value={overtimeSettings.deductionRatePerHour}
                    onChange={(e) =>
                      setOvertimeSettings({
                        ...overtimeSettings,
                        deductionRatePerHour: parseFloat(e.target.value),
                      })
                    }
                    placeholder="e.g., 10.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Amount deducted per hour of late arrival
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveOvertime}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekend Days</CardTitle>
              <CardDescription>
                Select which days are considered weekends for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {weekDays.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={weekendSettings.weekendDays.includes(day)}
                      onCheckedChange={() => toggleWeekendDay(day)}
                    />
                    <Label
                      htmlFor={day}
                      className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Selected weekend days:</p>
                <p className="text-sm text-muted-foreground">
                  {weekendSettings.weekendDays.length > 0
                    ? weekendSettings.weekendDays.join(", ")
                    : "None selected"}
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveWeekend}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
