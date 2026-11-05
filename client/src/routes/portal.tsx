import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireRole } from "../components/RequireRole";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <RequireRole roles={["CUSTOMER"]}>
      <Outlet />
    </RequireRole>
  );
}
