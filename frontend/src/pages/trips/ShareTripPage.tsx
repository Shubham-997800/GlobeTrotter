import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Globe, Link2, Lock, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/features/dashboard/components/States";
import { useTrip } from "@/features/trips/useItinerary";

type Visibility = "private" | "link" | "public";

const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { value: "private", label: "Private", description: "Only you can view this trip", icon: <Lock className="h-4 w-4" /> },
  { value: "link", label: "Anyone with link", description: "Anyone with the link can view", icon: <Link2 className="h-4 w-4" /> },
  { value: "public", label: "Public", description: "Listed publicly in the community", icon: <Globe className="h-4 w-4" /> },
];

export function ShareTripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const tripQuery = useTrip(tripId);
  const trip = tripQuery.data;

  const [visibility, setVisibility] = useState<Visibility>("link");
  const link = `https://globetrotter.app/share/${tripId ?? "trip"}`;
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<
    { name: string; email: string; role: "viewer" | "editor" }[]
  >([{ name: "You", email: "you@globetrotter.app", role: "editor" }]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const invite = () => {
    if (!email.trim()) return;
    setMembers((prev) => [
      ...prev,
      { name: email.split("@")[0], email: email.trim(), role: "viewer" },
    ]);
    setEmail("");
    toast.success("Invite sent");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-1 -ml-2 text-muted-foreground"
          asChild
        >
          <Link to={trip ? `/trips/${trip.id}` : "/trips"}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to trip
          </Link>
        </Button>

        {tripQuery.isError ? (
          <ErrorState
            title="Trip not found"
            description="This trip may have been deleted."
            onRetry={() => void tripQuery.refetch()}
          />
        ) : null}

        {tripQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : trip ? (
          <>
            <Card className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Sharing settings</h2>
                <p className="text-sm text-muted-foreground">
                  Choose who can see and edit "{trip.name}".
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisibility(opt.value)}
                    className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors ${
                      visibility === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-subtle-border hover:border-strong-border"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {opt.icon}
                    </span>
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Share link</h2>
                <p className="text-sm text-muted-foreground">
                  Anyone with this link can view the trip.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={link} readOnly onChange={() => {}} />
                <Button onClick={copyLink} className="shrink-0">
                  <Copy className="mr-1.5 h-4 w-4" /> Copy link
                </Button>
              </div>
            </Card>

            <Card className="space-y-4 p-5">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Invite people</h2>
                <p className="text-sm text-muted-foreground">
                  Send an invite by email to collaborate.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <Label htmlFor="invite-email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="friend@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && invite()}
                  />
                </div>
                <Button variant="outline" onClick={invite} className="shrink-0">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Send invite
                </Button>
              </div>

              {members.length > 0 ? (
                <div className="space-y-2 pt-2">
                  {members.map((m) => (
                    <div
                      key={m.email}
                      className="flex items-center justify-between rounded-lg border border-subtle-border px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {m.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                          {m.role}
                        </span>
                        {m.email !== "you@globetrotter.app" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setMembers((prev) =>
                                prev.filter((x) => x.email !== m.email),
                              )
                            }
                            aria-label={`Remove ${m.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

export default ShareTripPage;
