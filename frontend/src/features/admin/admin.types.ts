export type AdminUserRole = "user" | "admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  avatarUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt: string;
  tripCount?: number;
}

export interface AdminTrip {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  startDate: string;
  endDate: string;
  destinationId: string;
  budgetTier: string;
  status: string;
  createdAt: string;
  archivedAt?: string | null;
  ownerName?: string;
}

export interface AdminDestination {
  id: string;
  city: string;
  country: string;
  description: string;
  image: string;
  imageAlt: string;
  rating: number;
  reviews: number;
  estimatedDailyCostInr: number;
  tags: string[];
}

export interface AdminActivity {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  durationHours: number;
  costInr: number;
  description: string;
  image: string;
  imageAlt: string;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalDestinations: number;
  totalActivities: number;
  roleBreakdown: Record<string, number>;
}

export interface TripTrend {
  date: string;
  count: number;
}

export interface PopularDestination {
  destination: string;
  count: number;
}

export interface ActivityFeedItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardData {
  stats: AdminStats;
  tripCreationTrends: TripTrend[];
  popularDestinations: PopularDestination[];
  activityFeed: ActivityFeedItem[];
}

export interface AdminAnalyticsData {
  userGrowth: Array<{ month: string; count: number }>;
  tripsOverTime: Array<{ month: string; count: number }>;
  budgetDistribution: Array<{ tier: string; count: number }>;
  statusBreakdown: Record<string, number>;
  avgTripDuration: number;
  totalTrips: number;
  totalUsers: number;
}
