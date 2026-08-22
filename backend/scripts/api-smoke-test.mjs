const BASE = "http://localhost:4000/api";
let pass = 0;
let fail = 0;

function check(name, cond, extra = "") {
  if (cond) {
    pass += 1;
    console.log(`PASS ${name}`);
  } else {
    fail += 1;
    console.log(`FAIL ${name} :: ${extra || "(no detail)"}`);
  }
}

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

const stamp = Date.now();
const email = `apitest_${stamp}@example.com`;
const password = "TestPass!234";
let token = null;
let userId = null;

// ── Auth ──────────────────────────────────────────────────────────
let r = await req("POST", "/auth/register", {
  firstName: "Api", lastName: "Tester", email, password, city: "Jaipur",
});
check("register returns session", r.status === 201 && r.json?.token?.length > 20, JSON.stringify(r.json));
token = r.json?.token;
userId = r.json?.user?.id;
check("register maps profile fields", r.json?.user?.name === "Api Tester" && r.json?.user?.city === "Jaipur");

r = await req("GET", "/auth/me", undefined, token);
check("me returns same user", r.status === 200 && r.json?.user?.id === userId);

r = await req("POST", "/auth/register", {
  firstName: "Dup", email, password,
});
check("duplicate register rejected EMAIL_TAKEN", r.status === 409 && r.json?.code === "EMAIL_TAKEN");

r = await req("POST", "/auth/login", { identifier: email, password, remember: true });
check("login by email", r.status === 200 && r.json?.token);

r = await req("POST", "/auth/login", { identifier: "Api Tester", password });
check("login by name identifier", r.status === 200 && r.json?.token, `${r.status} ${JSON.stringify(r.json)}`);

r = await req("POST", "/auth/login", { identifier: email, password: "wrong" });
check("bad password INVALID_CREDENTIALS", r.status === 401 && r.json?.code === "INVALID_CREDENTIALS");

// ── Trips CRUD ────────────────────────────────────────────────────
const draft = {
  name: "Goa Escape",
  description: "Beaches and sunsets",
  coverImage: "",
  startDate: "2026-10-01",
  endDate: "2026-10-05",
  destinationId: "goa",
  interests: ["beaches", "food"],
  budgetTier: "moderate",
  currency: "INR",
  budgetAmount: "45000",
};

r = await req("GET", "/trips");
check("list trips requires auth", r.status === 401);
r = await req("GET", "/trips", undefined, "garbage.token.here");
check("bad token rejected", r.status === 401);

r = await req("POST", "/trips", draft, token);
check("create trip", r.status === 201 && r.json?.status === "planned" && r.json?.budgetAmount === 45000, JSON.stringify(r.json));
const tripId = r.json?.id;

r = await req("PUT", `/trips/${tripId}/draft`, draft, token);
check("upsert draft by id", r.status === 200 && r.json?.status === "draft");

r = await req("PATCH", `/trips/${tripId}`, { name: "Goa Escape v2", status: "planned" }, token);
check("patch trip", r.status === 200 && r.json?.name === "Goa Escape v2" && r.json?.updatedAt);

r = await req("POST", `/trips/${tripId}/duplicate`, {}, token);
check("duplicate trip", r.status === 201 && r.json?.name === "Goa Escape v2 (Copy)");
const copyId = r.json?.id;

r = await req("PATCH", "/trips/bulk-archive", { ids: [copyId], archived: true }, token);
check("bulk archive", r.status === 200 && r.json.includes(copyId));

r = await req("GET", "/trips", undefined, token);
check("list includes both + archivedAt set", r.status === 200 && r.json.length === 2 && r.json.find(t => t.id === copyId)?.archivedAt);

r = await req("POST", "/trips/bulk-delete", { ids: [copyId, "not-a-real-id"] }, token);
check("bulk delete reports partial failures", r.status === 200 && r.json.deletedIds.length === 1 && r.json.failedIds.length === 1, JSON.stringify(r.json));

r = await req("DELETE", `/trips/${tripId}`, undefined, token);
check("delete trip", r.status === 204);

r = await req("GET", `/trips/${tripId}`, undefined, token);
check("deleted trip gone", r.status === 404);

// ── Validation & ownership guards ────────────────────────────────
r = await req("POST", "/trips", { ...draft, budgetTier: "luxury" }, token);
check("invalid budget tier rejected", r.status === 400 && r.json?.code === "INVALID_REQUEST");

r = await req("GET", "/catalog-nothing");
check("unknown route 404", r.status === 404 || r.status === 503);

// ── Edit-flow full PATCH (new contract) ───────────────────────────
r = await req("POST", "/trips", draft, token);
const editTripId = r.json?.id;
check("create trip for edit flow", r.status === 201);

