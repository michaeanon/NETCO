import { useState, useRef } from "react";
import {
  useGetAdminStats,
  useListConfigServers,
  useDeleteConfigServer,
  useUpdateConfigServerStatus,
  getListConfigServersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Users, ShoppingCart, DollarSign, Server, Plus, Trash2,
  Download, ToggleLeft, ToggleRight, Upload, X, CheckCircle, AlertCircle,
  Loader2, Smartphone, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const NETWORK_COLORS = ["#00F5FF", "#7B61FF", "#0057A8"];
const TABS = ["Dashboard", "Config Servers"] as const;
type Tab = typeof TABS[number];

const NETWORKS = ["safaricom", "airtel", "telkom"] as const;
const APP_TYPES = [
  { value: "http_custom", label: "HTTP Custom", ext: ".hc", store: "https://play.google.com/store/apps/details?id=xyz.easypro.httpcustom" },
  { value: "http_injector", label: "HTTP Injector", ext: ".ehi", store: "https://play.google.com/store/apps/details?id=com.evozi.injector" },
] as const;
const PLAN_TYPES = ["unlimited", "capped", "wifi"] as const;
const DURATIONS = ["daily", "weekly", "monthly"] as const;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function networkColor(network: string) {
  if (network === "safaricom") return "text-green-400";
  if (network === "airtel") return "text-red-400";
  return "text-blue-400";
}

function networkBg(network: string) {
  if (network === "safaricom") return "bg-green-400/10 border-green-400/20";
  if (network === "airtel") return "bg-red-400/10 border-red-400/20";
  return "bg-blue-400/10 border-blue-400/20";
}

interface AddServerForm {
  serverName: string;
  network: string;
  appType: string;
  planType: string;
  duration: string;
  file: File | null;
}

const EMPTY_FORM: AddServerForm = {
  serverName: "",
  network: "safaricom",
  appType: "http_custom",
  planType: "unlimited",
  duration: "monthly",
  file: null,
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dashboard
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();

  // Config Servers
  const { data: servers = [], isLoading: serversLoading } = useListConfigServers();
  const deleteServer = useDeleteConfigServer();
  const updateStatus = useUpdateConfigServerStatus();

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddServerForm>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [replaceId, setReplaceId] = useState<string | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  const statCards = stats
    ? [
        { icon: ShoppingCart, label: "Total Orders", value: stats.totalOrders.toLocaleString(), color: "text-primary", bg: "bg-primary/10 border-primary/20" },
        { icon: DollarSign, label: "Total Revenue", value: `Ksh ${stats.totalRevenue.toLocaleString()}`, color: "text-success", bg: "bg-success/10 border-success/20" },
        { icon: Users, label: "Active Users", value: stats.activeUsers.toLocaleString(), color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
        { icon: Server, label: "Active Plans", value: stats.activePlans.toLocaleString(), color: "text-warning", bg: "bg-warning/10 border-warning/20" },
      ]
    : [];

  const selectedAppType = APP_TYPES.find((a) => a.value === form.appType);
  const acceptedExt = selectedAppType?.ext ?? ".hc,.ehi";

  async function handleAddServer() {
    if (!form.file) {
      toast({ title: "No file selected", description: `Please upload a ${acceptedExt} config file.`, variant: "destructive" });
      return;
    }
    if (!form.serverName.trim()) {
      toast({ title: "Server name required", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("serverName", form.serverName.trim());
      fd.append("network", form.network);
      fd.append("appType", form.appType);
      fd.append("planType", form.planType);
      fd.append("duration", form.duration);
      fd.append("configFile", form.file);

      const res = await fetch("/api/admin/servers", { method: "POST", body: fd });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Upload failed");
      }

      await queryClient.invalidateQueries({ queryKey: getListConfigServersQueryKey() });
      setShowAddForm(false);
      setForm(EMPTY_FORM);
      toast({ title: "Config server added", description: `"${form.serverName}" is now live.` });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleStatus(id: string, current: string) {
    const next = current === "active" ? "inactive" : "active";
    try {
      await updateStatus.mutateAsync({ id, data: { status: next } });
      await queryClient.invalidateQueries({ queryKey: getListConfigServersQueryKey() });
      toast({ title: `Server marked ${next}` });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This will also remove the config file.`)) return;
    try {
      await deleteServer.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: getListConfigServersQueryKey() });
      toast({ title: "Server deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  async function handleReplaceFile(id: string) {
    if (!replaceFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("configFile", replaceFile);
      const res = await fetch(`/api/admin/servers/${id}/file`, { method: "PUT", body: fd });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Replace failed");
      }
      await queryClient.invalidateQueries({ queryKey: getListConfigServersQueryKey() });
      setReplaceId(null);
      setReplaceFile(null);
      toast({ title: "Config file replaced" });
    } catch (err) {
      toast({ title: "Replace failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function downloadServer(id: string) {
    window.open(`/api/admin/servers/${id}/download`, "_blank");
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">
            Admin <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Panel</span>
          </h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 p-1 glass-card rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ─────────── DASHBOARD TAB ─────────── */}
        {activeTab === "Dashboard" && (
          <div className="space-y-8">
            {/* Stat cards */}
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="glass-card rounded-xl p-5 animate-pulse h-28" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={`glass-card rounded-xl p-5 space-y-3 ${bg}`} data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
                      <p className={`text-xl font-heading font-bold ${color}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-heading font-bold text-lg">Revenue by Month</h2>
                </div>
                {statsLoading ? (
                  <div className="h-64 bg-muted/10 rounded-lg animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats?.revenueByMonth ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "#11183A", border: "1px solid #1A2247", borderRadius: 8, color: "#fff" }}
                        formatter={(v: number) => [`Ksh ${v.toLocaleString()}`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" fill="#00F5FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="glass-card rounded-xl p-6 space-y-4">
                <h2 className="font-heading font-bold text-lg">Revenue by Network</h2>
                {statsLoading ? (
                  <div className="h-64 bg-muted/10 rounded-lg animate-pulse" />
                ) : (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={stats?.revenueByNetwork ?? []} dataKey="revenue" nameKey="network" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                          {stats?.revenueByNetwork.map((_, i) => (
                            <Cell key={i} fill={NETWORK_COLORS[i % NETWORK_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#11183A", border: "1px solid #1A2247", borderRadius: 8, color: "#fff" }} formatter={(v: number) => [`Ksh ${v.toLocaleString()}`, "Revenue"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {stats?.revenueByNetwork.map((n, i) => (
                        <div key={n.network} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: NETWORK_COLORS[i % NETWORK_COLORS.length] }} />
                            <span className="text-muted-foreground">{capitalize(n.network)}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Ksh {n.revenue.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">{n.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Monthly table */}
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="font-heading font-bold text-lg">Monthly Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Month</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Orders</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsLoading
                      ? [1, 2, 3, 4].map((i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-3 px-4"><div className="h-4 bg-muted/20 rounded w-16 animate-pulse" /></td>
                            <td className="py-3 px-4 text-right"><div className="h-4 bg-muted/20 rounded w-12 animate-pulse ml-auto" /></td>
                            <td className="py-3 px-4 text-right"><div className="h-4 bg-muted/20 rounded w-20 animate-pulse ml-auto" /></td>
                          </tr>
                        ))
                      : stats?.revenueByMonth.slice().reverse().slice(0, 6).map((row) => (
                          <tr key={row.month} className="border-b border-border/50 hover:bg-muted/5 transition-colors" data-testid={`row-month-${row.month}`}>
                            <td className="py-3 px-4 font-medium">{row.month}</td>
                            <td className="py-3 px-4 text-right text-muted-foreground">{row.orders.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-primary font-medium">Ksh {row.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─────────── CONFIG SERVERS TAB ─────────── */}
        {activeTab === "Config Servers" && (
          <div className="space-y-6">

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-heading font-bold">VPN Config Servers</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Upload base <code className="text-primary text-xs">.hc</code> / <code className="text-primary text-xs">.ehi</code> config files for each network and plan combination.
                </p>
              </div>
              <Button
                onClick={() => setShowAddForm(true)}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add New Server
              </Button>
            </div>

            {/* App download links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {APP_TYPES.map((app) => (
                <a
                  key={app.value}
                  href={app.store}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{app.label}</p>
                    <p className="text-xs text-muted-foreground truncate">Config format: {app.ext}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>
              ))}
            </div>

            {/* Add Server Form */}
            {showAddForm && (
              <div className="glass-card rounded-xl p-6 border border-primary/30 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-primary">Add New Config Server</h3>
                  <button onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="serverName">Server Name</Label>
                    <Input
                      id="serverName"
                      placeholder="e.g. Safaricom Unlimited Monthly"
                      value={form.serverName}
                      onChange={(e) => setForm((f) => ({ ...f, serverName: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="network">Network</Label>
                    <select
                      id="network"
                      value={form.network}
                      onChange={(e) => setForm((f) => ({ ...f, network: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {NETWORKS.map((n) => <option key={n} value={n}>{capitalize(n)}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="appType">App Type</Label>
                    <select
                      id="appType"
                      value={form.appType}
                      onChange={(e) => setForm((f) => ({ ...f, appType: e.target.value, file: null }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {APP_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label} ({a.ext})</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="planType">Plan Type</Label>
                    <select
                      id="planType"
                      value={form.planType}
                      onChange={(e) => setForm((f) => ({ ...f, planType: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {PLAN_TYPES.map((p) => <option key={p} value={p}>{capitalize(p)}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="duration">Duration</Label>
                    <select
                      id="duration"
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {DURATIONS.map((d) => <option key={d} value={d}>{capitalize(d)}</option>)}
                    </select>
                  </div>

                  {/* File Upload */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Base Config File ({selectedAppType?.ext})</Label>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-primary/60 ${
                        form.file ? "border-primary/50 bg-primary/5" : "border-border"
                      }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept={acceptedExt}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          setForm((prev) => ({ ...prev, file: f }));
                        }}
                      />
                      {form.file ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium text-primary">{form.file.name}</span>
                          <span className="text-xs text-muted-foreground">({(form.file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">Click to upload <span className="text-primary font-medium">{selectedAppType?.ext}</span> config file</p>
                          <p className="text-xs text-muted-foreground/60">Max 10 MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddServer}
                    disabled={uploading}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Add Server"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Servers Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              {serversLoading ? (
                <div className="p-8 space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted/10 rounded-lg animate-pulse" />)}
                </div>
              ) : servers.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <Server className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="font-medium text-muted-foreground">No config servers yet</p>
                  <p className="text-sm text-muted-foreground/60">Click "Add New Server" to upload your first config file.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/5">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Server Name</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Network</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">App</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Plan</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Duration</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">File</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Status</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Added</th>
                        <th className="text-right py-3 px-4 text-muted-foreground font-medium whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servers.map((server) => (
                        <>
                          <tr key={server.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-foreground">{server.serverName}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${networkColor(server.network)}`}>{capitalize(server.network)}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className={server.appType === "http_custom" ? "border-primary/40 text-primary" : "border-secondary/40 text-secondary"}>
                                {server.appType === "http_custom" ? "HTTP Custom" : "HTTP Injector"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{capitalize(server.planType)}</td>
                            <td className="py-3 px-4 text-muted-foreground">{capitalize(server.duration)}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground font-mono text-xs truncate max-w-32" title={server.originalName}>{server.originalName}</span>
                                {server.fileSize && <span className="text-xs text-muted-foreground/50">({(server.fileSize / 1024).toFixed(0)} KB)</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleToggleStatus(server.id, server.status)}
                                className="flex items-center gap-1.5 transition-colors"
                              >
                                {server.status === "active"
                                  ? <><ToggleRight className="w-5 h-5 text-primary" /><span className="text-primary text-xs font-medium">Active</span></>
                                  : <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground text-xs">Inactive</span></>}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                              {new Date(server.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => downloadServer(server.id)}
                                  title="Download config file"
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setReplaceId(replaceId === server.id ? null : server.id); setReplaceFile(null); }}
                                  title="Replace config file"
                                  className="p-1.5 rounded-lg hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-all"
                                >
                                  <Upload className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(server.id, server.serverName)}
                                  title="Delete server"
                                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Inline file replace panel */}
                          {replaceId === server.id && (
                            <tr key={`${server.id}-replace`} className="bg-secondary/5 border-b border-secondary/20">
                              <td colSpan={9} className="px-4 py-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <AlertCircle className="w-4 h-4 text-secondary shrink-0" />
                                  <span className="text-sm text-secondary font-medium">Replace config file for "{server.serverName}"</span>
                                  <div className="flex items-center gap-2 ml-auto flex-wrap">
                                    <input
                                      ref={replaceFileRef}
                                      type="file"
                                      accept={server.appType === "http_custom" ? ".hc" : ".ehi"}
                                      className="hidden"
                                      onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => replaceFileRef.current?.click()}
                                      className="gap-1.5 border-secondary/40 text-secondary hover:bg-secondary/10"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      {replaceFile ? replaceFile.name : "Choose File"}
                                    </Button>
                                    {replaceFile && (
                                      <Button
                                        size="sm"
                                        disabled={uploading}
                                        onClick={() => handleReplaceFile(server.id)}
                                        className="gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                      >
                                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                        Confirm Replace
                                      </Button>
                                    )}
                                    <Button size="sm" variant="ghost" onClick={() => { setReplaceId(null); setReplaceFile(null); }}>
                                      <X className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">How it works</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
                <div className="flex gap-2">
                  <Upload className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Upload a base <code className="text-primary">.hc</code> or <code className="text-primary">.ehi</code> file for each Network + Plan + Duration combo.</span>
                </div>
                <div className="flex gap-2">
                  <ToggleRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Toggle a server Active/Inactive to control whether it can be matched to new orders.</span>
                </div>
                <div className="flex gap-2">
                  <Download className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Download the raw base file, or use Replace to swap it without losing the server record.</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
