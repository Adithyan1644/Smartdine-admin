export const mockData = {
  kpis: {
    sales: { value: 84290, change: 12, isPositive: true },
    expenses: { value: 18500, change: 3, isPositive: false },
    profit: { value: 65790, change: 18, isPositive: true },
    orders: { value: 312, change: 8, isPositive: true }
  },
  pulse: [
    "Sales are 12% higher than yesterday",
    "Kitchen is operating smoothly — 0 delayed orders",
    "Average preparation time improved by 2 minutes",
    "Online orders increased by 18% this week"
  ],
  kitchen: {
    status: "Smooth",
    prepTime: "16 mins",
    delayedOrders: 0,
    fastestItem: "Masala Chai — 4 mins",
    slowestItem: "Dum Biryani — 28 mins",
    efficiency: 94
  },
  topDishes: [
    { name: "Chicken Biryani", orders: 245, revenue: 48500 },
    { name: "Paneer Tikka", orders: 186, revenue: 32100 },
    { name: "Butter Naan", orders: 312, revenue: 18720 },
    { name: "Dal Makhani", orders: 98, revenue: 14700 },
    { name: "Masala Chai", orders: 428, revenue: 8560 }
  ],
  businessMix: [
    { name: 'Dine-in', value: 45 },
    { name: 'Online', value: 30 },
    { name: 'Takeaway', value: 25 },
  ],
  insights: [
    { title: "Revenue Star", desc: "Chicken Biryani generated 22% of today's revenue", type: "positive", priority: "High" },
    { title: "Group Bookings", desc: "Group bookings increased by 15% this week", type: "neutral", priority: "Medium" },
    { title: "Kitchen Win", desc: "Kitchen efficiency improved by 10% vs last week", type: "warning", priority: "Medium" },
    { title: "Stock Alert", desc: "Paneer stock may run out within 4 hours", type: "critical", priority: "High" }
  ]
};
