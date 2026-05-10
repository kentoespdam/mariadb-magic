"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        sidebar: "flex-col gap-1 bg-surface-subtle p-1.5 w-60",
        default: "gap-1 bg-muted p-[3px] rounded-lg",
        line: "gap-0 bg-transparent border-b-2 border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded border border-transparent px-3 py-2 text-[14px] font-medium whitespace-nowrap text-text-secondary transition-all focus-visible:border-primary focus-visible:ring-[2px] focus-visible:ring-primary/30 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=sidebar]/tabs-list:w-full group-data-[variant=sidebar]/tabs-list:justify-start group-data-[variant=sidebar]/tabs-list:text-left group-data-[variant=sidebar]/tabs-list:data-active:bg-background group-data-[variant=sidebar]/tabs-list:data-active:border-border group-data-[variant=sidebar]/tabs-list:data-active:border-l-2 group-data-[variant=sidebar]/tabs-list:data-active:text-primary group-data-[variant=sidebar]/tabs-list:data-active:border-primary group-data-[variant=sidebar]/tabs-list:hover:bg-muted",
        "group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:hover:text-foreground",
        "group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:data-active:border-primary group-data-[variant=line]/tabs-list:data-active:text-primary group-data-[variant=line]/tabs-list:hover:text-primary",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants };
