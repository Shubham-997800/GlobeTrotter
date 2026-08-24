import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, MapPin, Pencil, Trash2, User } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/useAuth";
import type { TravelPreferences } from "@/features/auth/auth.types";
import { TIMEZONE_OPTIONS } from "@/features/settings/settings.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const BIO_MAX = 280;

const TRAVEL_STYLE_OPTIONS = [
  "Relaxed",
  "Adventure",
  "Cultural",
  "Luxury",
  "Budget",
  "Road trips",
];

const INTEREST_OPTIONS = [
  "Food",
  "History",
  "Nature",
  "Nightlife",
  "Photography",
  "Shopping",
  "Wildlife",
];

const ACTIVITY_OPTIONS = [
  "Hiking",
  "Museums",
  "Beaches",
  "City walks",
  "Food tours",
  "Water sports",
];

const BUDGET_OPTIONS: { value: TravelPreferences["budget"]; label: string }[] = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
  { value: "flexible", label: "Flexible" },
];

const DURATION_OPTIONS: {
  value: TravelPreferences["tripDuration"];
  label: string;
}[] = [
  { value: "weekend", label: "Weekend escapes" },
  { value: "one-week", label: "About a week" },
  { value: "two-weeks", label: "Two weeks" },
  { value: "longer", label: "Longer expeditions" },
  { value: "flexible", label: "Flexible" },
];

