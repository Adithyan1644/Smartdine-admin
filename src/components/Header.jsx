import React, { useState } from 'react';
import { Bell } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [headerTab, setHeaderTab] = useState('alerts');

  return (
    <header className="header">
      <div className="header-brand">Surabhi SmartDine</div>

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
        <div className="header-status">
          <span className="header-status-dot" />
          Excellent
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
