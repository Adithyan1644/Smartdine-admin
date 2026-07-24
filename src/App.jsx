import React, { useState, useEffect } from 'react';
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
    const storedAccount = JSON.parse(localStorage.getItem('smartdine_account') || 'null');
    const storedSession = JSON.parse(localStorage.getItem('smartdine_session') || 'null');

    if (!storedAccount) {
      setAppState('signup');
    } else if (storedSession) {
      // Already logged in → go straight to dashboard
      setAccount(storedAccount);
      setAppState('dashboard');
    } else {
      setAccount(storedAccount);
      setAppState('login');
    }
  }, []);

  /* ── Handlers ── */
  const handleSignup = (newAccount) => {
    setAccount(newAccount);
    setAppState('wizard');
  };

  const handleWizardComplete = () => {
    localStorage.setItem('smartdine_session', JSON.stringify({ loggedInAt: new Date().toISOString() }));
    setAppState('dashboard');
  };

  const handleLogin = (acc) => {
    localStorage.setItem('smartdine_session', JSON.stringify({ loggedInAt: new Date().toISOString() }));
    setAccount(acc);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('smartdine_session');
    localStorage.removeItem('smartdine_account');
    localStorage.removeItem('smartdine_setup');
    localStorage.removeItem('smartdine_active_email');
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
  }

  if (appState === 'login') {
    return <LoginScreen onLogin={handleLogin} onGoSignup={() => setAppState('signup')} />;
  }

  /* ── Dashboard ── */
  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="main-content">
        <Header activeTab={activeTab} />
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
