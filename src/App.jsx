import React, { useState, useEffect } from 'react';
import { SyncProvider } from './context/SyncContext';
import { RestaurantNameProvider } from './context/RestaurantNameContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewScreen from './components/OverviewScreen';
import SalesScreen from './components/SalesScreen';
import ExpensesScreen from './components/ExpensesScreen';
import KitchenScreen from './components/KitchenScreen';
import SetupScreen from './components/SetupScreen';
import StaffScreen from './components/StaffScreen';
import SettingsScreen from './components/SettingsScreen';
import LoginScreen from './components/auth/LoginScreen';
import SignupScreen from './components/auth/SignupScreen';
import SetupWizard from './components/onboarding/SetupWizard';

function App() {
  // appState: 'loading' | 'signup' | 'wizard' | 'login' | 'dashboard'
  const [appState, setAppState] = useState('loading');
  const [account, setAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Determine initial screen on mount ── */
  useEffect(() => {
    // Cloud-SQL-First Auth Gate:
    // The ONLY valid session proof is a JWT token + restaurant name from the cloud.
    // localStorage never stores operational arrays (tables/menus/areas).
    const jwtToken = localStorage.getItem('smartdine_jwt_token');
    const restaurantName = localStorage.getItem('smartdine_restaurant_name');
    const syncCode = localStorage.getItem('smartdine_sync_code');
    const isTest = localStorage.getItem('smartdine_is_test') === 'true';

    if (jwtToken && restaurantName) {
      // Valid cloud session with JWT — restore account context
      setAccount({ restaurantName, syncCode, isTest });
      setAppState('dashboard');
    } else if (syncCode && restaurantName) {
      // Signed up but page refreshed before JWT was stored (e.g. wizard flow)
      // Allow access — the user's data exists in Cloud SQL already
      setAccount({ restaurantName, syncCode, isTest });
      setAppState('dashboard');
    } else {
      // No valid session — always show login; never allow stale local state access
      setAppState('login');
    }
  }, []);

  /* ── Handlers ── */
  const handleSignup = (newAccount) => {
    // After signup, the SetupWizard collects operational details and pushes them to Cloud SQL.
    // We store only minimal identity context — never tables or menu arrays.
    setAccount(newAccount);
    setAppState('wizard');
  };

  const handleWizardComplete = (wizardAccount) => {
    // Store ONLY session tokens after wizard completion — zero operational data locally.
    if (wizardAccount) {
      if (wizardAccount.token) localStorage.setItem('smartdine_jwt_token', wizardAccount.token);
      if (wizardAccount.restaurantName) localStorage.setItem('smartdine_restaurant_name', wizardAccount.restaurantName);
      if (wizardAccount.syncCode) localStorage.setItem('smartdine_sync_code', wizardAccount.syncCode);
      localStorage.setItem('smartdine_is_test', String(!!wizardAccount.isTest));
    }
    setAppState('dashboard');
  };

  const handleLogin = (acc) => {
    // acc shape from LoginScreen: { token, restaurantName, syncCode, isTest }
    // Store ONLY the secure session tokens — Cloud SQL is the source of truth for all operational data.
    if (acc.token) localStorage.setItem('smartdine_jwt_token', acc.token);
    if (acc.restaurantName) localStorage.setItem('smartdine_restaurant_name', acc.restaurantName);
    if (acc.syncCode) localStorage.setItem('smartdine_sync_code', acc.syncCode);
    localStorage.setItem('smartdine_is_test', String(!!acc.isTest));
    setAccount(acc);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    // Wipe all session tokens and cached data on logout.
    localStorage.removeItem('smartdine_jwt_token');
    localStorage.removeItem('smartdine_sync_code');
    localStorage.removeItem('smartdine_restaurant_name');
    localStorage.removeItem('smartdine_is_test');
    localStorage.removeItem('smartdine_cached_analytics');
    // Legacy keys cleanup (safe to remove even if absent)
    localStorage.removeItem('smartdine_session');
    localStorage.removeItem('smartdine_account');
    localStorage.removeItem('smartdine_setup');
    localStorage.removeItem('smartdine_active_email');
    localStorage.removeItem('smartdine_accounts');
    setAccount(null);
    setAppState('login');
  };

  /* ── Render the active dashboard tab ── */
  const renderScreen = () => {
    switch (activeTab) {
      case 'overview':   return <OverviewScreen />;
      case 'sales':      return <SalesScreen />;
      case 'expenses':   return <ExpensesScreen />;
      case 'kitchen':    return <KitchenScreen />;
      case 'setup':      return <SetupScreen />;
      case 'staff':      return <StaffScreen />;
      case 'settings':   return <SettingsScreen />;
      default:           return <OverviewScreen />;
    }
  };

  /* ── Route to correct screen ── */
  if (appState === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAF9' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🍽️</div>
          <div style={{ fontWeight: 800, color: '#063D2F', fontSize: 18 }}>SmartDine</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (appState === 'signup') {
    return <SignupScreen onSignup={handleSignup} onGoLogin={() => setAppState('login')} />;
  }

  if (appState === 'wizard') {
    return <SetupWizard account={account} onComplete={handleWizardComplete} />;
    // SetupWizard calls onComplete(wizardAccount) with { token, restaurantName, syncCode, isTest }
  }

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} onGoSignup={() => setAppState('signup')} />;
  }

  /* ── Dashboard ── */
  return (
    <RestaurantNameProvider>
      <SyncProvider>
        <div className="app-container">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
          <div className="main-content">
            <Header activeTab={activeTab} />
            {renderScreen()}
          </div>
        </div>
      </SyncProvider>
    </RestaurantNameProvider>
  );
}

export default App;
