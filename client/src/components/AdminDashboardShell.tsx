import type { ComponentProps } from "react";
import { DashboardShell } from "./DashboardShell";
import "./AdminDashboardShell.css";

// Admin-only styling keeps customer and technician dashboards independent.
export function AdminDashboardShell(
  props: ComponentProps<typeof DashboardShell>,
) {
  return (
    <div className="admin-dashboard">
      <DashboardShell {...props} />
    </div>
  );
}
