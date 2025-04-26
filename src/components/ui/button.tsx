import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils"; 

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "default" && "bg-black text-white hover:bg-gray-800",
        variant === "outline" && "border border-gray-300 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  );
}
