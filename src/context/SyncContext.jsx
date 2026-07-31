import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config';

const SyncContext = createContext();

const CACHE_KEY = 'smartdine_cached_analytics';
const DISCONNECT_THRESHOLD_MS = 45000;
const POLL_INTERVAL_MS = 30000;

export function SyncProvider({ children }) {
  // Seed state instantly from localStorage to prevent UI flashing on mount
  const [analyticsData, setAnalyticsData] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.warn('[SyncContext] Failed to parse cached analytics:', e);
      return null;
    }
  });

  const [loading, setLoading]                 = useState(!analyticsData);
  const [billerConnected, setBillerConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime]       = useState(() => {
    return analyticsData?.lastActiveTime
      ? new Date(analyticsData.lastActiveTime).toLocaleTimeString()
      : null;
  });
  const [disconnectedSince, setDisconnectedSince] = useState(null);

  const fetchAnalytics = useCallback(async (showLoading = false) => {
    if (showLoading && !analyticsData) setLoading(true);

    // Resolve sync code from localStorage — never fall back to hardcoded ID
    let syncCode = '';
    try {
      const setup   = JSON.parse(localStorage.getItem('smartdine_setup')   || '{}');
      const account = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
      syncCode = setup.syncCode || account.syncCode || '';
    } catch (e) {
      console.warn('[SyncContext] Failed to read sync code:', e);
    }

    try {
      const res = await fetch(`${API_URL}/api/activation/analytics?filter=today&code=${syncCode}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Persist to localStorage for 24/7 offline standalone viewing
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(json)); } catch (_) {}

      setAnalyticsData(json);
      setLastSyncTime(new Date().toLocaleTimeString());

      // UTC epoch delta — handles timezone drift between biller PC and cloud server
      const lastBillerPingMs = json.lastBillerPingTime || json.lastActiveTime || 0;
      const utcNow           = Date.now();
      const deltaMs          = utcNow - lastBillerPingMs;
      const isRecentPing     = lastBillerPingMs > 0 && deltaMs < DISCONNECT_THRESHOLD_MS;
      const billerActive     = json.billerStatus === 'ACTIVE' || json.isLive === true;

      if (billerActive || isRecentPing) {
        setBillerConnected(true);
        setDisconnectedSince(null);
      } else {
        setBillerConnected(false);
        // Capture first moment of disconnection; don't overwrite on subsequent polls
        setDisconnectedSince(prev =>
          prev ? prev : (lastBillerPingMs > 0
            ? new Date(lastBillerPingMs).toLocaleTimeString()
            : new Date().toLocaleTimeString())
        );
      }
    } catch (err) {
      console.warn('[SyncContext] Biller offline or cloud fetch error:', err);
      setBillerConnected(false);
      // Serve cached data silently — dashboard stays functional
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchAnalytics(false);
    const interval = setInterval(() => fetchAnalytics(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return (
    <SyncContext.Provider value={{
      analyticsData,
      billerConnected,
      isBillerConnected: billerConnected, // backward-compat alias
      lastSyncTime,
      disconnectedSince,
      loading,
      refetchData: () => fetchAnalytics(true),
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
