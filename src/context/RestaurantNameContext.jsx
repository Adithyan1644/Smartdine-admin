import React, { createContext, useContext, useState, useEffect } from 'react';

const RESTAURANT_NAME_KEY = 'smartdine_restaurant_name';
const PANEL_NAME_KEY = 'smartdine_panel_name';

const DEFAULT_RESTAURANT_NAME = 'My Restaurant';
const DEFAULT_PANEL_NAME = 'Smart Dine';

const RestaurantNameContext = createContext(null);

export function RestaurantNameProvider({ children }) {
  const getActiveName = () => {
    try {
      const activeAcc = JSON.parse(localStorage.getItem('smartdine_account') || 'null');
      if (activeAcc && activeAcc.restaurantName) return activeAcc.restaurantName;
      return localStorage.getItem(RESTAURANT_NAME_KEY) || DEFAULT_RESTAURANT_NAME;
    } catch { return DEFAULT_RESTAURANT_NAME; }
  };

  const [restaurantName, setRestaurantNameState] = useState(getActiveName);

  const [panelName, setPanelNameState] = useState(() => {
    try {
      return localStorage.getItem(PANEL_NAME_KEY) || DEFAULT_PANEL_NAME;
    } catch { return DEFAULT_PANEL_NAME; }
  });

  useEffect(() => {
    const handleStorage = () => {
      setRestaurantNameState(getActiveName());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setRestaurantName = (name) => {
    const val = name?.trim() || DEFAULT_RESTAURANT_NAME;
    setRestaurantNameState(val);
    try { localStorage.setItem(RESTAURANT_NAME_KEY, val); } catch {}
  };

  const setPanelName = (name) => {
    const val = name?.trim() || DEFAULT_PANEL_NAME;
    setPanelNameState(val);
    try { localStorage.setItem(PANEL_NAME_KEY, val); } catch {}
  };

  return (
    <RestaurantNameContext.Provider value={{ restaurantName, panelName, setRestaurantName, setPanelName }}>
      {children}
    </RestaurantNameContext.Provider>
  );
}

export function useRestaurantName() {
  const ctx = useContext(RestaurantNameContext);
  if (!ctx) throw new Error('useRestaurantName must be used inside RestaurantNameProvider');
  return ctx;
}
