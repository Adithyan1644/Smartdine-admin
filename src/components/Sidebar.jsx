import React from 'react';
import {
  LayoutDashboard, ShoppingBag, Receipt, ChefHat,
  UtensilsCrossed, UserCog, Settings, Leaf, FileText
} from 'lucide-react';
import { useRestaurantName } from '../context/RestaurantNameContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',  tab: 'overview' },
  { icon: ShoppingBag,     label: 'Sales',     tab: 'sales' },
  { icon: Receipt,         label: 'Expenses',  tab: 'expenses' },
  { icon: ChefHat,         label: 'Kitchen',   tab: 'kitchen' },
  { icon: UtensilsCrossed, label: 'Setup',     tab: 'setup' },
  { icon: UserCog,         label: 'Staff',     tab: 'staff' },
  { icon: Settings,        label: 'Settings',  tab: 'settings' },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const { restaurantName, panelName } = useRestaurantName();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={16} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name" title={restaurantName} style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{restaurantName}</span>
          <span className="sidebar-logo-sub">{panelName}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ icon: Icon, label, tab }) => (
          <button
            key={tab}
            className={`sidebar-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-generate-report">
          <FileText size={16} />
          Generate Report
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '9px 12px', marginTop: 8,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, color: '#fca5a5', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          >
            <span style={{ fontSize: 15 }}>🚪</span> Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}

