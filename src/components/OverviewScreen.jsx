import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import { API_URL } from '../config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, ShoppingBag,
  Sparkles, ChefHat, Clock, Smartphone, LayoutDashboard, Lightbulb,
  UtensilsCrossed, BarChart2, AlertTriangle, Zap, Users,
} from 'lucide-react';
import { mockData } from '../data/mockData';

/* ---- Filter multipliers ---- */
const multipliers = { today: 1, yesterday: 0.88, week: 7, month: 30, custom: 1.12 };

/* ---- Chart Data ---- */
const dailyData = [
  { name: 'Mon', sales: 60000, expenses: 15000, profit: 45000 },
  { name: 'Tue', sales: 65000, expenses: 16000, profit: 49000 },
  { name: 'Wed', sales: 62000, expenses: 15500, profit: 46500 },
  { name: 'Thu', sales: 70000, expenses: 17000, profit: 53000 },
  { name: 'Fri', sales: 85000, expenses: 20000, profit: 65000 },
  { name: 'Sat', sales: 90000, expenses: 22000, profit: 68000 },
  { name: 'Sun', sales: 84290, expenses: 18500, profit: 65790 },
];
const weeklyData = [
  { name: 'Wk 1', sales: 420000, expenses: 105000, profit: 315000 },
  { name: 'Wk 2', sales: 480000, expenses: 118000, profit: 362000 },
  { name: 'Wk 3', sales: 510000, expenses: 122000, profit: 388000 },
  { name: 'Wk 4', sales: 590290, expenses: 129500, profit: 460790 },
];
const monthlyData = [
  { name: 'Jan', sales: 1800000, expenses: 450000, profit: 1350000 },
  { name: 'Feb', sales: 1650000, expenses: 415000, profit: 1235000 },
  { name: 'Mar', sales: 1920000, expenses: 480000, profit: 1440000 },
  { name: 'Apr', sales: 2100000, expenses: 510000, profit: 1590000 },
  { name: 'May', sales: 2250000, expenses: 540000, profit: 1710000 },
  { name: 'Jun', sales: 2000290, expenses: 474500, profit: 1525790 },
];
const chartDataMap = { Daily: dailyData, Weekly: weeklyData, Monthly: monthlyData };

