"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const sizeMap = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

export function Avatar({ src, name, className, size = "md", children }: AvatarProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", sizeMap[size], className)}>
        <img
          src={src}
          alt={name || "User"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (children) {
    return (
      <div className={cn("relative flex shrink-0 overflow-hidden rounded-full", sizeMap[size], className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium", sizeMap[size], className)}>
      {initials}
    </div>
  );
}

export function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement> & { className?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props}>
      {children}
    </span>
  );
}
