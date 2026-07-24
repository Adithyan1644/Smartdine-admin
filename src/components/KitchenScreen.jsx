import React, { useState } from 'react';
import { API_URL } from '../config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingCart, Flame, CheckCircle2, Users, Package, Wifi,
  ChefHat, Clock, AlertTriangle, Zap, ArrowRight, Lightbulb,
  TrendingUp, TrendingDown, Timer,
} from 'lucide-react';
import {
  orderKpis, orderDistribution, kitchenKpis, kitchenStatus,
  liveSummary, orderTimeline, prepTrendToday, prepTrend7Days,
  prepTrendWeekly, prepTrendMonthly, delayedItems, operationalInsights,
} from '../data/kitchenData';

const trendMap = {
  Today: prepTrendToday,
  'Last 7 Days': prepTrend7Days,
  Weekly: prepTrendWeekly,
  Monthly: prepTrendMonthly,
};

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{d.name}</p>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.count} {d.count === 1 ? 'order' : 'orders'} · {d.pct}%</p>
    </div>
  );
};

const PrepTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 8 }}>{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>{p.dataKey === 'today' ? 'Today' : 'Yesterday'}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{p.value} min</span>
        </div>
      ))}
    </div>
  );
};

const statusConfig = {
  Smooth:   { bg: '#EAF8F2', text: '#0B6B50', dot: '#22C55E' },
  Busy:     { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  Critical: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
};

const orderKpiCards = [
  { label: 'Total Orders',   value: orderKpis.total,     Icon: ShoppingCart },
  { label: 'Active Orders',  value: orderKpis.active,    Icon: Flame },
  { label: 'Completed',      value: orderKpis.completed, Icon: CheckCircle2 },
  { label: 'Dine-In',        value: orderKpis.dineIn,    Icon: Users },
  { label: 'Takeaway',       value: orderKpis.takeaway,  Icon: Package },
  { label: 'Online',         value: orderKpis.online,    Icon: Wifi },
];

export default function KitchenScreen() {
  const [trendFilter, setTrendFilter] = useState('Today');
  const [sortByDelay, setSortByDelay] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let active = true;

    const fetchKitchen = (showLoading = false) => {
      if (showLoading) setLoading(true);
      let syncCode = 'SD-28E792';
      try {
        const setup = JSON.parse(localStorage.getItem('smartdine_setup') || '{}');
        const account = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
        syncCode = setup.syncCode || account.syncCode || 'SD-28E792';
      } catch (e) {
        console.warn('Failed to parse setup configuration', e);
      }

      fetch(`${API_URL}/api/activation/analytics?filter=today&code=${syncCode}`)
        .then(res => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(json => {
          if (active) {
            setData(json);
            setLoading(false);
          }
        })
        .catch(err => {
          console.warn('[KitchenScreen] Failed to fetch kitchen analytics:', err);
          if (active) {
            setLoading(false);
          }
        });
    };

    fetchKitchen(true);
    const interval = setInterval(() => fetchKitchen(false), 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const activeKitchen = {
    orderKpis: {
      total: data?.kitchen?.orderKpis?.totalOrders?.value ?? orderKpis.total,
      active: data?.kitchen?.orderKpis?.activeOrders?.value ?? orderKpis.active,
      completed: data?.kitchen?.orderKpis?.completed?.value ?? orderKpis.completed,
      dineIn: data?.kitchen?.orderKpis?.dineIn?.value ?? orderKpis.dineIn,
      takeaway: data?.kitchen?.orderKpis?.takeaway?.value ?? orderKpis.takeaway,
      online: data?.kitchen?.orderKpis?.online?.value ?? orderKpis.online,
    },
    orderDistribution: data?.kitchen?.orderDistribution || orderDistribution,
    kitchenKpis: data?.kitchen?.kitchenKpis || kitchenKpis,
    kitchenStatus: data?.kitchen?.kitchenStatus || kitchenStatus,
    liveSummary: data?.kitchen?.liveSummary || liveSummary,
    delayedItems: data?.kitchen?.delayedItems || delayedItems,
    operationalInsights: data?.kitchen?.operationalInsights || operationalInsights
  };

  const kpis = activeKitchen.orderKpis;
  const distribution = Array.isArray(activeKitchen.orderDistribution) ? activeKitchen.orderDistribution : orderDistribution;
  const stats = activeKitchen.kitchenKpis;
  const statusInfo = activeKitchen.kitchenStatus;
  const summary = activeKitchen.liveSummary;
  const delays = Array.isArray(activeKitchen.delayedItems) ? activeKitchen.delayedItems : delayedItems;
  const currentInsights = Array.isArray(activeKitchen.operationalInsights) ? activeKitchen.operationalInsights : operationalInsights;

  const status = statusConfig[statusInfo.status || 'Smooth'] || statusConfig.Smooth;
  const trendData = trendMap[trendFilter] || prepTrendToday;

  const sortedItems = sortByDelay
    ? [...delays].sort((a, b) => b.avgPrepTime - a.avgPrepTime)
    : [...delays].sort((a, b) => b.delays - a.delays);

  const orderKpiCards = [
    { label: 'Total Orders',   value: kpis.total,     Icon: ShoppingCart },
    { label: 'Active Orders',  value: kpis.active,    Icon: Flame },
    { label: 'Completed',      value: kpis.completed, Icon: CheckCircle2 },
    { label: 'Dine-In',        value: kpis.dineIn || Math.round(kpis.total * 0.5),    Icon: Users },
    { label: 'Takeaway',       value: kpis.takeaway || Math.round(kpis.total * 0.2),  Icon: Package },
    { label: 'Online',         value: kpis.online || Math.round(kpis.total * 0.3),    Icon: Wifi },
  ];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>Orders & Kitchen Health</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Monitor restaurant operations, kitchen performance, order flow, and preparation efficiency in real time.
        </p>
      </div>

      {/* Section 1 — Orders Overview */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Orders Overview</h2>
        <div className="grid-6">
          {orderKpiCards.map(({ label, value, Icon }) => (
            <div key={label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', lineHeight: 1.3 }}>{label}</p>
                <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color="#0B6B50" />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', letterSpacing: '-0.5px' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2+3 — Order Distribution + Kitchen KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
        {/* Order Distribution Donut */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>Order Distribution</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>By channel today</p>
          <div style={{ position: 'relative', height: 170, marginBottom: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="count" stroke="none">
                  {distribution.map((_, i) => <Cell key={i} fill={distribution[i].color || '#0B6B50'} />)}
                </Pie>
                <RechartTooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#1E293B' }}>{kpis.total}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Total Orders</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {distribution.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color || '#0B6B50', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{item.name}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.pct}%</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{item.count}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color || '#0B6B50', borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen KPIs + Pulse */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2" style={{ gap: 16 }}>
            {/* Avg Prep Time */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' }}>Avg Prep Time</p>
                <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={14} color="#0B6B50" />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1E293B' }}>
                {stats.avgPrepTime} <span style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>min</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} color="#ef4444" />
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>+{Math.max(0, stats.avgPrepTime - (stats.yesterdayPrepTime || 14))} min</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>vs yesterday ({stats.yesterdayPrepTime || 14} min)</span>
              </div>
            </div>

            {/* Active KOTs */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' }}>Active KOTs</p>
                <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flame size={14} color="#0B6B50" />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#1E293B' }}>{stats.activeKots}</p>
            </div>

            {/* Ready Orders */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' }}>Ready Orders</p>
                <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={14} color="#0B6B50" />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#0B6B50' }}>{stats.readyOrders}</p>
            </div>

            {/* Delayed Orders */}
            <div className="card" style={{
              display: 'flex', flexDirection: 'column', gap: 12,
              ...(stats.delayedOrders > 0 ? { background: '#fffbeb', border: '1px solid #fde68a' } : {}),
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8' }}>Delayed Orders</p>
                <div style={{ width: 28, height: 28, background: stats.delayedOrders > 0 ? '#fef3c7' : '#EAF8F2', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={14} color={stats.delayedOrders > 0 ? '#D97706' : '#0B6B50'} />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: stats.delayedOrders > 0 ? '#D97706' : '#0B6B50' }}>{stats.delayedOrders}</p>
            </div>
          </div>

          {/* Kitchen Pulse */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: '#EAF8F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={16} color="#0B6B50" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Kitchen Pulse</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 12, marginBottom: 16, background: status.bg }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: status.dot, flexShrink: 0 }} className="animate-pulse" />
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: status.text }}>Kitchen Status</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: status.text, marginTop: 2 }}>{statusInfo.status}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{statusInfo.message}</p>
          </div>
        </div>
      </div>

      {/* Section 5 — Prep Time Trend */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Preparation Time Trend</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Today vs Yesterday — average minutes per order</p>
          </div>
          <div className="chart-tabs">
            {['Today', 'Last 7 Days', 'Weekly', 'Monthly'].map(tab => (
              <button key={tab} className={`chart-tab ${trendFilter === tab ? 'active' : ''}`} onClick={() => setTrendFilter(tab)}>{tab}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} unit=" min" />
            <RechartTooltip content={<PrepTooltip />} />
            <Line type="monotone" dataKey="today" stroke="#0B6B50" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Today" />
            <Line type="monotone" dataKey="yesterday" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} name="Yesterday" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 2, background: '#0B6B50', borderRadius: 2, display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>Today</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 0, border: '1.5px dashed #94A3B8', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>Yesterday</span>
          </div>
        </div>
      </div>

      {/* Section 6 — Live Kitchen Summary + Order Timeline */}
      <div className="grid-2">
        {/* Live Summary */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#0B6B50" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Live Kitchen Summary</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Current kitchen queue status</p>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            {[
              { label: 'Orders Cooking',  value: summary.cooking,      Icon: Flame,        color: '#F59E0B', bg: '#FEF3C7' },
              { label: 'Orders Waiting',  value: summary.waiting,      Icon: Timer,        color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Orders Ready',    value: summary.ready,        Icon: CheckCircle2, color: '#0B6B50', bg: '#EAF8F2' },
              { label: 'Avg Queue Time',  value: summary.avgQueueTime, Icon: Clock,        color: '#8B5CF6', bg: '#F5F3FF' },
            ].map(({ label, value, Icon, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', borderRadius: 12, background: bg }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}22` }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: `${color}cc` }}>{label}</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Timeline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={16} color="#0B6B50" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Live Order Timeline</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Orders flowing through the kitchen right now</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            {orderTimeline.map((stage, i) => (
              <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 auto 8px', background: stage.color }}>
                    {stage.count}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#1E293B', lineHeight: 1.3, textAlign: 'center' }}>{stage.stage}</p>
                </div>
                {i < orderTimeline.length - 1 && <ArrowRight size={16} color="#d1d5db" style={{ flexShrink: 0, margin: '0 4px' }} />}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {orderTimeline.map((stage) => (
              <div key={stage.stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color, flexShrink: 0 }} />
                <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((stage.count / kpis.total) * 100)}%`, height: '100%', background: stage.color, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, color: '#64748b', width: 120, textAlign: 'right' }}>{stage.stage} ({stage.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 7 — Most Delayed Items */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#FEF3C7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#D97706" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Most Delayed Menu Items</h2>
              <p style={{ fontSize: 12, color: '#94a3b8' }}>Items causing the most preparation delays today</p>
            </div>
          </div>
          <button onClick={() => setSortByDelay(!sortByDelay)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 12, fontWeight: 500, color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer' }}>
            <Timer size={14} />
            Sort by {sortByDelay ? 'Delays' : 'Prep Time'}
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Rank', 'Item Name', 'Avg Prep Time', 'Delays Today', 'Status'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item, idx) => (
                <tr key={item.name}>
                  <td>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, background: idx === 0 ? '#DC2626' : idx === 1 ? '#D97706' : '#94A3B8' }}>
                      {idx + 1}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1E293B' }}>{item.name}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                      <Clock size={14} color="#94a3b8" /> {item.avgPrepTime} min
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 13, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                      background: item.delays >= 10 ? '#fee2e2' : item.delays >= 5 ? '#fef3c7' : '#f1f5f9',
                      color: item.delays >= 10 ? '#dc2626' : item.delays >= 5 ? '#d97706' : '#64748b',
                    }}>
                      {item.delays} delays
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {item.avgPrepTime > 20
                        ? <><TrendingUp size={14} color="#ef4444" /><span style={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>High</span></>
                        : <><TrendingDown size={14} color="#22c55e" /><span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500 }}>Normal</span></>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 9 — Operational Insights */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lightbulb size={16} color="#0B6B50" />
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Operational Insights</h2>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Auto-generated kitchen & order observations</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {currentInsights.map((insight, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', background: '#FAFAFA', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#EAF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Lightbulb size={12} color="#0B6B50" />
              </div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
