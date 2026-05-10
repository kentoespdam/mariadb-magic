import { Database, GitBranch, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

interface EmptyStateProps {
  icon?: "database" | "profile" | "session";
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

const ICONS = {
  database: Database,
  profile: GitBranch,
  session: PlayCircle,
};

export function EmptyState({ icon = "database", title, description, action }: EmptyStateProps) {
  const Icon = ICONS[icon];

  return (
    <Card className="border border-border bg-surface-subtle">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-text-secondary" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-text">{title}</h3>
        <p className="mb-6 max-w-sm text-sm text-text-secondary">{description}</p>
        {action && <LinkButton href={action.href}>{action.label}</LinkButton>}
      </CardContent>
    </Card>
  );
}
