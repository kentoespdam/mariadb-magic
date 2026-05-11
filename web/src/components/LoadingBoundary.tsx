import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type LoadingVariant =
  | "list-skeleton"
  | "form-spinner"
  | "two-pane-split"
  | "report-skeleton"
  | "sse-empty"
  | "button-inline";

interface LoadingBoundaryProps {
  variant: LoadingVariant;
  className?: string;
  children?: React.ReactNode;
  spinner?: React.ReactNode;
}

function ListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

function FormSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-background/80",
        className,
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function TwoPaneSplit({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-4", className)}>
      <div className="w-1/3 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    </div>
  );
}

function ReportSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

function SseEmpty({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-muted",
        className,
      )}
    >
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse mb-2" />
      <span className="text-sm">Waiting for events...</span>
    </div>
  );
}

function ButtonInline({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent",
        className,
      )}
    />
  );
}

export function LoadingBoundary({
  variant,
  className,
  children,
  spinner,
}: LoadingBoundaryProps) {
  switch (variant) {
    case "list-skeleton":
      return <ListSkeleton className={className} />;
    case "form-spinner":
      return spinner ?? <FormSpinner className={className} />;
    case "two-pane-split":
      return <TwoPaneSplit className={className} />;
    case "report-skeleton":
      return <ReportSkeleton className={className} />;
    case "sse-empty":
      return <SseEmpty className={className} />;
    case "button-inline":
      return spinner ? spinner : <ButtonInline className={className} />;
    default:
      return <>{children}</>;
  }
}
