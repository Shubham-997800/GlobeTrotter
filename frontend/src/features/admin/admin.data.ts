import type {
  AdminDashboardData,
  AdminUser,
  AdminTrip,
  AdminDestination,
  AdminActivity,
  AdminPagination,
  AdminAnalyticsData,
  PopularDestination,
  TripTrend,
  ActivityFeedItem,
} from "./admin.types";

const ADMIN_USERS_KEY = "globetrotter.mock.admin.users";
const ADMIN_DESTINATIONS_KEY = "globetrotter.mock.admin.destinations";
const ADMIN_ACTIVITIES_KEY = "globetrotter.mock.admin.activities";
const ADMIN_TRIPS_KEY = "globetrotter.mock.admin.trips";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

function seedIfEmpty() {
  if (!localStorage.getItem(ADMIN_USERS_KEY)) {
    const users: AdminUser[] = [
      { id: "usr_001", name: "Aarav Sharma", email: "aarav@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43210", city: "Mumbai", country: "India", createdAt: "2024-01-15T10:30:00Z", tripCount: 3 },
      { id: "usr_002", name: "Priya Patel", email: "priya.patel@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43211", city: "Delhi", country: "India", createdAt: "2024-02-20T14:15:00Z", tripCount: 5 },
      { id: "usr_003", name: "Rohan Mehta", email: "rohan.mehta@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43212", city: "Bangalore", country: "India", createdAt: "2024-03-10T09:45:00Z", tripCount: 2 },
      { id: "usr_004", name: "Sneha Reddy", email: "sneha.reddy@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43213", city: "Hyderabad", country: "India", createdAt: "2024-04-05T16:20:00Z", tripCount: 4 },
      { id: "usr_005", name: "Vikram Singh", email: "vikram.singh@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43214", city: "Chennai", country: "India", createdAt: "2024-05-12T11:00:00Z", tripCount: 1 },
      { id: "usr_006", name: "Anjali Gupta", email: "anjali.gupta@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43215", city: "Pune", country: "India", createdAt: "2024-06-18T08:30:00Z", tripCount: 6 },
      { id: "usr_007", name: "Karan Malhotra", email: "karan.malhotra@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43216", city: "Kolkata", country: "India", createdAt: "2024-07-22T13:45:00Z", tripCount: 2 },
      { id: "usr_008", name: "Nisha Agarwal", email: "nisha.agarwal@example.com", role: "admin", avatarUrl: null, phone: "+91 98765 43217", city: "Jaipur", country: "India", createdAt: "2024-08-01T10:00:00Z", tripCount: 0 },
      { id: "usr_009", name: "Rahul Verma", email: "rahul.verma@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43218", city: "Ahmedabad", country: "India", createdAt: "2024-08-15T09:15:00Z", tripCount: 3 },
      { id: "usr_010", name: "Pooja Joshi", email: "pooja.joshi@example.com", role: "user", avatarUrl: null, phone: "+91 98765 43219", city: "Surat", country: "India", createdAt: "2024-09-01T12:00:00Z", tripCount: 1 },
    ];
    writeJson(ADMIN_USERS_KEY, users);
  }

  if (!localStorage.getItem(ADMIN_DESTINATIONS_KEY)) {
    const destinations: AdminDestination[] = [
      { id: "dest_001", city: "Goa", country: "India", description: "Sunny beaches, vibrant nightlife, and Portuguese heritage.", image: "https://images.unsplash.com/photo-1512343879784-a960ba4d646e?w=800", imageAlt: "Goa beach at sunset", rating: 4.7, reviews: 1240, estimatedDailyCostInr: 3500, tags: ["beach", "nightlife", "heritage"] },
      { id: "dest_002", city: "Manali", country: "India", description: "Hill station with snow-capped peaks and adventure sports.", image: "https://images.unsplash.com/photo-1582184215584-bf4b2a0521e4?w=800", imageAlt: "Manali mountains", rating: 4.6, reviews: 980, estimatedDailyCostInr: 2800, tags: ["mountains", "adventure", "nature"] },
      { id: "dest_003", city: "Jaipur", country: "India", description: "Pink City with palaces, forts, and rich Rajasthani culture.", image: "https://images.unsplash.com/photo-1599661046827-dacde4a9b8e8?w=800", imageAlt: "Jaipur Hawa Mahal", rating: 4.5, reviews: 1100, estimatedDailyCostInr: 2500, tags: ["heritage", "culture", "palaces"] },
      { id: "dest_004", city: "Kerala Backwaters", country: "India", description: "Serene backwaters, houseboats, and Ayurvedic wellness.", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", imageAlt: "Kerala backwaters houseboat", rating: 4.8, reviews: 890, estimatedDailyCostInr: 4200, tags: ["backwaters", "wellness", "nature"] },
      { id: "dest_005", city: "Ladakh", country: "India", description: "High-altitude desert with monasteries and stunning landscapes.", image: "https://images.unsplash.com/photo-1617918695525-9a93a1b3a9f5?w=800", imageAlt: "Ladakh Pangong Lake", rating: 4.9, reviews: 760, estimatedDailyCostInr: 5500, tags: ["mountains", "monasteries", "adventure"] },
      { id: "dest_006", city: "Andaman Islands", country: "India", description: "Pristine beaches, coral reefs, and marine life.", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800", imageAlt: "Andaman Islands beach", rating: 4.8, reviews: 650, estimatedDailyCostInr: 6000, tags: ["beach", "diving", "marine-life"] },
      { id: "dest_007", city: "Rishikesh", country: "India", description: "Yoga capital with Ganges river and adventure activities.", image: "https://images.unsplash.com/photo-1590210716848-3e3f8c81b4b5?w=800", imageAlt: "Rishikesh Ganges", rating: 4.6, reviews: 820, estimatedDailyCostInr: 2200, tags: ["yoga", "adventure", "spiritual"] },
      { id: "dest_008", city: "Udaipur", country: "India", description: "City of lakes with palaces and romantic ambiance.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", imageAlt: "Udaipur Lake Palace", rating: 4.7, reviews: 950, estimatedDailyCostInr: 3000, tags: ["lakes", "palaces", "romantic"] },
    ];
    writeJson(ADMIN_DESTINATIONS_KEY, destinations);
  }

  if (!localStorage.getItem(ADMIN_ACTIVITIES_KEY)) {
    const activities: AdminActivity[] = [
      { id: "act_001", name: "Beach Sunset Cruise", city: "Goa", country: "India", category: "nature", durationHours: 2, costInr: 1500, description: "Evening cruise with live music and dinner", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", imageAlt: "Goa sunset cruise" },
      { id: "act_002", name: "Paragliding in Solang Valley", city: "Manali", country: "India", category: "adventure", durationHours: 3, costInr: 3500, description: "Tandem paragliding with mountain views", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800", imageAlt: "Manali paragliding" },
      { id: "act_003", name: "Amber Fort Guided Tour", city: "Jaipur", country: "India", category: "culture", durationHours: 4, costInr: 800, description: "Guided tour of Amber Fort with elephant ride", image: "https://images.unsplash.com/photo-1599661046827-dacde4a9b8e8?w=800", imageAlt: "Amber Fort Jaipur" },
      { id: "act_004", name: "Houseboat Overnight Stay", city: "Kerala Backwaters", country: "India", category: "relaxation", durationHours: 24, costInr: 8000, description: "Traditional houseboat with meals and Ayurvedic massage", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", imageAlt: "Kerala houseboat" },
      { id: "act_005", name: "Pangong Lake Day Trip", city: "Ladakh", country: "India", category: "nature", durationHours: 12, costInr: 4500, description: "Drive to Pangong Lake via Chang La pass", image: "https://images.unsplash.com/photo-1617918695525-9a93a1b3a9f5?w=800", imageAlt: "Pangong Lake Ladakh" },
      { id: "act_006", name: "Scuba Diving at Havelock", city: "Andaman Islands", country: "India", category: "adventure", durationHours: 4, costInr: 4500, description: "Certified scuba diving with coral reef exploration", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", imageAlt: "Andaman scuba diving" },
      { id: "act_007", name: "White Water Rafting", city: "Rishikesh", country: "India", category: "adventure", durationHours: 3, costInr: 1200, description: "Grade III-IV rapids on Ganges river", image: "https://images.unsplash.com/photo-1590210716848-3e3f8c81b4b5?w=800", imageAlt: "Rishikesh rafting" },
      { id: "act_008", name: "Lake Palace Dinner", city: "Udaipur", country: "India", category: "food", durationHours: 3, costInr: 3000, description: "Royal dinner at Lake Palace hotel", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", imageAlt: "Udaipur Lake Palace dinner" },
    ];
    writeJson(ADMIN_ACTIVITIES_KEY, activities);
  }

  if (!localStorage.getItem(ADMIN_TRIPS_KEY)) {
    const trips: AdminTrip[] = [
      { id: "trip_001", userId: "usr_001", name: "Goa Beach Vacation", description: "Relaxing beach holiday with friends", coverImage: "https://images.unsplash.com/photo-1512343879784-a960ba4d646e?w=800", startDate: "2024-12-20", endDate: "2024-12-27", destinationId: "dest_001", budgetTier: "moderate", status: "completed", createdAt: "2024-11-15T10:00:00Z", archivedAt: null, ownerName: "Aarav Sharma" },
      { id: "trip_002", userId: "usr_002", name: "Manali Adventure Trip", description: "Skiing and trekking in the Himalayas", coverImage: "https://images.unsplash.com/photo-1582184215584-bf4b2a0521e4?w=800", startDate: "2025-01-10", endDate: "2025-01-17", destinationId: "dest_002", budgetTier: "premium", status: "planned", createdAt: "2024-12-01T14:30:00Z", archivedAt: null, ownerName: "Priya Patel" },
      { id: "trip_003", userId: "usr_003", name: "Rajasthan Heritage Tour", description: "Exploring palaces and forts of Rajasthan", coverImage: "https://images.unsplash.com/photo-1599661046827-dacde4a9b8e8?w=800", startDate: "2025-02-05", endDate: "2025-02-12", destinationId: "dest_003", budgetTier: "moderate", status: "planned", createdAt: "2024-12-10T09:00:00Z", archivedAt: null, ownerName: "Rohan Mehta" },
      { id: "trip_004", userId: "usr_004", name: "Kerala Wellness Retreat", description: "Ayurveda and backwaters relaxation", coverImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", startDate: "2024-11-20", endDate: "2024-11-27", destinationId: "dest_004", budgetTier: "premium", status: "completed", createdAt: "2024-10-15T11:00:00Z", archivedAt: null, ownerName: "Sneha Reddy" },
      { id: "trip_005", userId: "usr_005", name: "Ladakh Road Trip", description: "Bike trip through high mountain passes", coverImage: "https://images.unsplash.com/photo-1617918695525-9a93a1b3a9f5?w=800", startDate: "2025-06-15", endDate: "2025-06-25", destinationId: "dest_005", budgetTier: "budget", status: "draft", createdAt: "2025-01-20T16:00:00Z", archivedAt: null, ownerName: "Vikram Singh" },
      { id: "trip_006", userId: "usr_006", name: "Andaman Island Hopping", description: "Exploring multiple islands in Andaman", coverImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800", startDate: "2025-03-10", endDate: "2025-03-18", destinationId: "dest_006", budgetTier: "premium", status: "planned", createdAt: "2025-01-25T10:30:00Z", archivedAt: null, ownerName: "Anjali Gupta" },
      { id: "trip_007", userId: "usr_007", name: "Rishikesh Yoga Retreat", description: "Week of yoga and meditation by Ganges", coverImage: "https://images.unsplash.com/photo-1590210716848-3e3f8c81b4b5?w=800", startDate: "2025-02-20", endDate: "2025-02-27", destinationId: "dest_007", budgetTier: "budget", status: "planned", createdAt: "2025-02-01T08:00:00Z", archivedAt: null, ownerName: "Karan Malhotra" },
      { id: "trip_008", userId: "usr_009", name: "Udaipur Royal Experience", description: "Palaces, lakes and Rajasthani cuisine", coverImage: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800", startDate: "2025-04-01", endDate: "2025-04-08", destinationId: "dest_008", budgetTier: "moderate", status: "draft", createdAt: "2025-02-15T12:00:00Z", archivedAt: null, ownerName: "Rahul Verma" },
    ];
    writeJson(ADMIN_TRIPS_KEY, trips);
  }
}

export function getAdminDashboard(): AdminDashboardData {
  seedIfEmpty();
  const users = readJson<AdminUser[]>(ADMIN_USERS_KEY, []);
  const trips = readJson<AdminTrip[]>(ADMIN_TRIPS_KEY, []);
  const destinations = readJson<AdminDestination[]>(ADMIN_DESTINATIONS_KEY, []);
  const activities = readJson<AdminActivity[]>(ADMIN_ACTIVITIES_KEY, []);

  const roleBreakdown: Record<string, number> = { user: 0, admin: 0 };
  users.forEach(u => roleBreakdown[u.role] = (roleBreakdown[u.role] ?? 0) + 1);

  const popularDestinations: PopularDestination[] = destinations
    .map(d => ({ destination: d.city, count: Math.floor(Math.random() * 200) + 50 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const tripCreationTrends: TripTrend[] = [
    { date: "2024-10", count: 12 },
    { date: "2024-11", count: 18 },
    { date: "2024-12", count: 25 },
    { date: "2025-01", count: 30 },
    { date: "2025-02", count: 28 },
    { date: "2025-03", count: 35 },
  ];

  const activityFeed: ActivityFeedItem[] = [
    { type: "user_created", title: "New user registered", description: "Pooja Joshi joined GlobeTrotter", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { type: "trip_created", title: "New trip created", description: "Udaipur Royal Experience by Rahul Verma", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { type: "destination_added", title: "Destination added", description: "Udaipur added by admin", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
    { type: "activity_added", title: "Activity added", description: "Lake Palace Dinner added", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
    { type: "user_promoted", title: "User promoted", description: "Nisha Agarwal promoted to admin", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ];

  return {
    stats: {
      totalUsers: users.length,
      totalTrips: trips.length,
      totalDestinations: destinations.length,
      totalActivities: activities.length,
      roleBreakdown,
    },
    tripCreationTrends,
    popularDestinations,
    activityFeed,
  };
}

export function getAdminUsers(params: Record<string, string | number>): { users: AdminUser[]; pagination: AdminPagination } {
  seedIfEmpty();
  let users = readJson<AdminUser[]>(ADMIN_USERS_KEY, []);
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const search = String(params.search ?? "").toLowerCase();
  const roleFilter = String(params.role ?? "all");

  if (search) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.city?.toLowerCase().includes(search)
    );
  }
  if (roleFilter !== "all") {
    users = users.filter(u => u.role === roleFilter);
  }

  const total = users.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = users.slice((page - 1) * limit, page * limit);

  return {
    users: paginated,
    pagination: { page, limit, total, totalPages },
  };
}

export function getAdminTrips(params: Record<string, string | number>): { trips: AdminTrip[]; pagination: AdminPagination } {
  seedIfEmpty();
  let trips = readJson<AdminTrip[]>(ADMIN_TRIPS_KEY, []);
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const search = String(params.search ?? "").toLowerCase();
  const statusFilter = String(params.status ?? "all");

  if (search) {
    trips = trips.filter(t =>
      t.name.toLowerCase().includes(search) ||
      t.ownerName?.toLowerCase().includes(search)
    );
  }
  if (statusFilter !== "all") {
    trips = trips.filter(t => t.status === statusFilter);
  }

  const total = trips.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = trips.slice((page - 1) * limit, page * limit);

  return {
    trips: paginated,
    pagination: { page, limit, total, totalPages },
  };
}

export function getAdminDestinations(params: Record<string, string | number>): { destinations: AdminDestination[]; pagination: AdminPagination } {
  seedIfEmpty();
  let destinations = readJson<AdminDestination[]>(ADMIN_DESTINATIONS_KEY, []);
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const search = String(params.search ?? "").toLowerCase();

  if (search) {
    destinations = destinations.filter(d =>
      d.city.toLowerCase().includes(search) ||
      d.country.toLowerCase().includes(search)
    );
  }

  const total = destinations.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = destinations.slice((page - 1) * limit, page * limit);

  return {
    destinations: paginated,
    pagination: { page, limit, total, totalPages },
  };
}

export function createDestination(payload: Record<string, unknown>): AdminDestination {
  seedIfEmpty();
  const destinations = readJson<AdminDestination[]>(ADMIN_DESTINATIONS_KEY, []);
  const newDest: AdminDestination = {
    id: `dest_${Date.now()}`,
    city: payload.city as string,
    country: payload.country as string,
    description: payload.description as string,
    image: payload.image as string,
    imageAlt: payload.imageAlt as string,
    rating: Number(payload.rating ?? 4.5),
    reviews: Number(payload.reviews ?? 0),
    estimatedDailyCostInr: Number(payload.estimatedDailyCostInr ?? 3000),
    tags: (payload.tags as string[]) ?? [],
  };
  destinations.push(newDest);
  writeJson(ADMIN_DESTINATIONS_KEY, destinations);
  return newDest;
}

export function updateDestination(destId: string, payload: Record<string, unknown>): AdminDestination {
  seedIfEmpty();
  const destinations = readJson<AdminDestination[]>(ADMIN_DESTINATIONS_KEY, []);
  const idx = destinations.findIndex(d => d.id === destId);
  if (idx === -1) throw new Error("Destination not found");
  destinations[idx] = { ...destinations[idx], ...payload, id: destId } as AdminDestination;
  writeJson(ADMIN_DESTINATIONS_KEY, destinations);
  return destinations[idx];
}

export function deleteDestination(destId: string): void {
  seedIfEmpty();
  let destinations = readJson<AdminDestination[]>(ADMIN_DESTINATIONS_KEY, []);
  destinations = destinations.filter(d => d.id !== destId);
  writeJson(ADMIN_DESTINATIONS_KEY, destinations);
}

export function getAdminActivities(params: Record<string, string | number>): { activities: AdminActivity[]; pagination: AdminPagination } {
  seedIfEmpty();
  let activities = readJson<AdminActivity[]>(ADMIN_ACTIVITIES_KEY, []);
  const page = Number(params.page ?? 1);
  const limit = Number(params.limit ?? 10);
  const search = String(params.search ?? "").toLowerCase();
  const categoryFilter = String(params.category ?? "all");

  if (search) {
    activities = activities.filter(a =>
      a.name.toLowerCase().includes(search) ||
      a.city.toLowerCase().includes(search)
    );
  }
  if (categoryFilter !== "all") {
    activities = activities.filter(a => a.category === categoryFilter);
  }

  const total = activities.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = activities.slice((page - 1) * limit, page * limit);

  return {
    activities: paginated,
    pagination: { page, limit, total, totalPages },
  };
}

export function createActivity(payload: Record<string, unknown>): AdminActivity {
  seedIfEmpty();
  const activities = readJson<AdminActivity[]>(ADMIN_ACTIVITIES_KEY, []);
  const newAct: AdminActivity = {
    id: `act_${Date.now()}`,
    name: payload.name as string,
    city: payload.city as string,
    country: payload.country as string,
    category: payload.category as string,
    durationHours: Number(payload.durationHours ?? 2),
    costInr: Number(payload.costInr ?? 2000),
    description: payload.description as string,
    image: payload.image as string,
    imageAlt: payload.imageAlt as string,
  };
  activities.push(newAct);
  writeJson(ADMIN_ACTIVITIES_KEY, activities);
  return newAct;
}

export function updateActivity(activityId: string, payload: Record<string, unknown>): AdminActivity {
  seedIfEmpty();
  const activities = readJson<AdminActivity[]>(ADMIN_ACTIVITIES_KEY, []);
  const idx = activities.findIndex(a => a.id === activityId);
  if (idx === -1) throw new Error("Activity not found");
  activities[idx] = { ...activities[idx], ...payload, id: activityId } as AdminActivity;
  writeJson(ADMIN_ACTIVITIES_KEY, activities);
  return activities[idx];
}

export function deleteActivity(activityId: string): void {
  seedIfEmpty();
  let activities = readJson<AdminActivity[]>(ADMIN_ACTIVITIES_KEY, []);
  activities = activities.filter(a => a.id !== activityId);
  writeJson(ADMIN_ACTIVITIES_KEY, activities);
}

export function getAdminAnalytics(): AdminAnalyticsData {
  seedIfEmpty();
  return {
    userGrowth: [
      { month: "2024-10", count: 85 },
      { month: "2024-11", count: 102 },
      { month: "2024-12", count: 135 },
      { month: "2025-01", count: 160 },
      { month: "2025-02", count: 185 },
      { month: "2025-03", count: 210 },
    ],
    tripsOverTime: [
      { month: "2024-10", count: 12 },
      { month: "2024-11", count: 18 },
      { month: "2024-12", count: 25 },
      { month: "2025-01", count: 30 },
      { month: "2025-02", count: 28 },
      { month: "2025-03", count: 35 },
    ],
    budgetDistribution: [
      { tier: "budget", count: 8 },
      { tier: "moderate", count: 15 },
      { tier: "premium", count: 7 },
    ],
    statusBreakdown: { planned: 18, ongoing: 5, completed: 12, draft: 4, archived: 2 },
    avgTripDuration: 7,
    totalTrips: 42,
    totalUsers: 10,
  };
}