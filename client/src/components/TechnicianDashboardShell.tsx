import type { ComponentProps } from "react";
import { DashboardShell } from "./DashboardShell";
import "./TechnicianDashboardShell.css";

// Scope technician styling while reusing the existing dashboard layout.
export function TechnicianDashboardShell(
  props: ComponentProps<typeof DashboardShell>,
) {
  return (
    <div className="technician-dashboard">
      <DashboardShell {...props} />
    </div>
  );
}
