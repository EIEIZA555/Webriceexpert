import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  if (title || Icon || action) {
    return (
      <Card
        className={`p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center ${className ?? ""}`}
      >
        {Icon && (
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-10 h-10 text-emerald-600" />
          </div>
        )}
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        {(description || message) && (
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {description ?? message}
          </p>
        )}
        {action}
      </Card>
    );
  }

  return (
    <Card
      className={`p-8 rounded-xl text-center text-muted-foreground text-sm ${className ?? ""}`}
    >
      {message}
    </Card>
  );
}
