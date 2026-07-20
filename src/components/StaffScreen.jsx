import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const session = JSON.parse(localStorage.getItem('smartdine_session') || 'null');
  const token = session?.token || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function avatarColor(name = '') {
  const colors = ['#0b6b50','#1d4ed8','#7c3aed','#b45309','#be185d','#0e7490','#166534'];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + (hash << 5) - hash;
  return colors[Math.abs(hash) % colors.length];
}

// ─── Add Waiter Modal ─────────────────────────────────────────────────────────

function AddWaiterModal({ onClose, onSaved, restaurantId }) {
  const [form, setForm] = useState({
    fullName: '', username: '', pin: '', confirmPin: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: '' }));
    setApiError('');
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    if (!/^\d{4}$/.test(form.pin)) e.pin = 'PIN must be exactly 4 digits';
    if (form.pin !== form.confirmPin) e.confirmPin = 'PINs do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const setup = JSON.parse(localStorage.getItem('smartdine_setup') || '{}');
      const syncCode = setup?.syncCode || restaurantId; // syncCode preferred for correct UUID resolution
      const res = await fetch(`${API_URL}/auth/register-waiter`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          username: form.username.trim().toLowerCase(),
          pin: form.pin,
          restaurantId,
          syncCode, // allows backend to resolve the correct restaurant UUID
        }),
      });
      if (res.ok) {
        onSaved();
      } else {
        const body = await res.json().catch(() => ({}));
        setApiError(body.message || body.error || `Server error: ${res.status}`);
      }
    } catch (err) {
      setApiError('Cannot connect to the local server. Make sure Spring Boot is running.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.45)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: 440, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Add New Waiter</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Create a staff account for the Waiter App</div>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {apiError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
            padding: '10px 14px', fontSize: 13, color: '#b91c1c', marginBottom: 16,
          }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              className="form-control"
              placeholder="e.g. Arjun Mehta"
              value={form.fullName}
              onChange={set('fullName')}
              style={{ borderColor: errors.fullName ? '#ef4444' : undefined }}
            />
            {errors.fullName && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.fullName}</div>}
          </div>

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
              Username (for app login) *
            </label>
            <input
              className="form-control"
              placeholder="e.g. arjun.mehta"
              value={form.username}
              onChange={set('username')}
              style={{ borderColor: errors.username ? '#ef4444' : undefined }}
            />
            {errors.username && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.username}</div>}
          </div>

          {/* PIN row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                4-Digit PIN *
              </label>
              <input
                className="form-control"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={form.pin}
                onChange={set('pin')}
                style={{ letterSpacing: 6, borderColor: errors.pin ? '#ef4444' : undefined }}
              />
              {errors.pin && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.pin}</div>}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Confirm PIN *
              </label>
              <input
                className="form-control"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={form.confirmPin}
                onChange={set('confirmPin')}
                style={{ letterSpacing: 6, borderColor: errors.confirmPin ? '#ef4444' : undefined }}
              />
              {errors.confirmPin && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errors.confirmPin}</div>}
            </div>
          </div>

          {/* Info box */}
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
            padding: '10px 14px', fontSize: 12, color: '#166534', marginBottom: 20,
          }}>
            💡 The waiter will use their <strong>PIN</strong> to log into the SmartDine Waiter App on their phone.
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px 0', border: '1.5px solid #e2e8f0',
              borderRadius: 10, background: '#fff', color: '#374151',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 1, padding: '11px 0', border: 'none',
              borderRadius: 10, background: saving ? '#9ca3af' : '#063D2F',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}>
              {saving ? 'Saving...' : '+ Add Waiter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Staff Screen ────────────────────────────────────────────────────────

const DEMO_STAFF = [
  { id: '1', fullName: 'Arjun Mehta',   username: 'arjun.mehta',   role: 'WAITER', isActive: true,  pin: '4022', ordersToday: 12, tablesCovered: 4 },
  { id: '2', fullName: 'Priya Sharma',  username: 'priya.sharma',  role: 'WAITER', isActive: true,  pin: '4023', ordersToday: 9,  tablesCovered: 3 },
  { id: '3', fullName: 'Rahul Verma',   username: 'rahul.verma',   role: 'WAITER', isActive: false, pin: '4024', ordersToday: 0,  tablesCovered: 0 },
];

export default function StaffScreen() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [toastMsg, setToastMsg] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);

  // Get restaurantId from stored account
  const account = JSON.parse(localStorage.getItem('smartdine_account') || 'null');
  const restaurantId = account?.restaurantId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/waiters?restaurantId=${restaurantId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
        setUsingDemo(false);
      } else {
        throw new Error(`${res.status}`);
      }
    } catch {
      // Fallback to demo data when server is offline
      setStaff(DEMO_STAFF);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleDeactivate = async (member) => {
    if (!window.confirm(`Deactivate ${member.fullName || member.username}? They will no longer be able to log in.`)) return;
    if (usingDemo) {
      setStaff(s => s.map(m => m.id === member.id ? { ...m, isActive: false } : m));
      showToast('Waiter deactivated (demo mode)');
      return;
    }
    try {
      await fetch(`${API_URL}/auth/waiters/${member.id}/deactivate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      showToast(`${member.fullName || member.username} has been deactivated.`);
      loadStaff();
    } catch {
      showToast('Failed to deactivate. Check server connection.');
    }
  };

  const handleReactivate = async (member) => {
    if (usingDemo) {
      setStaff(s => s.map(m => m.id === member.id ? { ...m, isActive: true } : m));
      showToast('Waiter reactivated (demo mode)');
      return;
    }
    try {
      await fetch(`${API_URL}/auth/waiters/${member.id}/activate`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      showToast(`${member.fullName || member.username} has been reactivated.`);
      loadStaff();
    } catch {
      showToast('Failed to reactivate. Check server connection.');
    }
  };

  const filtered = staff.filter(m => {
    const matchSearch =
      (m.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.username || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? m.isActive :
      !m.isActive;
    return matchSearch && matchFilter;
  });

  const activeCount = staff.filter(m => m.isActive).length;
  const inactiveCount = staff.filter(m => !m.isActive).length;

  return (
    <div className="page-content">
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 200,
          background: '#063D2F', color: '#fff', borderRadius: 10,
          padding: '12px 20px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'fadeIn 0.2s ease',
        }}>{toastMsg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Staff Management</h1>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            Manage your waiter accounts and Waiter App access.
            {usingDemo && <span style={{ marginLeft: 8, background: '#fef3c7', color: '#92400e', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>DEMO MODE — Start local server to sync</span>}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: '#063D2F', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontWeight: 700,
            fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(6,61,47,0.25)', transition: 'transform 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Add Waiter
        </button>
      </div>



      {/* Waiter App Sync Code Banner */}
      {(() => {
        const setup = JSON.parse(localStorage.getItem('smartdine_setup') || 'null');
        const code = setup?.syncCode || account?.syncCode || null;
        if (!code) return null;
        return (
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #93c5fd',
            borderRadius: 14, padding: '14px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28 }}>📱</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
                  Waiter App Sync Code
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                  {code}
                </div>
                <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 2 }}>
                  Enter this code in the Waiter App when activating on a new device.
                </div>
              </div>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(code); alert(`Copied: ${code}\n\nEnter this in the SmartDine Waiter App → Sync Code screen.`); }}
              style={{
                background: '#1d4ed8', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 18px', fontWeight: 700,
                fontSize: 12, cursor: 'pointer', flexShrink: 0,
              }}
            >
              Copy Code
            </button>
          </div>
        );
      })()}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Staff', value: staff.length, color: '#0f172a', bg: '#f8fafc', border: '#e2e8f0' },
          { label: 'Active',      value: activeCount,  color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
          { label: 'Inactive',    value: inactiveCount, color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 12, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or username..."
          className="form-control"
          style={{ maxWidth: 300, margin: 0 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'active', 'inactive'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
              background: filter === f ? '#063D2F' : '#fff',
              color: filter === f ? '#fff' : '#374151',
              border: `1.5px solid ${filter === f ? '#063D2F' : '#e2e8f0'}`,
            }}>{f}</button>
          ))}
        </div>
        <button onClick={loadStaff} style={{
          marginLeft: 'auto', padding: '7px 14px', borderRadius: 8,
          background: '#f1f5f9', border: '1.5px solid #e2e8f0',
          color: '#374151', fontWeight: 600, fontSize: 12, cursor: 'pointer',
        }}>⟳ Refresh</button>
      </div>

      {/* Staff Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Loading staff...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No staff found</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              {search ? 'Try a different search term.' : 'Click "+ Add Waiter" to create the first account.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Staff Member', 'Username', 'PIN', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 18px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((member, i) => {
                const name = member.fullName || member.username || 'Unknown';
                const bg = avatarColor(name);
                return (
                  <tr key={member.id} style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* Avatar + Name */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: bg, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#fff',
                          fontSize: 14, fontWeight: 800, flexShrink: 0,
                        }}>{getInitials(name)}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {String(member.id).slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    {/* Username */}
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>
                      {member.username || '—'}
                    </td>
                    {/* PIN */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: '#f1f5f9', borderRadius: 6, padding: '3px 10px',
                        fontSize: 13, fontWeight: 700, color: '#374151', fontFamily: 'monospace',
                        letterSpacing: 4,
                      }}>
                        {member.pin ? '••••' : '—'}
                      </span>
                    </td>
                    {/* Role */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: '#eff6ff', color: '#1d4ed8',
                        borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                      }}>
                        {member.role || 'WAITER'}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: member.isActive ? '#f0fdf4' : '#fef2f2',
                        color: member.isActive ? '#166534' : '#b91c1c',
                        border: `1px solid ${member.isActive ? '#bbf7d0' : '#fecaca'}`,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: member.isActive ? '#22c55e' : '#ef4444',
                          display: 'inline-block',
                        }}/>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 18px' }}>
                      {member.isActive ? (
                        <button onClick={() => handleDeactivate(member)} style={{
                          background: '#fef2f2', color: '#b91c1c',
                          border: '1px solid #fecaca', borderRadius: 7,
                          padding: '5px 12px', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        >Deactivate</button>
                      ) : (
                        <button onClick={() => handleReactivate(member)} style={{
                          background: '#f0fdf4', color: '#166534',
                          border: '1px solid #bbf7d0', borderRadius: 7,
                          padding: '5px 12px', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                        >Reactivate</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <AddWaiterModal
          restaurantId={restaurantId}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            showToast('✅ Waiter account created successfully!');
            loadStaff();
          }}
        />
      )}
    </div>
  );
}
