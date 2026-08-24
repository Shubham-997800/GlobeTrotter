import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { ApiError, asyncHandler } from "../lib/api-error.js";
import { getSupabaseAdmin } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

export const adminRouter = Router();

// All admin routes require authentication + admin role
adminRouter.use(requireAuth, requireAdmin);

/* ── Helpers ──────────────────────────────────────────────────── */

function parseQuery<T extends z.ZodTypeAny>(schema: T, query: unknown): z.infer<T> {
  const result = schema.safeParse(query);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "INVALID_REQUEST",
      issue ? `${issue.path.join(".") || "query"}: ${issue.message}` : "Invalid query parameters.",
    );
  }
  return result.data;
}

function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: (row.name as string) ?? "",
    email: (row.auth_email as string) ?? "",
    role: (row.role as string) ?? "user",
    avatarUrl: row.avatar_url ?? null,
    phone: row.phone ?? null,
    city: row.city ?? null,
    country: row.country ?? null,
    createdAt: row.created_at as string,
  };
}

function mapTrip(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description ?? null,
    coverImage: row.cover_image ?? null,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    destinationId: row.destination_id as string,
    budgetTier: row.budget_tier as string,
    status: row.status as string,
    createdAt: row.created_at as string,
    archivedAt: row.archived_at ?? null,
  };
}

function mapDestination(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    city: row.city as string,
    country: row.country as string,
    description: (row.description as string) ?? "",
    image: (row.image as string) ?? "",
    imageAlt: (row.image_alt as string) ?? "",
    rating: (row.rating as number) ?? 0,
    reviews: (row.reviews as number) ?? 0,
    estimatedDailyCostInr: (row.estimated_daily_cost_inr as number) ?? 0,
    tags: (row.tags as string[]) ?? [],
  };
}

function mapActivity(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    name: row.name as string,
    city: row.city as string,
    country: row.country as string,
    category: row.category as string,
    durationHours: (row.duration_hours as number) ?? 0,
    costInr: (row.cost_inr as number) ?? 0,
    description: (row.description as string) ?? "",
    image: (row.image as string) ?? "",
    imageAlt: (row.image_alt as string) ?? "",
  };
}

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD STATS
   ══════════════════════════════════════════════════════════════════ */

adminRouter.get(
  "/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    const admin = getSupabaseAdmin();

    const [
      usersResult,
      tripsResult,
      destinationsResult,
      activitiesResult,
    ] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("trips").select("id", { count: "exact", head: true }),
      admin.from("destinations").select("id", { count: "exact", head: true }),
      admin.from("activities").select("id", { count: "exact", head: true }),
    ]);

    // Recent trips for activity feed
    const { data: recentTrips } = await admin
      .from("trips")
      .select("id, name, user_id, destination_id, created_at, status")
      .order("created_at", { ascending: false })
      .limit(10);

    // Recent profiles
    const { data: recentUsers } = await admin
      .from("profiles")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Trip creation trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: tripTrends } = await admin
      .from("trips")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true });

    // Popular destinations
    const { data: popularDests } = await admin
      .from("trips")
      .select("destination_id")
      .not("destination_id", "is", null);

    const destCounts: Record<string, number> = {};
    (popularDests ?? []).forEach((row) => {
      const d = row.destination_id as string;
      destCounts[d] = (destCounts[d] ?? 0) + 1;
    });
    const popularDestinations = Object.entries(destCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([dest, count]) => ({ destination: dest, count }));

    // User roles breakdown
    const { data: allProfiles } = await admin
      .from("profiles")
      .select("role");

    const roleCounts: Record<string, number> = {};
    (allProfiles ?? []).forEach((row) => {
      const r = (row.role as string) ?? "user";
      roleCounts[r] = (roleCounts[r] ?? 0) + 1;
    });

    // Build trip trends by day
    const trendsByDay: Record<string, number> = {};
    (tripTrends ?? []).forEach((row) => {
      const day = (row.created_at as string).slice(0, 10);
      trendsByDay[day] = (trendsByDay[day] ?? 0) + 1;
    });
    const tripCreationTrends = Object.entries(trendsByDay).map(([date, count]) => ({ date, count }));

    // Activity feed combining recent trips + user registrations
    const activityFeed: Array<{
      type: string;
      title: string;
      description: string;
      timestamp: string;
    }> = [];

    (recentTrips ?? []).forEach((trip) => {
      activityFeed.push({
        type: "trip_created",
        title: `Trip "${trip.name}" created`,
        description: `Destination: ${trip.destination_id}`,
        timestamp: trip.created_at as string,
      });
    });

    (recentUsers ?? []).forEach((user) => {
      activityFeed.push({
        type: "user_registered",
        title: `New user: ${(user.name as string) ?? "Unknown"}`,
        description: "Account registered",
        timestamp: user.created_at as string,
      });
    });

    activityFeed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    res.json({
      stats: {
        totalUsers: usersResult.count ?? 0,
        totalTrips: tripsResult.count ?? 0,
        totalDestinations: destinationsResult.count ?? 0,
        totalActivities: activitiesResult.count ?? 0,
        roleBreakdown: roleCounts,
      },
      tripCreationTrends,
      popularDestinations,
      activityFeed: activityFeed.slice(0, 20),
    });
  }),
);

