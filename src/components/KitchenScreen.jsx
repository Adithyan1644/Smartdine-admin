import React, { useState } from 'react';
import { useSync } from '../context/SyncContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ChefHat, Clock, AlertTriangle, CheckCircle2, Flame, RefreshCw,
  Search, ShieldCheck, Zap, Activity, Filter, ArrowUpRight, TrendingDown
} from 'lucide-react';
import {
  kdsOverallKpis, prepTimeTrends, stationWorkload, dishPrepSpeedAudit, kdsInsights
} from '../data/kdsReportData';

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>{d.name}</p>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{d.count} orders · {d.pct}% of workload</p>
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
          <span style={{ fontSize: 12, color: '#64748b' }}>{p.dataKey === 'actual' ? 'Avg Prep Time' : 'Target SLA'}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{p.value} min</span>
        </div>
      ))}
    </div>
  );
};

export default function KitchenScreen() {
  const [timeFilter, setTimeFilter] = useState('Today');
  const [stationFilter, setStationFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { analyticsData } = useSync();

  const liveData = analyticsData?.overview?.kitchen || analyticsData?.kitchen || {};

  // Live or fallback metrics
  const hasLiveData = Boolean(liveData && (liveData.orderKpis || liveData.overallKpis));
  const totalKots = hasLiveData ? (liveData.orderKpis?.totalOrders?.value ?? 0) : kdsOverallKpis.totalKotsToday;
  const completedKots = hasLiveData ? (liveData.orderKpis?.completed?.value ?? 0) : Math.round(totalKots * 0.94);
  const activeKots = hasLiveData ? (liveData.orderKpis?.activeOrders?.value ?? 0) : Math.max(0, totalKots - completedKots);
  const overallKpis = liveData?.overallKpis || {};
  
  const currentStationWorkload = (Array.isArray(liveData?.stationWorkload) && liveData.stationWorkload.length > 0) ? liveData.stationWorkload : stationWorkload;
  const currentDishAudit = (Array.isArray(liveData?.dishPrepSpeedAudit) && liveData.dishPrepSpeedAudit.length > 0) ? liveData.dishPrepSpeedAudit : dishPrepSpeedAudit;

  const kpiCards = [
    { label: 'Avg Prep Time', value: hasLiveData ? (overallKpis.avgPrepTime || '0.0 min') : kdsOverallKpis.avgPrepTime, sub: 'Target: 12.0 min', Icon: Clock, color: '#0B6B50', bg: '#EAF8F2' },
    { label: 'SLA Compliance', value: hasLiveData ? (overallKpis.slaCompliance || '100%') : kdsOverallKpis.slaCompliance, sub: 'Target: 90%', Icon: ShieldCheck, color: '#22C55E', bg: '#DCFCE7' },
    { label: 'Completed KOTs', value: completedKots, sub: `Active: ${activeKots}`, Icon: CheckCircle2, color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Delayed Orders', value: hasLiveData ? (overallKpis.delayedOrders ?? 0) : kdsOverallKpis.delayedOrders, sub: 'Order Prep > 15m', Icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2' },
    { label: 'Efficiency Score', value: hasLiveData ? (overallKpis.efficiencyScore || '100%') : kdsOverallKpis.efficiencyScore, sub: 'Optimal Performance', Icon: Zap, color: '#8B5CF6', bg: '#F3E8FF' },
    { label: 'Kitchen Load', value: hasLiveData ? (overallKpis.kitchenLoad || '0%') : kdsOverallKpis.kitchenLoad, sub: 'Smooth Operation', Icon: Activity, color: '#F59E0B', bg: '#FEF3C7' },
  ];

  const trendData = prepTimeTrends[timeFilter] || prepTimeTrends.Today;

  const filteredDishes = currentDishAudit.filter(item => {
    const matchesStation = stationFilter === 'All' || item.station === stationFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStation && matchesSearch;
  });

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Section 1: Page Title & Global Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>Kitchen Performance & KDS Reports</h1>
            <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} /> Live System Healthy
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            Comprehensive KDS operational reports, preparation speeds, station workloads, and SLA compliance metrics.
          </p>
        </div>

        {/* Time Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: 10, padding: 3 }}>
          {['Today', 'Yesterday', 'Weekly', 'Monthly'].map(tab => (
            <button
              key={tab}
              onClick={() => setTimeFilter(tab)}
              style={{
                border: 'none',
                background: timeFilter === tab ? '#fff' : 'transparent',
                color: timeFilter === tab ? '#0B6B50' : '#64748b',
                fontWeight: timeFilter === tab ? 700 : 500,
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: timeFilter === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: KDS KPI Overview Grid */}
      <div className="grid-6">
        {kpiCards.map(({ label, value, sub, Icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8' }}>{label}</p>
              <div style={{ width: 32, height: 32, background: bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#1E293B', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: Recharts Visualizations (Prep Time Trend + Station Workload) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Chart 1: Preparation Time vs SLA Benchmark */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Prep Speed vs SLA Target</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Average dish preparation time in minutes across peak hours</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#0B6B50', background: '#EAF8F2', padding: '4px 10px', borderRadius: 6 }}>
              SLA Benchmark: 12 min
            </span>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 20]} />
                <RechartTooltip content={<PrepTooltip />} />
                <Line type="monotone" dataKey="actual" stroke="#0B6B50" strokeWidth={3} dot={{ fill: '#0B6B50', r: 4 }} activeDot={{ r: 6 }} name="Avg Prep Time" />
                <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target SLA" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Kitchen Station Workload Distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Station Workload Mix</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Order volume distribution by kitchen station</p>
          </div>

          <div style={{ position: 'relative', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentStationWorkload} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={3} dataKey="count" stroke="none">
                  {currentStationWorkload.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#0B6B50'} />
                  ))}
                </Pie>
                <RechartTooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1E293B' }}>{totalKots}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total KOTs</p>
            </div>
          </div>

          {/* Legend Items */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {currentStationWorkload.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color || '#0B6B50', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Dish Preparation Speed & SLA Bottleneck Audit Table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Dish Preparation & SLA Bottleneck Audit</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Detailed dish-level prep times, SLA targets, and delay frequency</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 200 }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search dish..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 30,
                  paddingRight: 10,
                  paddingTop: 6,
                  paddingBottom: 6,
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  outline: 'none'
                }}
              />
            </div>

            {/* Station Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', padding: 3, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              {['All', 'Main Kitchen', 'Tandoor & Grill', 'Bar & Beverages', 'Desserts & Pantry'].map(st => (
                <button
                  key={st}
                  onClick={() => setStationFilter(st)}
                  style={{
                    border: 'none',
                    background: stationFilter === st ? '#0B6B50' : 'transparent',
                    color: stationFilter === st ? '#fff' : '#64748b',
                    fontSize: 11,
                    fontWeight: stationFilter === st ? 600 : 500,
                    padding: '5px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st === 'All' ? 'All Stations' : st.split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dish Name</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Station</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Avg Prep Time</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Target SLA</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Orders</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delays</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>SLA Compliance</th>
                <th style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDishes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No matching dishes found for the selected station or search query.
                  </td>
                </tr>
              ) : (
                filteredDishes.map(dish => {
                  let badgeBg = '#DCFCE7';
                  let badgeText = '#15803D';
                  if (dish.status === 'Delayed') { badgeBg = '#FEE2E2'; badgeText = '#DC2626'; }
                  else if (dish.status === 'Nearing SLA') { badgeBg = '#FEF3C7'; badgeText = '#D97706'; }

                  return (
                    <tr key={dish.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <p style={{ fontWeight: 600, color: '#1E293B', fontSize: 13 }}>{dish.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{dish.category}</p>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#475569', fontWeight: 500 }}>{dish.station}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: dish.status === 'Delayed' ? '#DC2626' : '#1E293B' }}>{dish.avgPrepTime}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b' }}>{dish.targetSla}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: '#1E293B' }}>{dish.totalOrders}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600, color: dish.delays > 0 ? '#EF4444' : '#22C55E' }}>{dish.delays}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#0B6B50' }}>{dish.slaScore}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: badgeBg, color: badgeText, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12, display: 'inline-block' }}>
                          {dish.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Operational Insights Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {kdsInsights.map((insight, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, borderLeft: `4px solid ${insight.priority === 'High' ? '#EF4444' : insight.priority === 'Medium' ? '#F59E0B' : '#3B82F6'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: insight.priority === 'High' ? '#EF4444' : insight.priority === 'Medium' ? '#D97706' : '#3B82F6', background: insight.priority === 'High' ? '#FEE2E2' : insight.priority === 'Medium' ? '#FEF3C7' : '#DBEAFE', padding: '2px 6px', borderRadius: 4 }}>
                {insight.priority} Priority
              </span>
              <ChefHat size={14} color="#94a3b8" />
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{insight.title}</h3>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{insight.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
