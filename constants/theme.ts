export const colors = {
  primary: "#A61470",
  secondary: "#C1433F",
  gradient: ["#A61470", "#C1433F"] as const,
  background: "#272830",
  card: "#1F2029",
  surface: "#2A2B35",
  input: "#1E1F29",
  overlay: "#1E1F29",
  text: {
    primary: "#FFFFFF",
    secondary: "#D1D5DB",
    tertiary: "#9CA3AF",
    muted: "#6B7280",
  },
  border: "#374151",
  borderSecondary: "#4B5563",
  focusRing: "#A61470",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",
  xp: "#FFD700", // Gold for XP
  categories: {
    helpful_tip: "#E91E63",
    wait_time: "#9C27B0",
    food: "#FF9800",
    gate_change: "#FF5722",
    tsa_update: "#E91E63",
    parking: "#795548",
    general: "#607D8B",
  },
  badges: {
    road_warrior: "#FFD700",
    frequent_flyer: "#FF6B9D",
    elite_traveler: "#9C27B0",
  },
};

export const spacing = {
  mdm: -12,
  smm: -6,
  xsm: -3,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
  xxxxxl: 96,
};

export const borderRadius = {
  xs: 6,
  sm: 8,
  base: 10,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const typography = {
  fontFamily: "'Poppins', sans-serif",
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