interface ChipGroupProps {
  legend: string;
  hint?: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function ChipGroup({
  legend,
  hint,
  options,
  selected,
  onToggle,
}: ChipGroupProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-white shadow-xs dark:text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-error-text">{message}</p>;
}

/** Profile — identity, preferences and account. */
export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatarUrl,
  );
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [stateRegion, setStateRegion] = useState(user?.stateRegion ?? "");
  const [country, setCountry] = useState(user?.country ?? "");
  const [timezone, setTimezone] = useState(user?.timezone ?? "system");
  const [favoritesText, setFavoritesText] = useState(
    (user?.preferences?.favoriteDestinations ?? []).join(", "),
  );
  const [preferences, setPreferences] = useState<TravelPreferences>(
    user?.preferences ?? {
      travelStyle: [],
      favoriteDestinations: [],
      interests: [],
      activities: [],
      budget: "flexible",
      tripDuration: "flexible",
    },
  );

  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);
  const [readingImage, setReadingImage] = useState(false);

  useEffect(() => {
    if (!avatarDirty && user?.avatarUrl !== undefined) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user?.avatarUrl, avatarDirty]);

  const dirty =
    name !== (user?.name ?? "") ||
    phone !== (user?.phone ?? "") ||
    dateOfBirth !== (user?.dateOfBirth ?? "") ||
    gender !== (user?.gender ?? "") ||
    bio !== (user?.bio ?? "") ||
    city !== (user?.city ?? "") ||
    stateRegion !== (user?.stateRegion ?? "") ||
    country !== (user?.country ?? "") ||
    timezone !== (user?.timezone ?? "system") ||
    favoritesText !==
      (user?.preferences?.favoriteDestinations ?? []).join(", ") ||
    JSON.stringify(preferences) !==
      JSON.stringify(
        user?.preferences ?? {
          travelStyle: [],
          favoriteDestinations: [],
          interests: [],
          activities: [],
          budget: "flexible",
          tripDuration: "flexible",
        },
      ) ||
    avatarDirty;

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const reset = () => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setDateOfBirth(user?.dateOfBirth ?? "");
    setGender(user?.gender ?? "");
    setBio(user?.bio ?? "");
    setCity(user?.city ?? "");
    setStateRegion(user?.stateRegion ?? "");
    setCountry(user?.country ?? "");
    setTimezone(user?.timezone ?? "system");
    setFavoritesText(
      (user?.preferences?.favoriteDestinations ?? []).join(", "),
    );
    setPreferences(
      user?.preferences ?? {
        travelStyle: [],
        favoriteDestinations: [],
        interests: [],
        activities: [],
        budget: "flexible",
        tripDuration: "flexible",
      },
    );
    setAvatarUrl(user?.avatarUrl);
    setAvatarDirty(false);
    setErrors({});
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image must be smaller than 2 MB.");
      return;
    }
    setReadingImage(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setAvatarDirty(true);
      }
      setReadingImage(false);
    };
    reader.onerror = () => {
      toast.error("Could not read that file. Try another image.");
      setReadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleChip = (key: keyof Pick<TravelPreferences, "travelStyle" | "interests" | "activities">, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const save = async () => {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (phone && !/^[+\d][\d\s()-]{5,19}$/.test(phone.trim()))
      nextErrors.phone = "Enter a valid phone number.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const favoriteDestinations = favoritesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await updateProfile({
        name: name.trim(),
        ...(avatarDirty ? { avatarUrl: avatarUrl || null } : {}),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        city: city.trim() || undefined,
        stateRegion: stateRegion.trim() || undefined,
        country: country.trim() || undefined,
        timezone,
        bio: bio.trim() || undefined,
        preferences: { ...preferences, favoriteDestinations },
      });
      setAvatarDirty(false);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Could not save your profile. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-28">
        {/* ── Profile Header ──────────────────────────────────── */}
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
          <div className="relative shrink-0">
            <UserAvatar
              name={name || user?.name || "Traveler"}
              src={avatarUrl}
              className="size-20 text-2xl"
            />
            {readingImage ? (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Loader2 className="size-5 animate-spin text-white" aria-hidden="true" />
              </span>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {name || user?.name || "Traveler"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Travel Planner</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                {city || "Add location"}
              </span>
              <span className="flex items-center gap-1">
                <User className="size-3" aria-hidden="true" />
                Member
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="sr-only"
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-4" aria-hidden="true" />
              Avatar
            </Button>
            {avatarUrl ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAvatarUrl(undefined);
                  setAvatarDirty(true);
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>

        {/* ── Two Column Layout ────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* ── Left: Personal Information ────────────────────── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-4 text-primary" aria-hidden="true" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  This is how you appear across trips and the community.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Full name *</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Alex Traveler"
                    />
                    <FieldError message={errors.name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" value={user?.email ?? ""} readOnly />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-phone">Phone number</Label>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <FieldError message={errors.phone} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-dob">Date of birth</Label>
                    <Input
                      id="profile-dob"
                      type="date"
                      value={dateOfBirth}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(event) => setDateOfBirth(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="profile-gender">Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="profile-gender" className="w-full sm:max-w-xs">
                        <SelectValue placeholder="Prefer not to say" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Female", "Male", "Non-binary", "Prefer not to say"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea
                    id="profile-bio"
                    rows={3}
                    value={bio}
                    maxLength={BIO_MAX}
                    onChange={(event) => setBio(event.target.value)}
                    placeholder="Weekend wanderer collecting coastlines and street food…"
                  />
                  <p className="text-right text-xs text-disabled-text">
                    {bio.length}/{BIO_MAX}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ── Location ───────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-4 text-travel-blue" aria-hidden="true" />
                  Location
                </CardTitle>
                <CardDescription>
                  Helps us tailor destination ideas to where you start.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-city">City</Label>
                  <Input
                    id="profile-city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-state">State / Region</Label>
                  <Input
                    id="profile-state"
                    value={stateRegion}
                    onChange={(event) => setStateRegion(event.target.value)}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-country">Country</Label>
                  <Input
                    id="profile-country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="India"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="profile-timezone" className="w-full">
                      <SelectValue placeholder="Choose timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Travel Preferences ────────────────────── */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="size-4 text-primary" aria-hidden="true" />
                  Travel Preferences
                </CardTitle>
                <CardDescription>
                  We use these to suggest destinations and activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ChipGroup
                  legend="Travel style"
                  options={TRAVEL_STYLE_OPTIONS}
                  selected={preferences.travelStyle}
                  onToggle={(value) => toggleChip("travelStyle", value)}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="profile-favorites">Favorite destinations</Label>
                  <Input
                    id="profile-favorites"
                    value={favoritesText}
                    onChange={(event) => setFavoritesText(event.target.value)}
                    placeholder="Kyoto, Lisbon, Patagonia"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate places with commas.
                  </p>
                </div>
                <ChipGroup
                  legend="Interests"
                  options={INTEREST_OPTIONS}
                  selected={preferences.interests}
                  onToggle={(value) => toggleChip("interests", value)}
                />
                <ChipGroup
                  legend="Preferred activities"
                  options={ACTIVITY_OPTIONS}
                  selected={preferences.activities}
                  onToggle={(value) => toggleChip("activities", value)}
                />
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-foreground">
                    Budget preference
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map((option) => {
                      const active = preferences.budget === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() =>
                            setPreferences((prev) => ({ ...prev, budget: option.value }))
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "border-primary bg-primary text-white shadow-xs dark:text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="space-y-1.5">
                  <Label>Preferred trip duration</Label>
                  <Select
                    value={preferences.tripDuration}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        tripDuration: value as TravelPreferences["tripDuration"],
                      }))
                    }
                  >
                    <SelectTrigger className="w-full sm:max-w-xs">
                      <SelectValue placeholder="Any length" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Save Actions ──────────────────────────────────── */}
        <div className="hidden justify-end gap-2 sm:flex">
          <Button variant="ghost" onClick={reset} disabled={!dirty || saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={!dirty || saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Save changes
          </Button>
        </div>
      </div>

      {/* Mobile sticky save bar */}
      {dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-medium text-warning-text">
              Unsaved changes
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={reset}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void save()} disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
