import React, { useState } from 'react';
import { API_URL } from '../config';

const sanitizeMenuItem = (itm, idx) => {
  const name = itm.name || 'Unnamed Item';
  const nameLower = name.toLowerCase();

  // Smart Veg / Non-Veg detection
  let isVeg = true;
  if (nameLower.includes('chicken') || nameLower.includes('mutton') || nameLower.includes('fish') || nameLower.includes('egg') || nameLower.includes('prawn') || nameLower.includes('c65') || itm.veg === false || itm.type === 'Non-Veg') {
    isVeg = false;
  }

  // Smart Category detection
  let cat = (itm.categoryName && itm.categoryName.trim()) || (itm.category && itm.category.trim()) || '';
  if (!cat || cat === '' || cat === 'General') {
    if (nameLower.includes('tikka') || nameLower.includes('corn') || nameLower.includes('65') || nameLower.includes('starter') || nameLower.includes('roll')) {
      cat = 'Starters';
    } else if (nameLower.includes('butter') || nameLower.includes('curry') || nameLower.includes('masala') || nameLower.includes('main')) {
      cat = 'Main Course';
    } else if (nameLower.includes('brownie') || nameLower.includes('ice cream') || nameLower.includes('sweet') || nameLower.includes('dessert')) {
      cat = 'Desserts';
    } else if (nameLower.includes('naan') || nameLower.includes('roti') || nameLower.includes('bread')) {
      cat = 'Breads';
    } else if (nameLower.includes('rice') || nameLower.includes('biryani')) {
      cat = 'Rice & Biryani';
    } else {
      cat = 'Starters';
    }
  }

  return {
    id: itm.id || idx + 1,
    category: cat,
    categoryName: cat,
    name: name,
    code: itm.code || itm.shortCode || (name.length >= 3 ? name.substring(0, 3).toUpperCase() : 'ITEM'),
    shortCode: itm.code || itm.shortCode || (name.length >= 3 ? name.substring(0, 3).toUpperCase() : 'ITEM'),
    price: parseFloat(itm.price) || 0.0,
    type: isVeg ? 'Veg' : 'Non-Veg',
    veg: isVeg,
    status: 'Available'
  };
};

