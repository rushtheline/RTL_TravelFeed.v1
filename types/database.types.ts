export type UserRole = "regular" | "frequent_flyer" | "staff";
export type UserBadge = "road_warrior" | "frequent_flyer" | "elite_traveler";
export type PostCategory =
  | "helpful_tip"
  | "wait_time"
  | "food"
  | "gate_change"
  | "tsa_update"
  | "parking"
  | "general";

export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  created_at: string;
}

export interface Terminal {
  id: string;
  airport_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Gate {
  id: string;
  terminal_id: string;
  gate_number: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  badge: UserBadge | null;
  xp: number;
  level: number;
  current_airport_id: string | null;
  current_terminal_id: string | null;
  bio: string | null;
  flight_number: string | null;
  flight_iata: string | null;
  departure_airport: string | null;
  arrival_airport: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  airline_name: string | null;
  flight_status: string | null;
  dep_gate: string | null;
  arr_gate: string | null;
  dep_terminal: string | null;
  arr_terminal: string | null;
  flight_duration: number | null;
  dep_delayed: number | null;
  arr_delayed: number | null;
  codeshare_airline: string | null;
  codeshare_flight: string | null;
  has_seen_flight_modal: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  airport_id: string;
  terminal_id: string | null;
  gate_id: string | null;
  category: PostCategory;
  content: string;
  media_url: string | null;
  media_type: string | null;
  location_text: string | null;
  xp_reward: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostWithDetails extends Post {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  user_role: UserRole;
  user_badge: UserBadge | null;
  like_count: number;
  comment_count: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  requirement_type: string;
  requirement_count: number;
  active: boolean;
  created_at: string;
}

export interface UserMission {
  id: string;
  user_id: string;
  mission_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}
