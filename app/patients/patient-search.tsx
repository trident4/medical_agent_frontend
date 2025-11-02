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
import { Loader2 } from "lucide-react";
import { Patient } from "./types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PatientSearch({
  onSelect,
}: {
  onSelect?: (patient: Patient) => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // debounce to avoid too many API calls
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(delay);
  }, [query]);

  const {
    data,
    error,
    isLoading,
  }: { data: Patient[]; error: any; isLoading: boolean } = useSWR(
    `/api/patients?q=${debouncedQuery}`,
    fetcher
  );

  const results = Array.isArray(data) ? data : data || [];

  return (
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
          {error
            ? "Failed to load patients."
            : isLoading
            ? "Loading..."
            : "No patients found."}
        </CommandEmpty>

        {results.length > 0 && isFocused && (
          <CommandGroup heading="Results">
            {results.map((patient: any) => (
              <CommandItem
                key={patient.id || patient.full_name}
                onSelect={() => onSelect?.(patient)}
              >
                <div>
                  <p className="font-medium">{patient.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {patient.age} yrs —{" "}
                    {patient.condition || "General Checkup "}—{" "}
                    {patient.visit_count} visits - Last visit:{" "}
                    {new Date(patient.last_visit).toLocaleDateString()}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
