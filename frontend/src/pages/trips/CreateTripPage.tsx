import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MapPin,
  Sparkles,
  Ticket,
  Wallet,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/layout/AppShell";
import { CoverImageUpload } from "@/features/trips/components/CoverImageUpload";
import { DestinationSearch } from "@/features/trips/components/DestinationSearch";
import { DraftStatus } from "@/features/trips/components/DraftStatus";
import { BudgetSetup } from "@/features/trips/components/BudgetSetup";
import { InterestSelector } from "@/features/trips/components/InterestSelector";
import { SectionCard } from "@/features/trips/components/SectionCard";
import { SuggestedActivities } from "@/features/trips/components/SuggestedActivities";
import { SuggestedDestinations } from "@/features/trips/components/SuggestedDestinations";
import { TripActionBar } from "@/features/trips/components/TripActionBar";
import { TripPreview } from "@/features/trips/components/TripPreview";
import { TravelDates } from "@/features/trips/components/TravelDates";
import {
  TRIP_DESCRIPTION_MAX,
  TRIP_NAME_MAX,
  createTripSchema,
  emptyTripDraft,
  type TripFormValues,
} from "@/features/trips/schemas/create-trip.schema";
import { destinations, activities } from "@/features/trips/trips.data";
import type {
  ActivitySuggestion,
  BudgetTierDef,
  Destination,
  InterestId,
  TripRecord,
} from "@/features/trips/trips.types";
import {
  estimateSpendingInr,
  tripDuration,
} from "@/features/trips/trips.utils";
import { budgetTier, interestLabel } from "@/features/trips/trips.data";
import { tripsService } from "@/features/trips/trips.service";
import { useCreateTrip, useSaveDraft, useUpdateTrip } from "@/features/trips/useTrips";
import { useDraftAutosave } from "@/features/trips/useDraftAutosave";

function readInitialValues(): TripFormValues {
  const restored = tripsService.readActiveDraft();
  // Merge over defaults so older/partial drafts never break the form.
  return { ...emptyTripDraft(), ...restored };
}

/** Maps a persisted record back into the form shape (edit mode). */
function recordToFormValues(record: TripRecord): TripFormValues {
  return {
    name: record.name,
    description: record.description ?? "",
    coverImage: record.coverImage ?? "",
    startDate: record.startDate,
    endDate: record.endDate,
    destinationId: record.destinationId,
    interests: record.interests,
    budgetTier: record.budgetTier,
    currency: record.currency,
    budgetAmount: String(record.budgetAmount),
  };
}

