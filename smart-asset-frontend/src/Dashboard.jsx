import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Computer,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  ShieldCheck,
  Sun,
  TrendingUp,
  Wrench,
  X,
} from "lucide-react";
import api from "./services/api";

const statCards = [
  { label: "Total assets", icon: Package, tone: "bg-violet-50 text-violet-700", caption: "All registered assets" },
  { label: "Available", icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700", caption: "Ready for assignment" },
  { label: "Assigned", icon: ArrowUpRight, tone: "bg-blue-50 text-blue-700", caption: "Currently in use" },
  { label: "Maintenance", icon: Wrench, tone: "bg-amber-50 text-amber-700", caption: "Needs attention" },
];

function StatusSummary({ counts, loading }) {
  const total = counts.available + counts.assigned + counts.maintenance;
  const rows = [
    { label: "Available", count: counts.available, color: "bg-emerald-500" },
    { label: "Assigned", count: counts.assigned, color: "bg-blue-500" },
    { label: "Maintenance", count: counts.maintenance, color: "bg-amber-500" },
  ];

  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-gray-900">Asset status</h3>
      <p className="mt-1 text-xs text-gray-500">Loaded records by status</p>
      <div className="mt-5 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-gray-600">{row.label}</span>
              <span className="font-semibold text-gray-800">{loading ? "—" : row.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${row.color}`}
                style={{ width: loading || !total ? "0%" : `${(row.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewPanel({ assets, loading, pagination, counts, inventoryValue, ...tableProps }) {
  const values = [pagination?.total ?? assets.length, counts.available, counts.assigned, counts.maintenance];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <section key={stat.label} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{loading ? "—" : values[index]}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon size={21} />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">{stat.caption}</p>
            </section>
          );
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AssetTable assets={assets} loading={loading} pagination={pagination} {...tableProps} />
        </div>
        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Inventory value</h3>
                <p className="mt-1 text-xs text-gray-500">Current loaded page</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <TrendingUp size={20} />
              </div>
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-gray-900">{loading ? "—" : formatCurrency(inventoryValue)}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Boxes size={15} />
              Based on loaded asset records
            </div>
          </section>
          <StatusSummary counts={counts} loading={loading} />
          <section className="rounded-2xl bg-emerald-800 p-5 text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <h3 className="font-semibold">AssetFlow workspace</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-50/80">Keep your equipment records organized and up to date.</p>
            <button
              onClick={tableProps.onCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50"
            >
              <Plus size={15} />
              Register an asset
            </button>
          </section>
        </div>
      </div>
    </>
  );
}

function ModulePlaceholder({ page, onOpenAssets }) {
  const Icon = page === "Assignments" ? ClipboardList : Wrench;
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
      <Icon size={35} className="mx-auto text-emerald-700" />
      <h3 className="mt-4 text-lg font-bold text-gray-900">{page} module</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        This module is planned for the next development phase. For now, you can manage assets from the inventory page.
      </p>
      <button
        onClick={onOpenAssets}
        className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        Go to asset inventory
      </button>
    </section>
  );
}

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Assets", icon: Boxes },
  { label: "Assignments", icon: ClipboardList },
  { label: "Maintenance", icon: Wrench },
];

function Sidebar({ activePage, setActivePage, mobileOpen, closeMobile, user, onLogout }) {
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation" onClick={closeMobile} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Building2 size={22} />
          </div>
          <div>
            <p className="font-bold tracking-tight text-gray-900">AssetFlow</p>
            <p className="text-xs text-gray-500">Asset management</p>
          </div>
          <button
            aria-label="Close navigation"
            onClick={closeMobile}
            className="ml-auto rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">Workspace</p>
          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setActivePage(label);
                  closeMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${activePage === label ? "bg-emerald-50 text-emerald-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                <Icon size={19} />
                {label}
                {label === "Assets" && <ChevronRight size={15} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8 px-4">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">Preferences</p>
          <button
            onClick={() => alert("Settings will be added in a later phase.")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Settings size={19} />
            Settings
          </button>
          <button
            onClick={() => alert("Help center will be added in a later phase.")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <CircleHelp size={19} />
            Help center
          </button>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-emerald-800">
              <ShieldCheck size={19} />
              <span className="text-sm font-semibold">Workspace status</span>
            </div>
            <p className="text-xs leading-5 text-emerald-800/80">Your local asset workspace is ready to use.</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Development mode
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">GA</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{user?.name || "Administrator"}</p>
              <p className="truncate text-xs text-gray-500">{user?.email || "Local workspace"}</p>
            </div>
            <button aria-label="Log out" className="rounded-lg p-2 text-gray-500 transition hover:bg-white hover:text-gray-900" onClick={onLogout}>
              <LogOut size={17} className="text-gray-400" />
            </button>

          </div>
        </div>
      </aside>
    </>
  );
}

const emptyForm = {
  asset_code: "",
  name: "",
  category: "Computer",
  brand: "",
  serial_number: "",
  status: "available",
  purchase_date: "",
  purchase_cost: "",
  description: "",
};

const fields = [
  { name: "asset_code", label: "Asset code", required: true },
  { name: "name", label: "Asset name", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Computer", "Laptop", "Monitor", "Printer", "Furniture", "Other"],
  },
  { name: "brand", label: "Brand" },
  { name: "serial_number", label: "Serial number" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["available", "assigned", "maintenance"],
  },
  { name: "purchase_date", label: "Purchase date", type: "date" },
  { name: "purchase_cost", label: "Purchase cost (PHP)", type: "number" },
];

function AssetModal({ asset, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...(asset || {}),
    purchase_date: asset?.purchase_date?.slice(0, 10) || "",
    purchase_cost: asset?.purchase_cost ?? "",
  }));
  const [formError, setFormError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    try {
      await onSave({
        ...form,
        purchase_cost: form.purchase_cost === "" ? null : Number(form.purchase_cost),
        purchase_date: form.purchase_date || null,
        brand: form.brand || null,
        serial_number: form.serial_number || null,
        description: form.description || null,
      });
    } catch (error) {
      const errors = error.response?.data?.errors;
      setFormError(
        errors ? Object.values(errors).flat().join(" ") : error.response?.data?.message || "Unable to save the asset. Please try again.",
      );
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4 backdrop-blur-sm">
      <section className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{asset ? "Edit asset" : "Add new asset"}</h2>
            <p className="mt-1 text-sm text-gray-500">Enter the asset information below.</p>
          </div>
          <button onClick={onClose} aria-label="Close form" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="ml-1 text-red-500">*</span>}
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={form[field.name] ?? ""}
                    onChange={updateField}
                    required={field.required}
                    className="mt-2 w-full border px-3 py-2.5 text-sm"
                  >
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type || "text"}
                    value={form[field.name] ?? ""}
                    onChange={updateField}
                    required={field.required}
                    min={field.type === "number" ? "0" : undefined}
                    step={field.type === "number" ? "0.01" : undefined}
                    className="mt-2 w-full border px-3 py-2.5 text-sm"
                  />
                )}
              </label>
            ))}
            <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
              Description
              <textarea
                name="description"
                value={form.description ?? ""}
                onChange={updateField}
                rows={3}
                className="mt-2 w-full resize-y border px-3 py-2.5 text-sm"
                placeholder="Additional asset details..."
              />
            </label>
            {formError && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">
                {formError}
              </p>
            )}
          </div>
          <footer className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {saving && <LoaderCircle size={16} className="animate-spin" />}
              {saving ? "Saving..." : asset ? "Save changes" : "Create asset"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function AssetTable({ assets, loading, pagination, search, setSearch, statusFilter, setStatusFilter, setPage, onEdit, onDelete, onCreate }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-bold text-gray-900">Asset inventory</h3>
          <p className="mt-1 text-sm text-gray-500">View and manage registered equipment.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assets..."
              className="w-full border py-2.5 pl-9 pr-3 text-sm sm:w-52"
            />
          </label>
          <label className="relative">
            <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full appearance-none border bg-white py-2.5 pl-9 pr-9 text-sm sm:w-44"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <ChevronRight size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-180 text-left">
          <thead>
            <tr className="border-y border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <th className="py-3 pr-4">Asset</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Purchase date</th>
              <th className="px-2 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-14 text-center text-sm text-gray-500" role="status" aria-live="polite">
                  <LoaderCircle size={22} className="mx-auto mb-2 animate-spin text-emerald-700" />
                  Loading your assets…
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-14 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                    <Package size={25} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    {(pagination?.total ?? 0) === 0 ? "Your inventory is ready to start" : "No matching assets"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(pagination?.total ?? 0) === 0
                      ? "Add your first asset to keep equipment details in one place."
                      : "Try a different search or clear the selected status filter."}
                  </p>
                  {(pagination?.total ?? 0) === 0 ? (
                    <button onClick={onCreate} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
                      <Plus size={15} /> Add your first asset
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSearch(""); setStatusFilter("all"); }}
                      className="mt-4 rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Clear search and filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="transition hover:bg-gray-50/80">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                        <Computer size={19} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
                        <p className="mt-1 text-xs text-gray-500">{asset.asset_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{asset.category}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">{formatCurrency(asset.purchase_cost)}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{formatDate(asset.purchase_date)}</td>
                  <td className="px-2 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        title="Edit asset"
                        aria-label={`Edit ${asset.name}`}
                        onClick={() => onEdit(asset)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Delete asset"
                        aria-label={`Delete ${asset.name}`}
                        onClick={() => onDelete(asset)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-4 flex flex-col justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center">
        <p>
          Showing {assets.length} item(s){pagination?.total != null ? ` out of ${pagination.total} total` : ""}
        </p>
        <div className="flex items-center gap-2 self-end">
          <button
            disabled={loading || !pagination?.prev_page_url}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            aria-label="Previous page"
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-16 text-center">
            Page {pagination?.current_page ?? 1} of {pagination?.last_page ?? 1}
          </span>
          <button
            disabled={loading || !pagination?.next_page_url}
            onClick={() => setPage((current) => current + 1)}
            aria-label="Next page"
            className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>
    </section>
  );
}

const styles = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  assigned: "bg-blue-50 text-blue-700 ring-blue-600/20",
  maintenance: "bg-amber-50 text-amber-700 ring-amber-600/20",
};

function StatusBadge({ status }) {
  const value = status || "available";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[value] || "bg-gray-100 text-gray-700 ring-gray-500/20"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value.replaceAll("_", " ")}
    </span>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function App({ user, onLogout, theme, onToggleTheme }) {
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activePage, setActivePage] = useState("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalAsset, setModalAsset] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  async function loadAssets(pageNumber = page) {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/assets", { params: { page: pageNumber } });
      setAssets(Array.isArray(response.data.data) ? response.data.data : []);
      setPagination(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not connect to the Laravel API. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssets(page);
  }, [page]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchesSearch = [asset.asset_code, asset.name, asset.category, asset.brand, asset.serial_number].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      );
      return matchesSearch && (statusFilter === "all" || asset.status === statusFilter);
    });
  }, [assets, search, statusFilter]);

  const counts = {
    available: assets.filter((asset) => asset.status === "available").length,
    assigned: assets.filter((asset) => asset.status === "assigned").length,
    maintenance: assets.filter((asset) => asset.status === "maintenance").length,
  };
  const inventoryValue = assets.reduce((total, asset) => total + Number(asset.purchase_cost || 0), 0);

  async function saveAsset(form) {
    setSaving(true);
    try {
      if (modalAsset) {
        await api.put(`/assets/${modalAsset.id}`, form);
        setNotice("Asset updated successfully.");
      } else {
        await api.post("/assets", form);
        setNotice("Asset created successfully.");
      }
      setModalOpen(false);
      setModalAsset(null);
      if (!modalAsset && page !== 1) setPage(1);
      else await loadAssets(modalAsset ? page : 1);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAsset(asset) {
    if (!window.confirm(`Delete ${asset.name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/assets/${asset.id}`);
      setNotice("Asset deleted successfully.");
      await loadAssets(page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete the asset. Please try again.");
    }
  }

  function openCreateModal() {
    setModalAsset(null);
    setModalOpen(true);
  }
  function openEditModal(asset) {
    setModalAsset(asset);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#f7f9f7] text-gray-800">
      <Sidebar activePage={activePage} setActivePage={setActivePage} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} user={user} onLogout={onLogout} />
      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="text-xs font-medium text-gray-400">Workspace / {activePage}</p>
              <h1 className="mt-1 text-lg font-bold text-gray-900">{activePage === "Overview" ? "Dashboard overview" : activePage}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              API workspace
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              GA
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-gray-500">Welcome back, {user?.name || "Administrator"}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {activePage === "Overview" ? "Your asset overview" : activePage === "Assets" ? "Asset inventory" : activePage}
              </h2>
              <p className="mt-2 text-sm text-gray-500">Monitor and manage your organization&apos;s equipment.</p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <Plus size={18} />
              Add new asset
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div>
                <p className="font-semibold">Something went wrong</p>
                <p className="mt-1">{error}</p>
                <button
                  onClick={() => loadAssets(page)}
                  disabled={loading}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  {loading && <LoaderCircle size={14} className="animate-spin" />}
                  {loading ? "Trying again…" : "Try again"}
                </button>
              </div>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={18} />
              </button>
            </div>
          )}

          {activePage === "Assignments" || activePage === "Maintenance" ? (
            <ModulePlaceholder page={activePage} onOpenAssets={() => setActivePage("Assets")} />
          ) : (
            <OverviewPanel
              assets={filteredAssets}
              loading={loading}
              pagination={pagination}
              counts={counts}
              inventoryValue={inventoryValue}
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setPage={setPage}
              onEdit={openEditModal}
              onDelete={deleteAsset}
              onCreate={openCreateModal}
            />
          )}
        </main>
      </div>

      {notice && (
        <div
          role="status"
          className="success-toast fixed right-4 top-4 z-70 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white px-4 py-3.5 text-sm text-gray-800 shadow-2xl sm:right-6 sm:top-6 sm:px-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50/70">
            <CheckCircle2 size={19} />
          </span>
          <span className="min-w-0 flex-1 leading-5">
            <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Success</span>
            <span className="block font-medium">{notice}</span>
          </span>
          <button aria-label="Dismiss notification" onClick={() => setNotice("")} className="ml-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      )}
      {modalOpen && (
        <AssetModal
          key={modalAsset?.id ?? "new-asset"}
          asset={modalAsset}
          onClose={() => {
            setModalOpen(false);
            setModalAsset(null);
          }}
          onSave={saveAsset}
          saving={saving}
        />
      )}
    </div>
  );
}

export default App;
