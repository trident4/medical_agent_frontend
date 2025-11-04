"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

type FormDialogProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dialogSize?: DialogSize;
};

export function FormDialog({
  title,
  description,
  trigger,
  children,
  open,
  onOpenChange,
  dialogSize = "md",
}: FormDialogProps) {
  // Map size to Tailwind width classes
  const sizeClasses: Record<DialogSize, string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={`w-full ${sizeClasses[dialogSize]} max-h-[80vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
