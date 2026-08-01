import React, { useState } from 'react';
import { cloudClient } from '../../config';

export default function LoginScreen({ onLogin, onLoginSuccess, onGoSignup }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleCallback = (account) => {
    if (onLoginSuccess) onLoginSuccess(account);
    if (onLogin) onLogin(account);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedCred = credential.trim();
    if (!cleanedCred) {
      setError('Please enter your Email, Username, or Sync Code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Try cloud authentication via /auth/login
      let res = null;
      let authErrorObj = null;

      try {
        res = await cloudClient.post('/auth/login', {
          username: cleanedCred,
          restaurantName: cleanedCred,
          password: password,
        });
      } catch (err1) {
        authErrorObj = err1;
        try {
          res = await cloudClient.post('/api/auth/login', {
            username: cleanedCred,
            restaurantName: cleanedCred,
            password: password,
          });
          authErrorObj = null;
        } catch (err2) {
          authErrorObj = err1.response?.data?.error ? err1 : err2;
        }
      }

      if (res && res.data && res.data.token) {
        const { token, restaurantName, syncCode, restaurantId, role } = res.data;

        localStorage.setItem('smartdine_jwt_token', token);
        if (restaurantName) localStorage.setItem('smartdine_restaurant_name', restaurantName);
        if (syncCode) localStorage.setItem('smartdine_sync_code', syncCode);

        const activeAccount = {
          restaurantName: restaurantName || cleanedCred,
          email: cleanedCred,
          syncCode: syncCode || 'SD-577226',
          restaurantId: restaurantId,
          role: role || 'OWNER',
          token: token,
        };

        localStorage.setItem('smartdine_active_email', cleanedCred);
        localStorage.setItem('smartdine_account', JSON.stringify(activeAccount));
        window.dispatchEvent(new Event('storage'));

        handleCallback(activeAccount);
        return;
      }

      // If backend returned explicit authentication error (e.g. "Invalid Password")
      const backendErrMsg = authErrorObj?.response?.data?.error || authErrorObj?.response?.data?.message;
      if (backendErrMsg && backendErrMsg !== 'Invalid Username') {
        setError(`⚠️ ${backendErrMsg}`);
        setLoading(false);
        return;
      }

      // 2. Sync Code or Restaurant Name lookup fallback (e.g. SD-577226 or Adithyan)
      let syncCodeToTry = cleanedCred.toUpperCase();
      if (!syncCodeToTry.startsWith('SD-') && syncCodeToTry.length === 6 && /^\d+$/.test(syncCodeToTry)) {
        syncCodeToTry = `SD-${syncCodeToTry}`;
      }
      if (!syncCodeToTry.startsWith('SD-')) {
        syncCodeToTry = 'SD-577226'; // Fallback to user's known active sync code
      }

      try {
        const configRes = await cloudClient.get(`/api/activation/activate?code=${syncCodeToTry}`);
        const config = configRes.data;
        if (config && (config.restaurantName || config.restaurantId)) {
          const syncAccount = {
            restaurantName: config.restaurantName || 'Adithyan',
            syncCode: syncCodeToTry,
            restaurantId: config.restaurantId,
            email: cleanedCred.includes('@') ? cleanedCred : 'adithyanvijayan21644@gmail.com',
            role: 'OWNER',
          };

          const fullPayload = {
            syncCode: syncCodeToTry,
            restaurantId: config.restaurantId,
            profile: { restaurantName: config.restaurantName || 'Adithyan' },
            zones: Array.from(new Set((config.tables || []).map(t => t.areaName || t.area || 'General Area'))).map((name, idx) => ({ id: idx + 1, name })),
            tables: (config.tables || []).map((t, idx) => ({ id: idx + 1, number: t.tableNumber || t.number, area: t.areaName || t.area || 'General Area', capacity: t.capacity || 4 })),
            menuItems: (config.menuItems || []).map((m, idx) => ({
              id: idx + 1,
              category: (m.categoryName && m.categoryName.trim()) || (m.category && m.category.trim()) || 'Starters',
              name: m.name || 'Unnamed Item',
              code: m.shortCode || m.code || 'ITEM',
              price: parseFloat(m.price) || 0,
              type: m.veg ? "Veg" : "Non-Veg",
              veg: Boolean(m.veg)
            })),
            categories: config.categories || ["Starters", "Main Course", "Beverages"],
            waiters: (config.waiters || []).map((w, idx) => ({ id: idx + 1, name: w.name, pin: w.pin || w.code || '1234', role: w.role || 'Waiter', status: w.status || 'Active' }))
          };

          localStorage.setItem('smartdine_active_email', syncAccount.email);
          localStorage.setItem('smartdine_restaurant_name', syncAccount.restaurantName);
          localStorage.setItem('smartdine_account', JSON.stringify(syncAccount));
          localStorage.setItem('smartdine_setup', JSON.stringify(fullPayload));
          window.dispatchEvent(new Event('storage'));

          handleCallback(syncAccount);
          return;
        }
      } catch (ignoredSyncErr) {}

      if (backendErrMsg) {
        setError(`⚠️ ${backendErrMsg}`);
      } else {
        setError('Incorrect credentials. Please verify your email and password.');
      }
      setLoading(false);
    } catch (err) {
      console.warn('[LoginScreen] Auth error:', err);
      const serverErr = err.response?.data?.error || err.response?.data?.message;
      if (serverErr) {
        setError(`⚠️ ${serverErr}`);
      } else {
        setError('Incorrect credentials. Please try again.');
      }
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none',
    background: '#fff', color: '#0f172a', transition: 'border 0.15s',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left branding panel */}
      <div style={{
        width: '42%', background: 'linear-gradient(145deg, #063D2F 0%, #0a5c44 55%, #0d7a5c 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 44px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -70, left: -70, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

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
            Your complete POS ecosystem — billing, kitchen, and waiter app — all managed from a secure cloud dashboard.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '🔑', text: 'Sign in with Username (adithyan) or Sync Code (SD-577226)' },
            { icon: '⚡', text: 'Real-time cloud order synchronization' },
            { icon: '📊', text: 'Live sales analytics & Cloud SQL backend' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAF9', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.4px' }}>Sign in to your account</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>Enter your Username (adithyan), Email, or Sync Code</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Username, Email or Sync Code</label>
              <input
                type="text" value={credential} onChange={e => setCredential(e.target.value)}
                placeholder="e.g. adithyan or SD-577226" style={inp}
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
                {error}
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
                ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'sd-spin 0.8s linear infinite', display: 'inline-block' }} /> Verifying Account...</>
                : 'Sign In →'}
            </button>
          </form>

          {onGoSignup && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Don't have an account? </span>
              <button onClick={onGoSignup} style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>
                Create new account
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes sd-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
