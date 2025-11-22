"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, Eye, Edit, Trash2 } from "lucide-react";
import { Patient, PatientResponse } from "./types";
import { ApiError } from "@/commontypes";
import { toast } from "sonner";
import { buildUrl, handleLogout } from "@/utils";
import { Button } from "@/components/ui/button";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json();
    const error: any = new Error(errorData.error || 'An error occurred');
    error.status = res.status;
    throw error;
  }
  return res.json();
};

export default function PatientSearch({
  onSelect,
  onView,
  onEdit,
  onDelete,
  isPatientSelected,
}: {
  onSelect?: (patient: Patient) => void;
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  isPatientSelected: boolean;
}) {
  const DEFAULT_PATIENTS_URL = "/api/patients";
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [patientsUrl, setPatientsUrl] = useState(DEFAULT_PATIENTS_URL);
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);

  // debounce to avoid too many API calls
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    let queryParams = {
      page,
      page_size: pageSize,
      search: debouncedQuery,
    };
    setPatientsUrl(buildUrl(DEFAULT_PATIENTS_URL, queryParams));
  }, [page, debouncedQuery]);
  const {
    data,
    error: swrError,
    isLoading,
  } = useSWR<PatientResponse>(patientsUrl, fetcher, {
    // onError: (error) => {
    //   // Handle errors from the API
    //   const errorMessage = error?.error || error?.message || "Failed to load patients";
    //   toast.error(errorMessage, {
    //     position: "top-center",
    //     duration: 4000,
    //   });
    //   // if (error.status === 401) {
    //   //   handleLogout();
    //   // }
    // },
    // // Optionally add these for better UX
    // revalidateOnFocus: false,
    // shouldRetryOnError: false,
  });

  const results = data?.items || [];
  const pagination = data;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const fetchPatientDetails = async (
    patientId: string
  ): Promise<Patient | null> => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (response.ok) {
        return await response.json();
      } else {
        toast("Failed to load patient details", {
          description: "",
          action: { label: "ok", onClick: () => toast.dismiss() },
          position: "top-center",
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast("Error loading patient details", {
        description: "",
        action: { label: "ok", onClick: () => toast.dismiss() },
        position: "top-center",
      });
      return null;
    }
  };

  const handleAction = async (
    action: "view" | "edit" | "delete",
    patient: Patient
  ) => {
    setLoadingPatientId(patient.id);
    const fullPatient = await fetchPatientDetails(patient.id);
    setLoadingPatientId(null);
    if (fullPatient) {
      if (action === "view") onView?.(fullPatient);
      else if (action === "edit") onEdit?.(fullPatient);
      else if (action === "delete") onDelete?.(fullPatient);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.page || 1;

    // Show first page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            isActive={currentPage === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Add ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={currentPage === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Add ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              href="#"
              isActive={currentPage === totalPages}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="w-full">
      <Command
        shouldFilter={false}
        className="rounded-lg border shadow-md w-full"
      >
        <CommandInput
          placeholder="Search patients..."
          value={query}
          onValueChange={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
            }, 150);
          }}
        />
        {isLoading && (
          <div className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        <CommandList key={debouncedQuery}>
          <CommandEmpty>
            {swrError
              ? "Failed to load patients."
              : isLoading
                ? "Loading..."
                : isPatientSelected
                  ? ""
                  : "No patient selected."}
          </CommandEmpty>

          {results.length > 0 && isFocused && (
            <CommandGroup heading="Results">
              {results.map((patient: Patient) => (
                <CommandItem
                  key={patient.id || patient.full_name}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1" onClick={() => onSelect?.(patient)}>
                    <p className="font-medium">{patient.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age} yrs — {patient.patient_id} —{" "}
                      {patient.visit_count} visits - Last visit:{" "}
                      {patient.last_visit
                        ? new Date(patient.last_visit).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("view", patient);
                      }}
                      disabled={loadingPatientId === patient.id}
                    >
                      {loadingPatientId === patient.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("edit", patient);
                      }}
                      disabled={loadingPatientId === patient.id}
                    >
                      {loadingPatientId === patient.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Edit className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction("delete", patient);
                      }}
                      disabled={loadingPatientId === patient.id}
                    >
                      {loadingPatientId === patient.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>

      {/* Pagination Controls */}
      {pagination && pagination.total_pages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.has_previous) handlePageChange(page - 1);
                }}
                className={
                  !pagination.has_previous
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.has_next) handlePageChange(page + 1);
                }}
                className={
                  !pagination.has_next ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
