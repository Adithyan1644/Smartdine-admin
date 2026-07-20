import React, { useState } from "react";
import { DonutChart } from "./CustomCharts";

const SEED_CUSTOMERS = [
  { id: 1,  name: "Ananya Krishnan",  phone: "98401 12345", visits: 38, spent: 14820, points: 1480, tier: "VIP",     status: "Active" },
  { id: 2,  name: "Rajesh Menon",     phone: "99001 56789", visits: 21, spent: 7340,  points: 730,  tier: "Regular", status: "Active" },
  { id: 3,  name: "Priya Suresh",     phone: "97401 23456", visits: 5,  spent: 1250,  points: 120,  tier: "New",     status: "Active" },
  { id: 4,  name: "Mohammed Farouk",  phone: "90001 78901", visits: 54, spent: 22100, points: 2210, tier: "VIP",     status: "Active" },
  { id: 5,  name: "Divya Nair",       phone: "91501 34567", visits: 12, spent: 3900,  points: 390,  tier: "Regular", status: "Active" },
  { id: 6,  name: "Suresh Babu",      phone: "96001 90123", visits: 2,  spent: 480,   points: 48,   tier: "New",     status: "Inactive" },
  { id: 7,  name: "Lakshmi Pillai",   phone: "88001 45678", visits: 31, spent: 11200, points: 1120, tier: "VIP",     status: "Active" },
  { id: 8,  name: "Arjun Varma",      phone: "94501 67890", visits: 9,  spent: 2800,  points: 280,  tier: "Regular", status: "Active" },
  { id: 9,  name: "Kavitha Rajan",    phone: "82001 12890", visits: 1,  spent: 220,   points: 22,   tier: "New",     status: "Active" },
  { id: 10, name: "Vinod Chandran",   phone: "79001 34512", visits: 44, spent: 17500, points: 1750, tier: "VIP",     status: "Active" },
];

const TIER_COLORS = { VIP: "#f59e0b", Regular: "#3b82f6", New: "#16a34a" };
const TIER_BG    = { VIP: "#fef3c7", Regular: "#eff6ff", New: "#f0fdf4" };

const DONUT_SEGMENTS = [
  { label: "VIP",     value: 32, color: "#f59e0b" },
  { label: "Regular", value: 45, color: "#3b82f6" },
  { label: "New",     value: 23, color: "#16a34a" },
];

const KPI = [
  { label: "Total Customers", value: "1,248", icon: "Total", change: "+42 this month",  up: true  },
  { label: "Active Members",  value: "842",   icon: "Active", change: "+18 this week",   up: true  },
  { label: "VIP Customers",   value: "156",   icon: "VIP",   change: "+6 this month",   up: true  },
  { label: "Loyalty Points",  value: "45,200",icon: "Pts",   change: "12,400 redeemed", up: false },
];

const INSIGHTS = [
  { title: "Peak Registration Day",  text: "Friday: 38% of new sign-ups happen on weekends", badge: "Trend",   cls: "badge-blue"  },
  { title: "Repeat Visit Rate",      text: "74% of customers return within 30 days",          badge: "+4%",    cls: "badge-green" },
  { title: "Avg. Spend per Visit",   text: "VIP Rs.482, Regular Rs.278, New Rs.198",          badge: "Insight",cls: "badge-amber" },
  { title: "Loyalty Redemption",     text: "23% of points redeemed for discounts last month", badge: "Active", cls: "badge-green" },
];

