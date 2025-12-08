"use client";

import { useEffect, useState } from "react";
import PatientSearch from "./patient-search";
import { Patient } from "./types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import { Spinner } from "@/components/ui/spinner";
import ReactMarkdown from "react-markdown";
import ChatScreen from "@/components/chat/ChatScree";
import { Menu, Plus, X } from "lucide-react";
import { FormDialog } from "@/components/commoncomp/FormDialog";
import { PatientForm } from "@/components/patients/PatientForm";
import { fetcherPost } from "@/utils";
import { Toaster } from "@/components/ui/sonner";
import { AddVisitForm } from "@/components/patients/AddVisit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePageTitle } from "@/contexts/PageTitleContext";

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

export default function PatientsPage() {
  const { setPageTitle } = usePageTitle();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [includeRecentVisits, setIncludeRecentVisits] = useState(5);
  const [timePeriodDays, setTimePeriodDays] = useState(0);
  const [openVisitForm, setOpenVisitForm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [patientDialogMode, setPatientDialogMode] = useState<
    "add" | "edit" | "view"
  >("add");
  const [selectedPatientForDialog, setSelectedPatientForDialog] =
    useState<Patient | null>(null);

  interface PatientSummaryBody {
    patient_id: number | null;
    include_recent_visits: number;
    time_period_days: number;
  }
  const [patientSummaryBody, setPatientSummaryBody] =
    useState<PatientSummaryBody>({
      patient_id: null,
      include_recent_visits: includeRecentVisits,
      time_period_days: timePeriodDays,
    });

  const handleSummaryRequest = () => {
    setPatientSummaryBody({
      patient_id: selectedPatient?.id || null,
      include_recent_visits: includeRecentVisits,
      time_period_days: timePeriodDays,
    });
  };

  let {
    data: summaryData,
    error: summaryError,
    isLoading: summaryLoading,
  } = useSWR(
    () => (patientSummaryBody.patient_id ? `/api/patientssummary` : null),
    (url) => fetcherPost(url, patientSummaryBody)
  );

  useEffect(() => {
    // Reset summary data when selected patient changes
    setPatientSummaryBody({
      patient_id: null,
      include_recent_visits: includeRecentVisits,
      time_period_days: timePeriodDays,
    });
  }, [selectedPatient]);

  const handleView = (patient: Patient) => {
    setSelectedPatientForDialog(patient);
    setPatientDialogMode("view");
    setPatientDialogOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatientForDialog(patient);
    setPatientDialogMode("edit");
    setPatientDialogOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatientForDialog(patient);
    setPatientDialogMode("view");
    setPatientDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPatientForDialog(null);
    setPatientDialogMode("add");
    setPatientDialogOpen(true);
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    if (isMobile) {
      setDrawerOpen(false); // Close drawer on mobile after selection
    }
  };

  useEffect(() => {
    setPageTitle("Patients");
  }, [setPageTitle]);

  // View/Edit Patient Dialog (shared for both mobile and desktop)
  const patientFormDialog = (
    <FormDialog
      dialogSize="lg"
      title={`${patientDialogMode.charAt(0).toUpperCase() +
        patientDialogMode.slice(1)
        } Patient`}
      description={
        patientDialogMode === "add"
          ? "Fill out the details below to add a patient."
          : ""
      }
      open={patientDialogOpen}
      onOpenChange={setPatientDialogOpen}
      trigger={<div style={{ display: 'none' }} />} // Hidden trigger, opened programmatically
    >
      <PatientForm
        mode={patientDialogMode}
        patient={selectedPatientForDialog}
        onSubmit={() => setPatientDialogOpen(false)}
      />
    </FormDialog>
  );

  // Render mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-white dark:bg-black font-sans">
        {patientFormDialog} {/* Place the shared dialog here */}
        {/* Mobile Header */}
        <div className="flex-shrink-0 border-b p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <FormDialog
              dialogSize="lg"
              title={`${patientDialogMode.charAt(0).toUpperCase() +
                patientDialogMode.slice(1)
                } Patient`}
              description={
                patientDialogMode === "add"
                  ? "Fill out the details below to add a patient."
                  : ""
              }
              open={patientDialogOpen}
              onOpenChange={setPatientDialogOpen}
              trigger={
                <Button size="sm" onClick={handleAdd}>
                  <Plus className="h-4 w-4" />
                </Button>
              }
            >
              <PatientForm
                mode={patientDialogMode}
                patient={selectedPatientForDialog}
                onSubmit={() => setPatientDialogOpen(false)}
              />
            </FormDialog>
          </div>

          {/* Patient Chip */}
          {selectedPatient && (
            <div
              className="mt-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              onClick={() => setDrawerOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{selectedPatient.full_name}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Age: {selectedPatient.age} | Visits: {selectedPatient.visit_count}
                  </p>
                </div>
                <Menu className="h-4 w-4 text-zinc-500" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-full sm:w-[400px] p-0">
            <div className="h-full flex flex-col">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Patient Search</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-auto p-4">
                <PatientSearch
                  onSelect={handlePatientSelect}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isPatientSelected={selectedPatient ? true : false}
                />

                {/* Patient Details in Drawer */}
                {selectedPatient && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">Patient Details</h3>
                    <div className="space-y-3">
                      <p className="text-sm">
                        <strong>{selectedPatient.full_name}</strong>
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Age: {selectedPatient.age} | Visits: {selectedPatient.visit_count}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Last Visit: {selectedPatient.last_visit ? new Date(selectedPatient.last_visit).toLocaleDateString() : 'N/A'}
                      </p>

                      <div className="flex flex-col gap-2 mt-4">
                        <FormDialog
                          dialogSize="lg"
                          title="Add New Visit"
                          description="Fill out the details below to add a visit."
                          open={openVisitForm}
                          onOpenChange={setOpenVisitForm}
                          trigger={
                            <Button size="sm" className="w-full" onClick={() => setOpenVisitForm(true)}>
                              <Plus className="h-4 w-4" /> Add Visit
                            </Button>
                          }
                        >
                          <AddVisitForm
                            onSubmit={(data) => setOpenVisitForm(false)}
                            patient_id={selectedPatient.id}
                          />
                        </FormDialog>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full">
                              Get Summary
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Label className="mb-2 mt-1">Number of Recent Visits</Label>
                            <Input
                              type="number"
                              placeholder="Include recent visits"
                              value={includeRecentVisits}
                              onChange={(e) => setIncludeRecentVisits(parseInt(e.target.value) || 0)}
                            />
                            <Label className="mb-2 mt-2">Time Period (Days)</Label>
                            <Input
                              type="number"
                              placeholder="Include time period in days"
                              value={timePeriodDays}
                              onChange={(e) => setTimePeriodDays(parseInt(e.target.value) || 0)}
                            />
                            <Button
                              className="mt-2 w-full"
                              onClick={handleSummaryRequest}
                              size="sm"
                            >
                              {summaryLoading ? <Spinner /> : "Generate"}
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Mobile Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPatient ? (
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <div className="flex-shrink-0 px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="flex-1 overflow-auto px-4">
                {summaryData ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <h2 className="text-xl font-semibold mb-3">Patient Summary</h2>
                    <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 py-8">
                    Click "Get Summary" to generate a patient summary.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4">
                <ChatScreen
                  patientId={selectedPatient?.id || null}
                  visitId={null}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 px-4 text-center">
              Tap the menu button to search and select a patient.
            </div>
          )}
        </div>

        <Toaster />
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-white dark:bg-black font-sans">
      {patientFormDialog} {/* Place the shared dialog here */}

      {/* Resizable Split Panel Layout */}
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Patient Search & Info */}
        <Panel defaultSize={30} minSize={20} maxSize={50}>
          <div className="h-full flex flex-col p-4 border-r">
            {/* Patient Search */}
            <div className="mb-4">
              <PatientSearch
                onSelect={handlePatientSelect}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isPatientSelected={selectedPatient ? true : false}
              />
            </div>

            {/* Selected Patient Info */}
            {selectedPatient && (
              <div className="flex-shrink-0 border-t pt-4">
                <h2 className="text-xl font-semibold mb-2">Selected Patient</h2>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>{selectedPatient.full_name}</strong>
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Age: {selectedPatient.age} | Visits: {selectedPatient.visit_count}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Last Visit: {selectedPatient.last_visit ? new Date(selectedPatient.last_visit).toLocaleDateString() : 'N/A'}
                  </p>

                  <div className="flex flex-col gap-2 mt-4">
                    <FormDialog
                      dialogSize="lg"
                      title="Add New Visit"
                      description="Fill out the details below to add a visit."
                      open={openVisitForm}
                      onOpenChange={setOpenVisitForm}
                      trigger={
                        <Button size="sm" className="w-full" onClick={() => setOpenVisitForm(true)}>
                          <Plus className="h-4 w-4" /> Add Visit
                        </Button>
                      }
                    >
                      <AddVisitForm
                        onSubmit={(data) => setOpenVisitForm(false)}
                        patient_id={selectedPatient.id}
                      />
                    </FormDialog>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full">
                          Get Summary
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Label className="mb-2 mt-1">Number of Recent Visits</Label>
                        <Input
                          type="number"
                          placeholder="Include recent visits"
                          value={includeRecentVisits}
                          onChange={(e) => setIncludeRecentVisits(parseInt(e.target.value) || 0)}
                        />
                        <Label className="mb-2 mt-2">Time Period (Days)</Label>
                        <Input
                          type="number"
                          placeholder="Include time period in days"
                          value={timePeriodDays}
                          onChange={(e) => setTimePeriodDays(parseInt(e.target.value) || 0)}
                        />
                        <Button
                          className="mt-2 w-full"
                          onClick={handleSummaryRequest}
                          size="sm"
                        >
                          {summaryLoading ? <Spinner /> : "Generate"}
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-blue-500 transition-colors" />

        {/* Right Panel - Tabbed Content */}
        <Panel defaultSize={70} minSize={50}>
          <div className="h-full flex flex-col">
            {selectedPatient ? (
              <Tabs defaultValue="chat" className="h-full flex flex-col">
                <div className="flex-shrink-0 px-4 pt-4">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="flex-1 overflow-auto px-4">
                  {summaryData ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <h2 className="text-2xl font-semibold mb-3">Patient Summary</h2>
                      <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-500 py-8">
                      Click "Get Summary" to generate a patient summary.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="chat" className="flex-1 flex flex-col px-4 pb-4">
                  <ChatScreen
                    patientId={selectedPatient?.id || null}
                    visitId={null}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Please select a patient to view details and chat.
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>

      <Toaster />
    </div>
  );
}
