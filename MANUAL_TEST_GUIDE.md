# GlobeTrotter — Manual Testing Guide

> Step-by-step instructions to verify every feature. Follow in order — each section builds on the previous.

**Base URL:** `https://globetrotter-b769.onrender.com`
**Frontend:** Run locally with `npm run dev` → `http://localhost:5173`

> **Note:** First API request after idle can take ~60s (free-tier cold start).

---

## 1. Account Creation & Auth

### 1.1 Register a new user

1. Open `http://localhost:5173/register`
2. Fill in: First Name = `Test`, Last Name = `One`, Email = `testone@example.com`, Password = `TestPass123!`
3. Click **Create Account**
4. **Expected:** Redirects to `/dashboard`. Top-right shows `Test One`.

### 1.2 Register a second user (for isolation testing later)

1. Open an **incognito/private window**
2. Go to `/register`
3. Fill in: First Name = `Test`, Last Name = `Two`, Email = `testtwo@example.com`, Password = `TestPass123!`
4. Click **Create Account**
5. **Expected:** Redirects to `/dashboard`. Top-right shows `Test Two`.

### 1.3 Login

1. Log out from Test One
2. Go to `/login`
3. Enter `testone@example.com` + `TestPass123!`
4. Click **Login**
5. **Expected:** Redirects to `/dashboard`. Welcome message shows "Test One".

### 1.4 Login with wrong password

1. Log out
2. Go to `/login`
3. Enter `testone@example.com` + `wrongpassword`
4. Click **Login**
5. **Expected:** Error message shown. Stays on login page.

### 1.5 Forgot password flow

1. Go to `/login`
2. Click **"Forgot password?"**
3. Enter `testone@example.com`
4. **Expected:** Confirmation message shown.

### 1.6 Register an admin account

1. Go to `/register`
2. Scroll down, click **"Create Admin Account"**
3. Enter admin secret code: `globetrotter-admin-2026`
4. Fill in: First Name = `Admin`, Last Name = `User`, Email = `admin@example.com`, Password = `AdminPass123!`
5. Click **Create Account**
6. **Expected:** Redirects to `/admin`. User has admin role.

---

## 2. Dashboard

> Log in as Test One (`testone@example.com`)

### 2.1 Empty state

1. Go to `/dashboard`
2. **Expected:**
   - Welcome section with user name
   - Featured destination slides visible
   - Popular destinations grid shows cards
   - "My Trips" section shows empty state or 0 trips
   - Insights cards visible
   - Quick actions visible
   - No error messages

### 2.2 Navigation links work

1. Click each quick action / navigation link on dashboard
2. **Expected:** Each navigates to the correct page without errors.

---

## 3. Trip Creation

### 3.1 Create a trip

1. Go to `/trips`
2. Click **"Create Trip"** button
3. Fill in the form:
   - Trip Name = `Japan Adventure`
   - Start Date = `2026-11-01`
   - End Date = `2026-11-05`
   - Destination = type `Tokyo` and select it
   - Interests = select `Food`, `Culture`
   - Budget Tier = `Moderate`
   - Budget Amount = `50000`
   - Currency = `INR`
4. Click **Save** / **Create**
5. **Expected:** Trip is created. You are taken to the trip detail or itinerary page.

### 3.2 Verify trip appears in list

1. Go to `/trips`
2. **Expected:** `Japan Adventure` appears in the trip list with:
   - Status: `planned` (or `draft` if not finalized)
   - Dates: Nov 1–5, 2026
   - Cover image visible

### 3.3 Edit a trip

1. Open `Japan Adventure`
2. Click **Edit** / change trip name to `Japan Adventure 2026`
3. Save
4. **Expected:** Name updated in the list.

### 3.4 Duplicate a trip

1. On `/trips`, find `Japan Adventure 2026`
2. Click **Duplicate**
3. **Expected:** A new trip appears named `Japan Adventure 2026 (Copy)`.

### 3.5 Delete a trip

1. Delete the duplicate trip (`Japan Adventure 2026 (Copy)`)
2. **Expected:** Only the original remains.

---

## 4. Itinerary Builder

> Continue from Section 3 with `Japan Adventure 2026`

### 4.1 View itinerary

1. Open the trip → go to Itinerary Builder
2. **Expected:** Day tabs shown for each trip date (Nov 1–5 = 5 days). Empty state with "Add Activity" prompt.

### 4.2 Add activities

1. On Day 1 (Nov 1), click **"Add Activity"**
2. Fill in:
   - Name = `Fushimi Inari Shrine`
   - Description = `Thousand torii gates hike`
   - Category = `Culture`
   - Location = `Kyoto`
   - Start Time = `09:00`
   - End Time = `11:00`
   - Cost = `0`
3. Save
4. **Expected:** Activity appears on Day 1 card.

5. Add another activity on Day 1:
   - Name = `Nishiki Market`
   - Category = `Food`
   - Start Time = `12:00`, End Time = `14:00`
   - Cost = `2000`

