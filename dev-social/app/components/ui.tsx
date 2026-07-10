import type { ReactNode } from "react";

export function Alert({
  children,
  id,
  tone = "error",
}: {
  children: ReactNode;
  id?: string;
  tone?: "error" | "success";
}) {
  return (
    <div
      id={id}
      className={`alert alert--${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {children ? <p className="muted">{children}</p> : null}
    </div>
  );
}

export function Avatar({
  src,
  name,
  size = "md",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const sizeClass = size === "md" ? "" : ` avatar--${size}`;

  return (
    <span
      className={`avatar${sizeClass}`}
      role={src ? undefined : "img"}
      aria-label={src ? undefined : `Avatar de ${name}`}
    >
      {src ? (
        // Supabase avatar URLs are user-controlled and already constrained by the avatar frame.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Avatar de ${name}`} />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(new Date(value));
}
