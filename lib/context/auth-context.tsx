// lib/context/auth-context.tsx

"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { IUser } from "@/lib/types/api.types";

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, isFetching } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading && !isFetching) {
      if (!data?.data && !isPublicRoute) {
        router.push("/login");
      } else if (data?.data && isPublicRoute) {
        router.push("/dashboard");
      }
    }
  }, [data, isLoading, isFetching, isPublicRoute, pathname, router]);

  const value = {
    user: data?.data || null,
    isLoading: isLoading || isFetching,
    isAuthenticated: !!data?.data,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