/* ══════════════════════════════════════════════════════════════════
   USER MANAGEMENT
   ══════════════════════════════════════════════════════════════════ */

const userListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.enum(["user", "admin", "all"]).default("all"),
  sort: z.enum(["name", "created_at", "role"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

adminRouter.get(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    const params = parseQuery(userListSchema, req.query);
    const admin = getSupabaseAdmin();

    let query = admin.from("profiles").select("*", { count: "exact" });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,city.ilike.%${params.search}%`);
    }
    if (params.role !== "all") {
      query = query.eq("role", params.role);
    }

    query = query.order(params.sort, { ascending: params.order === "asc" });

    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, count, error } = await query;
    if (error) throw new ApiError("SERVER_ERROR", error.message);

    // Fetch auth emails for these users
    const userIds = (data ?? []).map((r) => r.id);
    let emailMap: Record<string, string> = {};
    if (userIds.length > 0) {
      // We need to use the admin client to list users and get their emails
      // Supabase admin auth API doesn't support bulk email lookup, so we
      // store a best-effort approach: try the RPC function if available
      try {
        for (const uid of userIds) {
          const { data: emailData } = await admin.rpc("get_auth_email", { profile_id: uid });
          if (typeof emailData === "string") {
            emailMap[uid] = emailData;
          }
        }
      } catch {
        // RPC might not exist — graceful fallback
      }
    }

    const users = (data ?? []).map((row) => ({
      ...mapProfile({ ...row, auth_email: emailMap[row.id] ?? "" }),
    }));

    res.json({
      users,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / params.limit),
      },
    });
  }),
);

adminRouter.get(
  "/users/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new ApiError("SERVER_ERROR", error.message);
    if (!data) throw new ApiError("NOT_FOUND", "User not found.");

    let email = "";
    try {
      const { data: emailData } = await admin.rpc("get_auth_email", { profile_id: userId });
      if (typeof emailData === "string") email = emailData;
    } catch {
      // graceful
    }

    // Get user's trip count
    const { count: tripCount } = await admin
      .from("trips")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    res.json({
      user: { ...mapProfile({ ...data, auth_email: email }), tripCount: tripCount ?? 0 },
    });
  }),
);

const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

adminRouter.patch(
  "/users/:userId/role",
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const payload = updateUserRoleSchema.parse(req.body);
    const admin = getSupabaseAdmin();

    // Prevent self-demotion
    if (userId === req.userId) {
      throw new ApiError("INVALID_REQUEST", "You cannot change your own admin role.");
    }

    const { data, error } = await admin
      .from("profiles")
      .update({ role: payload.role })
      .eq("id", userId)
      .select("id, role")
      .maybeSingle();

    if (error) throw new ApiError("SERVER_ERROR", error.message);
    if (!data) throw new ApiError("NOT_FOUND", "User not found.");

    res.json({ user: { id: data.id, role: data.role } });
  }),
);

/* ══════════════════════════════════════════════════════════════════
   TRIP MANAGEMENT
   ══════════════════════════════════════════════════════════════════ */

const tripListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  status: z.enum(["draft", "planned", "all"]).default("all"),
  sort: z.enum(["name", "created_at", "start_date"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

adminRouter.get(
  "/trips",
  asyncHandler(async (req: Request, res: Response) => {
    const params = parseQuery(tripListSchema, req.query);
    const admin = getSupabaseAdmin();

    let query = admin.from("trips").select("*", { count: "exact" });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,destination_id.ilike.%${params.search}%`);
    }
    if (params.status !== "all") {
      query = query.eq("status", params.status);
    }

    query = query.order(params.sort, { ascending: params.order === "asc" });

    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, count, error } = await query;
    if (error) throw new ApiError("SERVER_ERROR", error.message);

    // Fetch owner names
    const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
    let nameMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, name")
        .in("id", userIds);
      (profiles ?? []).forEach((p) => {
        nameMap[p.id] = (p.name as string) ?? "Unknown";
      });
    }

    const trips = (data ?? []).map((row) => ({
      ...mapTrip(row),
      ownerName: nameMap[row.user_id] ?? "Unknown",
    }));

    res.json({
      trips,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / params.limit),
      },
    });
  }),
);

