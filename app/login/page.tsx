"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // =====================
    // Client-side validation (toast only)
    // =====================
    if (!formData.usernameOrEmail.trim()) {
      toast.error("من فضلك أدخل اسم المستخدم أو البريد الإلكتروني");
      return;
    }

    if (!formData.password.trim()) {
      toast.error("من فضلك أدخل كلمة المرور");
      return;
    }

    // =====================
    // API Call
    // =====================
    login(formData, {
      onSuccess: () => {
        toast.success("تم تسجيل الدخول بنجاح");
        router.push("/dashboard");
      },
      onError: (error: Error) => {
        const apiError = error as ApiError;
        toast.error(
          apiError.response?.data?.message ||
            apiError.message ||
            "بيانات الدخول غير صحيحة",
        );
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your HR management account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">
                Username or Email
              </Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter username or email"
                value={formData.usernameOrEmail}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usernameOrEmail: e.target.value,
                  })
                }
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
