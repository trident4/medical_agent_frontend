"use client";

import { Button } from "@/components/ui/button";
import { handleLogout } from "@/utils";
import { LogOut } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/commoncomp/Sidebar"; // ✅ Import from the correct location

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50">
        <AppSidebar />
        <main className="flex-1 w-full">
          <header className="border-b py-4 px-5 flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 text-2xl font-semibold">Dashboard</h1>
            </div>
          </header>
          <div className="p-5">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
