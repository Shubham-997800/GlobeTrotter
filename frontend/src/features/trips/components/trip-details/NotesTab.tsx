import { useMemo } from "react";
import { FileText, FolderLock, Link2, MapPin, Share2, StickyNote } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/features/dashboard/components/States";

import { describeDate } from "@/features/trips/itinerary.utils";
import type { ItineraryRecord } from "@/features/trips/itinerary.types";
import type { TripRecord } from "@/features/trips/trips.types";

interface NotesTabProps {
  trip: TripRecord;
  itinerary: ItineraryRecord | null | undefined;
}

export function NotesTab({ trip, itinerary }: NotesTabProps) {
  const dayNotes = useMemo(() => {
    if (!itinerary?.days.length) return [];
    return itinerary.days
      .filter((day) => day.notes && day.notes.trim())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        day,
        notes: day.notes!,
      }));
  }, [itinerary]);

  return (
    <section aria-label="Notes" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="h-4 w-4 text-primary" aria-hidden="true" />
            Trip description
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trip.description ? (
            <div className="prose prose-sm max-w-none text-foreground">
              <p className="whitespace-pre-wrap">{trip.description}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground/50" aria-hidden="true" />
              <p className="mt-3 text-muted-foreground">No description yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a description when editing the trip to remember the vision.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {dayNotes.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              Day notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dayNotes.map(({ day, notes }, idx) => (
                <DayNoteCard key={day.id} day={day} notes={notes} dayIndex={idx} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" aria-hidden="true" />
            <p className="mt-3 text-muted-foreground">No day notes yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add notes to specific days in the itinerary builder.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-info/30 bg-info/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderLock className="h-4 w-4 text-info" aria-hidden="true" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FolderLock}
            title="Document storage not available"
            description="Attaching PDFs, images, tickets, and confirmations to trips is not wired yet. When implemented, documents will appear here with per-day and trip-level organization."
          />
        </CardContent>
      </Card>

      <Card className="border-info/30 bg-info/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4 text-info" aria-hidden="true" />
            Share settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Link2}
            title="Collaborative sharing not configured"
            description="Granular permissions (view-only, comment, edit), invite links with expiry, and activity notifications are not implemented. For now, use the 'Copy link' action in the trip header to share a read-only preview of this itinerary."
          />
        </CardContent>
      </Card>
    </section>
  );
}

function DayNoteCard({
  day,
  notes,
  dayIndex,
}: {
  day: ItineraryRecord["days"][0];
  notes: string;
  dayIndex: number;
}) {
  const dateInfo = describeDate(day.date);
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              Day {dayIndex + 1}
            </span>
          </div>
          <div>
            <p className="font-medium text-foreground truncate max-w-md">
              Day {dayIndex + 1}
            </p>
            <p className="text-sm text-muted-foreground">
              {dateInfo?.shortDate ?? day.date}
            </p>
          </div>
        </div>
        <Badge variant="outline">
          <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
          Day {dayIndex + 1}
        </Badge>
      </div>
      <div className="mt-3 prose prose-sm max-w-none text-foreground">
        <p className="whitespace-pre-wrap">{notes}</p>
      </div>
    </div>
  );
}