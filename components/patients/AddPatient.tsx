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

const patientSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  current_medications: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export function AddPatientForm({
  onSubmit,
}: {
  onSubmit?: (data: PatientFormData) => void;
}) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
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
      let patient = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!patient.ok) {
        throw new Error("Failed to add patient");
      }
      const patientData = await patient.json();
      onSubmit?.(patientData);
      toast(
        `Patient ${data.first_name} ${data.last_name} created successfully.`,
        {
          description: "",
          action: {
            label: "ok",
            onClick: () => toast.dismiss(),
          },
          position: "top-center",
        }
      );
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  // 🧩 Field configuration array
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
              disabled={fieldDef.disabled}
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

        <div className="flex justify-end pt-2">
          <Button type="submit">Save Patient</Button>
        </div>
      </form>
    </Form>
  );
}
