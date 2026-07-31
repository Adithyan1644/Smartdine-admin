import React, { useState } from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';
import { useSync } from '../context/SyncContext';
import { useRestaurantName } from '../context/RestaurantNameContext';

export default function Header({ activeTab, setActiveTab }) {
  const [headerTab, setHeaderTab] = useState('alerts');
  const { billerConnected, lastSyncTime, disconnectedSince } = useSync();
  const { restaurantName, panelName } = useRestaurantName();

  return (
    <header className="header">
      <div className="header-brand">{restaurantName} — {panelName}</div>

      <div className="header-toggle">
        <button
          className={`header-toggle-btn ${headerTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setHeaderTab('alerts')}
        >
          Live Alerts
        </button>
        <button
          className={`header-toggle-btn ${headerTab === 'brief' ? 'active' : ''}`}
          onClick={() => setHeaderTab('brief')}
        >
          Daily Brief
        </button>
      </div>

      <div className="header-right">
        {/* Connection status badge */}
        <div
          title={billerConnected
            ? 'Biller PC is active & sharing live data'
            : `Biller PC is offline. Displaying saved cloud data. Last sync: ${lastSyncTime || 'N/A'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            transition: 'all 0.3s ease',
            ...(billerConnected
              ? { background: '#EAF8F2', color: '#0B6B50', border: '1px solid #A7F3D0' }
              : { background: '#FFFBEB', color: '#78350F', border: '1px solid #FDE68A' }
            ),
          }}
        >
          {billerConnected ? (
            <>
              <span style={{ backgroundColor: '#0B6B50', width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
              <Wifi size={13} style={{ strokeWidth: 2.5 }} />
              <span>Live Data Active</span>
            </>
          ) : (
            <>
              <span style={{ backgroundColor: '#F59E0B', width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
              <WifiOff size={13} style={{ strokeWidth: 2.5 }} />
              <span>Disconnected</span>
              <span style={{ color: '#92400E', fontWeight: 400, fontSize: 11 }}>
                {disconnectedSince
                  ? `Since ${disconnectedSince}`
                  : lastSyncTime
                    ? `Last sync: ${lastSyncTime}`
                    : ''}
              </span>
            </>
          )}
        </div>

        <button className="header-bell">
          <Bell size={16} />
          <span className="header-bell-dot" />
        </button>
        <div className="header-avatar">SS</div>
      </div>
    </header>
  );
}
