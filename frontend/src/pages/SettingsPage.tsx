import { useState } from "react";
import { Palette, Monitor, Globe, Bell, Trash2, Download, Shield, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/features/auth/useAuth";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export function SettingsPage() {
  const { user } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [autoSave, setAutoSave] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [crashReporting, setCrashReporting] = useState(false);

  const handleDangerousAction = (action: string) => {
    if (confirm(`Are you sure you want to ${action}? This action cannot be undone.`)) {
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} initiated`);
    }
  };

  return (
    <AppShell
      crumbs={[{ label: "Home", to: "/dashboard" }, { label: "Settings" }]}
      title="Settings"
      description="Configure your GlobeTrotter experience."
    >
      <div className="space-y-8">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data & Privacy</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-5" />
                  Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <p className="font-medium">Color scheme</p>
                  <p className="text-sm text-muted-foreground">Choose how GlobeTrotter looks on your device</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: "light", label: "Light", icon: <Monitor className="size-4" /> },
                    { value: "dark", label: "Dark", icon: <Monitor className="size-4" /> },
                    { value: "system", label: "System", icon: <Globe className="size-4" /> },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={resolvedTheme === option.value ? "default" : "outline"}
                      className="h-20 flex-col gap-2"
                      onClick={() => setTheme(option.value)}
                    >
                      {option.icon}
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.value === "system" ? "Matches OS setting" : `${option.value.charAt(0).toUpperCase() + option.value.slice(1)} mode`}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="size-5" />
                  Language
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <p className="font-medium">Interface language</p>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="size-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "email-notifications", label: "Email notifications", description: "Receive important updates via email" },
                  { id: "push-notifications", label: "Push notifications", description: "Get browser notifications for trips and activities" },
                  { id: "trip-reminders", label: "Trip reminders", description: "Get notified before your trips start" },
                  { id: "budget-alerts", label: "Budget alerts", description: "Warnings when approaching budget limits" },
                  { id: "community-updates", label: "Community updates", description: "New followers, comments, and shares" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch id={item.id} defaultChecked={item.id !== "community-updates"} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto-save & Sync</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Auto-save drafts</p>
                    <p className="text-sm text-muted-foreground">Automatically save trip drafts as you type</p>
                  </div>
                  <Switch defaultChecked={autoSave} onCheckedChange={setAutoSave} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Sync across devices</p>
                    <p className="text-sm text-muted-foreground">Keep your trips synced when signed in</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="size-5" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <p className="font-medium">Export your data</p>
                  <p className="text-sm text-muted-foreground">Download a copy of all your trips, activities, and preferences</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => toast.info("Exporting JSON - coming soon")}>
                    <Download className="size-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" onClick={() => toast.info("Exporting CSV - coming soon")}>
                    <Download className="size-4 mr-2" />
                    Export as CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="size-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <p className="font-medium text-destructive">Delete account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data</p>
                </div>
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleDangerousAction("delete your account")}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Privacy & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Usage analytics</p>
                    <p className="text-sm text-muted-foreground">Help improve GlobeTrotter with anonymous usage data</p>
                  </div>
                  <Switch defaultChecked={analytics} onCheckedChange={setAnalytics} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">Crash reporting</p>
                    <p className="text-sm text-muted-foreground">Automatically send crash reports to help fix issues</p>
                  </div>
                  <Switch defaultChecked={crashReporting} onCheckedChange={setCrashReporting} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5" />
                  Team & Collaboration (Admin)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <p className="font-medium">Workspace settings</p>
                  <p className="text-sm text-muted-foreground">Manage team members, roles, and workspace preferences</p>
                </div>
                {user?.role === "admin" ? (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => toast.info("Team management - coming soon")}>
                      <UserPlus className="size-4 mr-2" />
                      Invite members
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/admin")}>
                      <Shield className="size-4 mr-2" />
                      Admin console
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Contact your workspace administrator for team settings.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>GlobeTrotter v0.0.0</p>
                <p>Personalized travel planning platform</p>
                <p className="pt-2">
                  <Link to="/#terms" className="underline hover:text-foreground">Terms of Service</Link> ·
                  <Link to="/#privacy" className="underline hover:text-foreground ml-2">Privacy Policy</Link> ·
                  <Link to="/#contact" className="underline hover:text-foreground ml-2">Contact Support</Link>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}