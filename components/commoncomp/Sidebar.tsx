"use client";

import { LogOut, Users, UserRoundPlus, ChartSpline } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { handleLogout } from "@/utils";
import Link from "next/link";

type MenuItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

const menuItems: MenuItem[] = [
  // {
  //   key: "home",
  //   label: "Home",
  //   href: "/",
  //   icon: Home,
  // },
  {
    key: "patients",
    label: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    key: "addUser",
    label: "Add User",
    href: "/adduser",
    icon: UserRoundPlus,
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/analytics",
    icon: ChartSpline,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-semibold">Doctors Assistant</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