export default function SetupScreen() {
  // Load initial setup configuration
  const storedSetup = JSON.parse(localStorage.getItem('smartdine_setup') || '{}');
  const storedAccount = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
  const [syncCode, setSyncCode] = useState(() => storedAccount.syncCode || storedSetup.syncCode || "SD-28E792");

  // 1. Areas State
  const [areas, setAreas] = useState(() => {
    if (storedSetup.zones && storedSetup.zones.length > 0) {
      return storedSetup.zones.map((z, idx) => ({
        id: z.id || idx + 1,
        name: z.name,
        tables: (storedSetup.tables || []).filter(t => t.area === z.name).length,
        active: true
      }));
    }
    return [
      { id: 1, name: "Main Hall", tables: 0, active: true },
      { id: 2, name: "AC Room", tables: 0, active: true }
    ];
  });

  // 2. Tables State
  const [tables, setTables] = useState(() => {
    if (storedSetup.tables && storedSetup.tables.length > 0) {
      return storedSetup.tables.map((t, idx) => ({
        id: t.id || idx + 1,
        number: t.number,
        area: t.area,
        capacity: parseInt(t.capacity) || 4,
        status: "Available"
      }));
    }
    return [];
  });

  // 3. Menu Items State (Sanitized automatically)
  const [menuItems, setMenuItems] = useState(() => {
    if (storedSetup.menuItems && storedSetup.menuItems.length > 0) {
      return storedSetup.menuItems.map((itm, idx) => sanitizeMenuItem(itm, idx));
    }
    return [];
  });

  // 3b. Categories State
  const [categories, setCategories] = useState(() => {
    if (storedSetup.categories && storedSetup.categories.length > 0) {
      return storedSetup.categories;
    }
    return [];
  });

  // Fetch live genuine data directly from backend Cloud SQL database on mount
  React.useEffect(() => {
    fetch(`${API_URL}/api/activation/config?code=${encodeURIComponent(syncCode)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.error) {
          if (Array.isArray(data.tables) && data.tables.length > 0) {
            const loadedTables = data.tables.map((t, idx) => ({
              id: t.id || idx + 1,
              number: t.number,
              area: t.area,
              capacity: parseInt(t.capacity) || 4,
              status: "Available"
            }));
            setTables(loadedTables);

            // Re-derive areas from tables
            const areaNames = Array.from(new Set(loadedTables.map(t => t.area)));
            setAreas(areaNames.map((name, idx) => ({
              id: idx + 1,
              name: name,
              tables: loadedTables.filter(t => t.area === name).length,
              active: true
            })));
          }

          if (Array.isArray(data.menuItems) && data.menuItems.length > 0) {
            setMenuItems(data.menuItems.map((itm, idx) => sanitizeMenuItem(itm, idx)));
          }

          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }

          if (Array.isArray(data.waiters) && data.waiters.length > 0) {
            setWaiters(data.waiters.map((w, idx) => ({
              id: w.id || idx + 1,
              name: w.name || w.fullName,
              code: w.pin || w.code,
              status: w.status || "Active",
              lastLogin: w.lastLogin || "Never"
            })));
          }

          if (Array.isArray(data.addons) && data.addons.length > 0) {
            setAddons(data.addons.map((a, idx) => ({
              id: a.id || idx + 1,
              name: a.name,
              price: parseFloat(a.price) || 0.0,
              status: a.status || "Active"
            })));
          }
        }
      })
      .catch(err => console.log("[SetupScreen] Backend sync note:", err.message));
  }, [syncCode]);

  // 4. Waiters State
  const [waiters, setWaiters] = useState(() => {
    if (storedSetup.waiters && storedSetup.waiters.length > 0) {
      return storedSetup.waiters.map((w, idx) => ({
        id: w.id || idx + 1,
        name: w.name || w.fullName,
        code: w.pin || w.code,
        status: w.status || "Active",
        lastLogin: w.lastLogin || "Never"
      }));
    }
    return [];
  });

  // 5. Addons State & Handlers
  const [addons, setAddons] = useState([]);
  const [showAddAddon, setShowAddAddon] = useState(false);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  const fetchAddons = () => {
    fetch(`${API_URL}/api/addons`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setAddons(data))
      .catch(err => console.warn('[SetupScreen] Failed to fetch addons:', err));
  };

  React.useEffect(() => {
    fetchAddons();
  }, []);

  const handleSaveAddon = async (e) => {
    e.preventDefault();
    if (!newAddonName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAddonName.trim(),
          price: parseFloat(newAddonPrice) || 0.0,
          isAvailable: true
        })
      });
      if (res.ok) {
        const savedAddon = await res.json();
        const updatedA = [...addons, savedAddon];
        setAddons(updatedA);
        setNewAddonName("");
        setNewAddonPrice("");
        setShowAddAddon(false);
        autoSyncConfig(null, null, null, null, updatedA);
      }
    } catch (err) {
      alert("Error saving addon: " + err.message);
    }
  };

  const handleDeleteAddon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Add-on item?")) return;
    try {
      const res = await fetch(`${API_URL}/api/addons/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updatedA = addons.filter(a => a.id !== id);
        setAddons(updatedA);
        autoSyncConfig(null, null, null, null, updatedA);
      }
    } catch (err) {
      alert("Error deleting addon: " + err.message);
    }
  };

  // Auto-fetch configuration from backend on mount
  React.useEffect(() => {
    fetch(`${API_URL}/api/activation/activate?code=${syncCode}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.tables && data.tables.length > 0) {
            const mappedTables = data.tables.map((t, idx) => ({
              id: idx + 1,
              number: t.tableNumber || t.number,
              area: t.areaName || t.area || 'General Area',
              capacity: parseInt(t.capacity) || 4,
              status: "Available"
            }));
            setTables(mappedTables);
            const uniqueAreas = Array.from(new Set(mappedTables.map(t => t.area))).map((name, idx) => ({
              id: idx + 1,
              name,
              tables: mappedTables.filter(t => t.area === name).length,
              active: true
            }));
            setAreas(uniqueAreas);
          }
          if (data.menuItems && data.menuItems.length > 0) {
            const sanitized = data.menuItems.map((m, idx) => sanitizeMenuItem(m, idx));
            setMenuItems(sanitized);
            
            // Auto-update localStorage with sanitized items
            const updatedSetup = { ...storedSetup, syncCode, menuItems: sanitized };
            localStorage.setItem('smartdine_setup', JSON.stringify(updatedSetup));
          }
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
          if (data.waiters && data.waiters.length > 0) {
            setWaiters(data.waiters.map((w, idx) => ({
              id: idx + 1,
              name: w.name,
              code: w.pin || w.code || '1234',
              status: w.status || "Active",
              lastLogin: "Never"
            })));
          }
        }
      })
      .catch(err => console.warn('[SetupScreen] Failed to fetch live setup:', err));
  }, [syncCode]);

  const [showAddWaiter, setShowAddWaiter] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState("");
  const [newWaiterPin, setNewWaiterPin] = useState("");
  const [newWaiterPhone, setNewWaiterPhone] = useState("");
  const [newWaiterRole, setNewWaiterRole] = useState("Waiter");

  const handleConfirmAddWaiter = (e) => {
    e.preventDefault();
    if (!newWaiterName.trim() || !newWaiterPin.trim()) return;

    if (newWaiterPin.trim().length !== 4 || isNaN(newWaiterPin.trim())) {
      alert("PIN must be exactly a 4-digit number!");
      return;
    }

    if (waiters.some(w => w.code === newWaiterPin.trim())) {
      alert("This PIN code is already assigned to another waiter!");
      return;
    }

    const newW = {
      id: Date.now(),
      name: newWaiterName.trim(),
      code: newWaiterPin.trim(),
      phone: newWaiterPhone.trim(),
      role: newWaiterRole,
      status: "Active",
      lastLogin: "Never"
    };

    setWaiters([...waiters, newW]);
    setNewWaiterName("");
    setNewWaiterPin("");
    setNewWaiterPhone("");
    setNewWaiterRole("Waiter");
    setShowAddWaiter(false);
  };

  // Sync State
  const [syncing, setSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncError, setSyncError] = useState("");

  React.useEffect(() => {
    if (!syncCode) return;
    
    fetch(`${API_URL}/api/activation/activate?code=${syncCode}`)
      .then(res => res.json())
      .then(config => {
        if (config && !config.error) {
          if (config.categories) {
            setCategories(config.categories);
          }
          if (config.menuItems) {
            setMenuItems(config.menuItems.map((itm, idx) => ({
              id: idx + 1,
              category: itm.categoryName || itm.category || 'General',
              name: itm.name,
              code: itm.shortCode || itm.code,
              price: parseFloat(itm.price) || 0.0,
              type: itm.veg ? "Veg" : "Non-Veg",
              status: "Available"
            })));
          }
          if (config.tables) {
            setTables(config.tables.map((t, idx) => ({
              id: idx + 1,
              number: t.tableNumber || t.number,
              area: t.areaName || t.area,
              capacity: parseInt(t.capacity) || 4,
              status: "Available"
            })));
          }
          if (config.waiters) {
            setWaiters(config.waiters.map((w, idx) => ({
              id: idx + 1,
              name: w.name,
              code: w.pin || w.code,
              phone: w.phone || "",
              role: w.role || "Waiter",
              status: w.status,
              lastLogin: "Never"
            })));
          }
        }
      })
      .catch(err => {
        console.warn('[SetupScreen] Failed to fetch active configuration:', err);
      });
  }, [syncCode]);

  const handleSyncToBiller = async () => {
    setSyncing(true);
    setSyncError("");
    try {
      const storedAccount = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
      const response = await fetch(`${API_URL}/api/activation/save-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          areas, 
          tables, 
          menuItems,
          categories: categoriesList,
          waiters: waiters.map(w => ({ id: w.id, name: w.name, pin: w.code, phone: w.phone || "", role: w.role || "Waiter", status: w.status })),
          syncCode: syncCode, // Pass existing state sync code directly
          restaurantName: storedAccount.restaurantName || storedSetup.profile?.restaurantName || "SmartDine Elite Restaurant"
        }),
      });
      if (!response.ok) throw new Error("HTTP error " + response.status);
      const data = await response.json();
      if (data.success) {
        setSyncCode(data.code);
        
        // Save changes back to smartdine_setup in localStorage
        const updatedSetup = {
          ...storedSetup,
          zones: areas.map(a => ({ id: a.id, name: a.name })),
          tables: tables.map(t => ({ id: t.id, number: t.number, area: t.area, capacity: t.capacity })),
          menuItems: menuItems.map(m => ({ id: m.id, category: m.category, name: m.name, code: m.code, price: m.price, veg: m.type === "Veg" })),
          categories: categoriesList,
          waiters: waiters.map(w => ({ id: w.id, name: w.name, pin: w.code, phone: w.phone || "", role: w.role || "Waiter", status: w.status, lastLogin: w.lastLogin })),
          syncCode: data.code
        };
        localStorage.setItem('smartdine_setup', JSON.stringify(updatedSetup));
        
        try {
          const activeEmail = localStorage.getItem('smartdine_active_email');
          if (activeEmail) {
            const accounts = JSON.parse(localStorage.getItem('smartdine_accounts') || '[]');
            const idx = accounts.findIndex(a => a.email?.toLowerCase() === activeEmail.toLowerCase());
            if (idx !== -1) {
              accounts[idx].syncCode = data.code;
              accounts[idx].setupPayload = updatedSetup;
              localStorage.setItem('smartdine_accounts', JSON.stringify(accounts));
              localStorage.setItem('smartdine_account', JSON.stringify(accounts[idx]));
            }
          }
        } catch (e) {
          console.warn('Failed to update accounts list', e);
        }
        
        setShowSyncModal(true);
      } else {
        setSyncError("Failed to generate sync code: " + (data.error || "unknown error"));
      }
    } catch (e) {
      setSyncError("Error: " + e.message + "\n\nMake sure the local SmartDine app (API Server on port 8080) is running.");
    } finally {
      setSyncing(false);
    }
  };

  // Table Search and filters
  const [tableSearch, setTableSearch] = useState("");
  const [tableAreaFilter, setTableAreaFilter] = useState("all");

  // Menu Search and filters
  const [menuSearch, setMenuSearch] = useState("");
  const [menuFilter, setMenuFilter] = useState("all");

  // Toggle Area active status
  const toggleAreaStatus = (id) => {
    setAreas(areas.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  // Add Area dynamically
  const handleAddArea = () => {
    const name = window.prompt("Enter new Area/Zone Name (e.g. Ground Floor, AC Room):");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    if (areas.some(a => a.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Area already exists!");
      return;
    }
    const newA = {
      id: Date.now(),
      name: trimmed,
      tables: 0,
      active: true
    };
    setAreas([...areas, newA]);
  };

  // Toggle Menu item status
  const toggleMenuStatus = (id) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, status: item.status === "Available" ? "Unavailable" : "Available" } : item
    ));
  };

  // Toggle Waiter Active/Disable
  const toggleWaiterStatus = (id) => {
    setWaiters(waiters.map(w => 
      w.id === id ? { 
        ...w, 
        status: w.status === "Active" ? "Disabled" : "Active" 
      } : w
    ));
  };

  // Interactive Adding
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableNo, setNewTableNo] = useState("");
  const [newTableArea, setNewTableArea] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newMenuCat, setNewMenuCat] = useState("Biryani");
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuCode, setNewMenuCode] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuType, setNewMenuType] = useState("Veg");
  // Bulk Generator States
  const [showBulkTable, setShowBulkTable] = useState(false);
  const [bulkTableCount, setBulkTableCount] = useState("");
  const [bulkTableArea, setBulkTableArea] = useState("");
  const [bulkTableCapacity, setBulkTableCapacity] = useState("4");

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableNo) return;
    const targetArea = newTableArea || (areas[0]?.name || "");
    if (!targetArea) {
      alert("Please add at least one Area first!");
      return;
    }
    const newT = {
      id: Date.now(),
      number: newTableNo.startsWith("#") ? newTableNo : `#${newTableNo}`,
      area: targetArea,
      capacity: parseInt(newTableCapacity),
      status: "Available"
    };
    setTables([...tables, newT]);
    setAreas(areas.map(a => a.name === targetArea ? { ...a, tables: a.tables + 1 } : a));
    setNewTableNo("");
    setShowAddTable(false);
  };

  const handleBulkGenerateTables = (e) => {
    e.preventDefault();
    const qty = parseInt(bulkTableCount, 10);
    if (isNaN(qty) || qty <= 0) return;
    const cap = parseInt(bulkTableCapacity, 10) || 4;
    const targetArea = bulkTableArea || (areas[0]?.name || "");
    if (!targetArea) {
      alert("Please add at least one Area first!");
      return;
    }

    let maxNum = 0;
    tables.forEach(t => {
      const match = t.number.match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });

    const newGenerated = [];
    for (let i = 1; i <= qty; i++) {
      const idx = maxNum + i;
      const numStr = `T-${String(idx).padStart(2, '0')}`;
      newGenerated.push({
        id: Date.now() + Math.random() + i,
        number: numStr,
        area: targetArea,
        capacity: cap,
        status: "Available"
      });
    }

    setTables([...tables, ...newGenerated]);
    setAreas(areas.map(a => a.name === targetArea ? { ...a, tables: a.tables + qty } : a));
    setBulkTableCount("");
    setShowBulkTable(false);
  };

  const autoSyncConfig = async (customMenuItems, customTables, customWaiters, customAreas, customAddons) => {
    try {
      const itemsToSync = customMenuItems || menuItems;
      const tablesToSync = customTables || tables;
      const waitersToSync = customWaiters || waiters;
      const areasToSync = customAreas || areas;
      const addonsToSync = customAddons || addons;
      const catList = Array.from(new Set([
        ...categories,
        ...itemsToSync.map(item => item.category)
      ])).filter(Boolean);

      const storedAccount = JSON.parse(localStorage.getItem('smartdine_account') || '{}');
      const response = await fetch(`${API_URL}/api/activation/save-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          areas: areasToSync, 
          tables: tablesToSync, 
          menuItems: itemsToSync,
          categories: catList,
          waiters: waitersToSync.map(w => ({ id: w.id, name: w.name, pin: w.code, phone: w.phone || "", role: w.role || "Waiter", status: w.status })),
          addons: addonsToSync.map(a => ({ name: a.name, price: parseFloat(a.price) || 0 })),
          syncCode: syncCode,
          restaurantName: storedAccount.restaurantName || storedSetup.profile?.restaurantName || "SmartDine Elite Restaurant"
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.code) {
          setSyncCode(data.code);
        }
      }
    } catch (e) {
      console.warn('[SetupScreen] Background auto-sync failed:', e);
    }
  };

  const handleAddMenu = (e) => {
    e.preventDefault();
    if (!newMenuName || !newMenuPrice) return;
    const newM = {
      id: Date.now(),
      category: newMenuCat,
      name: newMenuName,
      code: newMenuCode || `XX${Math.floor(Math.random() * 100)}`,
      price: parseFloat(newMenuPrice),
      type: newMenuType,
      status: "Available"
    };
    const updated = [...menuItems, newM];
    setMenuItems(updated);
    setNewMenuName("");
    setNewMenuCode("");
    setNewMenuPrice("");
    setShowAddMenu(false);
    autoSyncConfig(updated);
  };

  const deleteTable = (id, areaName) => {
    if (window.confirm("Remove this table?")) {
      const updatedT = tables.filter(t => t.id !== id);
      setTables(updatedT);
      const updatedA = areas.map(a => a.name === areaName ? { ...a, tables: Math.max(0, a.tables - 1) } : a);
      setAreas(updatedA);
      autoSyncConfig(null, updatedT, null, updatedA);
    }
  };

  const deleteMenu = (id) => {
    if (window.confirm("Remove this menu item?")) {
      const updatedM = menuItems.filter(m => m.id !== id);
      setMenuItems(updatedM);
      autoSyncConfig(updatedM);
    }
  };

  const filteredTables = tables.filter(t => {
    const matchesSearch = t.number.toLowerCase().includes(tableSearch.toLowerCase()) || 
                          t.area.toLowerCase().includes(tableSearch.toLowerCase());
    const matchesArea = tableAreaFilter === "all" || t.area === tableAreaFilter;
    return matchesSearch && matchesArea;
  });

  const filteredMenu = menuItems.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
                          m.code.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = menuFilter === "all" || m.category === menuFilter;
    return matchesSearch && matchesCat;
  });

  const categoriesList = Array.from(new Set([
    ...categories,
    ...menuItems.map(item => item.category)
  ])).filter(Boolean);

  const handleCategoryChange = (val) => {
    if (val === "__ADD_NEW__") {
      const custom = window.prompt("Enter new category name:");
      if (custom && custom.trim()) {
        const trimmed = custom.trim();
        if (!categories.includes(trimmed)) {
          setCategories([...categories, trimmed]);
        }
        setNewMenuCat(trimmed);
      } else {
        setNewMenuCat(categoriesList[0] || "Starters");
      }
    } else {
      setNewMenuCat(val);
    }
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Configurations &amp; Settings</h1>
          <div className="page-subtitle">Configure layout, tables, menu, prices, and staff access.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <button
            onClick={handleSyncToBiller}
            disabled={syncing}
            style={{
              background: syncing ? '#94a3b8' : 'linear-gradient(135deg, #166534, #15803d)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: syncing ? 'not-allowed' : 'pointer',
              boxShadow: syncing ? 'none' : '0 4px 12px rgba(22,101,52,0.35)',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {syncing ? (
              <>
                <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.5)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Syncing...
              </>
            ) : (
              <>&#x2601; Sync Setup &amp; Generate Sync Code</>
            )}
          </button>
          {syncError && (
            <div style={{ fontSize: '12px', color: '#dc2626', maxWidth: 280, textAlign: 'right', whiteSpace: 'pre-line' }}>{syncError}</div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4 mb-5">
        <div className="card">
          <span className="kpi-label">Total Areas</span>
          <div className="kpi-value" style={{ marginTop: 10, marginBottom: 0 }}>{areas.length}</div>
        </div>
        <div className="card">
          <span className="kpi-label">Total Tables</span>
          <div className="kpi-value" style={{ marginTop: 10, marginBottom: 0 }}>{tables.length}</div>
        </div>
        <div className="card">
          <span className="kpi-label">Menu Items</span>
          <div className="kpi-value" style={{ marginTop: 10, marginBottom: 0 }}>{menuItems.length}</div>
        </div>
        <div className="card">
          <span className="kpi-label">Active Waiters</span>
          <div className="kpi-value" style={{ marginTop: 10, marginBottom: 0 }}>{waiters.filter(w => w.status === "Active").length}</div>
        </div>
      </div>

      {/* Area Management Section */}
      <div className="card mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="card-title">Area Management</div>
            <div className="card-subtitle">Define different dining sections in the restaurant</div>
          </div>
          <button className="timeframe-tab active" style={{ height: 36, padding: '0 14px' }} onClick={handleAddArea}>
            + Add Area
          </button>
        </div>
        <div className="grid-4">
          {areas.map((area) => (
            <div key={area.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: area.active ? '4px solid #166534' : '4px solid #64748b' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{area.name}</span>
                <span className={`badge ${area.active ? 'badge-green' : 'badge-slate'}`}>
                  {area.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{area.tables} Tables configured</span>
              <div className="flex gap-2" style={{ marginTop: '10px' }}>
                <button className="timeframe-tab" style={{ flex: 1, padding: '6px 0' }}>Edit</button>
                <button
                  className="timeframe-tab active"
                  style={{ flex: 1, padding: '6px 0', background: area.active ? '#94a3b8' : '#166534', borderColor: area.active ? '#94a3b8' : '#166534' }}
                  onClick={() => toggleAreaStatus(area.id)}
                >
                  {area.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Management Section */}
      <div className="card mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="card-title">Table Configurations</div>
            <div className="card-subtitle">Define layout and QR tags</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="timeframe-tab active" style={{ height: 36, padding: '0 14px' }} onClick={() => { setShowAddTable(!showAddTable); setShowBulkTable(false); }}>
              {showAddTable ? 'Cancel' : '+ Add Table'}
            </button>
            <button className="timeframe-tab active" style={{ height: 36, padding: '0 14px', background: 'linear-gradient(135deg, #166534, #15803d)', borderColor: '#166534' }} onClick={() => { setShowBulkTable(!showBulkTable); setShowAddTable(false); }}>
              {showBulkTable ? 'Cancel' : '⚡ Auto-Generate Tables'}
            </button>
          </div>
        </div>

        {/* Add Table Mini-Form */}
        {showAddTable && (
          <form onSubmit={handleAddTable} className="card mb-4" style={{ background: '#f8fafc', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Table Number/Name</label>
                <input type="text" placeholder="e.g. 11, AC-1" className="form-control" value={newTableNo} onChange={(e) => setNewTableNo(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Area Location</label>
                <select className="form-control" value={newTableArea || (areas[0]?.name || "")} onChange={(e) => setNewTableArea(e.target.value)}>
                  {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px' }}>Confirm Table</button>
            </div>
          </form>
        )}

        {/* Bulk Auto-Generate Table Form */}
        {showBulkTable && (
          <form onSubmit={handleBulkGenerateTables} className="card mb-4" style={{ background: '#f8fafc', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Auto-Generate Count</label>
                <input type="number" min="1" placeholder="e.g. 10" className="form-control" value={bulkTableCount} onChange={(e) => setBulkTableCount(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Area Location</label>
                <select className="form-control" value={bulkTableArea || (areas[0]?.name || "")} onChange={(e) => setBulkTableArea(e.target.value)}>
                  {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px', background: 'linear-gradient(135deg, #166534, #15803d)' }}>⚡ Auto-Generate</button>
            </div>
          </form>
        )}

        <div className="flex justify-between items-center mb-4">
          <div style={{ position: 'relative', width: 240 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search tables..."
              className="form-control"
              style={{ paddingLeft: 32 }}
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={tableAreaFilter} onChange={(e) => setTableAreaFilter(e.target.value)}>
            <option value="all">All Areas</option>
            {areas.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Table</th>
              <th>Area Location</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.map((t) => (
              <tr key={t.id}>
                <td>
                  <input
                    type="text"
                    value={t.number}
                    onChange={e => {
                      const val = e.target.value;
                      setTables(tables.map(x => x.id === t.id ? { ...x, number: val } : x));
                    }}
                    style={{
                      fontWeight: '700',
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      width: '90px',
                      outline: 'none',
                      background: '#fff',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                </td>
                <td style={{ color: '#64748b' }}>{t.area}</td>
                <td>
                  <span className={`badge ${t.status === 'Available' ? 'badge-green' : t.status === 'Reserved' ? 'badge-blue' : 'badge-amber'}`}>
                    {t.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="timeframe-tab" style={{ padding: '4px 8px' }} onClick={() => alert(`Generated QR Code for Table ${t.number}`)}>QR</button>
                    <button className="timeframe-tab" style={{ padding: '4px 8px' }} onClick={() => deleteTable(t.id, t.area)}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Menu Management Section */}
      <div className="card mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="card-title">Menu Index</div>
            <div className="card-subtitle">Add, search, and enable/disable dishes</div>
          </div>
          <button className="timeframe-tab active" style={{ height: 36, padding: '0 14px' }} onClick={() => setShowAddMenu(!showAddMenu)}>
            {showAddMenu ? 'Cancel' : '+ Add Menu Item'}
          </button>
        </div>

        {/* Add Menu Mini-Form */}
        {showAddMenu && (
          <form onSubmit={handleAddMenu} className="card mb-4" style={{ background: '#f8fafc', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Category</label>
                <select className="form-control" value={newMenuCat} onChange={(e) => handleCategoryChange(e.target.value)}>
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__ADD_NEW__" style={{ fontWeight: 'bold', color: '#166534' }}>+ Add Custom Category...</option>
                </select>
              </div>
              <div>
                <label className="form-label">Dish Name</label>
                <input type="text" placeholder="e.g. Garlic Naan" className="form-control" value={newMenuName} onChange={(e) => {
                  const val = e.target.value;
                  setNewMenuName(val);
                  const initials = val.trim().split(/\s+/).map(w => w[0] || '').join('').toUpperCase();
                  setNewMenuCode(initials);
                }} required />
              </div>
              <div>
                <label className="form-label">Item Code</label>
                <input type="text" placeholder="e.g. GN" className="form-control" value={newMenuCode} onChange={(e) => setNewMenuCode(e.target.value.toUpperCase())} required />
              </div>
              <div>
                <label className="form-label">Price (₹)</label>
                <input type="number" min="0" className="form-control" placeholder="Price" value={newMenuPrice} onChange={(e) => setNewMenuPrice(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select className="form-control" value={newMenuType} onChange={(e) => setNewMenuType(e.target.value)}>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px' }}>Confirm Item</button>
            </div>
          </form>
        )}

        <div className="flex justify-between items-center mb-4">
          <div style={{ position: 'relative', width: 240 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search menu..."
              className="form-control"
              style={{ paddingLeft: 32 }}
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: 'auto' }} value={menuFilter} onChange={(e) => setMenuFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item Name</th>
              <th>Code</th>
              <th>Price</th>
              <th>Type</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenu.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: '600', color: '#64748b', fontSize: '12px' }}>{item.category.toUpperCase()}</td>
                <td style={{ fontWeight: '500', color: '#0f172a' }}>{item.name}</td>
                <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.code}</td>
                <td style={{ fontWeight: '600', color: '#0f172a' }}>₹{item.price}</td>
                <td>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: item.type === 'Veg' ? '#16a34a' : '#dc2626', padding: '2px 6px', border: '1px solid currentColor', borderRadius: '4px' }}>
                    {item.type}
                  </span>
                </td>
                <td>
                  <span className={`badge ${item.status === 'Available' ? 'badge-green' : 'badge-red'}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="timeframe-tab" style={{ padding: '4px 8px' }} onClick={() => toggleMenuStatus(item.id)}>
                      {item.status === 'Available' ? 'Disable' : 'Enable'}
                    </button>
                    <button className="timeframe-tab" style={{ padding: '4px 8px' }} onClick={() => deleteMenu(item.id)}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add-ons Management Section */}
      <div className="card mb-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="card-title">🍟 Add-on & Extra Items Management</div>
            <div className="card-subtitle">Manage extra add-ons (e.g. Extra Cheese, Mayo, Gravy) with custom prices for POS & Waiter apps.</div>
          </div>
          <button className="timeframe-tab active" onClick={() => setShowAddAddon(!showAddAddon)}>
            {showAddAddon ? 'Cancel' : '+ Add New Add-on'}
          </button>
        </div>

        {showAddAddon && (
          <form onSubmit={handleSaveAddon} className="card mb-4" style={{ background: '#f8fafc', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Add-on Item Name</label>
                <input type="text" placeholder="e.g. Extra Cheese" className="form-control" value={newAddonName} onChange={(e) => setNewAddonName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Extra Price (₹)</label>
                <input type="number" step="0.5" min="0" placeholder="e.g. 30.00" className="form-control" value={newAddonPrice} onChange={(e) => setNewAddonPrice(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px' }}>Save Add-on</button>
            </div>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Add-on Name</th>
              <th>Extra Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.id}>
                <td style={{ fontWeight: '600', color: '#0f172a' }}>{addon.name}</td>
                <td style={{ fontWeight: '700', color: '#16a34a' }}>+₹{parseFloat(addon.price || 0).toFixed(2)}</td>
                <td>
                  <span className={`badge ${addon.isAvailable !== false ? 'badge-green' : 'badge-red'}`}>
                    {addon.isAvailable !== false ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button className="timeframe-tab" style={{ padding: '4px 8px' }} onClick={() => handleDeleteAddon(addon.id)}>
                    🗑️ Remove
                  </button>
                </td>
              </tr>
            ))}
            {addons.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>No add-ons found. Click "+ Add New Add-on" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Waiter Management Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="card-title">Waiter Handsets & Logins</div>
            <div className="card-subtitle">
              POS Biller Code: <strong style={{ color: '#166534', fontFamily: 'monospace', marginRight: '12px' }}>{syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode)}</strong>
              Waiter App Code: <strong style={{ color: '#1d4ed8', fontFamily: 'monospace' }}>{syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="timeframe-tab" onClick={() => {
              const wtCode = syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode;
              navigator.clipboard?.writeText(wtCode);
              alert(`Waiter App Code copied: ${wtCode}\n\nEnter this code in the Waiter App.`);
            }}>Copy Waiter Code</button>
            <button className="timeframe-tab active" onClick={() => setShowAddWaiter(!showAddWaiter)}>
              {showAddWaiter ? 'Cancel' : '+ Add Waiter'}
            </button>
          </div>
        </div>

        {/* Add Waiter Mini-Form */}
        {showAddWaiter && (
          <form onSubmit={handleConfirmAddWaiter} className="card mb-4" style={{ background: '#f8fafc', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div>
                <label className="form-label">Waiter Name</label>
                <input type="text" placeholder="e.g. Rahul" className="form-control" value={newWaiterName} onChange={(e) => setNewWaiterName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Login PIN (4 digits)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" maxLength="4" placeholder="1234" className="form-control" value={newWaiterPin} onChange={(e) => setNewWaiterPin(e.target.value.replace(/\D/g, ''))} required />
                  <button type="button" className="timeframe-tab" style={{ height: '36px', padding: '0 8px', flexShrink: 0 }} onClick={() => {
                    let pin;
                    let attempts = 0;
                    do {
                      pin = String(Math.floor(1000 + Math.random() * 9000));
                      attempts++;
                    } while (waiters.some(w => w.code === pin) && attempts < 100);
                    setNewWaiterPin(pin);
                  }}>Generate</button>
                </div>
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input type="text" placeholder="Optional" className="form-control" value={newWaiterPhone} onChange={(e) => setNewWaiterPhone(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-control" value={newWaiterRole} onChange={(e) => setNewWaiterRole(e.target.value)}>
                  <option value="Waiter">Waiter</option>
                  <option value="Captain">Captain</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ height: '38px', padding: '0 16px' }}>Confirm Waiter</button>
            </div>
          </form>
        )}
        
        <div className="grid-4">
          {waiters.map((waiter) => (
            <div key={waiter.id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="flex justify-between items-center">
                <div>
                  <span style={{ fontWeight: '700', fontSize: '15px', display: 'block', color: '#0f172a' }}>{waiter.name}</span>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>Login PIN: {waiter.code}</span>
                  {waiter.phone && <span style={{ fontSize: '11px', display: 'block', color: '#64748b', marginTop: 2 }}>📞 {waiter.phone}</span>}
                  {waiter.role && <span style={{ fontSize: '11px', fontWeight: '600', display: 'block', color: '#166534', marginTop: 2 }}>👤 {waiter.role}</span>}
                </div>
                <span className={`badge ${waiter.status === 'Active' ? 'badge-green' : 'badge-red'}`}>
                  {waiter.status}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Last Check-in: {waiter.lastLogin}</span>
              <div className="flex gap-2" style={{ marginTop: '10px' }}>
                <button
                  className="timeframe-tab"
                  style={{ flex: 1, color: '#dc2626' }}
                  onClick={() => {
                    if (window.confirm(`Delete waiter ${waiter.name}?`)) {
                      setWaiters(waiters.filter(w => w.id !== waiter.id));
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  className="timeframe-tab"
                  style={{ flex: 1, color: waiter.status === 'Active' ? '#dc2626' : '#16a34a' }}
                  onClick={() => toggleWaiterStatus(waiter.id)}
                >
                  {waiter.status === 'Active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Code Success Modal */}
      {showSyncModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '28px',
            maxWidth: '420px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '18px',
            animation: 'fadeIn 0.2s ease',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 22 }}>✅</span>
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '17px', color: '#0f172a' }}>Cloud Sync Successful!</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>Your configuration is saved and ready for Biller POS.</div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0' }} />

            {/* Dual Sync Code Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* POS Biller Code */}
              <div 
                style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => {
                  const bCode = syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode);
                  navigator.clipboard?.writeText(bCode);
                  alert(`POS Biller Code copied: ${bCode}`);
                }}
                title="Click to copy POS Biller Code"
              >
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>🖥️ POS Biller Code</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#15803d', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  {syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode)}
                </div>
                <div style={{ fontSize: '10px', color: '#166534', marginTop: '4px' }}>For POS Biller Station</div>
              </div>

              {/* Waiter App Code */}
              <div 
                style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => {
                  const wCode = syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode;
                  navigator.clipboard?.writeText(wCode);
                  alert(`Waiter App Code copied: ${wCode}`);
                }}
                title="Click to copy Waiter App Code"
              >
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>📱 Waiter App Code</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#1d4ed8', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                  {syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode}
                </div>
                <div style={{ fontSize: '10px', color: '#1e40af', marginTop: '4px' }}>For Waiter Mobile App</div>
              </div>
            </div>

            {/* Biller Instructions */}
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
              padding: '14px 16px', fontSize: '12px', color: '#166534',
            }}>
              <div style={{ fontWeight: '700', marginBottom: 6 }}>📋 Biller PC Activation Steps:</div>
              <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Launch the <strong>SMARTDINE Setup Wizard</strong> on the Biller PC.</li>
                <li>Enter POS Biller Code: <strong style={{ fontFamily: 'monospace', background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>{syncCode.startsWith('SD-') ? syncCode : ('SD-' + syncCode)}</strong></li>
                <li>Set Gateway URL: <strong style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>http://localhost:8080/api/public/provision</strong></li>
                <li>Click <strong>Verify Code &amp; Seed Database</strong>.</li>
              </ol>
            </div>

            {/* Waiter App Instructions */}
            <div style={{
              background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px',
              padding: '14px 16px', fontSize: '12px', color: '#1e40af',
            }}>
              <div style={{ fontWeight: '700', marginBottom: 6 }}>📱 Waiter App Activation Steps:</div>
              <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                <li>Install and open the <strong>SmartDine Waiter App</strong> on the waiter's phone.</li>
                <li>When prompted for a Waiter Code, enter: <strong style={{ fontFamily: 'monospace', letterSpacing: '0.1em', background: '#dbeafe', padding: '2px 6px', borderRadius: 4 }}>{syncCode.startsWith('SD-') ? ('WT-' + syncCode.substring(3)) : syncCode}</strong></li>
                <li>The app activates once permanently and pairs with your restaurant.</li>
              </ol>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowSyncModal(false)}
              style={{
                width: '100%', padding: '12px', fontWeight: '700', fontSize: '14px',
                background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
