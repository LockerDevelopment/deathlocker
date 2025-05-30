import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" &&
          "bg-primary text-white hover:bg-secondary shadow",
        variant === "outline" &&
          "border border-primary text-primary hover:bg-gray-800 hover:text-accent hover:border-accent",
        className
      )}
      {...props}
    />
  );
}