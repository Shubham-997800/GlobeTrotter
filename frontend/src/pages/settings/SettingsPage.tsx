import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Bug,
  Check,
  Download,
  Eye,
  FileText,
  Globe2,
  Info,
  LifeBuoy,
  Loader2,
  LogOut,
  MessageSquare,
  Monitor,
  Moon,
  Palette,
  PlugZap,
  ScrollText,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/features/dashboard/components/States";
import { ApiError } from "@/features/auth/auth.types";
import { useAuth } from "@/features/auth/useAuth";
import { settingsService } from "@/features/settings/settings.service";
import {
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
} from "@/features/settings/settings.types";
import type {
  NotificationPreferences,
  SettingsState,
  ThemePreference,
} from "@/features/settings/settings.types";
import { useSaveSettings, useSettings } from "@/features/settings/useSettings";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type SectionId =
  | "account"
  | "notifications"
  | "appearance"
  | "region"
  | "privacy"
  | "connections"
  | "help"
  | "about";

const NAV_ITEMS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: "account", label: "Account", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "region", label: "Language & Region", icon: Globe2 },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "connections", label: "Connected Services", icon: PlugZap },
  { id: "help", label: "Help & Support", icon: LifeBuoy },
  { id: "about", label: "About", icon: Info },
];

const APP_VERSION = "1.0.0";

const ACTIVE_SESSIONS = [
  {
    id: "sess_current",
    device: "Chrome · Windows",
    location: "This device",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "sess_mobile",
    device: "GlobeTrotter iOS",
    location: "Mumbai, India",
    lastActive: "2 hours ago",
    current: false,
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I plan my first trip?",
    a: "Open My Trips → Create New Trip, pick a destination and dates, then build your day-by-day itinerary in the builder.",
  },
  {
    q: "Can I share a trip with friends?",
    a: "Yes — open the trip, choose Share and send the link. Friends can view or copy it into their own account.",
  },
  {
    q: "How does budget tracking work?",
    a: "Add costs to activities in the itinerary builder; the budget panel totals them against your trip budget automatically.",
  },
  {
    q: "Is my data synced across devices?",
    a: "In this preview your data lives on this device. Cloud sync is coming with accounts on all plans.",
  },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", hint: "Anyone using GlobeTrotter" },
  { value: "followers", label: "Followers", hint: "Only people who follow you" },
  { value: "private", label: "Private", hint: "Only you" },
] as const;

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: "Light", hint: "Bright interface", icon: Sun },
  { value: "dark", label: "Dark", hint: "Deep forest tones", icon: Moon },
  { value: "system", label: "System", hint: "Follow your device", icon: Monitor },
];

/** Generic confirmation dialog used by every destructive/mock action. */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              destructive &&
                "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive",
            )}
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ── Account section ─────────────────────────────────────────── */

