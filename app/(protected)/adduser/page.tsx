"use client";

import { useEffect } from "react";
import { AddUserForm } from "@/components/user/Adduser";
import { Toaster } from "sonner";
import { usePageTitle } from "@/contexts/PageTitleContext";

export default function AddUserPage() {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Add New User");
  }, [setPageTitle]);

  return (
    <div className="container mx-auto ">
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