export default function CustomersScreen() {
  const [customers, setCustomers]   = useState(SEED_CUSTOMERS);
  const [search, setSearch]         = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ name: "", phone: "", tier: "New", points: "" });
  const [ptInput, setPtInput]       = useState({ id: null, value: "" });

  const filtered = customers.filter(c => {
    const s = search.toLowerCase();
    return (!s || c.name.toLowerCase().includes(s) || c.phone.includes(s))
        && (tierFilter === "all" || c.tier === tierFilter);
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setCustomers(p => [...p, {
      id: Date.now(), name: form.name.trim(), phone: form.phone.trim(),
      visits: 0, spent: 0, points: parseInt(form.points) || 0,
      tier: form.tier, status: "Active",
    }]);
    setForm({ name: "", phone: "", tier: "New", points: "" });
    setShowForm(false);
  };

  const applyPoints = (id) => {
    const v = parseInt(ptInput.value);
    if (!v || v <= 0) return;
    setCustomers(p => p.map(c => c.id === id ? { ...c, points: c.points + v } : c));
    setPtInput({ id: null, value: "" });
  };

  const del    = (id) => setCustomers(p => p.filter(c => c.id !== id));
  const togVIP = (id) => setCustomers(p => p.map(c =>
    c.id === id ? { ...c, tier: c.tier === "VIP" ? "Regular" : "VIP" } : c
  ));

  return (
    React.createElement("div", { className: "page-content" },
      React.createElement("div", { className: "flex justify-between items-center mb-5" },
        React.createElement("div", null,
          React.createElement("h1", { style: { fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 2 } }, "Customers"),
          React.createElement("p", { style: { fontSize: 13, color: "#64748b" } }, "Manage guest profiles, tiers, and loyalty points.")
        ),
        React.createElement("button", {
          onClick: () => setShowForm(s => !s),
          style: { background: "#166534", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }
        }, "+ Add Customer")
      ),

      showForm && React.createElement("div", { className: "card mb-5", style: { border: "2px solid #bbf7d0", background: "#f0fdf4" } },
        React.createElement("span", { className: "card-title", style: { display: "block", marginBottom: 16 } }, "New Customer"),
        React.createElement("form", { onSubmit: handleAdd, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end" } },
          React.createElement("div", null,
            React.createElement("label", { className: "form-label" }, "Full Name *"),
            React.createElement("input", { className: "form-control", value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), placeholder: "e.g. Ananya K.", required: true })
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "form-label" }, "Phone *"),
            React.createElement("input", { className: "form-control", value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })), placeholder: "98401 XXXXX", required: true })
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "form-label" }, "Tier"),
            React.createElement("select", { className: "form-control", value: form.tier, onChange: e => setForm(f => ({ ...f, tier: e.target.value })) },
              React.createElement("option", null, "New"),
              React.createElement("option", null, "Regular"),
              React.createElement("option", null, "VIP")
            )
          ),
          React.createElement("div", null,
            React.createElement("label", { className: "form-label" }, "Initial Points"),
            React.createElement("input", { className: "form-control", type: "number", value: form.points, onChange: e => setForm(f => ({ ...f, points: e.target.value })), placeholder: "0", min: "0" })
          ),
          React.createElement("div", { style: { display: "flex", gap: 8 } },
            React.createElement("button", { type: "submit", style: { background: "#166534", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "Save"),
            React.createElement("button", { type: "button", onClick: () => setShowForm(false), style: { background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, padding: "9px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer" } }, "Cancel")
          )
        )
      ),

      React.createElement("div", { className: "grid-4 mb-5" },
        KPI.map((k, i) =>
          React.createElement("div", { key: i, className: "card", style: { padding: "18px 20px" } },
            React.createElement("div", { className: "flex justify-between items-center", style: { marginBottom: 8 } },
              React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 } }, k.icon),
              React.createElement("span", { className: "badge " + (k.up ? "badge-green" : "badge-amber") }, k.up ? "Up" : "Down")
            ),
            React.createElement("div", { style: { fontSize: 26, fontWeight: 800, color: "#0f172a", marginBottom: 2 } }, k.value),
            React.createElement("div", { style: { fontSize: 12, color: "#64748b", fontWeight: 500 } }, k.label),
            React.createElement("div", { style: { fontSize: 11, color: k.up ? "#16a34a" : "#f59e0b", marginTop: 4 } }, k.change)
          )
        )
      ),

      React.createElement("div", { className: "grid-2 mb-5" },
        React.createElement("div", { className: "card" },
          React.createElement("div", { className: "flex items-center gap-2 mb-4" },
            React.createElement("span", { style: { fontSize: 18 } }, "Segments"),
            React.createElement("span", { className: "card-title" }, "Customer Segments")
          ),
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 24, justifyContent: "center" } },
            React.createElement(DonutChart, { segments: DONUT_SEGMENTS, size: 170, strokeWidth: 34, centerLabel: "1,248", centerSub: "Customers" }),
            React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 18 } },
              DONUT_SEGMENTS.map((s, i) =>
                React.createElement("div", { key: i },
                  React.createElement("div", { className: "flex items-center gap-2", style: { marginBottom: 4 } },
                    React.createElement("span", { className: "legend-dot", style: { background: s.color } }),
                    React.createElement("span", { style: { fontSize: 13.5, fontWeight: 500, color: "#334155" } }, s.label),
                    React.createElement("span", { style: { fontSize: 12, color: "#94a3b8", marginLeft: "auto" } }, s.value + "%")
                  ),
                  React.createElement("div", { className: "progress-bar-container", style: { width: 130 } },
                    React.createElement("div", { className: "progress-bar", style: { width: s.value + "%", background: s.color } })
                  )
                )
              )
            )
          )
        ),

        React.createElement("div", { className: "card" },
          React.createElement("div", { className: "flex items-center gap-2 mb-4" },
            React.createElement("span", { className: "card-title" }, "Customer Insights")
          ),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
            INSIGHTS.map((ins, i) =>
              React.createElement("div", { key: i, style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" } },
                React.createElement("div", { style: { flex: 1 } },
                  React.createElement("div", { className: "flex justify-between items-start", style: { marginBottom: 3 } },
                    React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "#0f172a" } }, ins.title),
                    React.createElement("span", { className: "badge " + ins.cls }, ins.badge)
                  ),
                  React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, ins.text)
                )
              )
            )
          )
        )
      ),

      React.createElement("div", { className: "card" },
        React.createElement("div", { className: "flex justify-between items-center mb-4" },
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("span", { className: "card-title" }, "Customer Directory"),
            React.createElement("span", { className: "badge badge-blue", style: { marginLeft: 6 } }, customers.length + " guests")
          ),
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("input", { className: "form-control", style: { width: 200 }, placeholder: "Search name or phone", value: search, onChange: e => setSearch(e.target.value) }),
            React.createElement("select", { className: "form-control", style: { width: 120 }, value: tierFilter, onChange: e => setTierFilter(e.target.value) },
              React.createElement("option", { value: "all" }, "All Tiers"),
              React.createElement("option", { value: "VIP" }, "VIP"),
              React.createElement("option", { value: "Regular" }, "Regular"),
              React.createElement("option", { value: "New" }, "New")
            )
          )
        ),
        React.createElement("div", { style: { overflowX: "auto" } },
          React.createElement("table", { className: "data-table" },
            React.createElement("thead", null,
              React.createElement("tr", null,
                ["#","Customer","Phone","Visits","Spent","Points","Tier","Status","Actions"].map(h =>
                  React.createElement("th", { key: h }, h)
                )
              )
            ),
            React.createElement("tbody", null,
              filtered.length === 0
                ? React.createElement("tr", null, React.createElement("td", { colSpan: 9, style: { textAlign: "center", color: "#94a3b8", padding: "32px 0" } }, "No customers found."))
                : filtered.map((c, idx) =>
                  React.createElement("tr", { key: c.id },
                    React.createElement("td", { style: { color: "#94a3b8", fontWeight: 600 } }, idx + 1),
                    React.createElement("td", null,
                      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                        React.createElement("div", { style: { width: 34, height: 34, borderRadius: "50%", background: TIER_BG[c.tier], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: TIER_COLORS[c.tier], flexShrink: 0 } },
                          c.name.split(" ").map(n => n[0]).join("").slice(0, 2)
                        ),
                        React.createElement("span", { style: { fontWeight: 600, color: "#0f172a" } }, c.name)
                      )
                    ),
                    React.createElement("td", { style: { color: "#64748b" } }, c.phone),
                    React.createElement("td", { style: { fontWeight: 600 } }, c.visits),
                    React.createElement("td", { style: { fontWeight: 700, color: "#166534" } }, "Rs." + c.spent.toLocaleString("en-IN")),
                    React.createElement("td", null,
                      ptInput.id === c.id
                        ? React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center" } },
                          React.createElement("input", { type: "number", min: "1", style: { width: 60, border: "1px solid #d1d5db", borderRadius: 6, padding: "3px 6px", fontSize: 12 }, value: ptInput.value, onChange: e => setPtInput(p => ({ ...p, value: e.target.value })), autoFocus: true }),
                          React.createElement("button", { onClick: () => applyPoints(c.id), style: { background: "#166534", color: "#fff", border: "none", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer", fontWeight: 700 } }, "Add"),
                          React.createElement("button", { onClick: () => setPtInput({ id: null, value: "" }), style: { background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 5, padding: "3px 7px", fontSize: 11, cursor: "pointer" } }, "X")
                        )
                        : React.createElement("div", { className: "flex items-center gap-1" },
                          React.createElement("span", { style: { fontWeight: 600 } }, c.points.toLocaleString("en-IN")),
                          React.createElement("button", { onClick: () => setPtInput({ id: c.id, value: "" }), style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 5, padding: "2px 7px", fontSize: 11, cursor: "pointer", fontWeight: 600 } }, "+")
                        )
                    ),
                    React.createElement("td", null,
                      React.createElement("span", { style: { background: TIER_BG[c.tier], color: TIER_COLORS[c.tier], fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 20 } },
                        (c.tier === "VIP" ? "VIP " : "") + c.tier
                      )
                    ),
                    React.createElement("td", null,
                      React.createElement("span", { className: "badge " + (c.status === "Active" ? "badge-green" : "badge-red") }, c.status)
                    ),
                    React.createElement("td", null,
                      React.createElement("div", { style: { display: "flex", gap: 6 } },
                        React.createElement("button", { onClick: () => togVIP(c.id), style: { background: "#fef3c7", color: "#b45309", border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontWeight: 600 } },
                          c.tier === "VIP" ? "Rem. VIP" : "Make VIP"
                        ),
                        React.createElement("button", { onClick: () => del(c.id), style: { background: "#fef2f2", color: "#b91c1c", border: "none", borderRadius: 6, padding: "4px 9px", fontSize: 11, cursor: "pointer", fontWeight: 600 } }, "Del")
                      )
                    )
                  )
                )
            )
          )
        ),
        React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "#94a3b8", textAlign: "right" } },
          "Showing " + filtered.length + " of " + customers.length + " customers"
        )
      )
    )
  );
}