function AccountSection({
  busy,
  onChangePassword,
}: {
  busy: boolean;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [saving, setSaving] = useState(false);

  const submitPassword = async () => {
    const errors: typeof fieldErrors = {};
    if (!currentPassword) errors.current = "Enter your current password.";
    if (newPassword.length < 8)
      errors.next = "Use at least 8 characters.";
    if (newPassword !== confirmPassword)
      errors.confirm = "Passwords do not match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await onChangePassword({ currentPassword, newPassword });
      toast.success("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not update your password. Try again.";
      setFieldErrors({
        current:
          error instanceof ApiError && error.code === "INVALID_CREDENTIALS"
            ? message
            : undefined,
        next:
          error instanceof ApiError && error.code !== "INVALID_CREDENTIALS"
            ? message
            : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
          <CardDescription>
            Your sign-in details. Contact support to change your email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="account-email">Email</Label>
            <Input id="account-email" value={user?.email ?? ""} readOnly />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Member since</Label>
              <p className="rounded-lg border border-border bg-surface-hover px-3 py-2 text-sm text-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })
                  : "—"}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <p>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                  Active
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Use at least 8 characters with a mix of letters and numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            {fieldErrors.current ? (
              <p className="text-xs font-medium text-error-text">
                {fieldErrors.current}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              {fieldErrors.next ? (
                <p className="text-xs font-medium text-error-text">
                  {fieldErrors.next}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {fieldErrors.confirm ? (
                <p className="text-xs font-medium text-error-text">
                  {fieldErrors.confirm}
                </p>
              ) : null}
            </div>
          </div>
          <Button onClick={() => void submitPassword()} disabled={saving || busy}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Update password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login &amp; security</CardTitle>
          <CardDescription>
            Devices currently signed in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border rounded-xl border border-border">
            {ACTIVE_SESSIONS.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 p-3.5 text-sm"
              >
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">
                    {session.device}
                    {session.current ? (
                      <span className="ml-2 rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-semibold text-primary dark:bg-primary/15">
                        This device
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <LogOutAllDevicesButton />
        </CardContent>
      </Card>
    </div>
  );
}

function LogOutAllDevicesButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const confirm = () => {
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setOpen(false);
      toast.success("Signed out of all other devices.");
    }, 500);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <LogOut className="size-4" aria-hidden="true" />
        Log out of all other devices
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Log out everywhere else?"
        description="Every other signed-in device will be logged out. You stay signed in here."
        confirmLabel="Log out devices"
        pending={pending}
        onConfirm={confirm}
      />
    </>
  );
}

/* ── Notifications section ───────────────────────────────────── */

function NotificationRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <Label htmlFor={id} className="min-w-0 flex-col items-start gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs font-normal text-muted-foreground">
          {description}
        </span>
      </Label>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function NotificationsSection({
  draft,
  setPush,
  setEmail,
}: {
  draft: SettingsState;
  setPush: (patch: Partial<NotificationPreferences["push"]>) => void;
  setEmail: (patch: Partial<NotificationPreferences["email"]>) => void;
}) {
  const push = draft.notifications.push;
  const email = draft.notifications.email;
  const allPushOn = Object.values(push).every(Boolean);
  const allEmailOn = Object.values(email).every(Boolean);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Push notifications</CardTitle>
            <CardDescription>Alerts on this device.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPush(
                Object.fromEntries(
                  Object.keys(push).map((key) => [key, !allPushOn]),
                ) as Record<keyof NotificationPreferences["push"], boolean>,
              )
            }
          >
            <Check className="size-4" aria-hidden="true" />
            {allPushOn ? "Disable all" : "Enable all"}
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <NotificationRow
            id="push-trip-reminders"
            label="Trip reminders"
            description="Upcoming departures and trip milestones"
            checked={push.tripReminders}
            onChange={(value) => setPush({ tripReminders: value })}
          />
          <NotificationRow
            id="push-activity-reminders"
            label="Activity reminders"
            description="Itinerary activities before they start"
            checked={push.activityReminders}
            onChange={(value) => setPush({ activityReminders: value })}
          />
          <NotificationRow
            id="push-booking-updates"
            label="Booking updates"
            description="Confirmations and changes to bookings"
            checked={push.bookingUpdates}
            onChange={(value) => setPush({ bookingUpdates: value })}
          />
          <NotificationRow
            id="push-community-activity"
            label="Community activity"
            description="Likes, comments and shared trips"
            checked={push.communityActivity}
            onChange={(value) => setPush({ communityActivity: value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Email notifications</CardTitle>
            <CardDescription>Summaries sent to your inbox.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setEmail(
                Object.fromEntries(
                  Object.keys(email).map((key) => [key, !allEmailOn]),
                ) as Record<keyof NotificationPreferences["email"], boolean>,
              )
            }
          >
            <Check className="size-4" aria-hidden="true" />
            {allEmailOn ? "Disable all" : "Enable all"}
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <NotificationRow
            id="email-trip-updates"
            label="Trip updates"
            description="Changes to trips you follow or collaborate on"
            checked={email.tripUpdates}
            onChange={(value) => setEmail({ tripUpdates: value })}
          />
          <NotificationRow
            id="email-recommendations"
            label="Recommendations"
            description="Destinations picked for you"
            checked={email.recommendations}
            onChange={(value) => setEmail({ recommendations: value })}
          />
          <NotificationRow
            id="email-community-updates"
            label="Community updates"
            description="Weekly digest of posts you follow"
            checked={email.communityUpdates}
            onChange={(value) => setEmail({ communityUpdates: value })}
          />
          <NotificationRow
            id="email-product-updates"
            label="Product updates"
            description="New features and improvements"
            checked={email.productUpdates}
            onChange={(value) => setEmail({ productUpdates: value })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Appearance section ──────────────────────────────────────── */

function AppearanceSection({
  draft,
  onUpdate,
}: {
  draft: SettingsState;
  onUpdate: (patch: Partial<SettingsState>) => void;
}) {
  const { setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Changes apply instantly and are saved with your settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={draft.theme}
            onValueChange={(value) => {
              const next = value as ThemePreference;
              setTheme(next);
              onUpdate({ theme: next });
            }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = draft.theme === option.value;
              return (
                <Label
                  key={option.value}
                  htmlFor={`theme-${option.value}`}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors",
                    selected
                      ? "border-primary bg-primary-subtle dark:border-primary/50 dark:bg-primary/10"
                      : "border-border hover:border-strong",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <Icon
                      className={cn(
                        "size-5",
                        selected ? "text-primary" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    <RadioGroupItem
                      id={`theme-${option.value}`}
                      value={option.value}
                      className="sr-only"
                    />
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {option.label}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {option.hint}
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color theme</CardTitle>
          <CardDescription>The GlobeTrotter signature palette.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl border border-primary/50 bg-primary-subtle p-4 dark:bg-primary/10">
            <span
              aria-hidden="true"
              className="size-9 shrink-0 rounded-full bg-primary ring-2 ring-primary-light dark:ring-primary/40"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">Emerald Green</p>
              <p className="text-xs text-muted-foreground">
                Selected · more color themes are coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interface density</CardTitle>
          <CardDescription>
            Compact mode tightens padding across lists and cards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={draft.compactMode ? "compact" : "comfortable"}
            onValueChange={(value) =>
              onUpdate({ compactMode: value === "compact" })
            }
            className="grid gap-3 sm:grid-cols-2"
          >
            {[
              { value: "comfortable", label: "Comfortable", hint: "Standard spacing" },
              { value: "compact", label: "Compact", hint: "Tighter spacing" },
            ].map((option) => {
              const selected =
                (draft.compactMode ? "compact" : "comfortable") === option.value;
              return (
                <Label
                  key={option.value}
                  htmlFor={`density-${option.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                    selected
                      ? "border-primary bg-primary-subtle dark:border-primary/50 dark:bg-primary/10"
                      : "border-border hover:border-strong",
                  )}
                >
                  <RadioGroupItem id={`density-${option.value}`} value={option.value} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {option.label}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {option.hint}
                    </span>
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
          <CardDescription>How components look right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Primary action</Button>
            <Button size="sm" variant="outline">
              Secondary
            </Button>
            <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text">
              Success state
            </span>
          </div>
          <Input placeholder="Sample input" aria-label="Preview input" />
          <p className="text-sm text-muted-foreground">
            Muted helper text ·{" "}
            <span className="font-medium text-travel-blue">travel blue accent</span>{" "}
            · <span className="font-medium text-primary">primary accent</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Region section ──────────────────────────────────────────── */

function RegionSection({
  draft,
  onUpdate,
}: {
  draft: SettingsState;
  onUpdate: (patch: Partial<SettingsState>) => void;
}) {
  const regional = draft.regional;
  const patchRegional = (
    patch: Partial<SettingsState["regional"]>,
  ): Partial<SettingsState> => ({ regional: { ...regional, ...patch } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language &amp; Region</CardTitle>
        <CardDescription>
          Formats apply to dates, times and prices across the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="language-select">Language</Label>
            <Select
              value={regional.language}
              onValueChange={(value) => onUpdate(patchRegional({ language: value }))}
            >
              <SelectTrigger id="language-select" className="w-full">
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency-select">Currency</Label>
            <Select
              value={regional.currency}
              onValueChange={(value) => onUpdate(patchRegional({ currency: value }))}
            >
              <SelectTrigger id="currency-select" className="w-full">
                <SelectValue placeholder="Choose currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date-format-select">Date format</Label>
            <Select
              value={regional.dateFormat}
              onValueChange={(value) => onUpdate(patchRegional({ dateFormat: value }))}
            >
              <SelectTrigger id="date-format-select" className="w-full">
                <SelectValue placeholder="Choose format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="timezone-select">Timezone</Label>
            <Select
              value={regional.timezone}
              onValueChange={(value) => onUpdate(patchRegional({ timezone: value }))}
            >
              <SelectTrigger id="timezone-select" className="w-full">
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
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Time format</Label>
          <RadioGroup
            value={regional.timeFormat}
            onValueChange={(value) =>
              onUpdate(patchRegional({ timeFormat: value as "12h" | "24h" }))
            }
            className="flex gap-3"
          >
            {[
              { value: "12h" as const, label: "12-hour · 7:30 PM" },
              { value: "24h" as const, label: "24-hour · 19:30" },
            ].map((option) => (
              <Label
                key={option.value}
                htmlFor={`time-${option.value}`}
                className={cn(
                  "flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors",
                  regional.timeFormat === option.value
                    ? "border-primary bg-primary-subtle dark:border-primary/50 dark:bg-primary/10"
                    : "border-border hover:border-strong",
                )}
              >
                <RadioGroupItem id={`time-${option.value}`} value={option.value} />
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Privacy section ─────────────────────────────────────────── */

function VisibilityRadios({
  legend,
  name,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  onChange: (value: "public" | "followers" | "private") => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as "public" | "followers" | "private")}
        className="grid gap-3 sm:grid-cols-3"
      >
        {VISIBILITY_OPTIONS.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${name}-${option.value}`}
            className={cn(
              "flex cursor-pointer flex-col gap-1 rounded-xl border p-3.5 transition-colors",
              value === option.value
                ? "border-primary bg-primary-subtle dark:border-primary/50 dark:bg-primary/10"
                : "border-border hover:border-strong",
            )}
          >
            <span className="flex items-center gap-2">
              <RadioGroupItem id={`${name}-${option.value}`} value={option.value} />
              <span className="text-sm font-semibold text-foreground">
                {option.label}
              </span>
            </span>
            <span className="pl-6 text-xs font-normal text-muted-foreground">
              {option.hint}
            </span>
          </Label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

function PrivacySection({
  draft,
  onUpdate,
}: {
  draft: SettingsState;
  onUpdate: (patch: Partial<SettingsState>) => void;
}) {
  const queryClient = useQueryClient();
  const privacy = draft.privacy;
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const clearData = async () => {
    setClearing(true);
    try {
      await settingsService.clearLocalData();
      queryClient.invalidateQueries();
      toast.success("Local app data has been cleared.");
    } finally {
      setClearing(false);
      setClearOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Who can see things</CardTitle>
          <CardDescription>
            Control what other travelers can view about you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <VisibilityRadios
            legend="Profile visibility"
            name="profile-visibility"
            value={privacy.profileVisibility}
            onChange={(value) =>
              onUpdate({ privacy: { ...privacy, profileVisibility: value } })
            }
          />
          <VisibilityRadios
            legend="Trip visibility"
            name="trip-visibility"
            value={privacy.tripVisibility}
            onChange={(value) =>
              onUpdate({ privacy: { ...privacy, tripVisibility: value } })
            }
          />
          <div className="divide-y divide-border rounded-xl border border-border px-4">
            <NotificationRow
              id="privacy-show-community"
              label="Show me in community"
              description="Your profile appears in feeds and followers"
              checked={privacy.showInCommunity}
              onChange={(value) =>
                onUpdate({ privacy: { ...privacy, showInCommunity: value } })
              }
            />
            <NotificationRow
              id="privacy-search-engines"
              label="Allow search engines"
              description="Let search engines index your public profile"
              checked={privacy.allowSearchEngines}
              onChange={(value) =>
                onUpdate({ privacy: { ...privacy, allowSearchEngines: value } })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Export everything stored locally, or wipe app data on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => settingsService.downloadData()}>
            <Download className="size-4" aria-hidden="true" />
            Download my data
          </Button>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setClearOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Clear local data
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear local data?"
        description="Trips, itineraries, community content and preferences stored in this browser will be deleted. Your account stays intact."
        confirmLabel="Clear data"
        destructive
        pending={clearing}
        onConfirm={() => void clearData()}
      />
    </div>
  );
}

/* ── Connected services section ──────────────────────────────── */

function ConnectionsSection({
  draft,
  onUpdate,
}: {
  draft: SettingsState;
  onUpdate: (patch: Partial<SettingsState>) => void;
}) {
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const accounts = draft.connectedAccounts;
  const target = accounts.find((a) => a.id === disconnectId) ?? null;

  const connect = (id: string) => {
    onUpdate({
      connectedAccounts: accounts.map((account) =>
        account.id === id
          ? { ...account, connected: true, connectedAt: new Date().toISOString() }
          : account,
      ),
    });
    toast.success("Account connected.");
  };

  const disconnect = () => {
    if (!target) return;
    onUpdate({
      connectedAccounts: accounts.map((account) =>
        account.id === target.id
          ? { ...account, connected: false, connectedAt: undefined }
          : account,
      ),
    });
    setDisconnectId(null);
    toast.success(`${target.provider} disconnected.`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Connected services</CardTitle>
          <CardDescription>
            Sign in faster and import travel details from linked accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar
                  name={account.provider}
                  className="size-10 shrink-0"
                  fallbackClassName="bg-primary-light text-primary dark:bg-primary/15 dark:text-primary"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {account.provider}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.connected && account.connectedAt
                      ? `Connected ${new Date(account.connectedAt).toLocaleDateString()}`
                      : "Not connected"}
                  </p>
                </div>
              </div>
              {account.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisconnectId(account.id)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => connect(account.id)}>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setDisconnectId(null)}
        title={`Disconnect ${target?.provider ?? "account"}?`}
        description="You will no longer be able to sign in with this provider or import its data."
        confirmLabel="Disconnect"
        destructive
        onConfirm={disconnect}
      />
    </>
  );
}

/* ── Help section ────────────────────────────────────────────── */

function HelpSection() {
  const [faqOpen, setFaqOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [feedbackText, setFeedbackText] = useState("");

  const submitReport = () => {
    setReportOpen(false);
    setReportText("");
    toast.success("Thanks! Our team will look into this problem.");
  };

  const submitFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackText("");
    toast.success("Thanks for helping us improve GlobeTrotter!");
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setFaqOpen(true)}
          className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LifeBuoy className="mb-2 size-5 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Help Center</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Guides and frequently asked questions
          </p>
        </button>
        <Button
          asChild
          variant="outline"
          className="h-auto justify-start rounded-xl p-4 text-left"
        >
          <a href="mailto:support@globetrotter.app?subject=Support%20request">
            <span>
              <MessageSquare className="mb-2 block size-5 text-travel-blue" aria-hidden="true" />
              <span className="block text-sm font-semibold text-foreground">
                Contact Support
              </span>
              <span className="block text-xs text-muted-foreground">
                support@globetrotter.app
              </span>
            </span>
          </a>
        </Button>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bug className="mb-2 size-5 text-warning" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Report a Problem</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Something broken? Tell us what happened
          </p>
        </button>
        <button
          type="button"
          onClick={() => setFeedbackOpen(true)}
          className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessageSquare className="mb-2 size-5 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">Share Feedback</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ideas that would make your trips better
          </p>
        </button>
      </div>

      {/* FAQ */}
      <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Help Center · FAQ</DialogTitle>
            <DialogDescription>
              Quick answers to common questions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border px-4 py-3"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground marker:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report a Problem</DialogTitle>
            <DialogDescription>
              Describe what went wrong and where it happened.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={reportText}
            onChange={(event) => setReportText(event.target.value)}
            placeholder="e.g. The itinerary map does not load on my trip page…"
            aria-label="Problem description"
          />
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReport} disabled={reportText.trim().length < 10}>
              Send report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Feedback</DialogTitle>
            <DialogDescription>
              What should we build or improve next?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={feedbackText}
            onChange={(event) => setFeedbackText(event.target.value)}
            placeholder="I would love an offline mode for my trips…"
            aria-label="Feedback"
          />
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitFeedback}
              disabled={feedbackText.trim().length < 5}
            >
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── About section ───────────────────────────────────────────── */

function AboutDocLink({
  label,
  icon: Icon,
  title,
  children,
}: {
  label: string;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex items-center gap-3">
          <Icon className="size-5 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </span>
        <span className="text-xs text-muted-foreground">View</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>GlobeTrotter · v{APP_VERSION}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AboutSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white dark:text-primary-foreground">
            <Globe2 className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-base font-bold tracking-tight text-foreground">
              GlobeTrotter
            </p>
            <p className="text-sm text-muted-foreground">
              Version {APP_VERSION} · Web
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the application</CardTitle>
          <CardDescription>
            Plan trips, build day-by-day itineraries, track budgets and share
            journeys with a community of travelers — all in one calm, green
            workspace.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="space-y-3">
        <AboutDocLink
          label="Terms of Service"
          icon={FileText}
          title="Terms of Service"
        >
          <p>
            By using GlobeTrotter you agree to keep your account secure, respect
            other travelers in the community, and not misuse the service.
          </p>
          <p>
            This preview application stores data locally on your device and is
            provided as-is without warranties. Full terms accompany the public
            release.
          </p>
        </AboutDocLink>
        <AboutDocLink
          label="Privacy Policy"
          icon={Eye}
          title="Privacy Policy"
        >
          <p>
            Your trips, itineraries and settings are stored on this device. We
            never sell personal data. Community posts are visible per your
            privacy settings.
          </p>
        </AboutDocLink>
        <AboutDocLink
          label="Licenses"
          icon={ScrollText}
          title="Open-source licenses"
        >
          <p>
            GlobeTrotter is built with React, Vite, Tailwind CSS, Radix UI
            primitives, TanStack Query, react-hook-form, Zod and lucide icons —
            each under its own MIT/Apache license.
          </p>
        </AboutDocLink>
      </div>
    </div>
  );
}

/* ── Danger zone (inside Account tab) ────────────────────────── */

function DangerZone() {
  const navigate = useNavigate();
  const { deactivateAccount, deleteAccount, user } = useAuth();
  const [dialog, setDialog] = useState<"deactivate" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      navigate("/");
    } catch {
      toast.error("That did not work. Please try again.");
    } finally {
      setBusy(false);
      setDialog(null);
    }
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" aria-hidden="true" />
          Danger zone
        </CardTitle>
        <CardDescription>
          Irreversible actions for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Deactivate account
            </p>
            <p className="text-xs text-muted-foreground">
              Temporarily disable your profile. You can sign back in anytime.
            </p>
          </div>
          <Button variant="outline" onClick={() => setDialog("deactivate")}>
            Deactivate
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-destructive">
              Delete account
            </p>
            <p className="text-xs text-muted-foreground">
              Permanently remove {user?.email ?? "your account"} and all data.
            </p>
          </div>
          <Button
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => setDialog("delete")}
          >
            Delete
          </Button>
        </div>
      </CardContent>

      <ConfirmDialog
        open={dialog === "deactivate"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Deactivate your account?"
        description="Your profile will be hidden and you will be signed out. Signing back in reactivates it."
        confirmLabel="Deactivate account"
        destructive
        pending={busy}
        onConfirm={() => void run(deactivateAccount, "Account deactivated.")}
      />
      <ConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Delete your account?"
        description="This permanently removes your account, trips and community activity. This cannot be undone."
        confirmLabel="Delete forever"
        destructive
        pending={busy}
        onConfirm={() => void run(deleteAccount, "Your account has been deleted.")}
      />
    </Card>
  );
}

/* ── Page shell ──────────────────────────────────────────────── */

export function SettingsPage() {
  const { user, changePassword } = useAuth();
  const settingsQuery = useSettings();
  const saveMutation = useSaveSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const paramSection = searchParams.get("section");
  const validInitial = NAV_ITEMS.some((item) => item.id === paramSection)
    ? (paramSection as SectionId)
    : "account";
  const [active, setActive] = useState<SectionId>(validInitial);
  const [draft, setDraft] = useState<SettingsState | null>(null);
  const [discardTarget, setDiscardTarget] = useState<SectionId | null>(null);

  const data = settingsQuery.data ?? null;
  const dirty =
    data !== null &&
    draft !== null &&
    JSON.stringify(draft) !== JSON.stringify(data);

  useEffect(() => {
    if (settingsQuery.data) {
      setDraft(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    const current = searchParams.get("section");
    if (current !== active) {
      const next = new URLSearchParams(searchParams);
      next.set("section", active);
      setSearchParams(next, { replace: true });
    }
  }, [active, searchParams, setSearchParams]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function update(patch: Partial<SettingsState>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function setPush(patch: Partial<NotificationPreferences["push"]>) {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            notifications: {
              ...prev.notifications,
              push: { ...prev.notifications.push, ...patch },
            },
          }
        : prev,
    );
  }

  function setEmail(patch: Partial<NotificationPreferences["email"]>) {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            notifications: {
              ...prev.notifications,
              email: { ...prev.notifications.email, ...patch },
            },
          }
        : prev,
    );
  }

  const requestSection = (id: SectionId) => {
    if (id === active) return;
    if (dirty) {
      setDiscardTarget(id);
      return;
    }
    setActive(id);
  };

  const discardAndNavigate = () => {
    setDraft(data ? { ...data } : null);
    if (discardTarget) setActive(discardTarget);
    setDiscardTarget(null);
  };

  const save = () => {
    if (draft) saveMutation.mutate(draft);
  };

  const cancel = () => {
    setDraft(data ? { ...data } : null);
  };

  const renderSection = () => {
    if (!draft) return null;
    switch (active) {
      case "account":
        return (
          <>
            <AccountSection
              busy={saveMutation.isPending}
              onChangePassword={changePassword}
            />
            <DangerZone />
          </>
        );
      case "notifications":
        return (
          <NotificationsSection draft={draft} setPush={setPush} setEmail={setEmail} />
        );
      case "appearance":
        return <AppearanceSection draft={draft} onUpdate={update} />;
      case "region":
        return <RegionSection draft={draft} onUpdate={update} />;
      case "privacy":
        return <PrivacySection draft={draft} onUpdate={update} />;
      case "connections":
        return <ConnectionsSection draft={draft} onUpdate={update} />;
      case "help":
        return <HelpSection />;
      case "about":
        return <AboutSection />;
    }
  };

  if (settingsQuery.isError) {
    return (
      <AppShell>
        <ErrorState onRetry={() => void settingsQuery.refetch()} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-28">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account, appearance, privacy and regional preferences
          </p>
        </div>

        <Link
          to="/profile"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-surface-hover"
        >
          <UserAvatar
            name={user?.name ?? "Traveler"}
            src={user?.avatarUrl}
            className="size-12 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.name ?? "Traveler"}
            </p>
            <p className="truncate text-xs text-muted-foreground group-hover:text-primary">
              Edit your public profile →
            </p>
          </div>
          <UserRound
            className="size-4 shrink-0 text-muted-foreground group-hover:text-primary"
            aria-hidden="true"
          />
        </Link>

        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Desktop sidebar */}
          <nav
            aria-label="Settings sections"
            className="hidden w-56 shrink-0 space-y-1 md:block"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => requestSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary/10 font-medium text-primary dark:bg-primary/15"
                      : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile / tablet pills */}
          <nav
            aria-label="Settings sections"
            className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-selected={isActive}
                  role="tab"
                  onClick={() => requestSection(item.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-primary bg-primary text-white shadow-xs dark:text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent"
              aria-hidden="true"
            />
          </nav>

          <main className="min-w-0 flex-1 space-y-6">
            {settingsQuery.isLoading || !draft ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading settings">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-2xl border border-border p-5">
                    <Skeleton className="mb-4 h-5 w-40" />
                    {[0, 1, 2].map((j) => (
                      <Skeleton key={j} className="mb-3 h-10 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              renderSection()
            )}
          </main>
        </div>
      </div>

      {/* Sticky save bar */}
      {dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-warning-text">
              You have unsaved changes
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={cancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Save changes
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Discard unsaved changes when switching sections */}
      <ConfirmDialog
        open={discardTarget !== null}
        onOpenChange={(open) => !open && setDiscardTarget(null)}
        title="Discard unsaved changes?"
        description="Your edits in this section have not been saved yet."
        confirmLabel="Discard changes"
        destructive
        onConfirm={discardAndNavigate}
      />
    </AppShell>
  );
}
