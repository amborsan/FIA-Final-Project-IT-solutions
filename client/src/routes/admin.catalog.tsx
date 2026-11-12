import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import type { Product, ProductCategory, Service } from "../lib/types";
import { useI18n } from "../i18n/I18nContext";
import { useAdminNav } from "../components/nav";
import { AdminDashboardShell as DashboardShell } from "../components/AdminDashboardShell";
import {
  ArchiveTabs,
  ListToolbar,
  Pagination,
  SearchField,
} from "../components/ListControls";
import { EmptyState, PageLoader } from "../components/ui";
import {
  filterByArchive,
  matchesSearch,
  paginate,
  useListControls,
} from "../lib/list";
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
  const serviceControls = useListControls();
  const productControls = useListControls();
  const [tab, setTab] = useState<"services" | "products">("services");
  const [serviceForm, setServiceForm] = useState<typeof emptyService | null>(
    null,
  );
  const [productForm, setProductForm] = useState<typeof emptyProduct | null>(
    null,
  );
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

  const filteredServices = filterByArchive(
    services.filter((service) =>
      matchesSearch(
        serviceControls.search,
        service.nameEn,
        service.nameDe,
        service.slug,
        service.icon,
      ),
    ),
    serviceControls.archive,
    (service) => !service.active,
  );
  const servicePage = paginate(
    filteredServices,
    serviceControls.page,
    serviceControls.pageSize,
  );

  const filteredProducts = filterByArchive(
    products.filter((product) =>
      matchesSearch(
        productControls.search,
        product.nameEn,
        product.nameDe,
        product.sku,
        product.slug,
        product.category?.nameEn,
        product.category?.nameDe,
      ),
    ),
    productControls.archive,
    (product) => !product.active,
  );
  const productPage = paginate(
    filteredProducts,
    productControls.page,
    productControls.pageSize,
  );

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
        startingPrice: serviceForm.startingPrice
          ? Number(serviceForm.startingPrice)
          : undefined,
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
          <Button
            onClick={startNewService}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
            )}
          >
            <Plus className="h-4 w-4" /> {t("admin.addService")}
          </Button>
        ) : (
          <Button
            onClick={startNewProduct}
            className={cn(
              " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm",
            )}
          >
            <Plus className="h-4 w-4" /> {t("admin.addProduct")}
          </Button>
        )
      }
    >
      {message && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-success text-success-content border-success mb-4 text-sm",
          )}
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert
          className={cn(
            "flex flex-col items-start gap-4 rounded-box border border-base-300 bg-base-200 p-4 sm:flex-row sm:items-center bg-error text-error-content border-error mb-4 text-sm",
          )}
        >
          {error}
        </Alert>
      )}

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "services" | "products")}
        className="mb-5 w-fit"
      >
        <TabsList className="h-10 rounded-box bg-base-200 p-1">
          <TabsTrigger
            value="services"
            className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-content"
          >
            {t("admin.services")}
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-content"
          >
            {t("admin.products")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "services" && (
        <>
          {serviceForm && (
            <form
              onSubmit={saveService}
              className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium">
                  {editingServiceId
                    ? t("admin.editService")
                    : t("admin.addService")}
                </h2>
                <Button
                  type="button"
                  onClick={() => setServiceForm(null)}
                  className={cn(
                    " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                  )}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.slug")}
                  </span>
                  <Input
                    required
                    value={serviceForm.slug}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        slug: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.icon")}
                  </span>
                  <NativeSelect
                    value={serviceForm.icon}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        icon: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  >
                    {serviceIconOptions.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.titleEn")}
                  </span>
                  <Input
                    required
                    value={serviceForm.nameEn}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        nameEn: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.titleDe")}
                  </span>
                  <Input
                    required
                    value={serviceForm.nameDe}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        nameDe: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("common.description")} EN
                  </span>
                  <Textarea
                    required
                    rows={3}
                    value={serviceForm.descriptionEn}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        descriptionEn: event.target.value,
                      })
                    }
                    className={cn(" w-full text-sm")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("common.description")} DE
                  </span>
                  <Textarea
                    required
                    rows={3}
                    value={serviceForm.descriptionDe}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        descriptionDe: event.target.value,
                      })
                    }
                    className={cn(" w-full text-sm")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.startingPrice")}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={serviceForm.startingPrice}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        startingPrice: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.sortOrder")}
                  </span>
                  <Input
                    type="number"
                    min={0}
                    value={serviceForm.sortOrder}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        sortOrder: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
                  <input
                    type="checkbox"
                    className={cn(
                      "appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-5",
                    )}
                    checked={serviceForm.active}
                    onChange={(event) =>
                      setServiceForm({
                        ...serviceForm,
                        active: event.target.checked,
                      })
                    }
                  />
                  {t("common.active")}
                </label>
              </div>
              <Button
                disabled={busy}
                className={cn(
                  " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm mt-4",
                )}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("admin.save")}
              </Button>
            </form>
          )}

          {servicesQuery.isLoading && <PageLoader />}

          <ListToolbar>
            <SearchField
              value={serviceControls.search}
              onChange={serviceControls.setSearch}
              placeholder={t("list.searchCatalog")}
            />
            <ArchiveTabs
              value={serviceControls.archive}
              onChange={serviceControls.setArchive}
            />
          </ListToolbar>

          {!servicesQuery.isLoading && servicePage.total === 0 && (
            <div className="mt-5">
              <EmptyState title={t("admin.noResults")} />
            </div>
          )}

          {servicePage.total > 0 && (
            <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <Table
                className={cn(" [&_tbody_tr:nth-child(even)]:bg-base-200")}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.title")}</TableHead>
                    <TableHead>{t("admin.slug")}</TableHead>
                    <TableHead>{t("admin.startingPrice")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicePage.items.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-semibold">
                        {pick(service.nameEn, service.nameDe)}
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">
                        {service.slug}
                      </TableCell>
                      <TableCell className="text-xs">
                        {service.startingPrice
                          ? formatMoney(service.startingPrice)
                          : "–"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            ` h-5 text-xs ${service.active ? "bg-success text-success-content border-success" : "bg-base-200 text-base-content"}`,
                          )}
                        >
                          {service.active
                            ? t("common.active")
                            : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => editService(service)}
                            className={cn(
                              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                            )}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => void archiveService(service.id)}
                            className={cn(
                              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs text-error",
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Pagination
            page={servicePage.page}
            totalPages={servicePage.totalPages}
            from={servicePage.from}
            to={servicePage.to}
            total={servicePage.total}
            pageSize={serviceControls.pageSize}
            onPageChange={serviceControls.setPage}
            onPageSizeChange={serviceControls.setPageSize}
          />
        </>
      )}

      {tab === "products" && (
        <>
          {productForm && (
            <form
              onSubmit={saveProduct}
              className="mb-5 rounded-box border border-base-300 bg-base-100 p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium">
                  {editingProductId
                    ? t("admin.editProduct")
                    : t("admin.addProduct")}
                </h2>
                <Button
                  type="button"
                  onClick={() => setProductForm(null)}
                  className={cn(
                    " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                  )}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.slug")}
                  </span>
                  <Input
                    required
                    value={productForm.slug}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        slug: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.sku")}
                  </span>
                  <Input
                    required
                    value={productForm.sku}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        sku: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.categories")}
                  </span>
                  <NativeSelect
                    required
                    value={productForm.categoryId}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        categoryId: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  >
                    <option value="">–</option>
                    {(categoriesQuery.data?.categories ?? []).map(
                      (category) => (
                        <option key={category.id} value={category.id}>
                          {pick(category.nameEn, category.nameDe)}
                        </option>
                      ),
                    )}
                  </NativeSelect>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.imageUrl")}
                  </span>
                  <Input
                    value={productForm.imageUrl}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        imageUrl: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.titleEn")}
                  </span>
                  <Input
                    required
                    value={productForm.nameEn}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        nameEn: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.titleDe")}
                  </span>
                  <Input
                    required
                    value={productForm.nameDe}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        nameDe: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("common.description")} EN
                  </span>
                  <Textarea
                    required
                    rows={3}
                    value={productForm.descriptionEn}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        descriptionEn: event.target.value,
                      })
                    }
                    className={cn(" w-full text-sm")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("common.description")} DE
                  </span>
                  <Textarea
                    required
                    rows={3}
                    value={productForm.descriptionDe}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        descriptionDe: event.target.value,
                      })
                    }
                    className={cn(" w-full text-sm")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("common.price")} (EUR)
                  </span>
                  <Input
                    required
                    type="number"
                    min={0}
                    step={0.01}
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">
                    {t("admin.stock")}
                  </span>
                  <Input
                    required
                    type="number"
                    min={0}
                    value={productForm.stock}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        stock: event.target.value,
                      })
                    }
                    className={cn(" h-8 text-xs w-full")}
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    className={cn(
                      "appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-5",
                    )}
                    checked={productForm.active}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        active: event.target.checked,
                      })
                    }
                  />
                  {t("common.active")}
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    className={cn(
                      "appearance-auto accent-primary size-6 shrink-0 rounded-field border border-input focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary size-5",
                    )}
                    checked={productForm.featured}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        featured: event.target.checked,
                      })
                    }
                  />
                  {t("admin.featured")}
                </label>
              </div>
              <Button
                disabled={busy}
                className={cn(
                  " bg-primary text-primary-content border-primary hover:bg-primary-hover h-8 px-3 text-sm mt-4",
                )}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("admin.save")}
              </Button>
            </form>
          )}

          {productsQuery.isLoading && <PageLoader />}

          <ListToolbar>
            <SearchField
              value={productControls.search}
              onChange={productControls.setSearch}
              placeholder={t("list.searchCatalog")}
            />
            <ArchiveTabs
              value={productControls.archive}
              onChange={productControls.setArchive}
            />
          </ListToolbar>

          {!productsQuery.isLoading && productPage.total === 0 && (
            <div className="mt-5">
              <EmptyState title={t("admin.noResults")} />
            </div>
          )}

          {productPage.total > 0 && (
            <div className="mt-5 overflow-x-auto rounded-box border border-base-300 bg-base-100">
              <Table
                className={cn(" [&_tbody_tr:nth-child(even)]:bg-base-200")}
              >
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.title")}</TableHead>
                    <TableHead>{t("admin.sku")}</TableHead>
                    <TableHead>{t("common.category")}</TableHead>
                    <TableHead>{t("common.price")}</TableHead>
                    <TableHead>{t("admin.stock")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPage.items.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-semibold">
                        {pick(product.nameEn, product.nameDe)}
                      </TableCell>
                      <TableCell className="tabular-nums text-xs">
                        {product.sku}
                      </TableCell>
                      <TableCell className="text-xs">
                        {product.category
                          ? pick(
                              product.category.nameEn,
                              product.category.nameDe,
                            )
                          : "–"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatMoney(product.price)}
                      </TableCell>
                      <TableCell
                        className={`text-xs ${product.stock <= 3 ? "font-medium text-warning" : ""}`}
                      >
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            ` h-5 text-xs ${product.active ? "bg-success text-success-content border-success" : "bg-base-200 text-base-content"}`,
                          )}
                        >
                          {product.active
                            ? t("common.active")
                            : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => editProduct(product)}
                            className={cn(
                              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs",
                            )}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => void archiveProduct(product.id)}
                            className={cn(
                              " border-transparent bg-transparent text-base-content hover:bg-base-content/10 h-6 px-2 text-xs text-error",
                            )}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Pagination
            page={productPage.page}
            totalPages={productPage.totalPages}
            from={productPage.from}
            to={productPage.to}
            total={productPage.total}
            pageSize={productControls.pageSize}
            onPageChange={productControls.setPage}
            onPageSizeChange={productControls.setPageSize}
          />
        </>
      )}
    </DashboardShell>
  );
}