adminRouter.get(
  "/trips/:tripId",
  asyncHandler(async (req: Request, res: Response) => {
    const { tripId } = req.params;
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .maybeSingle();

    if (error) throw new ApiError("SERVER_ERROR", error.message);
    if (!data) throw new ApiError("NOT_FOUND", "Trip not found.");

    // Get owner name
    const { data: profile } = await admin
      .from("profiles")
      .select("name")
      .eq("id", data.user_id)
      .maybeSingle();

    // Get itinerary
    const { data: itinerary } = await admin
      .from("trip_itineraries")
      .select("document")
      .eq("trip_id", tripId)
      .maybeSingle();

    res.json({
      trip: {
        ...mapTrip(data),
        ownerName: (profile?.name as string) ?? "Unknown",
        itinerary: itinerary?.document ?? null,
      },
    });
  }),
);

/* ══════════════════════════════════════════════════════════════════
   DESTINATION MANAGEMENT
   ══════════════════════════════════════════════════════════════════ */

const destListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  sort: z.enum(["city", "country", "rating", "reviews"]).default("city"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

adminRouter.get(
  "/destinations",
  asyncHandler(async (req: Request, res: Response) => {
    const params = parseQuery(destListSchema, req.query);
    const admin = getSupabaseAdmin();

    let query = admin.from("destinations").select("*", { count: "exact" });

    if (params.search) {
      query = query.or(`city.ilike.%${params.search}%,country.ilike.%${params.search}%`);
    }

    query = query.order(params.sort, { ascending: params.order === "asc" });

    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, count, error } = await query;
    if (error) throw new ApiError("SERVER_ERROR", error.message);

    const destinations = (data ?? []).map(mapDestination);

    res.json({
      destinations,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / params.limit),
      },
    });
  }),
);

const createDestSchema = z.object({
  id: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).default(""),
  image: z.string().trim().url().max(2048).default(""),
  imageAlt: z.string().trim().max(500).default(""),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().int().min(0).default(0),
  estimatedDailyCostInr: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
});

adminRouter.post(
  "/destinations",
  asyncHandler(async (req: Request, res: Response) => {
    const payload = createDestSchema.parse(req.body);
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("destinations")
      .insert({
        id: payload.id,
        city: payload.city,
        country: payload.country,
        description: payload.description,
        image: payload.image,
        image_alt: payload.imageAlt,
        rating: payload.rating,
        reviews: payload.reviews,
        estimated_daily_cost_inr: payload.estimatedDailyCostInr,
        tags: payload.tags,
      })
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError("EMAIL_TAKEN", "A destination with this ID already exists.", 409);
      }
      throw new ApiError("SERVER_ERROR", error.message);
    }

    res.status(201).json({ destination: mapDestination(data!) });
  }),
);

