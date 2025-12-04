"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { handleLogout } from "@/utils";
import { LogOut, Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/commoncomp/Sidebar";
import { PageTitleProvider, usePageTitle } from "@/contexts/PageTitleContext";
import { FormDialog } from "@/components/commoncomp/FormDialog";
import { PatientForm } from "@/components/patients/PatientForm";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { pageTitle } = usePageTitle();
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50">
        <AppSidebar />
        <main className="flex-1 w-full flex flex-col">
          <header className="sticky top-0 z-10 border-b bg-white py-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger />
              <h1 className="ml-4 text-2xl font-semibold">{pageTitle}</h1>
            </div>
            <FormDialog
              dialogSize="lg"
              title="Add Patient"
              description="Fill out the details below to add a patient."
              open={patientDialogOpen}
              onOpenChange={setPatientDialogOpen}
              trigger={
                <Button onClick={() => setPatientDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              }
            >
              <PatientForm
                mode="add"
                patient={null}
                onSubmit={() => setPatientDialogOpen(false)}
              />
            </FormDialog>
          </header>
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTitleProvider>
      <LayoutContent>{children}</LayoutContent>
    </PageTitleProvider>
  );
}
