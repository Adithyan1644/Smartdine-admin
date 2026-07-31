import React, { useState } from 'react';
import { API_URL } from '../config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, IndianRupee, BarChart2,
  Clock, CreditCard, Lightbulb, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  salesKpis, salesComparison, revenueDistribution,
  salesTrendDaily, salesTrendWeekly, salesTrendMonthly,
  peakHours, paymentMethods, salesInsights,
} from '../data/salesData';

import { useSync } from '../context/SyncContext';

const trendData = {
  '7 Days': salesTrendDaily,
  Weekly: salesTrendWeekly,
  Monthly: salesTrendMonthly,
};

const fmt = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString('en-IN')}`;
const fmtTick = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(0)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, color: '#374151', marginBottom: 4, fontSize: 12 }}>{label}</p>
      <p style={{ fontWeight: 700, color: '#0B6B50', fontSize: 13 }}>{fmt(payload[0].value)}</p>
    </div>
  );
};

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{d.name}</p>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.pct}% · {fmt(d.value)}</p>
    </div>
  );
};

const kpiCardDefs = [
  { label: "Today's Sales",    key: 'today',     Icon: IndianRupee },
  { label: "Yesterday's Sales", key: 'yesterday', Icon: IndianRupee },
  { label: 'Weekly Sales',     key: 'weekly',    Icon: TrendingUp },
  { label: 'Monthly Sales',    key: 'monthly',   Icon: BarChart2 },
];

export default function SalesScreen() {
  const [trendTab, setTrendTab] = useState('7 Days');
  const { analyticsData } = useSync();
  const data = analyticsData;

  const activeSales = {
    kpis: {
      today: { value: Math.round(data?.sales?.kpis?.today?.value ?? 0), change: data?.sales?.kpis?.today?.change ?? 0, positive: data?.sales?.kpis?.today?.positive ?? true },
      yesterday: { value: Math.round(data?.sales?.kpis?.yesterday?.value ?? 0), change: 0, positive: true },
      weekly: { value: Math.round(data?.sales?.kpis?.weekly?.value ?? 0), change: 0, positive: true },
      monthly: { value: Math.round(data?.sales?.kpis?.monthly?.value ?? 0), change: 0, positive: true }
    },
    comparison: data?.sales?.comparison || [
      { label: "Today vs Yesterday", diff: 0, pct: 0, positive: true },
      { label: "This Week vs Last Week", diff: 0, pct: 0, positive: true },
      { label: "This Month vs Last Month", diff: 0, pct: 0, positive: true }
    ],
    distribution: data?.sales?.distribution || [
      { name: "Dine-In", value: 0, pct: 0, color: "#0B6B50" },
      { name: "Takeaway", value: 0, pct: 0, color: "#F59E0B" },
      { name: "Online", value: 0, pct: 0, color: "#3B82F6" }
    ],
    trends: data?.sales?.trends || {
      Daily: [
        { name: "Mon", sales: 0 }, { name: "Tue", sales: 0 }, { name: "Wed", sales: 0 },
        { name: "Thu", sales: 0 }, { name: "Fri", sales: 0 }, { name: "Sat", sales: 0 }, { name: "Sun", sales: 0 }
      ],
      Weekly: [
        { name: "Wk 1", sales: 0 }, { name: "Wk 2", sales: 0 }, { name: "Wk 3", sales: 0 }, { name: "Wk 4", sales: 0 }
      ],
      Monthly: [
        { name: "Jan", sales: 0 }, { name: "Feb", sales: 0 }, { name: "Mar", sales: 0 },
        { name: "Apr", sales: 0 }, { name: "May", sales: 0 }, { name: "Jun", sales: 0 }
      ]
    },
    peakHours: data?.sales?.peakHours || [
      { slot: "8 AM – 10 AM", label: "Breakfast Rush", orders: 0, pct: 0 },
      { slot: "12 PM – 2 PM", label: "Lunch Rush", orders: 0, pct: 0 },
      { slot: "4 PM – 6 PM", label: "Evening Snacks", orders: 0, pct: 0 },
      { slot: "7 PM – 9 PM", label: "Dinner Rush", orders: 0, pct: 0 },
      { slot: "9 PM – 11 PM", label: "Late Dinner", orders: 0, pct: 0 }
    ],
    paymentMethods: data?.sales?.paymentMethods || [
      { method: "UPI", amount: 0, pct: 0, color: "#0B6B50" },
      { method: "Cash", amount: 0, pct: 0, color: "#F59E0B" },
      { method: "Card", amount: 0, pct: 0, color: "#3B82F6" }
    ],
    insights: data?.sales?.insights || ["No sales transactions recorded yet."]
  };

  const kpis = activeSales.kpis;
  const comparison = Array.isArray(activeSales.comparison) ? activeSales.comparison : salesComparison;
  const distribution = Array.isArray(activeSales.distribution) ? activeSales.distribution : revenueDistribution;
  const trends = activeSales.trends;
  const currentTrendData = trendTab === '7 Days' ? (trends.Daily || salesTrendDaily) : trendTab === 'Weekly' ? (trends.Weekly || salesTrendWeekly) : (trends.Monthly || salesTrendMonthly);
  const currentPeakHours = Array.isArray(activeSales.peakHours) ? activeSales.peakHours : peakHours;
  const currentPaymentMethods = Array.isArray(activeSales.paymentMethods) ? activeSales.paymentMethods : paymentMethods;
  const currentInsights = Array.isArray(activeSales.insights) ? activeSales.insights : salesInsights;

  const totalToday = kpis.today.value;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>Sales Tracking</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Monitor restaurant revenue, sales trends, business growth, and payment performance.
        </p>
      </div>

      {/* Section 1 — KPI Cards */}
      <div className="grid-4">
        {kpiCardDefs.map(({ label, key, Icon }) => {
          const kpi = kpis[key] || salesKpis[key];
          return (
            <div key={key} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#64748b' }}>{label}</p>
                <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="#0B6B50" />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', letterSpacing: '-0.5px' }}>{fmt(kpi.value)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 20,
                  background: kpi.positive ? '#f0fdf4' : '#fef2f2',
                  color: kpi.positive ? '#16a34a' : '#dc2626',
                }}>
                  {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.positive ? '+' : '-'}{kpi.change}%
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>vs prev</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2 — Sales Comparison */}
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B', marginBottom: 12 }}>Sales Comparison</h2>
        <div className="grid-3">
          {comparison.map((c) => (
            <div key={c.label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#64748b' }}>{c.label}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 700, color: c.positive ? '#0B6B50' : '#DC2626', letterSpacing: '-0.5px', marginBottom: 4 }}>
                    {c.positive ? '+' : ''}₹{Math.abs(c.diff).toLocaleString('en-IN')}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: c.positive ? '#16a34a' : '#dc2626' }}>
                    {c.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {c.positive ? '+' : ''}{c.pct}%
                  </span>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.positive ? '#EAF8F2' : '#FEE2E2' }}>
                  {c.positive
                    ? <TrendingUp size={20} color="#0B6B50" />
                    : <TrendingDown size={20} color="#dc2626" />
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3+4 — Revenue Distribution + Sales Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
        {/* Donut */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>Revenue Distribution</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>By sales channel today</p>
          <div style={{ position: 'relative', height: 180, marginBottom: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value" stroke="none">
                  {distribution.map((_, i) => <Cell key={i} fill={distribution[i].color || '#0B6B50'} />)}
                </Pie>
                <RechartTooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{fmt(totalToday)}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Today</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {distribution.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color || '#0B6B50', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{item.name}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.pct}%</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{fmt(item.value)}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color || '#0B6B50', borderRadius: 3, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Sales Trend</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Revenue over time</p>
            </div>
            <div className="chart-tabs">
              {['7 Days', 'Weekly', 'Monthly'].map(tab => (
                <button key={tab} className={`chart-tab ${trendTab === tab ? 'active' : ''}`} onClick={() => setTrendTab(tab)}>{tab}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={currentTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtTick} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={52} />
              <RechartTooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="sales" stroke="#0B6B50" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0B6B50' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 5 — Peak Business Hours */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={16} color="#0B6B50" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Peak Business Hours</h2>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Busiest time slots by order volume</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentPeakHours.map((h) => (
            <div key={h.slot} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 130, flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{h.slot}</p>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>{h.label}</p>
              </div>
              <div style={{ flex: 1, height: 32, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${Math.max(h.pct, 0)}%`, height: '100%', borderRadius: 10, display: 'flex', alignItems: 'center', paddingLeft: 12,
                  background: h.pct === 100 ? '#0B6B50' : h.pct >= 70 ? '#14B8A6' : '#EAF8F2',
                  transition: 'width 0.7s ease',
                }}>
                  {h.pct >= 30 && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>
                      {h.orders} {h.orders === 1 ? 'order' : 'orders'}
                    </span>
                  )}
                </div>
                {h.pct < 30 && (
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 600, color: '#64748b', pointerEvents: 'none' }}>
                    {h.orders} {h.orders === 1 ? 'order' : 'orders'}
                  </span>
                )}
              </div>
              <div style={{ width: 48, textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 20,
                  background: h.pct === 100 ? '#0B6B50' : '#f1f5f9',
                  color: h.pct === 100 ? '#fff' : '#64748b',
                }}>
                  {h.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6+7 — Payment Summary + Insights */}
      <div className="grid-2">
        {/* Payment */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} color="#0B6B50" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Payment Summary</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>How customers are paying today</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={currentPaymentMethods} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="amount" stroke="none">
                    {currentPaymentMethods.map((_, i) => <Cell key={i} fill={currentPaymentMethods[i].color || '#0B6B50'} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Today</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentPaymentMethods.map((p) => (
                <div key={p.method} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || '#0B6B50', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{p.method}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{p.pct}%</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{fmt(p.amount)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${p.pct}%`, height: '100%', background: p.color || '#0B6B50', borderRadius: 4, transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={16} color="#0B6B50" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Quick Sales Insights</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Auto-generated business observations</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentInsights.map((insight, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#FAFAFA', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EAF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Lightbulb size={12} color="#0B6B50" />
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
