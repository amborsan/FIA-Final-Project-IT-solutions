import type { ComponentProps } from "react";
import { DashboardShell } from "./DashboardShell";
import "./CustomerPortalShell.css";

// Scope the customer visual system without changing the staff dashboard shell.
export function CustomerPortalShell(
  props: ComponentProps<typeof DashboardShell>,
) {
  return (
    <div className="customer-portal">
      <DashboardShell {...props} />
    </div>
  );
}
