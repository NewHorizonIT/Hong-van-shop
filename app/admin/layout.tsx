"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/common/header";
import { AppSidebar } from "@/components/common/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Login page doesn't need sidebar/header/auth
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="px-4 py-2 flex-1 flex flex-col">
          <Header />
          {children}
        </main>
      </SidebarProvider>
    </AuthGuard>
  );
}