const formatValue = (v) => {
  if (v >= 1000000) return `₹${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const kpiIcons = [DollarSign, Receipt, Wallet, ShoppingBag];
const rankColors = ['#0B6B50', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
const donutColors = ['#0B6B50', '#F59E0B', '#3B82F6'];

const pulseIcons = [TrendingUp, ChefHat, Clock, Smartphone];
const pulseColors = ['#0B6B50', '#0B6B50', '#3B82F6', '#8B5CF6'];

const insightConfig = [
  { icon: TrendingUp, color: '#0B6B50', bg: '#EAF8F2' },
  { icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
  { icon: Zap, color: '#D97706', bg: '#FEF3C7' },
  { icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
];
const priorityStyle = {
  High: 'bg-red text-red',
  Medium: 'bg-amber text-amber',
  Low: 'bg-green text-green',
};

/* ---- Custom Tooltip ---- */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, color: '#374151', marginBottom: 8, fontSize: 12 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>{entry.dataKey}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{formatValue(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, fontSize: 12, color: '#374151' }}>{payload[0].name}</p>
      <p style={{ fontSize: 12, color: '#64748b' }}>{payload[0].value}%</p>
    </div>
  );
};

export default function OverviewScreen() {
  const [filter, setFilter] = useState('today');
  const [chartTab, setChartTab] = useState('Daily');
  
  const { analyticsData, isBillerConnected } = useSync();

  const data = analyticsData;

  const activeData = (data && data.overview) ? data.overview : {
    kpis: {
      sales: { value: 0 },
      expenses: { value: 0 },
      profit: { value: 0 },
      orders: { value: 0 }
    },
    pulse: ["Welcome to Surabhi SmartDine! Start taking orders in POS Biller to view live stats."],
    topDishes: [],
    kitchen: { status: "Idle", prepTime: "—", delayedOrders: 0, fastestItem: "—", slowestItem: "—", efficiency: 100 },
    businessMix: [
      { name: "Dine In", value: 0 },
      { name: "Takeaway", value: 0 },
      { name: "Delivery", value: 0 }
    ],
    insights: [
      { priority: "Low", title: "Live Connection", desc: "No active connection." }
    ],
    charts: {
      Daily: [
        { name: 'Mon', sales: 0, expenses: 0, profit: 0 },
        { name: 'Tue', sales: 0, expenses: 0, profit: 0 },
        { name: 'Wed', sales: 0, expenses: 0, profit: 0 },
        { name: 'Thu', sales: 0, expenses: 0, profit: 0 },
        { name: 'Fri', sales: 0, expenses: 0, profit: 0 },
        { name: 'Sat', sales: 0, expenses: 0, profit: 0 },
        { name: 'Sun', sales: 0, expenses: 0, profit: 0 }
      ],
      Weekly: [
        { name: 'Wk 1', sales: 0, expenses: 0, profit: 0 },
        { name: 'Wk 2', sales: 0, expenses: 0, profit: 0 },
        { name: 'Wk 3', sales: 0, expenses: 0, profit: 0 },
        { name: 'Wk 4', sales: 0, expenses: 0, profit: 0 }
      ],
      Monthly: [
        { name: 'Jan', sales: 0, expenses: 0, profit: 0 },
        { name: 'Feb', sales: 0, expenses: 0, profit: 0 },
        { name: 'Mar', sales: 0, expenses: 0, profit: 0 },
        { name: 'Apr', sales: 0, expenses: 0, profit: 0 },
        { name: 'May', sales: 0, expenses: 0, profit: 0 },
        { name: 'Jun', sales: 0, expenses: 0, profit: 0 }
      ]
    }
  };

  const kpis = {
    sales: Math.round(activeData.kpis?.sales?.value ?? 0),
    expenses: Math.round(activeData.kpis?.expenses?.value ?? 0),
    profit: Math.round(activeData.kpis?.profit?.value ?? 0),
    orders: activeData.kpis?.orders?.value ?? 0,
  };

  const dishes = (activeData.topDishes || []).map(d => ({
    ...d,
    orders: d.orders,
    revenue: d.revenue,
  }));
  const maxRevenue = Math.max(...dishes.map(d => d.revenue), 1);
  const chartData = activeData.charts?.[chartTab] || [];

  const kpiCards = [
    { label: "Today's Sales",    value: `₹${kpis.sales.toLocaleString('en-IN')}`,    change: 'Live', positive: true,  iIcon: 0 },
    { label: "Today's Expenses", value: `₹${kpis.expenses.toLocaleString('en-IN')}`, change: 'Live',  positive: false, iIcon: 1 },
    { label: 'Net Profit',       value: `₹${kpis.profit.toLocaleString('en-IN')}`,   change: 'Live', positive: true,  iIcon: 2 },
    { label: 'Total Orders',     value: kpis.orders.toLocaleString('en-IN'),          change: 'Live',  positive: true,  iIcon: 3 },
  ];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Section 1: Health Overview Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>Restaurant Health Overview</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isBillerConnected ? '#22c55e' : '#dc2626', display: 'inline-block' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: isBillerConnected ? '#0B6B50' : '#dc2626' }}>
              {isBillerConnected ? 'Live Data Active' : 'Disconnected (Showing Saved Data)'}
            </span>
          </div>
        </div>
        <div className="filter-bar">
          {[['today','Today'],['yesterday','Yesterday'],['week','This Week'],['month','This Month'],['custom','Custom Range']].map(([key,label]) => (
            <button key={key} className={`filter-btn ${filter===key?'active':''}`} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Pulse / AI Insights Card */}
      <div className="pulse-card">
        <div className="pulse-header">
          <div className="pulse-icon">
            <Sparkles size={14} color="#0B6B50" />
          </div>
          <span className="pulse-label">AI Insights</span>
        </div>
        <div className="pulse-grid">
          {(activeData.pulse || mockData.pulse).map((item, i) => {
            const Icon = pulseIcons[i % pulseIcons.length];
            const color = pulseColors[i % pulseColors.length];
            return (
              <div key={i} className="pulse-item">
                <div className="pulse-item-icon" style={{ backgroundColor: `${color}18` }}>
                  <Icon size={12} color={color} />
                </div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{item}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        {kpiCards.map((kpi, i) => {
          const Icon = kpiIcons[i];
          return (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#64748b' }}>{kpi.label}</p>
                <div className="kpi-icon-wrap">
                  <Icon size={16} color="#0B6B50" />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', letterSpacing: '-0.5px' }}>{kpi.value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                  background: kpi.positive ? '#f0fdf4' : '#fef2f2',
                  color: kpi.positive ? '#16a34a' : '#dc2626'
                }}>
                  {kpi.change}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>vs last period</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Graph Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>Financial Performance</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Sales, expenses, and net profit trend</p>
          </div>
          <div className="filter-bar">
            {['Daily', 'Weekly', 'Monthly'].map(tab => (
              <button key={tab} className={`filter-btn ${chartTab===tab?'active':''}`} onClick={() => setChartTab(tab)}>{tab}</button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={formatValue} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingLeft: 20 }} />
              <Line type="monotone" dataKey="sales" name="Sales" stroke="#0B6B50" strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kitchen Health + Top Dishes */}
      <div className="grid-2">
        {/* Kitchen Health */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={16} color="#0B6B50" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Kitchen Health</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#EAF8F2', borderRadius: 12, marginBottom: 16 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} className="animate-pulse" />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#0B6B50' }}>Kitchen Status</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#0B6B50' }}>{activeData.kitchen.status}</p>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Clock size={14} color="#3B82F6" />
                <p style={{ fontSize: 12, color: '#64748b' }}>Avg Prep Time</p>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>{activeData.kitchen.prepTime}</p>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={14} color="#22c55e" />
                <p style={{ fontSize: 12, color: '#64748b' }}>Delayed Orders</p>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#0B6B50' }}>{activeData.kitchen.delayedOrders}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 10 }}>
            <Zap size={16} color="#EAB308" />
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fastest Item</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginTop: 2 }}>{activeData.kitchen.fastestItem}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, marginBottom: 16 }}>
            <Clock size={16} color="#F97316" />
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Slowest Item</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginTop: 2 }}>{activeData.kitchen.slowestItem}</p>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Kitchen Efficiency</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0B6B50' }}>{activeData.kitchen.efficiency}%</span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${activeData.kitchen.efficiency}%`, height: '100%', background: '#0B6B50', borderRadius: 4, transition: 'width 0.7s ease' }} />
            </div>
          </div>
        </div>

        {/* Top Dishes */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UtensilsCrossed size={16} color="#0B6B50" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Top Dishes</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {dishes.map((dish, idx) => {
              const pct = maxRevenue > 1 ? Math.min(100, Math.round((dish.revenue / maxRevenue) * 100)) : 0;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: idx === 0 ? '#0B6B50' : '#64748b', background: idx === 0 ? '#EAF8F2' : '#f1f5f9', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{dish.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>₹{dish.revenue.toLocaleString('en-IN')}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>{dish.orders} {dish.orders === 1 ? 'order' : 'orders'}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: rankColors[idx % rankColors.length], borderRadius: 3, transition: 'width 0.7s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Mix + Quick Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Business Mix Donut */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={16} color="#0B6B50" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Business Mix</h3>
          </div>
          <div style={{ position: 'relative', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeData.businessMix || mockData.businessMix} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                  {(activeData.businessMix || mockData.businessMix).map((_, index) => (
                    <Cell key={index} fill={donutColors[index % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>{kpis.orders}</p>
              <p style={{ fontSize: 11, color: '#94a3b8' }}>Total Orders</p>
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(activeData.businessMix || mockData.businessMix).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: donutColors[i % donutColors.length], display: 'inline-block' }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={16} color="#0B6B50" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Quick Insights</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(activeData.insights || mockData.insights).map((insight, i) => {
              const { icon: Icon, color, bg } = insightConfig[i % insightConfig.length];
              const priorityBg = insight.priority === 'High' ? '#fee2e2' : insight.priority === 'Medium' ? '#fef3c7' : '#f0fdf4';
              const priorityColor = insight.priority === 'High' ? '#dc2626' : insight.priority === 'Medium' ? '#d97706' : '#16a34a';
              return (
                <div key={i} style={{ padding: '14px', background: '#FAFAFA', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12, background: priorityBg, color: priorityColor }}>
                      {insight.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', marginBottom: 4, lineHeight: 1.3 }}>{insight.title}</p>
                  <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{insight.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
