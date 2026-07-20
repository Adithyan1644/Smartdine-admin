import React, { useState } from "react";

function Toggle({ checked, onChange }) {
  return React.createElement("button", {
    role: "switch",
    onClick: () => onChange(!checked),
    style: {
      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: checked ? "#166534" : "#cbd5e1",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }
  },
    React.createElement("span", { style: {
      position: "absolute", top: 3, left: checked ? 22 : 3,
      width: 18, height: 18, borderRadius: "50%", background: "#fff",
      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    }})
  );
}

export default function SettingsScreen() {
  const [profile, setProfile] = useState({
    name: "Surabhi Restaurant", contact: "+91 98401 00000",
    email: "surabhi@smartdine.in", address: "42, Green Park Road, Kochi, Kerala 682001",
    currency: "INR (Rs.)", cgst: "9", sgst: "9", service: "5",
  });
  const [hours, setHours] = useState({
    weekdayOpen: "09:00", weekdayClose: "23:00",
    weekendOpen: "08:00", weekendClose: "23:30",
  });
  const [ops, setOps] = useState({
    qrOrdering: true, onlineOrder: false, kdsSync: true,
    smsAlert: true, liveAlerts: true, dailyBrief: false,
  });
  const [privs, setPrivs] = useState({
    cancelOrder: true, manualDiscount: false, printReceipt: true,
    viewReports: false, editMenu: false,
  });
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [saveMsg, setSaveMsg] = useState("");

  const handleSave = () => {
    setSaveMsg("Settings saved successfully!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile, hours, ops, privs }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "smartdine-config.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to defaults? This cannot be undone.")) {
      setSaveMsg("Settings reset to defaults.");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const setP = (k) => (v) => setProfile(p => ({ ...p, [k]: v }));
  const setH = (k) => (v) => setHours(h => ({ ...h, [k]: v }));

  const profileFields = [
    { label: "Restaurant Name", key: "name",     type: "text"  },
    { label: "Contact Number",  key: "contact",  type: "text"  },
    { label: "Email Address",   key: "email",    type: "email" },
    { label: "Address",         key: "address",  type: "text"  },
    { label: "Base Currency",   key: "currency", type: "text"  },
  ];

  const opsItems = [
    { key: "qrOrdering",  label: "Dine-In QR Ordering",        desc: "Guests can scan table QR to place orders"         },
    { key: "onlineOrder", label: "Online Delivery Integration", desc: "Accept orders via Zomato / Swiggy integration"    },
    { key: "kdsSync",     label: "KDS Auto-Sync",               desc: "Push orders instantly to Kitchen Display System"  },
    { key: "smsAlert",    label: "SMS Notifications",           desc: "Send booking and order confirmations via SMS"     },
    { key: "liveAlerts",  label: "Live Dashboard Alerts",       desc: "Show real-time pop-ups for kitchen and sales"     },
    { key: "dailyBrief",  label: "Daily AI Briefing",           desc: "AI-generated summary each morning at 8 AM"       },
  ];

  const privItems = [
    { key: "cancelOrder",    label: "Cancel Orders",         desc: "Waiters can cancel placed orders"           },
    { key: "manualDiscount", label: "Apply Manual Discount", desc: "Waiters can offer ad-hoc discounts"         },
    { key: "printReceipt",   label: "Print Receipts",        desc: "Waiters can trigger receipt printing"       },
    { key: "viewReports",    label: "View Sales Reports",    desc: "Waiters can access shift summary data"      },
    { key: "editMenu",       label: "Edit Menu Availability",desc: "Waiters can mark items as out of stock"     },
  ];

  return React.createElement("div", { className: "page-content" },
    React.createElement("div", { className: "flex justify-between items-center mb-5" },
      React.createElement("div", null,
        React.createElement("h1", { style: { fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 2 } }, "Settings"),
        React.createElement("p", { style: { fontSize: 13, color: "#64748b" } }, "Configure your restaurant profile, operations, and system preferences.")
      ),
      React.createElement("button", { onClick: handleSave, style: { background: "#166534", color: "#fff", border: "none", borderRadius: 10, padding: "9px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "Save Settings")
    ),

    saveMsg && React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, fontWeight: 600, color: "#166534" } }, saveMsg),

    React.createElement("div", { className: "grid-2 mb-5" },
      React.createElement("div", { className: "card" },
        React.createElement("div", { className: "flex items-center gap-2 mb-4" },
          React.createElement("span", { className: "card-title" }, "Restaurant Profile")
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
          profileFields.map(function(f) {
            return React.createElement("div", { key: f.key },
              React.createElement("label", { className: "form-label" }, f.label),
              React.createElement("input", { className: "form-control", type: f.type, value: profile[f.key], onChange: function(e) { setP(f.key)(e.target.value); } })
            );
          })
        )
      ),

      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 20 } },
        React.createElement("div", { className: "card" },
          React.createElement("div", { className: "flex items-center gap-2 mb-4" },
            React.createElement("span", { className: "card-title" }, "Tax Configuration")
          ),
          React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 } },
            [
              { label: "CGST (%)", key: "cgst" },
              { label: "SGST (%)", key: "sgst" },
              { label: "Service (%)", key: "service" },
            ].map(function(f) {
              return React.createElement("div", { key: f.key },
                React.createElement("label", { className: "form-label" }, f.label),
                React.createElement("input", { className: "form-control", type: "number", min: "0", max: "100", value: profile[f.key], onChange: function(e) { setP(f.key)(e.target.value); } })
              );
            })
          ),
          React.createElement("div", { style: { marginTop: 14, background: "#f8fafc", borderRadius: 8, padding: "10px 14px" } },
            React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 } }, "Total Tax on Bill"),
            React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#0f172a" } },
              (parseFloat(profile.cgst || 0) + parseFloat(profile.sgst || 0)).toFixed(1) + "% GST" +
              (parseFloat(profile.service || 0) > 0 ? " + " + profile.service + "% Service" : "")
            )
          )
        ),

        React.createElement("div", { className: "card" },
          React.createElement("div", { className: "flex items-center gap-2 mb-4" },
            React.createElement("span", { className: "card-title" }, "Store Hours")
          ),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 } }, "Weekdays (Mon-Fri)"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
                React.createElement("div", null,
                  React.createElement("label", { className: "form-label" }, "Open"),
                  React.createElement("input", { className: "form-control", type: "time", value: hours.weekdayOpen, onChange: function(e) { setH("weekdayOpen")(e.target.value); } })
                ),
                React.createElement("div", null,
                  React.createElement("label", { className: "form-label" }, "Close"),
                  React.createElement("input", { className: "form-control", type: "time", value: hours.weekdayClose, onChange: function(e) { setH("weekdayClose")(e.target.value); } })
                )
              )
            ),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 } }, "Weekends (Sat-Sun)"),
              React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
                React.createElement("div", null,
                  React.createElement("label", { className: "form-label" }, "Open"),
                  React.createElement("input", { className: "form-control", type: "time", value: hours.weekendOpen, onChange: function(e) { setH("weekendOpen")(e.target.value); } })
                ),
                React.createElement("div", null,
                  React.createElement("label", { className: "form-label" }, "Close"),
                  React.createElement("input", { className: "form-control", type: "time", value: hours.weekendClose, onChange: function(e) { setH("weekendClose")(e.target.value); } })
                )
              )
            )
          )
        )
      )
    ),

    React.createElement("div", { className: "grid-2 mb-5" },
      React.createElement("div", { className: "card" },
        React.createElement("div", { className: "flex items-center gap-2 mb-4" },
          React.createElement("span", { className: "card-title" }, "Operational Settings")
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 0 } },
          opsItems.map(function(item, i) {
            return React.createElement("div", { key: item.key, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < opsItems.length - 1 ? "1px solid #f1f5f9" : "none" } },
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 } }, item.label),
                React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, item.desc)
              ),
              React.createElement(Toggle, { checked: ops[item.key], onChange: function(v) { setOps(function(o) { var n = Object.assign({}, o); n[item.key] = v; return n; }); } })
            );
          })
        )
      ),

      React.createElement("div", { className: "card" },
        React.createElement("div", { className: "flex items-center gap-2 mb-4" },
          React.createElement("span", { className: "card-title" }, "Waiter Privileges")
        ),
        React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#64748b" } },
          "Controls what actions waiters can perform in the Waiter App handsets."
        ),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 0 } },
          privItems.map(function(item, i) {
            return React.createElement("div", { key: item.key, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < privItems.length - 1 ? "1px solid #f1f5f9" : "none" } },
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 2 } }, item.label),
                React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, item.desc)
              ),
              React.createElement(Toggle, { checked: privs[item.key], onChange: function(v) { setPrivs(function(p) { var n = Object.assign({}, p); n[item.key] = v; return n; }); } })
            );
          })
        )
      )
    ),

    React.createElement("div", { className: "card" },
      React.createElement("div", { className: "flex items-center gap-2 mb-4" },
        React.createElement("span", { className: "card-title" }, "Backup and System Management")
      ),
      React.createElement("div", { className: "grid-2", style: { gap: 24 } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8 } }, "Auto-Backup Schedule"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            ["hourly","daily","weekly"].map(function(opt) {
              var descs = { hourly: "Every 60 mins - ideal for busy kitchens", daily: "Once a day at midnight - recommended", weekly: "Every Sunday at midnight - light option" };
              return React.createElement("label", { key: opt, style: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: "2px solid " + (backupSchedule === opt ? "#166534" : "#e2e8f0"), background: backupSchedule === opt ? "#f0fdf4" : "#fff" } },
                React.createElement("input", { type: "radio", name: "backup", value: opt, checked: backupSchedule === opt, onChange: function() { setBackupSchedule(opt); }, style: { accentColor: "#166534" } }),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#0f172a", textTransform: "capitalize" } }, opt),
                  React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, descs[opt])
                )
              );
            })
          )
        ),

        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
          React.createElement("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" } },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 } }, "Last Backup"),
            React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, "Today at 12:00 AM - 2.4 MB - All data intact"),
            React.createElement("button", { onClick: exportData, style: { background: "#eff6ff", color: "#1d4ed8", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" } }, "Export Config (JSON)")
          ),
          React.createElement("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "16px 20px" } },
            React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#b91c1c", marginBottom: 4 } }, "Danger Zone"),
            React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, "Reset all settings to factory defaults. This cannot be undone."),
            React.createElement("button", { onClick: handleReset, style: { background: "#fef2f2", color: "#b91c1c", border: "2px solid #fecaca", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" } }, "Reset All Settings")
          ),
          React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 20px" } },
            React.createElement("div", { style: { fontSize: 12, color: "#166534", fontWeight: 600, marginBottom: 2 } }, "System Version"),
            React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#0f172a" } }, "SmartDine Admin v2.4.1"),
            React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, "Build 2026-07 - All systems operational")
          )
        )
      )
    )
  );
}