r = await req("PATCH", `/trips/${editTripId}`, {
  name: "Goa Escape (edited)",
  description: null,
  coverImage: "",
  startDate: "2026-10-02",
  endDate: "2026-10-06",
  destinationId: "goa",
  interests: ["beaches"],
  budgetTier: "premium",
  currency: "inr",
  budgetAmount: 60000,
  activityIds: ["act_taj_1"],
}, token);
check(
  "edit-flow PATCH updates all fields + clears description + uppercases currency",
  r.status === 200
    && r.json?.name === "Goa Escape (edited)"
    && r.json?.description === undefined
    && r.json?.startDate === "2026-10-02"
    && r.json?.endDate === "2026-10-06"
    && r.json?.budgetTier === "premium"
    && r.json?.currency === "INR"
    && r.json?.budgetAmount === 60000
    && JSON.stringify(r.json?.activityIds) === JSON.stringify(["act_taj_1"])
    && JSON.stringify(r.json?.interests) === JSON.stringify(["beaches"]),
  JSON.stringify(r.json),
);

r = await req("PATCH", `/trips/${editTripId}`, { interests: ["city-life"] }, token);
check("city-life interest accepted", r.status === 200 && JSON.stringify(r.json?.interests) === '["city-life"]', JSON.stringify(r.json));

r = await req("DELETE", `/trips/${editTripId}`, undefined, token);
check("cleanup edit-flow trip", r.status === 204);

// ── Bookmarks (explore saved-destination hooks) ───────────────────
r = await req("POST", "/users/me/saved-destinations", { id: "kyoto" }, token);
check("toggle saved destination adds", r.status === 200 && r.json.includes("kyoto"), JSON.stringify(r.json));

r = await req("GET", "/users/me/bookmarks", undefined, token);
check(
  "bookmarks snapshot reflects toggle",
  r.status === 200 && r.json.savedDestinations.includes("kyoto") && Array.isArray(r.json.savedActivities),
  JSON.stringify(r.json),
);

r = await req("POST", "/users/me/saved-destinations", { id: "kyoto" }, token);
check("toggle saved destination removes", r.status === 200 && !r.json.includes("kyoto"));

// ── Explore module ────────────────────────────────────────────────
r = await req("GET", "/explore/destinations/trending?limit=5", undefined, token);
check(
  "trending sorted by rating",
  r.status === 200 && Array.isArray(r.json) && r.json.length === 5
    && Number(r.json[0].rating) >= Number(r.json[r.json.length - 1].rating)
    && typeof r.json[0].estimatedBudgetInr === "number",
  JSON.stringify(r.json?.slice(0, 1)),
);

r = await req("GET", "/explore/destinations/popular?limit=9", undefined, token);
check("popular returns up to 9 by reviews", r.status === 200 && Array.isArray(r.json) && r.json.length <= 9);

r = await req("GET", "/explore/regions", undefined, token);
check("regions list", r.status === 200 && Array.isArray(r.json) && r.json.length > 0 && r.json[0]?.label);
const regionId = r.json?.[0]?.id;

r = await req("GET", `/explore/destinations/by-region/${regionId}`, undefined, token);
check(
  "by-region filters correctly",
  r.status === 200 && Array.isArray(r.json) && r.json.every((d) => d.region === regionId),
  `region=${regionId} got ${JSON.stringify(r.json?.map((d) => d.region))}`,
);

r = await req("GET", "/explore/destinations/by-category/cities", undefined, token);
check("by-category matches cities", r.status === 200 && Array.isArray(r.json));

r = await req("GET", "/explore/recommended?interests=beaches,culture&saved=&limit=6", undefined, token);
check("recommended respects interests param", r.status === 200 && Array.isArray(r.json) && r.json.length > 0);

r = await req("GET", "/explore/search?q=japan", undefined, token);
check(
  "search returns mixed results",
  r.status === 200 && Array.isArray(r.json.destinations) && r.json.destinations.length > 0
    && Array.isArray(r.json.activities),
  JSON.stringify(r.json).slice(0, 120),
);

r = await req("GET", "/explore/suggestions?q=ja", undefined, token);
check("suggestions type-ahead", r.status === 200 && Array.isArray(r.json) && r.json.every((s) => s.id && s.label));

r = await req("GET", "/explore/destinations/kyoto/detail", undefined, token);
check(
  "detail returns destination + related shape",
  r.status === 200 && r.json.destination?.id === "kyoto"
    && Array.isArray(r.json.activities)
    && Array.isArray(r.json.related)
    && !r.json.related.some((d) => d.id === "kyoto"),
  JSON.stringify(r.json?.destination),
);

r = await req("GET", "/explore/destinations/nope/detail", undefined, token);
check("detail unknown destination 404", r.status === 404 && r.json?.code === "NOT_FOUND");

// ── Seeded catalog meta ───────────────────────────────────────────
r = await req("GET", "/meta");
check(
  "catalog meta serves tiers/currencies after seed",
  r.status === 200 && r.json.budgetTiers?.length === 4 && r.json.currencies?.length >= 4,
  JSON.stringify({ t: r.json?.budgetTiers?.length, c: r.json?.currencies?.length }),
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
