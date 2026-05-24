import { useGetAdminStats } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign, Server } from "lucide-react";

const NETWORK_COLORS = ["#00F5FF", "#7B61FF", "#0057A8"];

export default function Admin() {
  const { data: stats, isLoading } = useGetAdminStats();

  const statCards = stats
    ? [
        { icon: ShoppingCart, label: "Total Orders", value: stats.totalOrders.toLocaleString(), color: "text-primary", bg: "bg-primary/10 border-primary/20" },
        { icon: DollarSign, label: "Total Revenue", value: `Ksh ${stats.totalRevenue.toLocaleString()}`, color: "text-success", bg: "bg-success/10 border-success/20" },
        { icon: Users, label: "Active Users", value: stats.activeUsers.toLocaleString(), color: "text-secondary", bg: "bg-secondary/10 border-secondary/20" },
        { icon: Server, label: "Active Plans", value: stats.activePlans.toLocaleString(), color: "text-warning", bg: "bg-warning/10 border-warning/20" },
      ]
    : [];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">
            Admin <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">Platform overview and analytics</p>
        </div>

        {/* Stat cards */}
        {isLoading ? (
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
          {/* Revenue by month */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg">Revenue by Month</h2>
            </div>
            {isLoading ? (
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

          {/* Revenue by network */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-heading font-bold text-lg">Revenue by Network</h2>
            {isLoading ? (
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
                        <span className="text-muted-foreground">{n.network}</span>
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

        {/* Orders by month table */}
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
                {isLoading
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
    </div>
  );
}
