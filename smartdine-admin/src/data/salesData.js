export const salesKpis = {
  today: { value: 42850, change: 12, positive: true },
  yesterday: { value: 38240, change: 5, positive: true },
  weekly: { value: 264500, change: 9, positive: true },
  monthly: { value: 1082300, change: 7, positive: true },
};

export const salesComparison = [
  { label: "Today vs Yesterday", diff: 4610, pct: 12, positive: true },
  { label: "This Week vs Last Week", diff: 21800, pct: 9, positive: true },
  { label: "This Month vs Last Month", diff: -18400, pct: -1.7, positive: false },
];

export const revenueDistribution = [
  { name: "Dine-In", value: 145000, pct: 52, color: "#0B6B50" },
  { name: "Takeaway", value: 62000, pct: 22, color: "#F59E0B" },
  { name: "Online", value: 72000, pct: 26, color: "#3B82F6" },
];

export const salesTrendDaily = [
  { name: "Mon", sales: 36200 },
  { name: "Tue", sales: 38700 },
  { name: "Wed", sales: 34900 },
  { name: "Thu", sales: 41200 },
  { name: "Fri", sales: 47800 },
  { name: "Sat", sales: 52300 },
  { name: "Sun", sales: 42850 },
];

export const salesTrendWeekly = [
  { name: "Wk 1", sales: 228000 },
  { name: "Wk 2", sales: 242700 },
  { name: "Wk 3", sales: 258100 },
  { name: "Wk 4", sales: 264500 },
];

export const salesTrendMonthly = [
  { name: "Jan", sales: 920000 },
  { name: "Feb", sales: 875000 },
  { name: "Mar", sales: 980000 },
  { name: "Apr", sales: 1020000 },
  { name: "May", sales: 1064000 },
  { name: "Jun", sales: 1082300 },
];

export const peakHours = [
  { slot: "8 AM – 10 AM", label: "Breakfast Rush", orders: 62, pct: 34 },
  { slot: "12 PM – 2 PM", label: "Highest Lunch Rush", orders: 145, pct: 80 },
  { slot: "4 PM – 6 PM", label: "Evening Snacks", orders: 78, pct: 43 },
  { slot: "7 PM – 9 PM", label: "Highest Dinner Rush", orders: 182, pct: 100 },
  { slot: "9 PM – 11 PM", label: "Late Dinner", orders: 54, pct: 30 },
];

export const paymentMethods = [
  { method: "UPI", amount: 21840, pct: 51, color: "#0B6B50" },
  { method: "Cash", amount: 13710, pct: 32, color: "#F59E0B" },
  { method: "Card", amount: 7300, pct: 17, color: "#3B82F6" },
];

export const salesInsights = [
  "Sales increased by 12% compared to yesterday, driven by higher dinner covers.",
  "Dinner hours (7–9 PM) generated 48% of today's total revenue.",
  "Dine-In contributed the highest revenue channel at 52% of total sales.",
  "UPI is the most preferred payment method, used in 51% of transactions.",
  "Weekend sales are outperforming weekday averages by 28%.",
];