6. **Expected:** Two activities on Day 1.

### 4.3 Reorder activities

1. Drag `Nishiki Market` above `Fushimi Inari Shrine`
2. **Expected:** Order changes. Activity list reflects new order.

### 4.4 Edit an activity

1. Click on `Fushimi Inari Shrine`
2. Change description to `Morning hike through 10,000 torii gates`
3. Save
4. **Expected:** Description updated.

### 4.5 Duplicate an activity

1. Duplicate `Nishiki Market`
2. **Expected:** A new `Nishiki Market (copy)` appears on the same day.

### 4.6 Delete an activity

1. Delete `Nishiki Market (copy)`
2. **Expected:** Only the original two activities remain.

### 4.7 Switch days

1. Click on Day 2 tab (Nov 2)
2. **Expected:** Empty day with "Add Activity" prompt.
3. Add an activity on Day 2:
   - Name = `Arashiyama Bamboo`
   - Category = `Nature`
   - Cost = `500`

### 4.8 Trip complete

1. Click **"Complete Itinerary"** / mark trip as complete
2. **Expected:** Trip status changes to `completed`.

---

## 5. Explore

### 5.1 Browse destinations

1. Go to `/explore`
2. **Expected:**
   - Trending destinations rail visible with cards (image, city, country, rating)
   - Popular destinations section visible
   - Filter bar with category/region/budget/duration options

### 5.2 Search

1. In the search bar, type `Paris`
2. **Expected:** Suggestions appear. Clicking searches for Paris. Results show Paris destination.

### 5.3 Filter by category

1. Select category filter = `Culture`
2. **Expected:** Only culture-related destinations shown.

### 5.4 Filter by region

1. Select region = `Asia`
2. **Expected:** Asian destinations shown (Tokyo, Kyoto, Bali, etc.).

### 5.5 Destination detail page

1. Click on a destination card (e.g., Kyoto)
2. **Expected:** Detail page shows:
   - Destination name, country, description
   - Related destinations
   - Rating and reviews

### 5.6 Save a destination

1. On a destination detail page, click **Save** / heart icon
2. **Expected:** Icon toggles to saved state.
3. Go to `/saved`
4. **Expected:** Saved destination appears in the list.

### 5.7 Remove saved destination

1. On `/saved`, click to unsave the destination
2. **Expected:** Removed from saved list.

---

## 6. Calendar

### 6.1 View calendar

1. Go to `/calendar`
2. **Expected:** Month grid shown with current month. Trip activities appear as event chips on their respective dates.

### 6.2 Navigate months

1. Click next/previous month arrows
2. **Expected:** Calendar navigates. If trips exist in other months, events appear.

### 6.3 Day agenda

1. Click on a day that has activities
2. **Expected:** Day agenda panel opens showing scheduled activities.

---

## 7. Community

### 7.1 View feed

1. Go to `/community`
2. **Expected:** Feed page loads. Posts (if any) displayed. Composer at top.

### 7.2 Create a post

1. In the post composer, write `Just came back from Japan! Amazing trip.`
2. Submit
3. **Expected:** Post appears in the feed.

---

## 8. Notifications

### 8.1 View notifications

1. Go to `/notifications`
2. **Expected:** Notification center loads. Empty state if no notifications.

---

## 9. Settings & Profile

### 9.1 View settings

1. Go to `/settings`
2. **Expected:** Settings page loads with sections for:
   - Appearance (theme)
   - Regional (currency, language)
   - Account

### 9.2 Change theme

1. Switch theme to **Dark**
2. **Expected:** App switches to dark mode.
3. Switch back to **System**
4. **Expected:** Follows system preference.

### 9.3 Update profile

1. Go to `/profile`
2. Change name or bio
3. Save
4. **Expected:** Profile updated. Name reflects in top-right corner.

### 9.4 Change password

1. Go to profile / account settings
2. Enter current password + new password
3. Save
4. **Expected:** Confirmation shown.
5. Log out → log in with new password
6. **Expected:** Login succeeds with new password.

---

## 10. Data Isolation (Security)

> This requires **two browser windows** (or two profiles).

### 10.1 Setup

- **Window 1:** Logged in as `testone@example.com`
- **Window 2:** Logged in as `testtwo@example.com`

### 10.2 Test isolation

1. **Window 1 (Test One):** Create a trip called `Secret Trip`
2. **Window 2 (Test Two):** Go to `/trips`
3. **Expected:** Test Two sees **0 trips** (or only their own). `Secret Trip` is NOT visible.

4. **Window 2:** Try navigating to `http://localhost:5173/trips/<trip-id-of-secret-trip>`
5. **Expected:** 404 / "Trip not found" / redirect. Cannot access.

6. **Window 2:** Open browser DevTools → Network → try to `GET /api/trips/<trip-id-of-secret-trip>`
7. **Expected:** Response is `404` or `401`.

---

## 11. Admin Console

> Log in as Admin (`admin@example.com`)

