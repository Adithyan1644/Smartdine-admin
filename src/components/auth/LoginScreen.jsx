import React, { useState } from 'react';
import { API_URL } from '../../config';

export default function LoginScreen({ onLogin, onGoSignup }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!credential || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    setTimeout(() => {
      try {
        let accounts = JSON.parse(localStorage.getItem('smartdine_accounts') || '[]');

        const defaultAccounts = [
          {
            id: 'ryxon-15',
            email: 'adithyanvijayan1644@gmail.com',
            phone: '9316971598',
            restaurantName: 'Ryxon',
            ownerName: 'Adithyan',
            password: 'avk456',
            syncCode: 'SD-612376',
            setupCompleted: true
          }
        ];

        defaultAccounts.forEach(def => {
          const idx = accounts.findIndex(a => 
            a.restaurantName?.toLowerCase() === def.restaurantName.toLowerCase() || 
            a.email?.toLowerCase() === def.email.toLowerCase() ||
            (a.syncCode && a.syncCode.toLowerCase() === def.syncCode.toLowerCase())
          );
          if (idx >= 0) {
            accounts[idx] = { ...accounts[idx], ...def };
          } else {
            accounts.push(def);
          }
        });
        localStorage.setItem('smartdine_accounts', JSON.stringify(accounts));

        const cleanedCred = credential.trim().toLowerCase();
        const numericCred = cleanedCred.replace(/\D/g, '');

        let matchedAccount = accounts.find(a => {
          const emailMatch = a.email?.toLowerCase() === cleanedCred;
          const nameMatch = a.restaurantName?.toLowerCase() === cleanedCred;
          const phoneMatch = Boolean(numericCred && numericCred.length >= 7 && a.phone && a.phone.replace(/\D/g, '').includes(numericCred));
          
          return (emailMatch || nameMatch || phoneMatch) && a.password === password;
        });

        // Fail-safe direct fallback for Ryxon account
        if (!matchedAccount && password === 'avk456') {
          if (cleanedCred === '9316971598' || cleanedCred === 'ryxon' || cleanedCred === 'adithyanvijayan1644@gmail.com' || numericCred === '9316971598') {
            matchedAccount = defaultAccounts[0];
          }
        }

        if (matchedAccount) {
          // Clear old browser memory / cached setup from previous sessions
          localStorage.removeItem('smartdine_setup');
          localStorage.removeItem('smartdine_session');
          
          const syncCode = matchedAccount.syncCode || 'SD-28E792';
          localStorage.setItem('smartdine_active_email', matchedAccount.email);
          localStorage.setItem('smartdine_account', JSON.stringify(matchedAccount));

          // Auto-fetch setup configuration from backend for syncCode
          fetch(`${API_URL}/api/activation/activate?code=${syncCode}`)
            .then(res => res.ok ? res.json() : null)
            .then(config => {
              if (config && config.tables && config.tables.length > 0) {
                const fullPayload = {
                  syncCode: syncCode,
                  restaurantId: config.restaurantId,
                  profile: { restaurantName: config.restaurantName || matchedAccount.restaurantName },
                  zones: Array.from(new Set((config.tables || []).map(t => t.areaName || t.area || 'General Area'))).map((name, idx) => ({ id: idx + 1, name })),
                  tables: (config.tables || []).map((t, idx) => ({ id: idx + 1, number: t.tableNumber || t.number, area: t.areaName || t.area || 'General Area', capacity: t.capacity || 4 })),
                  menuItems: (config.menuItems || []).map((m, idx) => {
                    const name = m.name || 'Unnamed Item';
                    const nameLower = name.toLowerCase();
                    let isVeg = true;
                    if (nameLower.includes('chicken') || nameLower.includes('mutton') || nameLower.includes('fish') || nameLower.includes('egg') || nameLower.includes('prawn') || nameLower.includes('c65') || m.veg === false || m.type === 'Non-Veg') {
                      isVeg = false;
                    }
                    let cat = (m.categoryName && m.categoryName.trim()) || (m.category && m.category.trim()) || '';
                    if (!cat || cat === '' || cat === 'General') {
                      if (nameLower.includes('tikka') || nameLower.includes('corn') || nameLower.includes('65') || nameLower.includes('starter') || nameLower.includes('roll')) cat = 'Starters';
                      else if (nameLower.includes('butter') || nameLower.includes('curry') || nameLower.includes('masala') || nameLower.includes('main')) cat = 'Main Course';
                      else if (nameLower.includes('brownie') || nameLower.includes('ice cream') || nameLower.includes('sweet') || nameLower.includes('dessert')) cat = 'Desserts';
                      else if (nameLower.includes('naan') || nameLower.includes('roti') || nameLower.includes('bread')) cat = 'Breads';
                      else if (nameLower.includes('rice') || nameLower.includes('biryani')) cat = 'Rice & Biryani';
                      else cat = 'Starters';
                    }
                    return {
                      id: idx + 1,
                      category: cat,
                      categoryName: cat,
                      name: name,
                      code: m.shortCode || m.code || 'ITEM',
                      shortCode: m.shortCode || m.code || 'ITEM',
                      price: parseFloat(m.price) || 0,
                      type: isVeg ? "Veg" : "Non-Veg",
                      veg: isVeg
                    };
                  }),
                  categories: config.categories || ["Starters", "Main Course", "Beverages"],
                  waiters: (config.waiters || []).map((w, idx) => ({ id: idx + 1, name: w.name, pin: w.pin || w.code || '1234', phone: w.phone || '', role: w.role || 'Waiter', status: w.status || 'Active' }))
                };
                localStorage.setItem('smartdine_setup', JSON.stringify(fullPayload));
                matchedAccount.setupPayload = fullPayload;
                matchedAccount.syncCode = syncCode;
                localStorage.setItem('smartdine_account', JSON.stringify(matchedAccount));
              } else if (matchedAccount.setupPayload) {
                localStorage.setItem('smartdine_setup', JSON.stringify(matchedAccount.setupPayload));
              } else {
                localStorage.setItem('smartdine_setup', JSON.stringify({
                  syncCode: syncCode,
                  profile: { restaurantName: matchedAccount.restaurantName }
                }));
              }
              onLogin(matchedAccount);
            })
            .catch(() => {
              if (matchedAccount.setupPayload) {
                localStorage.setItem('smartdine_setup', JSON.stringify(matchedAccount.setupPayload));
              } else {
                localStorage.setItem('smartdine_setup', JSON.stringify({
                  syncCode: syncCode,
                  profile: { restaurantName: matchedAccount.restaurantName }
                }));
              }
              onLogin(matchedAccount);
            });
        } else {
          // Legacy account fallback
          const legacyAccount = JSON.parse(localStorage.getItem('smartdine_account') || 'null');
          if (legacyAccount) {
            const emailMatch = legacyAccount.email?.toLowerCase() === credential.toLowerCase();
            const nameMatch = legacyAccount.restaurantName?.toLowerCase() === credential.toLowerCase();
            if ((emailMatch || nameMatch) && legacyAccount.password === password) {
              localStorage.setItem('smartdine_active_email', legacyAccount.email);
              if (!localStorage.getItem('smartdine_setup')) {
                localStorage.setItem('smartdine_setup', JSON.stringify({
                  syncCode: legacyAccount.syncCode || 'SD-28E792',
                  profile: { restaurantName: legacyAccount.restaurantName }
                }));
              }
              onLogin(legacyAccount);
              return;
            }
          }
          
          setError('Incorrect credentials. Please try again.');
          setLoading(false);
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }, 700);
  };

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
    background: '#fff', color: '#0f172a', transition: 'border 0.15s',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left branding panel ── */}
      <div style={{
        width: '42%', background: 'linear-gradient(145deg, #063D2F 0%, #0a5c44 55%, #0d7a5c 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 44px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -70, left: -70, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
            <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.15)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍽️</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.3px' }}>SmartDine</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500 }}>by ORAACO</div>
            </div>
          </div>
          <div style={{ color: '#fff', fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.5px' }}>
            Welcome back to your restaurant hub
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7 }}>
            Your complete POS ecosystem — billing, kitchen, and waiter app — all in one place.
          </div>
        </div>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '⚡', text: 'Real-time order sync across all devices' },
            { icon: '🔐', text: 'Secure role-based staff access control' },
            { icon: '📊', text: 'Live sales analytics & expense tracking' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF9', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.4px' }}>Sign in to your account</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Enter your mobile number or restaurant name to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mobile Number or Restaurant Name</label>
              <input
                type="text" value={credential} onChange={e => setCredential(e.target.value)}
                placeholder="e.g. 9316971598 or Ryxon" style={inp}
                onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" style={{ ...inp, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#94a3b8' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #063D2F, #166534)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
              fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(6,61,47,0.3)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Inter, sans-serif',
            }}>
              {loading
                ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'sd-spin 0.8s linear infinite', display: 'inline-block' }} /> Signing in...</>
                : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <span style={{ color: '#64748b', fontSize: 14 }}>Don't have an account? </span>
            <button onClick={onGoSignup} style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
              Create new account
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
