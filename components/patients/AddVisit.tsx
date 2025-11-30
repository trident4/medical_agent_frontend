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

const visitSchema = z.object({
  patient_id: z.number().min(1),
  visit_type: z.string().min(1, "Enter visit type"),
  visit_date: z.string().min(1, "Enter the visit date"),
  chief_complaint: z.string().optional(),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  medications_prescribed: z.string().optional(),
  follow_up_instructions: z.string().optional(),
  doctor_notes: z.string().optional(),
  vital_signs: z.record(z.string(), z.union([z.string(), z.number()])),
  lab_results: z.array(
    z.object({
      test_name: z.string(),
      value: z.string(),
      unit: z.string().optional(),
      status: z.string().optional(),
    })
  ),
  duration_minutes: z.number().int().positive().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

export function AddVisitForm({
  onSubmit,
  patient_id,
}: {
  onSubmit?: (data: VisitFormData) => void;
  patient_id: number;
}) {
  const { post, loading, error, data } = useApi();

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patient_id: Number(patient_id) || 0, // ensure number, not string
      visit_type: "",
      visit_date: "",
      chief_complaint: "",
      symptoms: "",
      diagnosis: "",
      treatment_plan: "",
      medications_prescribed: "",
      follow_up_instructions: "",
      doctor_notes: "",
      vital_signs: {
        blood_pressure_systolic: 0,
        blood_pressure_diastolic: 0,
        heart_rate: 0,
        temperature: 0,
        respiratory_rate: 0,
        oxygen_saturation: 0,
        weight: 0,
        height: 0,
      }, // empty object for key-value pairs
      lab_results: [], // empty array of lab results
      duration_minutes: undefined, // optional field
    },
  });

  const onSubmitHandler = async (data: VisitFormData) => {
    try {
      // Clean up vital_signs: remove keys with invalid or empty values (only keep valid integers)
      // const cleanedVitalSigns = Object.fromEntries(
      //   Object.entries(data.vital_signs).filter(([key, value]) => {
      //     if (typeof value === "string") {
      //       const num = parseInt(value, 10);
      //       return !isNaN(num) && value.trim() !== "";
      //     }
      //     return typeof value === "number" && Number.isInteger(value);
      //   })
      // );
      // data.vital_signs = cleanedVitalSigns;
      console.log("The data is", data);
      let result = await post("/api/visits", data);
      onSubmit?.(result);
      toast(`Visit recorded successfully.`, {
        description: "",
        action: {
          label: "ok",
          onClick: () => toast.dismiss(),
        },
        position: "top-center",
      });
    } catch (e) {
      console.log("Error creating visit", e);
      toast(`Failed to record the visit data.`, {
        description: "",
        action: {
          label: "ok",
          onClick: () => toast.dismiss(),
        },
        position: "top-center",
      });
    }
  };

  const onError = (errors: any) => {
    console.error("❌ Validation failed:", errors);
  };

  // 🧩 Field configuration array
  const fields = [
    {
      name: "visit_type",
      label: "Visit Type",
      type: "text",
      required: true,
      disabled: false,
    },
    {
      name: "visit_date",
      label: "Visit Date",
      type: "date",
      required: true,
      disabled: false,
    },
    {
      name: "chief_complaint",
      label: "Chief Complaint",
      type: "textarea",
      disabled: false,
    },
    {
      name: "symptoms",
      label: "Symptoms",
      type: "textarea",
      disabled: false,
    },
    {
      name: "diagnosis",
      label: "Diagnosis",
      type: "textarea",
      disabled: false,
    },
    {
      name: "treatment_plan",
      label: "Treatment Plan",
      type: "textarea",
      disabled: false,
    },
    {
      name: "medications_prescribed",
      label: "Medications Prescribed",
      type: "textarea",
      disabled: false,
    },
    {
      name: "follow_up_instructions",
      label: "Follow-up Instructions",
      type: "textarea",
      disabled: false,
    },
    {
      name: "doctor_notes",
      label: "Doctor Notes",
      type: "textarea",
      disabled: false,
    },
    {
      name: "vital_signs",
      label: "Vital Signs",
      type: "keyValue",
      disabled: false,
    },
    {
      name: "lab_results",
      label: "Lab Results",
      type: "labResults",
      disabled: false,
    },
    {
      name: "duration_minutes",
      label: "Duration (minutes)",
      type: "number",
      disabled: false,
    },
  ] as const;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitHandler, onError)}
        className="space-y-4 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((fieldDef) => (
            <FormField
              key={fieldDef.name}
              control={form.control}
              disabled={fieldDef.disabled}
              name={fieldDef.name as keyof VisitFormData}
              render={({ field }) => (
                <FormItem
                  className={
                    fieldDef.type === "textarea" ||
                      fieldDef.type === "keyValue" ||
                      fieldDef.type === "labResults"
                      ? "col-span-2"
                      : ""
                  }
                >
                  <FormLabel>{fieldDef.label}</FormLabel>
                  <FormControl>
                    {fieldDef.type === "textarea" ? (
                      <Textarea
                        placeholder={fieldDef.label}
                        {...field}
                        value={(field.value as string) || ""}
                      />
                    ) : fieldDef.type === "keyValue" ? (
                      <div className="space-y-2">
                        {Object.entries((field.value as Record<string, string | number>) || {}).map(
                          ([key, val], i) => (
                            <div key={i} className="flex gap-3 items-center">
                              <Input
                                placeholder="Key"
                                value={key}
                                onChange={(e) => {
                                  const newEntries = Object.entries(
                                    (field.value as Record<string, string | number>) || {}
                                  );
                                  newEntries[i] = [e.target.value, val];
                                  field.onChange(
                                    Object.fromEntries(newEntries)
                                  );
                                }}
                              />
                              <Input
                                placeholder="Value"
                                value={val}
                                onChange={(e) => {
                                  const newEntries = Object.entries(
                                    (field.value as Record<string, string | number>) || {}
                                  );
                                  newEntries[i] = [key, e.target.value];
                                  field.onChange(
                                    Object.fromEntries(newEntries)
                                  );
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                onClick={() => {
                                  const newEntries = Object.entries(
                                    (field.value as Record<string, string | number>) || {}
                                  ).filter((_, idx) => idx !== i);
                                  field.onChange(
                                    Object.fromEntries(newEntries)
                                  );
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          )
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            field.onChange({
                              ...((field.value as Record<string, string | number>) || {}),
                              "": "",
                            })
                          }
                        >
                          + Add
                        </Button>
                      </div>
                    ) : fieldDef.type === "number" ? (
                      <Input
                        type="number"
                        placeholder={fieldDef.label}
                        value={(field.value as number | undefined) ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber
                          )
                        }
                      />
                    ) : fieldDef.type === "labResults" ? (
                      <div className="space-y-2">
                        {((field.value as any[]) || [])?.map((lab, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-5 gap-2 items-center"
                          >
                            <Input
                              placeholder="Test Name"
                              value={lab.test_name}
                              onChange={(e) => {
                                const updated = [...((field.value as any[]) || [])];
                                updated[i] = {
                                  ...lab,
                                  test_name: e.target.value,
                                };
                                field.onChange(updated);
                              }}
                            />
                            <Input
                              placeholder="Value"
                              value={lab.value}
                              onChange={(e) => {
                                const updated = [...((field.value as any[]) || [])];
                                updated[i] = { ...lab, value: e.target.value };
                                field.onChange(updated);
                              }}
                            />
                            <Input
                              placeholder="Unit (optional)"
                              value={lab.unit || ""}
                              onChange={(e) => {
                                const updated = [...((field.value as any[]) || [])];
                                updated[i] = { ...lab, unit: e.target.value };
                                field.onChange(updated);
                              }}
                            />
                            <Select
                              value={lab.status || ""}
                              onValueChange={(val) => {
                                const updated = [...((field.value as any[]) || [])];
                                updated[i] = { ...lab, status: val };
                                field.onChange(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {["normal", "elevated", "low", "critical"].map(
                                  (status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>

                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => {
                                const updated = ((field.value as any[]) || []).filter(
                                  (_, idx) => idx !== i
                                );
                                field.onChange(updated);
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            field.onChange([
                              ...((field.value as any[]) || []),
                              {
                                test_name: "",
                                value: "",
                                unit: "",
                                status: "",
                              },
                            ])
                          }
                        >
                          + Add Lab Result
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type={fieldDef.type}
                        placeholder={fieldDef.label}
                        value={(field.value as string | number | undefined) ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
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
          <Button type="submit"> {loading && <Spinner />}Save Visit</Button>
        </div>
      </form>
    </Form>
  );
}
