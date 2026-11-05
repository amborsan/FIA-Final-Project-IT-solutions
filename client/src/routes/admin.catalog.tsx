import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Product, ProductCategory, Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { DashboardShell } from "../components/DashboardShell";
import { PageLoader } from "../components/ui";
import { serviceIconOptions } from "../components/ServiceIcon";

export const Route = createFileRoute("/admin/catalog")({
  component: AdminCatalogPage,
});

const emptyService = {
  slug: "",
  nameEn: "",
  nameDe: "",
  descriptionEn: "",
  descriptionDe: "",
  icon: "network",
  startingPrice: "",
  sortOrder: "0",
  active: true,
};

const emptyProduct = {
  slug: "",
  sku: "",
  categoryId: "",
  nameEn: "",
  nameDe: "",
  descriptionEn: "",
  descriptionDe: "",
  price: "",
  stock: "0",
  imageUrl: "",
  active: true,
  featured: false,
};

function AdminCatalogPage() {
  const { t, pick, formatMoney } = useI18n();
  const nav = useAdminNav();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"services" | "products">("services");
  const [serviceForm, setServiceForm] = useState<typeof emptyService | null>(null);
  const [productForm, setProductForm] = useState<typeof emptyProduct | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const servicesQuery = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => api<{ services: Service[] }>("/services?all=true"),
  });
  const productsQuery = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => api<{ products: Product[] }>("/products?all=true"),
  });
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ categories: ProductCategory[] }>("/categories"),
  });

  const services = servicesQuery.data?.services ?? [];
  const products = productsQuery.data?.products ?? [];

  function startNewService() {
    setEditingServiceId(null);
    setServiceForm({ ...emptyService });
  }

  function editService(service: Service) {
    setEditingServiceId(service.id);
    setServiceForm({
      slug: service.slug,
      nameEn: service.nameEn,
      nameDe: service.nameDe,
      descriptionEn: service.descriptionEn,
      descriptionDe: service.descriptionDe,
      icon: service.icon,
      startingPrice: service.startingPrice ? String(service.startingPrice) : "",
      sortOrder: String(service.sortOrder),
      active: service.active,
    });
  }

  async function saveService(event: React.FormEvent) {
    event.preventDefault();
    if (!serviceForm) return;
    setBusy(true);
    setError("");
    try {
      const body = {
        ...serviceForm,
        startingPrice: serviceForm.startingPrice ? Number(serviceForm.startingPrice) : undefined,
        sortOrder: Number(serviceForm.sortOrder),
      };
      if (editingServiceId) {
        await api(`/services/${editingServiceId}`, { method: "PATCH", body });
      } else {
        await api("/services", { method: "POST", body });
      }
      setMessage(t("admin.serviceSaved"));
      setServiceForm(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      await queryClient.invalidateQueries({ queryKey: ["services"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy(false);
    }
  }

  async function archiveService(id: string) {
    if (!window.confirm(t("admin.deleteConfirm"))) return;
    try {
      await api(`/services/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      await queryClient.invalidateQueries({ queryKey: ["services"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  function startNewProduct() {
    setEditingProductId(null);
    setProductForm({
      ...emptyProduct,
      categoryId: categoriesQuery.data?.categories[0]?.id ?? "",
    });
  }

  function editProduct(product: Product) {
    setEditingProductId(product.id);
    setProductForm({
      slug: product.slug,
      sku: product.sku,
      categoryId: product.categoryId,
      nameEn: product.nameEn,
      nameDe: product.nameDe,
      descriptionEn: product.descriptionEn,
      descriptionDe: product.descriptionDe,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl ?? "",
      active: product.active,
      featured: product.featured,
    });
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    if (!productForm) return;
    setBusy(true);
    setError("");
    try {
      const body = {
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      };
      if (editingProductId) {
        await api(`/products/${editingProductId}`, { method: "PATCH", body });
      } else {
        await api("/products", { method: "POST", body });
      }
      setMessage(t("admin.productSaved"));
      setProductForm(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    } finally {
      setBusy(false);
    }
  }

  async function archiveProduct(id: string) {
    if (!window.confirm(t("admin.deleteConfirm"))) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (caught) {
      setError(errorMessage(caught, t("common.error")));
    }
  }

  return (
    <DashboardShell
      nav={nav}
      title={t("admin.catalog")}
      subtitle={`${services.length} ${t("admin.services").toLowerCase()} · ${products.length} ${t("admin.products").toLowerCase()}`}
      actions={
        tab === "services" ? (
          <button onClick={startNewService} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> {t("admin.addService")}
          </button>
        ) : (
          <button onClick={startNewProduct} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> {t("admin.addProduct")}
          </button>
        )
      }
    >
      {message && <div className="alert alert-success mb-4 text-sm">{message}</div>}
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      <div role="tablist" className="tabs tabs-boxed mb-5 w-fit">
        <button
          role="tab"
          className={`tab ${tab === "services" ? "tab-active" : ""}`}
          onClick={() => setTab("services")}
        >
          {t("admin.services")}
        </button>
        <button
          role="tab"
          className={`tab ${tab === "products" ? "tab-active" : ""}`}
          onClick={() => setTab("products")}
        >
          {t("admin.products")}
        </button>
      </div>

      {tab === "services" && (
        <>
          {serviceForm && (
            <form onSubmit={saveService} className="mb-5 rounded-box border border-base-300 bg-base-100 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">
                  {editingServiceId ? t("admin.editService") : t("admin.addService")}
                </h2>
                <button type="button" onClick={() => setServiceForm(null)} className="btn btn-ghost btn-xs">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.slug")}</span>
                  <input
                    required
                    value={serviceForm.slug}
                    onChange={(event) => setServiceForm({ ...serviceForm, slug: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.icon")}</span>
                  <select
                    value={serviceForm.icon}
                    onChange={(event) => setServiceForm({ ...serviceForm, icon: event.target.value })}
                    className="select select-bordered select-sm w-full"
                  >
                    {serviceIconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.titleEn")}</span>
                  <input
                    required
                    value={serviceForm.nameEn}
                    onChange={(event) => setServiceForm({ ...serviceForm, nameEn: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.titleDe")}</span>
                  <input
                    required
                    value={serviceForm.nameDe}
                    onChange={(event) => setServiceForm({ ...serviceForm, nameDe: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("common.description")} EN</span>
                  <textarea
                    required
                    rows={3}
                    value={serviceForm.descriptionEn}
                    onChange={(event) =>
                      setServiceForm({ ...serviceForm, descriptionEn: event.target.value })
                    }
                    className="textarea textarea-bordered w-full text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("common.description")} DE</span>
                  <textarea
                    required
                    rows={3}
                    value={serviceForm.descriptionDe}
                    onChange={(event) =>
                      setServiceForm({ ...serviceForm, descriptionDe: event.target.value })
                    }
                    className="textarea textarea-bordered w-full text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.startingPrice")}</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={serviceForm.startingPrice}
                    onChange={(event) =>
                      setServiceForm({ ...serviceForm, startingPrice: event.target.value })
                    }
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.sortOrder")}</span>
                  <input
                    type="number"
                    min={0}
                    value={serviceForm.sortOrder}
                    onChange={(event) => setServiceForm({ ...serviceForm, sortOrder: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={serviceForm.active}
                    onChange={(event) => setServiceForm({ ...serviceForm, active: event.target.checked })}
                  />
                  {t("common.active")}
                </label>
              </div>
              <button disabled={busy} className="btn btn-primary btn-sm mt-4">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("admin.save")}
              </button>
            </form>
          )}

          {servicesQuery.isLoading && <PageLoader />}
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("admin.slug")}</th>
                  <th>{t("admin.startingPrice")}</th>
                  <th>{t("common.status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="font-semibold">{pick(service.nameEn, service.nameDe)}</td>
                    <td className="font-mono text-[11px]">{service.slug}</td>
                    <td className="text-xs">
                      {service.startingPrice ? formatMoney(service.startingPrice) : "–"}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${service.active ? "badge-success" : "badge-ghost"}`}>
                        {service.active ? t("common.active") : t("common.inactive")}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => editService(service)} className="btn btn-ghost btn-xs">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void archiveService(service.id)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "products" && (
        <>
          {productForm && (
            <form onSubmit={saveProduct} className="mb-5 rounded-box border border-base-300 bg-base-100 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold">
                  {editingProductId ? t("admin.editProduct") : t("admin.addProduct")}
                </h2>
                <button type="button" onClick={() => setProductForm(null)} className="btn btn-ghost btn-xs">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.slug")}</span>
                  <input
                    required
                    value={productForm.slug}
                    onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.sku")}</span>
                  <input
                    required
                    value={productForm.sku}
                    onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.categories")}</span>
                  <select
                    required
                    value={productForm.categoryId}
                    onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}
                    className="select select-bordered select-sm w-full"
                  >
                    <option value="">–</option>
                    {(categoriesQuery.data?.categories ?? []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {pick(category.nameEn, category.nameDe)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.imageUrl")}</span>
                  <input
                    value={productForm.imageUrl}
                    onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.titleEn")}</span>
                  <input
                    required
                    value={productForm.nameEn}
                    onChange={(event) => setProductForm({ ...productForm, nameEn: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.titleDe")}</span>
                  <input
                    required
                    value={productForm.nameDe}
                    onChange={(event) => setProductForm({ ...productForm, nameDe: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("common.description")} EN</span>
                  <textarea
                    required
                    rows={3}
                    value={productForm.descriptionEn}
                    onChange={(event) =>
                      setProductForm({ ...productForm, descriptionEn: event.target.value })
                    }
                    className="textarea textarea-bordered w-full text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("common.description")} DE</span>
                  <textarea
                    required
                    rows={3}
                    value={productForm.descriptionDe}
                    onChange={(event) =>
                      setProductForm({ ...productForm, descriptionDe: event.target.value })
                    }
                    className="textarea textarea-bordered w-full text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("common.price")} (EUR)</span>
                  <input
                    required
                    type="number"
                    min={0}
                    step={0.01}
                    value={productForm.price}
                    onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">{t("admin.stock")}</span>
                  <input
                    required
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                    className="input input-bordered input-sm w-full"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={productForm.active}
                    onChange={(event) => setProductForm({ ...productForm, active: event.target.checked })}
                  />
                  {t("common.active")}
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={productForm.featured}
                    onChange={(event) => setProductForm({ ...productForm, featured: event.target.checked })}
                  />
                  {t("admin.featured")}
                </label>
              </div>
              <button disabled={busy} className="btn btn-primary btn-sm mt-4">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("admin.save")}
              </button>
            </form>
          )}

          {productsQuery.isLoading && <PageLoader />}
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("admin.sku")}</th>
                  <th>{t("common.category")}</th>
                  <th>{t("common.price")}</th>
                  <th>{t("admin.stock")}</th>
                  <th>{t("common.status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-semibold">{pick(product.nameEn, product.nameDe)}</td>
                    <td className="font-mono text-[11px]">{product.sku}</td>
                    <td className="text-xs">{product.category ? pick(product.category.nameEn, product.category.nameDe) : "–"}</td>
                    <td className="text-xs">{formatMoney(product.price)}</td>
                    <td className={`text-xs ${product.stock <= 3 ? "font-bold text-warning" : ""}`}>
                      {product.stock}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${product.active ? "badge-success" : "badge-ghost"}`}>
                        {product.active ? t("common.active") : t("common.inactive")}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => editProduct(product)} className="btn btn-ghost btn-xs">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void archiveProduct(product.id)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
