import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireRole } from "../components/RequireRole";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RequireRole roles={["ADMIN"]}>
      <Outlet />
    </RequireRole>
  );
}