export function CreateTripPage() {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const isEdit = Boolean(tripId);
  const existingTrip = tripsService.readTripById(tripId ?? "");
  const createTrip = useCreateTrip();
  const saveDraft = useSaveDraft();
  const updateTrip = useUpdateTrip();

  /* ── Form ─────────────────────────────────────────────────── */
  const form = useForm<TripFormValues>({
    resolver: zodResolver(createTripSchema("create")) as never,
    defaultValues: isEdit && existingTrip ? recordToFormValues(existingTrip) : readInitialValues(),
    mode: "onTouched",
  });
  const { register, handleSubmit, setValue, watch, formState } = form;
  const errors = formState.errors;

  const values = watch();

  /* ── Dirty tracking (drives autosave + guards) ────────────── */
  const [dirtyToken, setDirtyToken] = useState(0);
  useEffect(() => {
    // oxlint-disable-next-line react/incompatible-library -- RHF watch() intentionally returns a fresh function per render.
    const subscription = watch(() => setDirtyToken((token) => token + 1));
    return () => subscription.unsubscribe();
  }, [watch]);

  const [addedActivities, setAddedActivities] = useState<ActivitySuggestion[]>(() =>
    isEdit && existingTrip
      ? (existingTrip.activityIds ?? [])
          .map((id) => activities.find((activity) => activity.id === id))
          .filter((activity): activity is ActivitySuggestion => Boolean(activity))
      : [],
  );
  const touchedBeyondForm = addedActivities.length > 0;
  const hasUnsavedWork = dirtyToken > 0 || touchedBeyondForm;

  const { draftState, savedAt, markSavedNow, clearLocalDraft } =
    useDraftAutosave({ values, dirtyToken, enabled: !isEdit });

  /* Warn before leaving with unsaved work (refresh / close). */
  useEffect(() => {
    if (!hasUnsavedWork) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedWork]);

  /* Unknown trip id → back to My Trips instead of a dead form. */
  useEffect(() => {
    if (isEdit && !existingTrip) {
      toast.error("That trip doesn't exist anymore.");
      navigate("/trips", { replace: true });
    }
  }, [isEdit, existingTrip, navigate]);

  /* ── Derived preview data ─────────────────────────────────── */
  const selectedDestination = useMemo<Destination | null>(
    () =>
      values.destinationId
        ? destinations.find((d) => d.id === values.destinationId) ?? null
        : null,
    [values.destinationId],
  );
  const duration = tripDuration(values.startDate, values.endDate);
  const tier = budgetTier(values.budgetTier);
  const estimateInr =
    selectedDestination && duration
      ? estimateSpendingInr({ destination: selectedDestination, duration, tier })
      : null;

  /* ── Handlers ─────────────────────────────────────────────── */
  const toggleInterest = (interest: InterestId) => {
    const current = values.interests;
    setValue(
      "interests",
      current.includes(interest)
        ? current.filter((id) => id !== interest)
        : [...current, interest],
      { shouldValidate: true },
    );
  };

  const selectDestination = (destination: Destination | null) => {
    setValue("destinationId", destination?.id ?? "", { shouldValidate: true });
  };

  const onActivityAdd = (activity: ActivitySuggestion) => {
    setAddedActivities((current) =>
      current.some((item) => item.id === activity.id)
        ? current
        : [...current, activity],
    );
    toast.success(`${activity.name} added to your trip`);
  };

  const removeActivity = (activityId: string) => {
    setAddedActivities((current) =>
      current.filter((item) => item.id !== activityId),
    );
  };

  /* ── Save as Draft (name-only validation, create mode only) ─ */
  const handleSaveDraft = async () => {
    if (isEdit) return;
    const parsed = createTripSchema("draft").safeParse(values);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      toast.error(firstIssue?.message ?? "Add a trip name to save a draft.");
      document.getElementById("trip-name")?.focus();
      return;
    }
    try {
      await saveDraft.mutateAsync({
        values: parsed.data as TripFormValues,
        activityIds: addedActivities.map((activity) => activity.id),
      });
      clearLocalDraft();
      markSavedNow();
      toast.success("Trip saved as draft", {
        description: "Find it under My Trips whenever you're ready.",
      });
    } catch {
      toast.error("Couldn't save the draft. Please try again.");
    }
  };

  /* ── Create / Update (full validation via resolver) ───────── */
  const onValid = async (data: TripFormValues) => {
    const activityIds = addedActivities.map((activity) => activity.id);
    try {
      if (isEdit && tripId) {
        const trip = await updateTrip.mutateAsync({ tripId, values: data, activityIds });
        toast.success("Trip updated!", {
          description: `${trip.name} — all changes saved.`,
        });
        navigate("/trips");
        return;
      }
      const trip = await createTrip.mutateAsync({
        values: data,
        activityIds,
      });
      clearLocalDraft();
      toast.success("Trip created!", {
        description: `${trip.name} is ready — let's build the itinerary.`,
      });
      navigate(`/trips/${trip.id}/itinerary`);
    } catch {
      toast.error("Couldn't create the trip. Please try again.");
    }
  };

  const onInvalid = useCallback(() => {
    toast.error("Please fix the highlighted fields and try again.");
    // Move keyboard focus to the first offending control.
    requestAnimationFrame(() => {
      const invalid = document.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      invalid?.focus();
      invalid?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  /* ── Cancel guard ─────────────────────────────────────────── */
  const [cancelOpen, setCancelOpen] = useState(false);
  const requestCancel = () => {
    if (hasUnsavedWork) setCancelOpen(true);
    else navigate("/trips");
  };
  const confirmCancel = () => {
    setCancelOpen(false);
    clearLocalDraft();
    navigate("/trips");
  };

  const busy = createTrip.isPending || updateTrip.isPending || saveDraft.isPending;

  return (
    <AppShell
      title={isEdit ? "Edit Trip" : "Create a New Trip"}
      description={isEdit
        ? "Adjust the details and save when you're ready."
        : "Plan smarter — pick a destination, dates and budget, then let GlobeTrotter scaffold your itinerary."}
      actions={
        <>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link to="/trips">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to My Trips
            </Link>
          </Button>
          {!isEdit && (
            <DraftStatus
              state={draftState}
              savedAt={savedAt}
              className="hidden sm:inline-flex"
            />
          )}
        </>
      }
    >
      <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          {/* ── Sections ─────────────────────────────────────── */}
          <div className="min-w-0 space-y-5">
            <SectionCard
              icon={<MapPin />}
              title="Basic Details"
              description="Name your adventure and set the scene."
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="trip-name">
                    Trip name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="trip-name"
                    placeholder="e.g. Japan Cherry Blossom Escape"
                    maxLength={TRIP_NAME_MAX}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby="trip-name-count"
                    {...register("name")}
                  />
                  <p
                    id="trip-name-count"
                    className="text-right text-xs text-muted-foreground"
                  >
                    {values.name.length}/{TRIP_NAME_MAX}
                  </p>
                  {errors.name ? (
                    <p role="alert" className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="trip-description">Description</Label>
                  <Textarea
                    id="trip-description"
                    rows={3}
                    placeholder="What makes this trip special?"
                    maxLength={TRIP_DESCRIPTION_MAX}
                    aria-invalid={Boolean(errors.description)}
                    {...register("description")}
                  />
                  {errors.description ? (
                    <p role="alert" className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <Label>Cover photo</Label>
                  <CoverImageUpload
                    value={values.coverImage}
                    onChange={(dataUrl) => setValue("coverImage", dataUrl)}
                    disabled={busy}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<CalendarDays />}
              title="Travel Dates"
              description="We'll calculate nights and pace suggestions automatically."
            >
              <TravelDates
                startDate={values.startDate}
                endDate={values.endDate}
                onStartDateChange={(value) =>
                  setValue("startDate", value, { shouldValidate: true })
                }
                onEndDateChange={(value) =>
                  setValue("endDate", value, { shouldValidate: true })
                }
                errors={{
                  startDate: errors.startDate?.message,
                  endDate: errors.endDate?.message,
                }}
              />
            </SectionCard>

            <SectionCard
              icon={<MapPin />}
              title="Destination"
              description="Search our curated catalog or pick from suggestions below."
            >
              <div className="space-y-6">
                <DestinationSearch
                  selected={selectedDestination}
                  onSelect={selectDestination}
                  onClear={() => selectDestination(null)}
                  error={errors.destinationId?.message}
                />
                <SuggestedDestinations
                  interests={values.interests}
                  selectedId={values.destinationId}
                  onSelect={selectDestination}
                />
              </div>
            </SectionCard>

            <SectionCard
              icon={<Sparkles />}
              title="Interests"
              description="Tell us what you love — recommendations adapt instantly."
            >
              <InterestSelector
                selected={values.interests}
                onToggle={toggleInterest}
              />
            </SectionCard>

            <SectionCard
              icon={<Wallet />}
              title="Budget"
              description="Choose a travel style and set your total."
            >
              <BudgetSetup
                tier={values.budgetTier}
                currency={values.currency}
                amount={values.budgetAmount}
                estimateInr={estimateInr}
                durationDays={duration?.days ?? null}
                error={errors.budgetAmount?.message}
                onTierChange={(next: BudgetTierDef["id"]) =>
                  setValue("budgetTier", next, { shouldValidate: true })
                }
                onCurrencyChange={(code) =>
                  setValue("currency", code, { shouldValidate: true })
                }
                onAmountChange={(amount) =>
                  setValue("budgetAmount", amount, { shouldValidate: true })
                }
              />
            </SectionCard>

            <SectionCard
              icon={<Ticket />}
              title="Activities"
              description="Browse ideas and add what excites you — day-wise scheduling comes next."
            >
              <div className="space-y-4">
                <SuggestedActivities
                  addedIds={addedActivities.map((activity) => activity.id)}
                  onAdd={onActivityAdd}
                />

                {/* Added list */}
                {addedActivities.length > 0 ? (
                  <ul
                    aria-label="Activities added to this trip"
                    className="flex flex-wrap gap-2"
                  >
                    {addedActivities.map((activity) => (
                      <li key={activity.id}>
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-1 text-sm font-medium text-foreground">
                          {activity.name}
                          <button
                            type="button"
                            onClick={() => removeActivity(activity.id)}
                            aria-label={`Remove ${activity.name}`}
                            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <X className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-strong-border p-4 text-center text-sm text-muted-foreground">
                    Nothing added yet — tap “Add to Trip” on any idea above.
                    {" "}
                    {values.interests.length > 0 ? (
                      <>We're prioritizing{" "}
                        <span className="font-medium text-foreground">
                          {values.interests.map(interestLabel).slice(0, 3).join(", ")}
                        </span>{" "}
                        for you.
                      </>
                    ) : null}
                  </p>
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── Live preview ─────────────────────────────────── */}
          <div className="lg:relative">
            <TripPreview
              values={values}
              destination={selectedDestination}
              activities={addedActivities}
            />
          </div>
        </div>

        <TripActionBar
          onCancel={requestCancel}
          onSaveDraft={() => void handleSaveDraft()}
          savingDraft={saveDraft.isPending}
          creating={createTrip.isPending || updateTrip.isPending}
          draftState={draftState}
          mode={isEdit ? "edit" : "create"}
        />
      </form>

      {/* ── Cancel confirmation ──────────────────────────────── */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discard this trip?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Your local draft will be removed and
              this trip won't be created.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep editing
            </Button>
            <Button
              variant="default"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmCancel}
            >
              Discard trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full-page busy overlay while creating/updating */}
      {(createTrip.isPending || updateTrip.isPending) ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {isEdit ? "Saving changes…" : "Creating your trip…"}
          </p>
        </div>
      ) : null}
    </AppShell>
  );
}

/* Re-export keeps the route file imports shallow. */
export default CreateTripPage;
