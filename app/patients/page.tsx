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
import { Plus } from "lucide-react";
import { FormDialog } from "@/components/commoncomp/FormDialog";
import { AddPatientForm } from "@/components/patients/AddPatient";
import { fetcherPost } from "@/utils";
import { Toaster } from "@/components/ui/sonner";
import { AddVisitForm } from "@/components/patients/AddVisit";

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [includeRecentVisits, setIncludeRecentVisits] = useState(5);
  const [timePeriodDays, setTimePeriodDays] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [openPatientForm, setOpenPatientForm] = useState(false);
  const [openVisitForm, setOpenVisitForm] = useState(false);

  interface PatientSummaryBody {
    patient_id: string;
    include_recent_visits: number;
    time_period_days: number;
  }
  const [patientSummaryBody, setPatientSummaryBody] =
    useState<PatientSummaryBody>({
      patient_id: "",
      include_recent_visits: includeRecentVisits,
      time_period_days: timePeriodDays,
    });

  const handleSummaryRequest = () => {
    setPatientSummaryBody({
      patient_id: selectedPatient?.patient_id || "",
      include_recent_visits: includeRecentVisits,
      time_period_days: timePeriodDays,
    });
  };
  const {
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

  return (
    <div className="flex min-h-screen  items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center justify-start py-5 px-5 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full items-center justify-between">
          <h1 className="max-w-xs text-3xl font-semibold  tracking-tight text-black dark:text-zinc-50 ">
            Patients
          </h1>
          <FormDialog
            dialogSize="lg"
            title="Add New Patient"
            description="Fill out the details below to add a patient."
            open={openPatientForm}
            onOpenChange={setOpenPatientForm}
            trigger={
              <Button onClick={() => setOpenPatientForm(true)}>
                <Plus /> Add Patient
              </Button>
            }
          >
            <AddPatientForm onSubmit={(data) => setOpenPatientForm(false)} />
          </FormDialog>
        </div>
        <div className="mt-3 w-full">
          <PatientSearch onSelect={(patient) => setSelectedPatient(patient)} />
        </div>

        {selectedPatient && (
          <div className="mt-5 w-full">
            <div className="flex items-center gap-4 w-full">
              <h2 className="text-2xl font-semibold">Selected Patient</h2>
              <FormDialog
                dialogSize="xl"
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
                {new Date(selectedPatient.last_visit).toLocaleDateString()})
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
                    onInput={(e) => setIncludeRecentVisits(e.target.value)}
                  />
                  <Label className="mb-2  mt-2">Time Period (Days)</Label>
                  <Input
                    type="number"
                    placeholder="Include time period in days"
                    value={timePeriodDays}
                    onInput={(e) => setTimePeriodDays(e.target.value)}
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
              patientId={selectedPatient?.patient_id || null}
              visitId={null}
            />
          </div>
        )}
        {selectedPatient === null && (
          <div className="mt-10 text-center text-zinc-500">
            Please select a patient to view details and chat.
          </div>
        )}
        <Toaster />
      </main>
    </div>
  );
}
