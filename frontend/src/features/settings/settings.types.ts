export type ThemePreference = "light" | "dark" | "system";

export interface NotificationPreferences {
  push: {
    tripReminders: boolean;
    activityReminders: boolean;
    bookingUpdates: boolean;
    communityActivity: boolean;
  };
  email: {
    tripUpdates: boolean;
    recommendations: boolean;
    communityUpdates: boolean;
    productUpdates: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: "public" | "followers" | "private";
  tripVisibility: "public" | "followers" | "private";
  showInCommunity: boolean;
  allowSearchEngines: boolean;
}

export interface ConnectedAccount {
  id: string;
  provider: string;
  connected: boolean;
  connectedAt?: string;
}

export interface RegionalSettings {
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  timezone: string;
}

export interface SettingsState {
  theme: ThemePreference;
  compactMode: boolean;
  notifications: NotificationPreferences;
  regional: RegionalSettings;
  privacy: PrivacySettings;
  connectedAccounts: ConnectedAccount[];
}

export const DEFAULT_SETTINGS: SettingsState = {
  theme: "system",
  compactMode: false,
  notifications: {
    push: {
      tripReminders: true,
      activityReminders: true,
      bookingUpdates: true,
      communityActivity: true,
    },
    email: {
      tripUpdates: true,
      recommendations: true,
      communityUpdates: false,
      productUpdates: false,
    },
  },
  regional: {
    language: "en",
    currency: "USD",
    dateFormat: "MMM D, YYYY",
    timeFormat: "12h",
    timezone: "system",
  },
  privacy: {
    profileVisibility: "public",
    tripVisibility: "followers",
    showInCommunity: true,
    allowSearchEngines: false,
  },
  connectedAccounts: [
    { id: "conn_google", provider: "Google", connected: false },
    { id: "conn_facebook", provider: "Facebook", connected: false },
    { id: "conn_apple", provider: "Apple", connected: false },
  ],
};

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "हिन्दी" },
  { value: "ja", label: "日本語" },
] as const;

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "AUD", label: "AUD — Australian Dollar" },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "MMM D, YYYY", label: "Mar 28, 2026" },
  { value: "D MMMM YYYY", label: "28 March 2026" },
  { value: "MM/DD/YYYY", label: "03/28/2026" },
  { value: "DD.MM.YYYY", label: "28.03.2026" },
  { value: "YYYY-MM-DD", label: "2026-03-28" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "system", label: "Use system timezone" },
  { value: "UTC", label: "(UTC+00:00) Coordinated Universal Time" },
  { value: "America/New_York", label: "(UTC−05:00) New York" },
  { value: "America/Los_Angeles", label: "(UTC−08:00) Los Angeles" },
  { value: "Europe/London", label: "(UTC+00:00) London" },
  { value: "Europe/Berlin", label: "(UTC+01:00) Berlin" },
  { value: "Asia/Kolkata", label: "(UTC+05:30) Mumbai" },
  { value: "Asia/Tokyo", label: "(UTC+09:00) Tokyo" },
  { value: "Australia/Sydney", label: "(UTC+11:00) Sydney" },
] as const;

/** Loosely-typed stored state — older/partial blobs merge over defaults. */
export type StoredSettingsPatch = Partial<
  Omit<SettingsState, "notifications" | "regional" | "privacy">
> & {
  notifications?: {
    push?: Partial<NotificationPreferences["push"]>;
    email?: Partial<NotificationPreferences["email"]>;
  };
  regional?: Partial<SettingsState["regional"]>;
  privacy?: Partial<SettingsState["privacy"]>;
};

/** Deep-merges stored partial state over defaults for forward compatibility. */
export function mergeSettings(stored: StoredSettingsPatch): SettingsState {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    notifications: {
      push: { ...DEFAULT_SETTINGS.notifications.push, ...stored.notifications?.push },
      email: { ...DEFAULT_SETTINGS.notifications.email, ...stored.notifications?.email },
    },
    regional: { ...DEFAULT_SETTINGS.regional, ...stored.regional },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...stored.privacy },
    connectedAccounts:
      stored.connectedAccounts ?? DEFAULT_SETTINGS.connectedAccounts,
  };
}
