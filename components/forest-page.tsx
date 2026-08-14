import type { ReactNode } from "react";

export default function ForestPage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="page-forest">
      <div className="forest-glow" />
      <div className={`relative z-10 min-h-screen ${className}`}>{children}</div>
    </div>
  );
}
