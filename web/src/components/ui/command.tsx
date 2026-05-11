"use client";

import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Command = CommandPrimitive;

export const CommandInput = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  </div>
);

export const CommandList = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
);

export const CommandEmpty = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
);

export const CommandGroup = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    className={cn("relative overflow-hidden p-1", className)}
    {...props}
  />
);

export const CommandItem = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  />
);
