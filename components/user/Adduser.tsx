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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { useApi } from "@/lib/hooks/api";
import { Spinner } from "@/components/ui/spinner";

enum UserRole {
  DOCTOR = "doctor",
  NURSE = "nurse",
  ADMIN = "admin",
}

const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  full_name: z
    .string()
    .max(100, "Full name must be at most 100 characters")
    .optional(),
  role: z.nativeEnum(UserRole),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

type UserFormData = z.infer<typeof userSchema>;

interface AddUserFormProps {
  onSubmit?: (data: UserFormData) => void;
}

export function AddUserForm({ onSubmit }: AddUserFormProps) {
  const { post, loading, error, data } = useApi();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      full_name: "",
      role: UserRole.DOCTOR,
      password: "",
    },
  });

  const onSubmitHandler = async (data: UserFormData) => {
    try {
      let result = await post("/api/users", data);
      toast(`User created successfully.`, {
        description: "",
        action: { label: "ok", onClick: () => toast.dismiss() },
        position: "top-center",
      });
      onSubmit?.(result);
    } catch (error: any) {
      let errorMessage = "Failed to create user.";
      try {
        // Parse the error string directly since it's JSON
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.error || errorMessage;
      } catch (parseError) {
        // If parsing fails, use the error as is
        errorMessage = error || errorMessage;
      }

      toast(`Failed to create user.`, {
        description: errorMessage,
        action: { label: "ok", onClick: () => toast.dismiss() },
        position: "top-center",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() +
                            role.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full">
            {loading && <Spinner />}
            Create User
          </Button>
        </form>
      </Form>
      <Toaster />
    </>
  );
}
