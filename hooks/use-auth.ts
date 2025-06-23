"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, requireAuth, router]);

  const logout = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Fallback: redirecionar manualmente
      router.push("/login");
    }
  };

  return {
    user: session?.user,
    userId: session?.user?.id || null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout,
  };
}
