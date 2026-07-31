/* ---- KDS Kitchen Analytics & Performance Report Data Store ---- */

export const kdsOverallKpis = {
  avgPrepTime: '11.4 min',
  targetSla: '12.0 min',
  slaCompliance: '94.2%',
  totalKotsToday: 48,
  delayedOrders: 3,
  kitchenLoad: '13%',
  efficiencyScore: '98%',
  status: 'Smooth',
};

export const prepTimeTrends = {
  Today: [
    { hour: '8 AM', actual: 9, target: 12 },
    { hour: '10 AM', actual: 10, target: 12 },
    { hour: '12 PM', actual: 14, target: 12 },
    { hour: '2 PM', actual: 13, target: 12 },
    { hour: '4 PM', actual: 8, target: 12 },
    { hour: '6 PM', actual: 11, target: 12 },
    { hour: '8 PM', actual: 15, target: 12 },
    { hour: '10 PM', actual: 10, target: 12 },
  ],
  Yesterday: [
    { hour: '8 AM', actual: 10, target: 12 },
    { hour: '10 AM', actual: 11, target: 12 },
    { hour: '12 PM', actual: 15, target: 12 },
    { hour: '2 PM', actual: 12, target: 12 },
    { hour: '4 PM', actual: 9, target: 12 },
    { hour: '6 PM', actual: 13, target: 12 },
    { hour: '8 PM', actual: 16, target: 12 },
    { hour: '10 PM', actual: 11, target: 12 },
  ],
  Weekly: [
    { hour: 'Mon', actual: 11, target: 12 },
    { hour: 'Tue', actual: 10, target: 12 },
    { hour: 'Wed', actual: 12, target: 12 },
    { hour: 'Thu', actual: 11, target: 12 },
    { hour: 'Fri', actual: 14, target: 12 },
    { hour: 'Sat', actual: 15, target: 12 },
    { hour: 'Sun', actual: 13, target: 12 },
  ],
  Monthly: [
    { hour: 'Wk 1', actual: 12, target: 12 },
    { hour: 'Wk 2', actual: 11, target: 12 },
    { hour: 'Wk 3', actual: 10, target: 12 },
    { hour: 'Wk 4', actual: 11, target: 12 },
  ],
};

export const stationWorkload = [
  { name: 'Main Kitchen', count: 24, pct: 50, color: '#0B6B50' },
  { name: 'Tandoor & Grill', count: 12, pct: 25, color: '#F59E0B' },
  { name: 'Bar & Beverages', count: 8, pct: 17, color: '#3B82F6' },
  { name: 'Desserts & Pantry', count: 4, pct: 8, color: '#8B5CF6' },
];

export const dishPrepSpeedAudit = [
  { id: 1, name: 'Special Chicken Biryani', category: 'Main Course', station: 'Main Kitchen', avgPrepTime: '18 min', targetSla: '15 min', totalOrders: 32, delays: 4, status: 'Delayed', slaScore: '87.5%' },
  { id: 2, name: 'Paneer Butter Masala', category: 'Curries', station: 'Main Kitchen', avgPrepTime: '11 min', targetSla: '12 min', totalOrders: 28, delays: 1, status: 'On Time', slaScore: '96.4%' },
  { id: 3, name: 'Butter Naan (Basket)', category: 'Breads', station: 'Tandoor & Grill', avgPrepTime: '6 min', targetSla: '8 min', totalOrders: 54, delays: 0, status: 'Fastest', slaScore: '100%' },
  { id: 4, name: 'Tandoori Chicken (Full)', category: 'Starters', station: 'Tandoor & Grill', avgPrepTime: '16 min', targetSla: '15 min', totalOrders: 19, delays: 2, status: 'Nearing SLA', slaScore: '89.4%' },
  { id: 5, name: 'Fresh Lime Soda', category: 'Beverages', station: 'Bar & Beverages', avgPrepTime: '3 min', targetSla: '5 min', totalOrders: 41, delays: 0, status: 'Fastest', slaScore: '100%' },
  { id: 6, name: 'Gulab Jamun with Ice Cream', category: 'Dessert', station: 'Desserts & Pantry', avgPrepTime: '5 min', targetSla: '7 min', totalOrders: 15, delays: 0, status: 'On Time', slaScore: '100%' },
];

export const kdsInsights = [
  { priority: 'High', title: 'Main Kitchen Peak Rush', desc: 'Biryani orders exceed 15-minute SLA during 12 PM - 2 PM peak hours. Pre-batching Recommended.' },
  { priority: 'Medium', title: 'Tandoor Efficiency Excellent', desc: 'Naan & Roti preparation averaging under 6 mins with 100% SLA compliance.' },
  { priority: 'Low', title: 'Beverage Bar Capacity', desc: 'Bar station load is optimal at 17%. No bottleneck detected.' },
];
