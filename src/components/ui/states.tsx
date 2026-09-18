"use client";

import { cn } from "@/lib/utils";

type EmptyProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyProps) {
  return (
    <div className={cn("card px-6 py-12 text-center", className)}>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card px-6 py-10 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-primary mt-4" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
