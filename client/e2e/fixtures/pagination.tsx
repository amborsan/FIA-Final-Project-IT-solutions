// Test-only numeric records exercise the real list controls without API or auth mocks.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider, useI18n } from "../../src/i18n/I18nContext";
import { Pagination, SearchField } from "../../src/components/ListControls";
import { paginate, useListControls } from "../../src/lib/list";
import "../../src/index.css";
import "../../src/components/AdminDashboardShell.css";
import "../../src/components/CustomerPortalShell.css";
import "../../src/components/TechnicianDashboardShell.css";

const records = Array.from({ length: 200 }, (_, index) => index + 1);
const scope = new URLSearchParams(location.search).get("scope") ?? "admin-dashboard";

function Fixture() {
  const { t } = useI18n();
  const controls = useListControls();
  const data = paginate(records.filter(value => String(value).includes(controls.search)), controls.page, controls.pageSize);
  return <div className={scope}><main className="p-4 sm:p-8">
    <div data-slot="dashboard-content">
      <div><h1>{t("list.pagination")}</h1></div>
      <SearchField value={controls.search} onChange={controls.setSearch} placeholder={t("list.searchActivity")} />
      <ol data-testid="records" className="grid grid-cols-5 gap-2 py-4">{data.items.map(value => <li key={value}>{value}</li>)}</ol>
      <Pagination {...data} pageSize={controls.pageSize} onPageChange={controls.setPage} onPageSizeChange={controls.setPageSize} />
    </div>
  </main></div>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><I18nProvider><Fixture /></I18nProvider></StrictMode>);
