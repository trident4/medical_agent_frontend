"use client";

import { AddUserForm } from "@/components/user/Adduser";
import { Toaster } from "sonner";

export default function AddUserPage() {
  return (
    <div className="container mx-auto ">
      <h1 className="text-3xl font-bold mb-6">Add New User</h1>
      <div className="max-w-md">
        <AddUserForm
          onSubmit={() => {
            // Handle success, e.g., redirect or show message
          }}
        />
      </div>
    </div>
  );
}
