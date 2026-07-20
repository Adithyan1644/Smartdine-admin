import React, { useState } from 'react';

export default function SignupScreen({ onSignup, onGoLogin }) {
  const [form, setForm] = useState({
    restaurantName: '', ownerName: '', phone: '', email: '',
    password: '', confirmPassword: '', restaurantType: 'Fine Dine',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.restaurantName || !form.ownerName || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true); setError('');
    try {
      const { API_URL } = await import('../../config');
      let syncCode = 'SD-' + Math.floor(100000 + Math.random() * 900000);
      let restaurantId = 'rest-' + Date.now();

      try {
        const endpoints = [
          `${API_URL}/api/auth/register`,
          `${API_URL}/auth/register`
        ];
        
        for (const url of endpoints) {
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                restaurantName: form.restaurantName,
                username: form.email.split('@')[0] || 'admin',
                email: form.email,
                password: form.password
              })
            });
            if (response.ok) {
              const data = await response.json();
              if (data.syncCode || data.code) syncCode = data.syncCode || data.code;
              if (data.restaurantId) restaurantId = data.restaurantId;
              break;
            }
          } catch (ignored) {}
        }
      } catch (e) {
        console.warn('[SignupScreen] Remote API fallback activated:', e);
      }

      const account = { 
        ...form, 
        createdAt: new Date().toISOString(), 
        syncCode: syncCode, 
        restaurantId: restaurantId,
        setupPayload: null 
      };
      
      const accounts = JSON.parse(localStorage.getItem('smartdine_accounts') || '[]');
      accounts.push(account);
      localStorage.setItem('smartdine_accounts', JSON.stringify(accounts));
      localStorage.setItem('smartdine_active_email', form.email);
      localStorage.setItem('smartdine_account', JSON.stringify(account));
      
      onSignup(account);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '11px 13px', borderRadius: 9,
    border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
    background: '#fff', color: '#0f172a', transition: 'border 0.15s',
    fontFamily: 'Inter, sans-serif',
  };
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 };
  const foc = e => e.target.style.borderColor = '#166534';
  const blr = e => e.target.style.borderColor = '#e2e8f0';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF9', padding: '36px 24px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>

          {/* Logo strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: '#063D2F', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍽️</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#063D2F', letterSpacing: '-0.3px' }}>SmartDine</div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.4px' }}>Create your restaurant account</h2>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 28 }}>Set up your SmartDine profile. We'll walk you through the full setup wizard next.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Restaurant Name *</label>
                <input style={inp} type="text" placeholder="e.g. Surabhi Foods" value={form.restaurantName} onChange={e => upd('restaurantName', e.target.value)} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={lbl}>Owner / Manager Name *</label>
                <input style={inp} type="text" placeholder="Your full name" value={form.ownerName} onChange={e => upd('ownerName', e.target.value)} onFocus={foc} onBlur={blr} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Phone Number</label>
                <input style={inp} type="tel" placeholder="+91 9XXXXXXXXX" value={form.phone} onChange={e => upd('phone', e.target.value)} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={lbl}>Restaurant Type</label>
                <select style={{ ...inp, cursor: 'pointer' }} value={form.restaurantType} onChange={e => upd('restaurantType', e.target.value)} onFocus={foc} onBlur={blr}>
                  {['Fine Dine', 'QSR', 'Café', 'Cloud Kitchen', 'Bakery', 'Hotel'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={lbl}>Email Address *</label>
              <input style={inp} type="email" placeholder="admin@yourrestaurant.com" value={form.email} onChange={e => upd('email', e.target.value)} onFocus={foc} onBlur={blr} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Password *</label>
                <input style={inp} type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => upd('password', e.target.value)} onFocus={foc} onBlur={blr} />
              </div>
              <div>
                <label style={lbl}>Confirm Password *</label>
                <input style={inp} type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => upd('confirmPassword', e.target.value)} onFocus={foc} onBlur={blr} />
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #063D2F, #166534)',
              color: '#fff', border: 'none', borderRadius: 12, padding: '13px',
              fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(6,61,47,0.3)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Inter, sans-serif', marginTop: 4,
            }}>
              {loading
                ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'sd-spin 0.8s linear infinite', display: 'inline-block' }} /> Creating account...</>
                : 'Create Account & Continue →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: '#64748b', fontSize: 14 }}>Already have an account? </span>
            <button onClick={onGoLogin} style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* ── Right branding panel ── */}
      <div style={{
        width: '38%', background: 'linear-gradient(145deg, #063D2F 0%, #0a5c44 55%, #0d7a5c 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 14, letterSpacing: '-0.5px' }}>
          Your restaurant,<br />fully connected.
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 44 }}>
          SmartDine brings your Billing PC, Waiter App, and Kitchen Display into one seamlessly synchronized system.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            { icon: '🖥️', title: 'Biller PC', desc: 'Full offline billing & invoicing' },
            { icon: '📱', title: 'Waiter App', desc: 'Table-side ordering, synced live' },
            { icon: '🍳', title: 'Kitchen KDS', desc: 'Auto-discovers on your local WiFi' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
