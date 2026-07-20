import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Receipt, TrendingUp, TrendingDown, Plus, Search, Lightbulb, CalendarDays, CreditCard, X } from 'lucide-react';
import {
  expenseCategories,
} from '../data/expenseData';

const formatINR = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v.toLocaleString('en-IN')}`;

const formatDate = (d) => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getDaysAgoStr = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const TODAY = getTodayStr();
const THIS_WEEK_START = getDaysAgoStr(7);
const THIS_MONTH_START = getTodayStr().substring(0, 8) + '01'; // First day of current month

const CATEGORY_COLORS = {
  "Raw Material": "#0B6B50",
  "Staff Salary": "#3B82F6",
  "Rent": "#8B5CF6",
  "Vegetables": "#F59E0B",
  "Electricity": "#EC4899",
  "Groceries": "#14B8A6",
  "Miscellaneous": "#94A3B8"
};
const getCategoryColor = (c) => CATEGORY_COLORS[c] || "#64748B";

const sum = (entries) => entries.reduce((a, e) => a + e.amount, 0);

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <p style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{payload[0].name}</p>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{payload[0].payload.percentage}% · {formatINR(payload[0].payload.amount)}</p>
    </div>
  );
};

export default function ExpensesScreen() {
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem('smartdine_expenses');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('smartdine_expenses', JSON.stringify(entries));
  }, [entries]);

  const [form, setForm] = useState({ date: TODAY, category: 'Raw Material', amount: '', notes: '' });
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  const todayTotal = useMemo(() => sum(entries.filter(e => e.date === TODAY)), [entries]);
  const weekTotal = useMemo(() => sum(entries.filter(e => e.date >= THIS_WEEK_START)), [entries]);
  const monthTotal = useMemo(() => sum(entries.filter(e => e.date >= THIS_MONTH_START)), [entries]);

  const categoryDistribution = useMemo(() => {
    const groups = {};
    expenseCategories.forEach(c => {
      groups[c] = { name: c, amount: 0, color: getCategoryColor(c) };
    });
    
    entries.forEach(e => {
      if (groups[e.category]) {
        groups[e.category].amount += e.amount;
      }
    });
    
    const total = sum(entries);
    const list = Object.values(groups).filter(g => g.amount > 0);
    
    return list.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.amount * 100) / total) : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [entries]);

  const expenseInsights = useMemo(() => {
    const total = sum(entries);
    if (total === 0) {
      return [
        { text: "No expenses recorded yet. Use the 'Add Expense' form on the right to start tracking." },
        { text: "All expense categories are currently at ₹0 spending." }
      ];
    }
    
    const sorted = [...categoryDistribution].sort((a, b) => b.amount - a.amount);
    const largest = sorted[0];
    const list = [];
    
    if (largest) {
      list.push({ text: `${largest.name} accounts for ${largest.percentage}% of expenses — your largest cost driver.` });
    }
    list.push({ text: `Your total operating expenses stand at ${formatINR(total)}.` });
    
    if (sorted.length > 1) {
      const second = sorted[1];
      list.push({ text: `${second.name} is your second-largest expense at ${second.percentage}% of costs.` });
    }
    list.push({ text: `Categorized spending helps optimize your restaurant's profit margins.` });
    return list;
  }, [entries, categoryDistribution]);

  const filtered = useMemo(() => {
    return entries
      .filter(e => {
        const matchCat = filterCat === 'All' || e.category === filterCat;
        const matchDate = !filterDate || e.date === filterDate;
        const matchSearch = e.category.toLowerCase().includes(search.toLowerCase()) || e.notes.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchDate && matchSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [entries, filterCat, filterDate, search]);

  const handleAdd = () => {
    if (!form.amount || Number(form.amount) <= 0) { setFormError('Please enter a valid amount.'); return; }
    const entry = { id: Date.now(), date: form.date, category: form.category, amount: Number(form.amount), notes: form.notes.trim() };
    setEntries([entry, ...entries]);
    setForm({ date: TODAY, category: 'Raw Material', amount: '', notes: '' });
    setFormError('');
  };
  const handleDelete = (id) => setEntries(entries.filter(e => e.id !== id));

  const kpiCards = [
    { label: "Today's Expenses",      value: todayTotal,  change: 8,  positive: false, Icon: CreditCard },
    { label: "This Week's Expenses",  value: weekTotal,   change: 5,  positive: false, Icon: CalendarDays },
    { label: "This Month's Expenses", value: monthTotal,  change: 3,  positive: true,  Icon: Receipt },
  ];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>Expense Management</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Track restaurant expenses, monitor spending patterns, and understand where money is being spent.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid-3">
        {kpiCards.map(({ label, value, change, positive, Icon }) => (
          <div key={label} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{label}</p>
              <div style={{ width: 36, height: 36, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="#0B6B50" />
              </div>
            </div>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#1E293B', letterSpacing: '-1px' }}>{formatINR(value)}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                padding: '4px 10px', borderRadius: 20,
                background: positive ? '#f0fdf4' : '#fef2f2',
                color: positive ? '#16a34a' : '#dc2626',
              }}>
                {positive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                {positive ? '-' : '+'}{change}%
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>vs previous period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Expense Distribution + Add Expense */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Donut Chart */}
        <div className="card">
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>Expense Distribution</h2>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Where your money is being spent this month</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryDistribution.length > 0 ? categoryDistribution : [{ name: 'No Expenses', amount: 1, color: '#e2e8f0', percentage: 0 }]} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={62} 
                    outerRadius={90} 
                    paddingAngle={2} 
                    dataKey="amount" 
                    stroke="none"
                  >
                    {categoryDistribution.length > 0 
                      ? categoryDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)
                      : <Cell fill="#e2e8f0" />
                    }
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{formatINR(monthTotal)}</p>
                <p style={{ fontSize: 11, color: '#94a3b8' }}>This Month</p>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {categoryDistribution.length === 0 ? (
                <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: '40px 0' }}>No expense records found.</p>
              ) : (
                categoryDistribution.map((item) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{item.name}</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{item.percentage}%</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{formatINR(item.amount)}</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={16} color="#0B6B50" />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Add Expense</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            <div>
              <label className="form-label">Expense Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {expenseCategories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Amount (₹)</label>
              <input type="number" placeholder="e.g. 2500" className="form-control" value={form.amount}
                onChange={e => { setForm({ ...form, amount: e.target.value }); setFormError(''); }} />
              {formError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{formError}</p>}
            </div>
            <div>
              <label className="form-label">Notes</label>
              <input type="text" placeholder="e.g. Daily vegetable purchase" className="form-control" value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <button className="btn-primary" onClick={handleAdd} style={{ marginTop: 'auto' }}>
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Expense History */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Expense History</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{filtered.length} entries found</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="form-control" style={{ paddingLeft: 38, width: 200 }} placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <input type="date" className="form-control" style={{ width: 'auto' }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <select className="form-control" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option>All</option>
              {expenseCategories.map(c => <option key={c}>{c}</option>)}
            </select>
            {(filterDate || filterCat !== 'All' || search) && (
              <button onClick={() => { setFilterDate(''); setFilterCat('All'); setSearch(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px', fontSize: 12, color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Date', 'Category', 'Amount', 'Notes', ''].map((h, i) => (
                  <th key={i} style={i === 4 ? { textAlign: 'right' } : {}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{formatDate(entry.date)}</td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 500, padding: '4px 12px', borderRadius: 20, background: '#EAF8F2', color: '#0B6B50' }}>
                      {entry.category}
                    </span>
                  </td>
                  <td style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>₹{entry.amount.toLocaleString('en-IN')}</td>
                  <td style={{ color: '#64748b', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.notes || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(entry.id)}
                      style={{ padding: 6, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}>
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: 13 }}>No expenses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Insights */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, background: '#EAF8F2', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lightbulb size={16} color="#0B6B50" />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1E293B' }}>Expense Insights</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {expenseInsights.map((insight, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', background: '#FAFAFA', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EAF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <Lightbulb size={14} color="#0B6B50" />
              </div>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
