export const orderKpis = {
  total: 182,
  active: 24,
  completed: 158,
  dineIn: 96,
  takeaway: 34,
  online: 52,
};

export const orderDistribution = [
  { name: "Dine-In", count: 96, pct: 53, color: "#0B6B50" },
  { name: "Takeaway", count: 34, pct: 19, color: "#F59E0B" },
  { name: "Online", count: 52, pct: 28, color: "#3B82F6" },
];

export const kitchenKpis = {
  avgPrepTime: 16,
  yesterdayPrepTime: 14,
  activeKots: 18,
  readyOrders: 12,
  delayedOrders: 3,
};

export const kitchenStatus = {
  status: "Busy",
  message: "Kitchen workload is higher than usual — 3 orders are currently delayed.",
};

export const liveSummary = {
  cooking: 14,
  waiting: 5,
  ready: 7,
  avgQueueTime: "8 min",
};

export const orderTimeline = [
  { stage: "Order Received", count: 5, color: "#3B82F6" },
  { stage: "Cooking", count: 14, color: "#F59E0B" },
  { stage: "Ready", count: 7, color: "#0B6B50" },
  { stage: "Served", count: 156, color: "#94A3B8" },
];

export const prepTrendToday = [
  { time: "9 AM", today: 12, yesterday: 10 },
  { time: "10 AM", today: 14, yesterday: 12 },
  { time: "11 AM", today: 15, yesterday: 13 },
  { time: "12 PM", today: 19, yesterday: 16 },
  { time: "1 PM", today: 22, yesterday: 18 },
  { time: "2 PM", today: 18, yesterday: 15 },
  { time: "3 PM", today: 14, yesterday: 13 },
  { time: "4 PM", today: 13, yesterday: 12 },
  { time: "5 PM", today: 15, yesterday: 14 },
  { time: "6 PM", today: 18, yesterday: 15 },
  { time: "7 PM", today: 21, yesterday: 17 },
  { time: "8 PM", today: 16, yesterday: 14 },
];

export const prepTrend7Days = [
  { time: "Mon", today: 14, yesterday: 13 },
  { time: "Tue", today: 15, yesterday: 14 },
  { time: "Wed", today: 13, yesterday: 14 },
  { time: "Thu", today: 17, yesterday: 15 },
  { time: "Fri", today: 19, yesterday: 16 },
  { time: "Sat", today: 21, yesterday: 18 },
  { time: "Sun", today: 16, yesterday: 14 },
];

export const prepTrendWeekly = [
  { time: "Wk 1", today: 15, yesterday: 14 },
  { time: "Wk 2", today: 16, yesterday: 15 },
  { time: "Wk 3", today: 14, yesterday: 15 },
  { time: "Wk 4", today: 16, yesterday: 14 },
];

export const prepTrendMonthly = [
  { time: "Jan", today: 15, yesterday: 16 },
  { time: "Feb", today: 14, yesterday: 15 },
  { time: "Mar", today: 16, yesterday: 15 },
  { time: "Apr", today: 15, yesterday: 14 },
  { time: "May", today: 17, yesterday: 15 },
  { time: "Jun", today: 16, yesterday: 14 },
];

export const delayedItems = [
  { rank: 1, name: "Chicken Biryani", avgPrepTime: 24, delays: 12 },
  { rank: 2, name: "Paneer Butter Masala", avgPrepTime: 21, delays: 8 },
  { rank: 3, name: "Butter Chicken Masala", avgPrepTime: 20, delays: 6 },
  { rank: 4, name: "Dum Biryani", avgPrepTime: 28, delays: 5 },
  { rank: 5, name: "Fish Curry", avgPrepTime: 18, delays: 3 },
];

export const operationalInsights = [
  "Kitchen preparation time increased by 2 minutes compared to yesterday — peak hour load is higher.",
  "Chicken Biryani has the highest average preparation time today at 24 minutes.",
  "Dinner rush has started with 18 active KOTs currently in progress.",
  "Only 1.6% of today's 182 orders are delayed — within acceptable limits.",
  "Kitchen is operating within target preparation time for 97% of orders.",
];
