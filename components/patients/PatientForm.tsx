"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useApi } from "@/lib/hooks/api";
import { Spinner } from "../ui/spinner";
import { Patient } from "@/app/(protected)/patients/types";

const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.email().optional().or(z.literal("")),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  mode: "add" | "edit" | "view";
  patient?: Patient | null;
  onSubmit?: (data: PatientFormData | null) => void;
}

export function PatientForm({ mode, patient, onSubmit }: PatientFormProps) {
  const { post, put, del, loading, error, data } = useApi();
  console.log("The patient is sent", patient);
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        date_of_birth: patient.date_of_birth || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        emergency_contact: patient.emergency_contact || "",
        medical_history: patient.medical_history || "",
        allergies: patient.allergies || "",
        current_medications: patient.current_medications || "",
      }
      : {
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        emergency_contact: "",
        medical_history: "",
        allergies: "",
        current_medications: "",
      },
  });

  const onSubmitHandler = async (data: PatientFormData) => {
    try {
      if (mode === "add") {
        let result = await post("/api/patients", data);
        toast(`Patient created successfully.`, {
          description: "",
          action: { label: "ok", onClick: () => toast.dismiss() },
          position: "top-center",
        });
        onSubmit?.(result);
      } else if (mode === "edit") {
        let result = await put(`/api/patients/${patient?.id}`, data);
        toast(`Patient updated successfully.`, {
          description: "",
          action: { label: "ok", onClick: () => toast.dismiss() },
          position: "top-center",
        });
        onSubmit?.(result);
      }
    } catch (error) {
      console.error("Error:", error);
      toast(`Failed to ${mode} patient.`, {
        description: "",
        action: { label: "ok", onClick: () => toast.dismiss() },
        position: "top-center",
      });
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete ${patient?.full_name}?`)) {
      try {
        await del(`/api/patients/${patient?.id}`);
        toast(`Patient deleted successfully.`, {
          description: "",
          action: { label: "ok", onClick: () => toast.dismiss() },
          position: "top-center",
        });
        onSubmit?.(null); // Close dialog
      } catch (error) {
        console.error("Error deleting patient:", error);
        toast(`Failed to delete patient.`, {
          description: "",
          action: { label: "ok", onClick: () => toast.dismiss() },
          position: "top-center",
        });
      }
    }
  };

  const isDisabled = mode === "view";
  const submitLabel =
    mode === "add" ? "Save Patient" : mode === "edit" ? "Update Patient" : "";

  // Field configuration (same as before)
  const fields = [
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      required: true,
      disabled: false,
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["male", "female", "other"],
      disabled: false,
    },
    { name: "phone", label: "Phone", type: "text", disabled: false },
    { name: "email", label: "Email", type: "email", disabled: false },
    { name: "address", label: "Address", type: "textarea", disabled: false },
    {
      name: "emergency_contact",
      label: "Emergency Contact",
      type: "text",
      disabled: false,
    },
    {
      name: "medical_history",
      label: "Medical History",
      type: "textarea",
      disabled: false,
    },
    {
      name: "allergies",
      label: "Allergies",
      type: "textarea",
      disabled: false,
    },
    {
      name: "current_medications",
      label: "Current Medications",
      type: "textarea",
      disabled: false,
    },
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((fieldDef) => (
            <FormField
              key={fieldDef.name}
              control={form.control}
              disabled={isDisabled || fieldDef.disabled}
              name={fieldDef.name as keyof PatientFormData}
              render={({ field }) => (
                <FormItem
                  className={fieldDef.type === "textarea" ? "col-span-2" : ""}
                >
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <FormControl>
                    {fieldDef.type === "textarea" ? (
                      <Textarea placeholder={fieldDef.label} {...field} />
                    ) : fieldDef.type === "select" ? (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isDisabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${fieldDef.label}`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldDef.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={fieldDef.type}
                        placeholder={fieldDef.label}
                        {...field}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="flex justify-between pt-2">
          {mode === "view" && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Patient
            </Button>
          )}
          {mode !== "view" && (
            <Button type="submit">
              {loading && <Spinner />}
              {submitLabel}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
