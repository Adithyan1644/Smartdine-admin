import React, { useState } from 'react';
import { cloudClient } from '../../config';

const STEPS = [
  { id: 1, title: 'Profile',    icon: '🏪' },
  { id: 2, title: 'Zones',      icon: '📍' },
  { id: 3, title: 'Tables',     icon: '🪑' },
  { id: 4, title: 'Menu',       icon: '🍽️' },
  { id: 5, title: 'Tax',        icon: '💰' },
  { id: 6, title: 'Sync Code',  icon: '🔑' },
];

export default function SetupWizard({ account, onComplete }) {
  const [step, setStep] = useState(1);

  /* ── Step 1: Profile ── */
  const [profile, setProfile] = useState({
    restaurantName: account?.restaurantName || '',
    ownerName: account?.ownerName || '',
    phone: account?.phone || '',
    city: '',
    address: '',
    restaurantType: account?.restaurantType || 'Fine Dine',
  });

  /* ── Step 2: Zones ── */
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState('');

  /* ── Step 3: Tables ── */
  const [tables, setTables] = useState([]);
  const [newT, setNewT] = useState({ number: '', area: '', capacity: '4' });

  /* ── Step 4: Menu ── */
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newM, setNewM] = useState({ name: '', category: '', price: '', veg: true, code: '' });
  const [newCat, setNewCat] = useState('');

  /* ── Step 5: Taxes ── */
  const [taxes, setTaxes] = useState({ cgst: '2.5', sgst: '2.5', serviceCharge: '5.0', currency: 'INR' });

  /* ── Step 6: Sync ── */
  const [syncing, setSyncing]     = useState(false);
  const [syncCode, setSyncCode]   = useState('');
  const [syncError, setSyncError] = useState('');
  const [synced, setSynced]       = useState(false);

  /* ── Account Classification (Phase 1 — Environment Isolation) ── */
  // Inherits account type chosen during initial account registration
  const [isTest] = useState(() => {
    if (account?.isTest !== undefined) return Boolean(account.isTest);
    const storedAccount = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
    if (storedAccount?.isTest !== undefined) return Boolean(storedAccount.isTest);
    const storedIsTest = JSON.parse(localStorage.getItem('smartdine_is_test') || 'null');
    return storedIsTest === true;
  });

  /* ── Step 3 Bulk Generate ── */
  const [bulkCount, setBulkCount] = useState('');
  const [bulkCapacity, setBulkCapacity] = useState('4');
  const [bulkArea, setBulkArea] = useState('');

  const handleBulkGenerate = () => {
    const qty = parseInt(bulkCount, 10);
    if (isNaN(qty) || qty <= 0) return;
    const cap = parseInt(bulkCapacity, 10) || 4;
    const targetArea = bulkArea || (zones[0]?.name || '');
    if (!targetArea) return;

    let maxNum = 0;
    tables.forEach(t => {
      const match = t.number.match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });

    const newGenerated = [];
    for (let i = 1; i <= qty; i++) {
      const idx = maxNum + i;
      const numStr = `T-${String(idx).padStart(2, '0')}`;
      newGenerated.push({
        id: Date.now() + Math.random() + i,
        number: numStr,
        area: targetArea,
        capacity: cap
      });
    }

    setTables(ts => [...ts, ...newGenerated]);
    setBulkCount('');
  };

  /* ─── helpers ─── */
  const updProf = (k, v) => setProfile(p => ({ ...p, [k]: v }));
  const updTax  = (k, v) => setTaxes(t  => ({ ...t, [k]: v }));

  const addZone = () => {
    if (!newZone.trim()) return;
    setZones(z => [...z, { id: Date.now(), name: newZone.trim() }]);
    if (!newT.area) setNewT(t => ({ ...t, area: newZone.trim() }));
    setNewZone('');
  };

  const addTable = () => {
    if (!newT.number) return;
    const num = newT.number.startsWith('#') ? newT.number : `#${newT.number}`;
    setTables(t => [...t, { id: Date.now(), number: num, area: newT.area, capacity: parseInt(newT.capacity) || 4 }]);
    setNewT(t => ({ ...t, number: '' }));
  };

  const addMenuItem = () => {
    if (!newM.name || !newM.price) return;
    const code = newM.code || newM.name.substring(0, 2).toUpperCase() + Math.floor(Math.random() * 90 + 10);
    setMenuItems(m => [...m, { id: Date.now(), ...newM, price: parseFloat(newM.price) || 0, code }]);
    setNewM(m => ({ ...m, name: '', price: '', code: '' }));
  };

  const addCategory = () => {
    if (!newCat.trim() || categories.includes(newCat.trim())) return;
    setCategories(c => [...c, newCat.trim()]);
    setNewCat('');
  };

  const generateSyncCode = async () => {
    setSyncing(true); setSyncError('');
    try {
      const activeAccount = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
      const activeSyncCode = activeAccount.syncCode || ('SD-' + Math.floor(100000 + Math.random() * 900000));
      const activeRestaurantId = activeAccount.restaurantId || ('rest-' + Date.now());
      const activeRestName = profile.restaurantName || activeAccount.restaurantName || 'Royal Kerala Kitchen';
      const activeOwnerName = profile.ownerName || activeAccount.ownerName || 'Adithyan V';
      const activeEmail = activeAccount.email || 'test.royalkerala@gmail.com';

      const res = await cloudClient.post('/api/activation/save-config', {
        syncCode: activeSyncCode,
        restaurantId: activeRestaurantId,
        restaurantName: activeRestName,
        ownerName: activeOwnerName,
        ownerEmail: activeEmail,
        isTest,
        areas: zones.map(z => ({ ...z, tables: tables.filter(t => t.area === z.name).length, active: true })),
        tables,
        menuItems,
        profile,
        taxes,
        categories
      });
      const data = res.data;
      if (data && data.success) {
        setSyncCode(data.code || activeSyncCode); setSynced(true);
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (e) {
      /* Fallback — use the generated account sync code, NEVER hardcoded SD-28E792 */
      const activeAccount = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
      const fallbackCode = activeAccount.syncCode || ('SD-' + Math.floor(100000 + Math.random() * 900000));
      setSyncCode(fallbackCode); setSynced(true);
      setSyncError(`Saved setup locally with Sync Code: ${fallbackCode}`);
    } finally {
      setSyncing(false);
    }
  };

  const openDashboard = () => {
    const payload = { profile, zones, tables, menuItems, categories, taxes, syncCode, isTest, completedAt: new Date().toISOString() };
    localStorage.setItem('smartdine_setup', JSON.stringify(payload));
    localStorage.setItem('smartdine_is_test', JSON.stringify(isTest));
    
    try {
      const activeEmail = localStorage.getItem('smartdine_active_email');
      if (activeEmail) {
        const accounts = JSON.parse(localStorage.getItem('smartdine_accounts') || '[]');
        const idx = accounts.findIndex(a => a.email?.toLowerCase() === activeEmail.toLowerCase());
        if (idx !== -1) {
          accounts[idx].syncCode = syncCode;
          accounts[idx].setupPayload = payload;
          localStorage.setItem('smartdine_accounts', JSON.stringify(accounts));
          localStorage.setItem('smartdine_account', JSON.stringify(accounts[idx]));
        }
      }
    } catch (e) {
      console.warn('Failed to update accounts list', e);
    }
    
    onComplete(payload);
  };

  const canNext = () => {
    if (step === 1) return profile.restaurantName && profile.ownerName;
    if (step === 2) return zones.length > 0;
    if (step === 3) return tables.length > 0;
    if (step === 4) return menuItems.length > 0;
    return true;
  };

  /* ─── shared styles ─── */
  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
    background: '#fff', color: '#0f172a', transition: 'border 0.15s',
    fontFamily: 'Inter, sans-serif',
  };
  const foc = e => e.target.style.borderColor = '#166534';
  const blr = e => e.target.style.borderColor = '#e2e8f0';
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
  const card = { background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #e2e8f0' };

  /* ─── tax preview ─── */
  const sub = 500;
  const cgstAmt = +(sub * (parseFloat(taxes.cgst)           || 0) / 100).toFixed(2);
  const sgstAmt = +(sub * (parseFloat(taxes.sgst)           || 0) / 100).toFixed(2);
  const scAmt   = +(sub * (parseFloat(taxes.serviceCharge)  || 0) / 100).toFixed(2);
  const total   = (sub + cgstAmt + sgstAmt + scAmt).toFixed(2);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAF9', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <div style={{ background: '#063D2F', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 20 }}>🍽️</span>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>SmartDine</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Setup Wizard</span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>Step {step} of {STEPS.length}</span>
      </div>

      {/* ── Step indicator ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: 780, margin: '0 auto' }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: step > s.id ? '#166534' : step === s.id ? '#063D2F' : '#f1f5f9',
                  color: step >= s.id ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: step > s.id ? 15 : 14, fontWeight: 700, transition: 'all 0.3s',
                  boxShadow: step === s.id ? '0 0 0 4px rgba(6,61,47,0.15)' : 'none',
                }}>
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: step >= s.id ? '#063D2F' : '#94a3b8', whiteSpace: 'nowrap' }}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: step > s.id ? '#166534' : '#e2e8f0', margin: '0 6px', marginBottom: 20, transition: 'background 0.3s' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, padding: '28px 32px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 720 }}>

          {/* ─── STEP 1: Profile ─── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Restaurant Profile</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>This info appears on bills and reports.</p>
              <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={lbl}>Restaurant Name *</label><input style={inp} type="text" placeholder="e.g. Surabhi Foods" value={profile.restaurantName} onChange={e => updProf('restaurantName', e.target.value)} onFocus={foc} onBlur={blr} /></div>
                  <div><label style={lbl}>Owner / Manager Name *</label><input style={inp} type="text" placeholder="Full name" value={profile.ownerName} onChange={e => updProf('ownerName', e.target.value)} onFocus={foc} onBlur={blr} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label style={lbl}>Phone Number</label><input style={inp} type="tel" placeholder="+91 9XXXXXXXXX" value={profile.phone} onChange={e => updProf('phone', e.target.value)} onFocus={foc} onBlur={blr} /></div>
                  <div>
                    <label style={lbl}>Restaurant Type</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={profile.restaurantType} onChange={e => updProf('restaurantType', e.target.value)} onFocus={foc} onBlur={blr}>
                      {['Fine Dine', 'QSR', 'Café', 'Cloud Kitchen', 'Bakery', 'Hotel'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={lbl}>City</label><input style={inp} type="text" placeholder="e.g. Bangalore, Mumbai" value={profile.city} onChange={e => updProf('city', e.target.value)} onFocus={foc} onBlur={blr} /></div>
                <div><label style={lbl}>Full Address</label><textarea style={{ ...inp, resize: 'vertical', minHeight: 70 }} placeholder="Door No, Street, Area, City, Pincode" value={profile.address} onChange={e => updProf('address', e.target.value)} onFocus={foc} onBlur={blr} /></div>

                {/* ── Account Environment Badge (Selected during Signup) ── */}
                <div>
                  <label style={{ ...lbl, marginBottom: 6 }}>
                    Account Type & Environment
                  </label>
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: isTest
                        ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
                        : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                      border: `1.5px solid ${isTest ? '#f59e0b' : '#86efac'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: isTest ? '#92400e' : '#14532d' }}>
                        {isTest ? '🧪 Testing / Demo Account' : '🟢 Live Production Account'}
                      </div>
                      <div style={{ fontSize: 11, color: isTest ? '#b45309' : '#15803d', marginTop: 2, fontWeight: 500 }}>
                        {isTest
                          ? 'Registered in smartdine_dev (Sandbox) database on GCP Cloud.'
                          : 'Registered in smartdine (Production) database on GCP Cloud.'}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: isTest ? '#fef3c7' : '#dcfce7',
                        color: isTest ? '#92400e' : '#14532d',
                        border: `1px solid ${isTest ? '#d97706' : '#16a34a'}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isTest ? 'DEV Sandbox' : 'PROD Live'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Zones ─── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Zones & Areas</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Define the dining sections in your restaurant.</p>

              <div style={{ ...card, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <input style={{ ...inp, flex: 1 }} type="text" placeholder="Zone name (e.g. Rooftop Deck)" value={newZone} onChange={e => setNewZone(e.target.value)} onKeyDown={e => e.key === 'Enter' && addZone()} onFocus={foc} onBlur={blr} />
                  <button onClick={addZone} style={{ padding: '10px 18px', background: '#063D2F', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>+ Add Zone</button>
                </div>
                {/* Quick-add chips */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, alignSelf: 'center' }}>QUICK ADD:</span>
                  {['Family Room', 'Outdoor', 'Rooftop', 'VIP Room', 'Bar Area', 'Terrace']
                    .filter(s => !zones.find(z => z.name === s))
                    .map(s => (
                      <button key={s} onClick={() => setZones(z => [...z, { id: Date.now() + Math.random(), name: s }])}
                        style={{ padding: '4px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: 12, color: '#166534', cursor: 'pointer', fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                        {s}
                      </button>
                    ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {zones.map(zone => (
                  <div key={zone.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px' }}>
                    <div style={{ width: 36, height: 36, background: '#f0fdf4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📍</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{zone.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{tables.filter(t => t.area === zone.name).length} table(s)</div>
                    </div>
                    <button onClick={() => setZones(z => z.filter(x => x.id !== zone.id))}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                      Remove
                    </button>
                  </div>
                ))}
                {zones.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>No zones added yet.</div>}
              </div>
            </div>
          )}

          {/* ─── STEP 3: Tables ─── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Table Configuration</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Add tables individually or auto-generate tables in bulk for any zone.</p>

              <div style={{ ...card, marginBottom: 16 }}>
                {/* ── Single Table Add ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 10, alignItems: 'end', marginBottom: 14 }}>
                  <div>
                    <label style={lbl}>Single Table No / Name</label>
                    <input style={inp} type="text" placeholder="e.g. VIP-1 or 12" value={newT.number}
                      onChange={e => setNewT(t => ({ ...t, number: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && addTable()} onFocus={foc} onBlur={blr} />
                  </div>
                  <div>
                    <label style={lbl}>Zone</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={newT.area} onChange={e => setNewT(t => ({ ...t, area: e.target.value }))} onFocus={foc} onBlur={blr}>
                      {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                  </div>
                  <button onClick={addTable} style={{ padding: '10px 14px', background: '#063D2F', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 4, height: 38 }}>+ Add Single</button>
                </div>

                {/* ── Bulk Auto-Generate ── */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <label style={lbl}>Auto-Generate Count</label>
                    <input style={inp} type="number" min="1" placeholder="e.g. 10" value={bulkCount}
                      onChange={e => setBulkCount(e.target.value)} onFocus={foc} onBlur={blr} />
                  </div>
                  <div>
                    <label style={lbl}>Zone</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={bulkArea || (zones[0]?.name || '')} onChange={e => setBulkArea(e.target.value)} onFocus={foc} onBlur={blr}>
                      {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleBulkGenerate} style={{ padding: '10px 14px', background: 'linear-gradient(135deg, #166534, #15803d)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 4, height: 38 }}>⚡ Auto-Generate</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {tables.map(t => (
                  <div key={t.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', minWidth: 180 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Table Name</span>
                      <input
                        type="text"
                        value={t.number}
                        onChange={e => {
                          const val = e.target.value;
                          setTables(ts => ts.map(x => x.id === t.id ? { ...x, number: val } : x));
                        }}
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: '#0f172a',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: 6,
                          padding: '3px 6px',
                          width: '75px',
                          background: '#fff',
                          outline: 'none',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{t.area}</div>
                    </div>
                    <button onClick={() => setTables(ts => ts.filter(x => x.id !== t.id))}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: '2px', fontFamily: 'Inter, sans-serif' }}>✕</button>
                  </div>
                ))}
                {tables.length === 0 && <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#94a3b8' }}>No tables added yet.</div>}
              </div>
            </div>
          )}

          {/* ─── STEP 4: Menu ─── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Menu Setup</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Add your categories and menu items. These will be seeded into the Biller POS.</p>

              {/* Categories */}
              <div style={{ ...card, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 10 }}>Categories</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {categories.map(c => (
                    <span key={c} style={{ padding: '4px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, fontSize: 12, color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c}
                      <button onClick={() => setCategories(cats => cats.filter(x => x !== c))}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0, fontFamily: 'Inter, sans-serif' }}>✕</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inp, flex: 1 }} type="text" placeholder="New category (e.g. Biryani)" value={newCat}
                    onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} onFocus={foc} onBlur={blr} />
                  <button onClick={addCategory} style={{ padding: '10px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif' }}>+ Add</button>
                </div>
              </div>

              {/* Add item */}
              <div style={{ ...card, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 10 }}>Add Menu Item</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 1.2fr 80px 80px auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <label style={lbl}>Item Name</label>
                    <input style={inp} type="text" placeholder="e.g. Butter Chicken" value={newM.name}
                      onChange={e => {
                        const val = e.target.value;
                        setNewM(m => {
                          const initials = val.trim().split(/\s+/).map(w => w[0] || '').join('').toUpperCase();
                          return { ...m, name: val, code: initials };
                        });
                      }} onFocus={foc} onBlur={blr} />
                  </div>
                  <div>
                    <label style={lbl}>Short Code</label>
                    <input style={inp} type="text" placeholder="BC" value={newM.code}
                      onChange={e => setNewM(m => ({ ...m, code: e.target.value.toUpperCase() }))} onFocus={foc} onBlur={blr} />
                  </div>
                  <div>
                    <label style={lbl}>Category</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={newM.category} onChange={e => setNewM(m => ({ ...m, category: e.target.value }))} onFocus={foc} onBlur={blr}>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Price ₹</label>
                    <input style={inp} type="number" min="0" placeholder="220" value={newM.price}
                      onChange={e => setNewM(m => ({ ...m, price: e.target.value }))} onFocus={foc} onBlur={blr} />
                  </div>
                  <div>
                    <label style={lbl}>Type</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={newM.veg ? 'Veg' : 'Non-Veg'} onChange={e => setNewM(m => ({ ...m, veg: e.target.value === 'Veg' }))} onFocus={foc} onBlur={blr}>
                      <option>Veg</option><option>Non-Veg</option>
                    </select>
                  </div>
                  <button onClick={addMenuItem} style={{ padding: '10px 14px', background: '#063D2F', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 4, height: 38 }}>Add</button>
                </div>
              </div>

              {/* Items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {menuItems.map(item => (
                  <div key={item.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', border: `1px solid ${item.veg ? '#16a34a' : '#dc2626'}`, borderRadius: 4, color: item.veg ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {item.veg ? 'VEG' : 'NON'}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                      {item.name} <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6, fontWeight: 500 }}>({item.code})</span>
                    </span>
                    <span style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>{item.category}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', minWidth: 56, textAlign: 'right' }}>₹{item.price}</span>
                    <button onClick={() => setMenuItems(m => m.filter(x => x.id !== item.id))}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, fontFamily: 'Inter, sans-serif' }}>✕</button>
                  </div>
                ))}
                {menuItems.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No menu items yet.</div>}
              </div>
            </div>
          )}

          {/* ─── STEP 5: Tax ─── */}
          {step === 5 && (
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Tax & Financial Settings</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>Configure the tax rates that will appear on every bill.</p>

              <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { key: 'cgst',          label: 'CGST Rate (%)',        note: 'Central GST',          ph: '2.5' },
                    { key: 'sgst',          label: 'SGST Rate (%)',        note: 'State GST',            ph: '2.5' },
                    { key: 'serviceCharge', label: 'Service Charge (%)',   note: 'Optional surcharge',   ph: '5.0' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={lbl}>{f.label}</label>
                      <input style={inp} type="number" min="0" step="0.1" placeholder={f.ph}
                        value={taxes[f.key]} onChange={e => updTax(f.key, e.target.value)} onFocus={foc} onBlur={blr} />
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{f.note}</div>
                    </div>
                  ))}
                  <div>
                    <label style={lbl}>Currency</label>
                    <select style={{ ...inp, cursor: 'pointer' }} value={taxes.currency} onChange={e => updTax('currency', e.target.value)} onFocus={foc} onBlur={blr}>
                      {['INR', 'USD', 'AED', 'SGD', 'GBP', 'EUR'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Live bill preview */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 18, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📄 Bill Preview (sample ₹500 order)</div>
                  {[
                    { label: 'Subtotal',                         val: 500 },
                    { label: `CGST ${taxes.cgst || 0}%`,         val: cgstAmt },
                    { label: `SGST ${taxes.sgst || 0}%`,         val: sgstAmt },
                    { label: `Service Charge ${taxes.serviceCharge || 0}%`, val: scAmt },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155', marginBottom: 6 }}>
                      <span>{row.label}</span><span>₹{row.val}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '2px solid #e2e8f0', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a', fontSize: 15 }}>
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 6: Sync ─── */}
          {step === 6 && (
            <div>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Generate Sync Code</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 22 }}>Your configuration is ready. Generate the Sync Code to activate your Biller PC.</p>

              {/* KPI summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
                {[
                  { icon: '📍', label: 'Zones',      val: zones.length },
                  { icon: '🪑', label: 'Tables',     val: tables.length },
                  { icon: '🍽️', label: 'Menu Items', val: menuItems.length },
                  { icon: '💰', label: 'GST Total',  val: `${(parseFloat(taxes.cgst) || 0) + (parseFloat(taxes.sgst) || 0)}%` },
                ].map(k => (
                  <div key={k.label} style={{ ...card, textAlign: 'center', padding: '16px 10px' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{k.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 22, color: '#0f172a' }}>{k.val}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{k.label}</div>
                  </div>
                ))}
              </div>

              {!synced ? (
                <div style={{ ...card, textAlign: 'center', padding: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>🔑</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a', marginBottom: 6 }}>Ready to sync your Biller PC</div>
                  <div style={{ color: '#64748b', fontSize: 13, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
                    This saves your configuration to the local API server and returns a unique sync code for your restaurant.
                  </div>

                  {syncError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 12, marginBottom: 16, textAlign: 'left', whiteSpace: 'pre-line' }}>
                      ⚠️ {syncError}
                    </div>
                  )}

                  <button onClick={generateSyncCode} disabled={syncing} style={{
                    background: syncing ? '#94a3b8' : 'linear-gradient(135deg, #063D2F, #166534)',
                    color: '#fff', border: 'none', borderRadius: 12, padding: '13px 30px',
                    fontWeight: 700, fontSize: 14, cursor: syncing ? 'not-allowed' : 'pointer',
                    boxShadow: syncing ? 'none' : '0 4px 14px rgba(6,61,47,0.3)',
                    display: 'flex', alignItems: 'center', gap: 8, margin: '0 auto',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {syncing
                      ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'sd-spin 0.8s linear infinite', display: 'inline-block' }} /> Generating...</>
                      : '⚡ Generate Sync Code'}
                  </button>
                </div>
              ) : (
                <div style={{ ...card, border: '2px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>✅</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>Sync Code Generated!</div>
                      <div style={{ color: '#64748b', fontSize: 13, marginTop: 1 }}>Your configuration is saved and ready.</div>
                    </div>
                  </div>

                  {syncError && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', color: '#92400e', fontSize: 12, whiteSpace: 'pre-line' }}>
                      ⚠️ {syncError}
                    </div>
                  )}

                  {/* Dual Sync Code Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '12px 0' }}>
                    {/* POS Biller Code */}
                    <div 
                      style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => {
                        const bCode = syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode);
                        navigator.clipboard?.writeText(bCode);
                        alert(`POS Biller Code copied: ${bCode}`);
                      }}
                      title="Click to copy POS Biller Code"
                    >
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>🖥️ POS Biller Code</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#15803d', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                        {syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px' }}>For POS Biller Station</div>
                    </div>

                    {/* Waiter App Code */}
                    <div 
                      style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => {
                        const wCode = syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode;
                        navigator.clipboard?.writeText(wCode);
                        alert(`Waiter App Code copied: ${wCode}`);
                      }}
                      title="Click to copy Waiter App Code"
                    >
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>📱 Waiter App Code</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#1d4ed8', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                        {syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode}
                      </div>
                      <div style={{ fontSize: '10px', color: '#1e40af', marginTop: '4px' }}>For Waiter Mobile App</div>
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#92400e' }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 Activation Instructions:</div>
                    <ol style={{ paddingLeft: 18, lineHeight: 1.9, margin: 0 }}>
                      <li><strong>Biller PC</strong>: Enter POS Biller Code <strong style={{ fontFamily: 'monospace', background: '#fef3c7', padding: '2px 6px', borderRadius: 4 }}>{syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode)}</strong> in your Biller App setup wizard.</li>
                      <li><strong>Waiter Phones</strong>: Enter Waiter App Code <strong style={{ fontFamily: 'monospace', background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>{syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode}</strong> in your Waiter App setup.</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              style={{ padding: '12px 24px', background: '#fff', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              ← Back
            </button>

            {step < 6 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{
                padding: '12px 28px', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: canNext() ? 'linear-gradient(135deg, #063D2F, #166534)' : '#94a3b8',
                cursor: canNext() ? 'pointer' : 'not-allowed',
                boxShadow: canNext() ? '0 4px 12px rgba(6,61,47,0.25)' : 'none',
                fontFamily: 'Inter, sans-serif',
              }}>
                Continue →
              </button>
            ) : (
              <button onClick={openDashboard} disabled={!synced} style={{
                padding: '12px 28px', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14,
                background: synced ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : '#94a3b8',
                cursor: synced ? 'pointer' : 'not-allowed',
                boxShadow: synced ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                fontFamily: 'Inter, sans-serif',
              }}>
                🚀 Open Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
