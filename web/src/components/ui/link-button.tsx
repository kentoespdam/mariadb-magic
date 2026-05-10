import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface LinkButtonProps extends ButtonHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <a
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </a>
  );
}