const updateDestSchema = createDestSchema.partial();

adminRouter.patch(
  "/destinations/:destId",
  asyncHandler(async (req: Request, res: Response) => {
    const { destId } = req.params;
    const payload = updateDestSchema.parse(req.body);
    const admin = getSupabaseAdmin();

    const updateData: Record<string, unknown> = {};
    if (payload.city !== undefined) updateData.city = payload.city;
    if (payload.country !== undefined) updateData.country = payload.country;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.imageAlt !== undefined) updateData.image_alt = payload.imageAlt;
    if (payload.rating !== undefined) updateData.rating = payload.rating;
    if (payload.reviews !== undefined) updateData.reviews = payload.reviews;
    if (payload.estimatedDailyCostInr !== undefined) updateData.estimated_daily_cost_inr = payload.estimatedDailyCostInr;
    if (payload.tags !== undefined) updateData.tags = payload.tags;

    if (Object.keys(updateData).length === 0) {
      throw new ApiError("INVALID_REQUEST", "No fields to update.");
    }

    const { data, error } = await admin
      .from("destinations")
      .update(updateData)
      .eq("id", destId)
      .select()
      .maybeSingle();

    if (error) throw new ApiError("SERVER_ERROR", error.message);
    if (!data) throw new ApiError("NOT_FOUND", "Destination not found.");

    res.json({ destination: mapDestination(data) });
  }),
);

adminRouter.delete(
  "/destinations/:destId",
  asyncHandler(async (req: Request, res: Response) => {
    const { destId } = req.params;
    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from("destinations")
      .delete()
      .eq("id", destId);

    if (error) throw new ApiError("SERVER_ERROR", error.message);

    res.status(204).send();
  }),
);

/* ══════════════════════════════════════════════════════════════════
   ACTIVITY MANAGEMENT
   ══════════════════════════════════════════════════════════════════ */

const activityListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sort: z.enum(["name", "city", "cost_inr", "duration_hours"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

adminRouter.get(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const params = parseQuery(activityListSchema, req.query);
    const admin = getSupabaseAdmin();

    let query = admin.from("activities").select("*", { count: "exact" });

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,city.ilike.%${params.search}%`);
    }
    if (params.category) {
      query = query.eq("category", params.category);
    }

    query = query.order(params.sort, { ascending: params.order === "asc" });

    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, count, error } = await query;
    if (error) throw new ApiError("SERVER_ERROR", error.message);

    const activities = (data ?? []).map(mapActivity);

    res.json({
      activities,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / params.limit),
      },
    });
  }),
);

const createActivitySchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  durationHours: z.number().min(0).max(100).default(1),
  costInr: z.number().min(0).default(0),
  description: z.string().trim().max(2000).default(""),
  image: z.string().trim().url().max(2048).default(""),
  imageAlt: z.string().trim().max(500).default(""),
});

adminRouter.post(
  "/activities",
  asyncHandler(async (req: Request, res: Response) => {
    const payload = createActivitySchema.parse(req.body);
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("activities")
      .insert({
        id: payload.id,
        name: payload.name,
        city: payload.city,
        country: payload.country,
        category: payload.category,
        duration_hours: payload.durationHours,
        cost_inr: payload.costInr,
        description: payload.description,
        image: payload.image,
        image_alt: payload.imageAlt,
      })
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError("EMAIL_TAKEN", "An activity with this ID already exists.", 409);
      }
      throw new ApiError("SERVER_ERROR", error.message);
    }

    res.status(201).json({ activity: mapActivity(data!) });
  }),
);

const updateActivitySchema = createActivitySchema.partial();

adminRouter.patch(
  "/activities/:activityId",
  asyncHandler(async (req: Request, res: Response) => {
    const { activityId } = req.params;
    const payload = updateActivitySchema.parse(req.body);
    const admin = getSupabaseAdmin();

    const updateData: Record<string, unknown> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.city !== undefined) updateData.city = payload.city;
    if (payload.country !== undefined) updateData.country = payload.country;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.durationHours !== undefined) updateData.duration_hours = payload.durationHours;
    if (payload.costInr !== undefined) updateData.cost_inr = payload.costInr;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.imageAlt !== undefined) updateData.image_alt = payload.imageAlt;

    if (Object.keys(updateData).length === 0) {
      throw new ApiError("INVALID_REQUEST", "No fields to update.");
    }

    const { data, error } = await admin
      .from("activities")
      .update(updateData)
      .eq("id", activityId)
      .select()
      .maybeSingle();

    if (error) throw new ApiError("SERVER_ERROR", error.message);
    if (!data) throw new ApiError("NOT_FOUND", "Activity not found.");

    res.json({ activity: mapActivity(data) });
  }),
);

adminRouter.delete(
  "/activities/:activityId",
  asyncHandler(async (req: Request, res: Response) => {
    const { activityId } = req.params;
    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from("activities")
      .delete()
      .eq("id", activityId);

    if (error) throw new ApiError("SERVER_ERROR", error.message);

    res.status(204).send();
  }),
);

/* ══════════════════════════════════════════════════════════════════
   ANALYTICS
   ══════════════════════════════════════════════════════════════════ */

adminRouter.get(
  "/analytics",
  asyncHandler(async (_req: Request, res: Response) => {
    const admin = getSupabaseAdmin();

    // Trips by budget tier
    const { data: allTrips } = await admin
      .from("trips")
      .select("budget_tier, status, created_at, start_date, end_date");

    const budgetBreakdown: Record<string, number> = {};
    const statusBreakdown: Record<string, number> = {};
    (allTrips ?? []).forEach((trip) => {
      const tier = (trip.budget_tier as string) ?? "unknown";
      budgetBreakdown[tier] = (budgetBreakdown[tier] ?? 0) + 1;
      const status = (trip.status as string) ?? "unknown";
      statusBreakdown[status] = (statusBreakdown[status] ?? 0) + 1;
    });

    // User growth over time (by month)
    const { data: allUsers } = await admin
      .from("profiles")
      .select("created_at");

    const usersByMonth: Record<string, number> = {};
    (allUsers ?? []).forEach((u) => {
      const month = (u.created_at as string).slice(0, 7);
      usersByMonth[month] = (usersByMonth[month] ?? 0) + 1;
    });
    const userGrowth = Object.entries(usersByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Trips by month
    const tripsByMonth: Record<string, number> = {};
    (allTrips ?? []).forEach((t) => {
      const month = (t.created_at as string).slice(0, 7);
      tripsByMonth[month] = (tripsByMonth[month] ?? 0) + 1;
    });
    const tripsOverTime = Object.entries(tripsByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Average trip duration
    let totalDuration = 0;
    let tripDurationCount = 0;
    (allTrips ?? []).forEach((t) => {
      if (t.start_date && t.end_date) {
        const start = new Date(t.start_date as string).getTime();
        const end = new Date(t.end_date as string).getTime();
        const days = Math.ceil((end - start) / 86400000) + 1;
        if (days > 0 && days < 365) {
          totalDuration += days;
          tripDurationCount++;
        }
      }
    });
    const avgTripDuration = tripDurationCount > 0
      ? Math.round(totalDuration / tripDurationCount)
      : 0;

    // Budget distribution for chart
    const budgetDistribution = Object.entries(budgetBreakdown).map(([tier, count]) => ({
      tier,
      count,
    }));

    res.json({
      userGrowth,
      tripsOverTime,
      budgetDistribution,
      statusBreakdown,
      avgTripDuration,
      totalTrips: (allTrips ?? []).length,
      totalUsers: (allUsers ?? []).length,
    });
  }),
);
