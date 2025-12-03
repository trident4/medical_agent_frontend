"use client";

import { use, useEffect, useState } from "react";
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
import NormalQAChat from "@/components/chat/NormalQAChat";
import { ChevronDown, ChevronUp, Plus, LogOut } from "lucide-react";
import { FormDialog } from "@/components/commoncomp/FormDialog";
import { PatientForm } from "@/components/patients/PatientForm";
import { fetcherPost } from "@/utils";
import { Toaster } from "@/components/ui/sonner";
import { AddVisitForm } from "@/components/patients/AddVisit";

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [includeRecentVisits, setIncludeRecentVisits] = useState(5);
  const [timePeriodDays, setTimePeriodDays] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [openVisitForm, setOpenVisitForm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    if (summaryData) {
      setShowSummary(true);
    }
  }, [summaryData]);

  useEffect(() => {
    // Reset summary data when selected patient changes
    setPatientSummaryBody({
      patient_id: null,
      include_recent_visits: includeRecentVisits,
      time_period_days: timePeriodDays,
    });
    setShowSummary(false);
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
    setPatientDialogMode("view"); // Use view mode for delete
    setPatientDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPatientForDialog(null);
    setPatientDialogMode("add");
    setPatientDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-black font-sans">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 border-b ">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Patients
          </h1>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="sm"
            >
              {isCollapsed ? <ChevronDown /> : <ChevronUp />}
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
                <Button onClick={handleAdd}>
                  <Plus /> Add Patient
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
        </div>
        {!isCollapsed && (
          <>
            <div className="mt-3 w-full">
              <PatientSearch
                onSelect={(patient) => setSelectedPatient(patient)}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isPatientSelected={selectedPatient ? true : false}
              />
            </div>
          </>
        )}
        {selectedPatient && (
          <div className="mt-5 w-full">
            <div className="flex items-center gap-4 w-full">
              <h2 className="text-2xl font-semibold">Selected Patient</h2>
              <FormDialog
                dialogSize="lg"
                title="Add New Visit"
                description="Fill out the details below to add a visit."
                open={openVisitForm}
                onOpenChange={setOpenVisitForm}
                trigger={
                  <Button onClick={() => setOpenVisitForm(true)}>
                    <Plus /> Add Visit
                  </Button>
                }
              >
                <AddVisitForm
                  onSubmit={(data) => setOpenVisitForm(false)}
                  patient_id={selectedPatient.id}
                />
              </FormDialog>
            </div>
            <div className="flex items-center gap-4">
              <p className="mt-2 text-lg">
                {selectedPatient.full_name} (Age: {selectedPatient.age})
                (Visits: {selectedPatient.visit_count}) (Last Visit:{" "}
                {selectedPatient.last_visit ? new Date(selectedPatient.last_visit).toLocaleDateString() : 'N/A'})
              </p>

              <Popover>
                <PopoverTrigger asChild>
                  <Button className="cursor-pointer">Summary</Button>
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
                    className="mt-2 cursor-pointer btn-sm"
                    onClick={handleSummaryRequest}
                  >
                    {summaryLoading ? <Spinner /> : ""} Get Summary
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-y-auto ">
        {summaryData && (
          <div className="mt-5 w-full">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold">Patient Summary</h2>
              <Button
                variant="outline"
                title={showSummary ? "Hide Summary" : "Show Summary"}
                className="ml-2 cursor-pointer"
                size={"sm"}
                onClick={() => setShowSummary(!showSummary)}
              >
                {showSummary ? "Hide" : "Show"}
              </Button>
            </div>
            {showSummary && (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{summaryData.summary}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {selectedPatient && (
          <div className="mt-5 w-full">
            {" "}
            <h2 className="text-2xl font-semibold mb-3">Chat with Patient</h2>
            <ChatScreen
              patientId={selectedPatient?.id || null}
              visitId={null}
            />
            {/* <NormalQAChat
              patientId={selectedPatient?.id || null}
              visitId={null}
            /> */}
          </div>
        )}
        {selectedPatient === null && (
          <div className="mt-10 text-center text-zinc-500">
            Please select a patient to view details and chat.
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}