### 11.1 Access admin

1. Go to `/admin`
2. **Expected:** Admin dashboard loads with:
   - Platform stats (user count, trip count, etc.)
   - Recent activity feed
   - Navigation to sub-pages

### 11.2 User management

1. Go to `/admin/users`
2. **Expected:** List of registered users with roles.
3. Find a user, click to view details
4. **Expected:** User detail shows trip count and profile info.

### 11.3 Destination management

1. Go to `/admin/destinations`
2. **Expected:** List of destinations from the catalog.
3. Click **Add Destination**
4. Fill in: City = `Rome`, Country = `Italy`, etc.
5. Save
6. **Expected:** Rome appears in the list.

### 11.4 Activity management

1. Go to `/admin/activities`
2. **Expected:** List of activities.
3. Click **Add Activity**
4. Fill in: Name = `Colosseum Tour`, City = `Rome`, Category = `Culture`
5. Save
6. **Expected:** Activity appears in the list.

### 11.5 Admin access denied for regular users

1. Log out from admin
2. Log in as `testone@example.com` (regular user)
3. Go to `/admin`
4. **Expected:** 403 Forbidden or redirect away from admin. Cannot access.

---

## 12. API Health Check

### 12.1 Health endpoint (no auth required)

1. Open browser → `https://globetrotter-b769.onrender.com/api/health`
2. **Expected:**
   ```json
   {
     "status": "ok",
     "service": "globetrotter-api",
     "supabaseConfigured": true,
     "uptimeSeconds": ...
   }
   ```

### 12.2 Protected endpoint without token

1. Open browser → `https://globetrotter-b769.onrender.com/api/trips`
2. **Expected:** `401 Unauthorized`

### 12.3 Public catalog without token

1. Open browser → `https://globetrotter-b769.onrender.com/api/destinations?q=paris`
2. **Expected:** JSON array with Paris destination. No auth needed.

---

## 13. Error States

### 13.1 404 page

1. Go to `/this-page-does-not-exist`
2. **Expected:** Custom 404 page shown (not a blank screen or stack trace).

### 13.2 Network error

1. Stop the Vite dev server
2. Try navigating within the app
3. **Expected:** Graceful error handling, offline banner, or user-friendly message.

### 13.3 Cold start

1. If the API has been idle, first request may be slow
2. **Expected:** Loading spinner shown, then data appears. No crash.

---

## Checklist Summary

| # | Feature | Status |
|---|---------|--------|
| 1.1 | User registration | [ ] |
| 1.2 | Second user registration | [ ] |
| 1.3 | Login | [ ] |
| 1.4 | Wrong password error | [ ] |
| 1.5 | Forgot password | [ ] |
| 1.6 | Admin registration | [ ] |
| 2.1 | Dashboard empty state | [ ] |
| 2.2 | Dashboard navigation | [ ] |
| 3.1 | Create trip | [ ] |
| 3.2 | Trip in list | [ ] |
| 3.3 | Edit trip | [ ] |
| 3.4 | Duplicate trip | [ ] |
| 3.5 | Delete trip | [ ] |
| 4.1 | Itinerary view | [ ] |
| 4.2 | Add activities | [ ] |
| 4.3 | Reorder activities | [ ] |
| 4.4 | Edit activity | [ ] |
| 4.5 | Duplicate activity | [ ] |
| 4.6 | Delete activity | [ ] |
| 4.7 | Switch days | [ ] |
| 4.8 | Trip complete | [ ] |
| 5.1 | Explore browse | [ ] |
| 5.2 | Search | [ ] |
| 5.3 | Category filter | [ ] |
| 5.4 | Region filter | [ ] |
| 5.5 | Destination detail | [ ] |
| 5.6 | Save destination | [ ] |
| 5.7 | Remove saved | [ ] |
| 6.1 | Calendar view | [ ] |
| 6.2 | Month navigation | [ ] |
| 6.3 | Day agenda | [ ] |
| 7.1 | Community feed | [ ] |
| 7.2 | Create post | [ ] |
| 8.1 | Notifications | [ ] |
| 9.1 | Settings page | [ ] |
| 9.2 | Theme change | [ ] |
| 9.3 | Profile update | [ ] |
| 9.4 | Password change | [ ] |
| 10.1 | Isolation setup | [ ] |
| 10.2 | Cannot see other user's trips | [ ] |
| 10.2 | Cannot access other user's trip by ID | [ ] |
| 11.1 | Admin dashboard | [ ] |
| 11.2 | User management | [ ] |
| 11.3 | Destination CRUD | [ ] |
| 11.4 | Activity CRUD | [ ] |
| 11.5 | Admin denied for regular user | [ ] |
| 12.1 | Health endpoint | [ ] |
| 12.2 | Protected endpoint no token | [ ] |
| 12.3 | Public catalog no token | [ ] |
| 13.1 | 404 page | [ ] |
| 13.2 | Network error | [ ] |
| 13.3 | Cold start handling | [ ] |
