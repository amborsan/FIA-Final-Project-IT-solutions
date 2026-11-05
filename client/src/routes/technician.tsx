import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireRole } from "../components/RequireRole";

export const Route = createFileRoute("/technician")({
  component: TechnicianLayout,
});

function TechnicianLayout() {
  return (
    <RequireRole roles={["TECHNICIAN"]}>
      <Outlet />
    </RequireRole>
  );
}
