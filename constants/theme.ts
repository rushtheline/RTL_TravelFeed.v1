export const colors = {
  primary: "#a61470", // Pink/Magenta for buttons and accents
  secondary: "#C1433F",
  background: "#272830", // Dark navy background
  surface: "#252540", // Slightly lighter surface
  card: "#1F2029",
  text: {
    primary: "#FFFFFF",
    secondary: "#B0B0C8",
    muted: "#7A7A95",
  },
  border: "#3A3A55",
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
  mdm: -16,
  smm: -8,
  xsm: -4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  xxxxl: 80,
  xxxxxl: 96,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
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
