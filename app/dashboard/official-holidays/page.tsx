"use client";

import { useState } from "react";
import {
  useOfficialHolidays,
  useCreateOfficialHoliday,
  useDeleteOfficialHoliday,
} from "@/lib/hooks/useOfficialHoliday";
import { ICreateOfficialHoliday } from "@/lib/types/api.types";

export default function OfficialHolidaysPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number | undefined>(undefined);
  const [form, setForm] = useState<ICreateOfficialHoliday>({
    name: "",
    date: "",
    year: currentYear,
  });

  /* ================= Hooks ================= */
  const { data, isLoading } = useOfficialHolidays(year);
  const { mutate: createHoliday, isPending: isCreating } =
    useCreateOfficialHoliday();
  const { mutate: deleteHoliday } = useDeleteOfficialHoliday();

  const holidays = data?.data?.data || [];

  /* ================= Handlers ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.date || !form.year) return;

    createHoliday(form, {
      onSuccess: () => {
        setForm({
          name: "",
          date: "",
          year,
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    deleteHoliday(id);
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">الإجازات الرسمية</h1>

      {/* Add Form */}
      <div className="border rounded p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="name"
            placeholder="اسم الإجازة"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="كل السنوات"
            value={year ?? ""}
            onChange={(e) =>
              setYear(e.target.value ? Number(e.target.value) : undefined)
            }
            className="border p-1 rounded w-32"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="px-6 py-2 bg-gray-200 border rounded hover:bg-gray-300 disabled:opacity-50"
        >
          إضافة
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span>السنة:</span>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-1 rounded w-28"
        />
      </div>

      {/* Table */}
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">الاسم</th>
              <th className="border p-2">التاريخ</th>
              <th className="border p-2">العمليات</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={3} className="text-center p-4">
                  جاري التحميل...
                </td>
              </tr>
            )}

            {!isLoading && holidays.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-4">
                  لا توجد بيانات
                </td>
              </tr>
            )}

            {holidays.map((holiday) => (
              <tr key={holiday._id}>
                <td className="border p-2">{holiday.name}</td>
                <td className="border p-2">
                  {new Date(holiday.date).toLocaleDateString("ar-EG", {
                    weekday: "long",
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(holiday._id)}
                    className="px-3 py-1 border rounded hover:bg-red-100"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
