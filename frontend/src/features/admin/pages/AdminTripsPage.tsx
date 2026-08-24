import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  MapIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAdminTrips } from "../useAdmin";

export function AdminTripsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const params = {
    page,
    limit: 15,
    search,
    status: statusFilter,
    sort: sortBy,
    order: sortOrder,
  };

  const { data, isLoading, isError } = useAdminTrips(params);

  return (
    <div className="space-y-6">
      <PageHeader title="Trips" description="Browse and manage all trips" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="start_date">Start Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-lg font-medium">Failed to load trips</p>
            <p className="text-sm text-muted-foreground mt-1">
              Something went wrong while fetching trips. Please try again.
            </p>
          </CardContent>
        </Card>
      ) : !data?.trips?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <MapIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No trips found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try adjusting your search or filters."
                : "There are no trips to display yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[22%]">Trip Name</TableHead>
                        <TableHead className="w-[14%]">Owner</TableHead>
                        <TableHead className="w-[16%]">Destination</TableHead>
                        <TableHead className="w-[18%]">Dates</TableHead>
                        <TableHead className="w-[10%]">Status</TableHead>
                        <TableHead className="w-[12%]">Created</TableHead>
                        <TableHead className="text-right w-[8%]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.trips.map((trip) => (
                        <TableRow
                          key={trip.id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {trip.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {trip.ownerName}
                          </TableCell>
                          <TableCell className="capitalize">
                            {trip.destinationId?.replace(/-/g, " ")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {trip.startDate} – {trip.endDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                trip.status === "planned" ? "default" : "secondary"
                              }
                            >
                              {trip.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/trips/${trip.id}`}>
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="block md:hidden space-y-3">
            {data.trips.map((trip) => (
              <div key={trip.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{trip.name}</span>
                  <Badge variant={trip.status === "planned" ? "default" : "secondary"}>
                    {trip.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <span>{trip.ownerName}</span>
                  <span className="capitalize">{trip.destinationId?.replace(/-/g, " ")}</span>
                  <span>{trip.startDate} – {trip.endDate}</span>
                  <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/trips/${trip.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Showing{" "}
                {(data.pagination.page - 1) * data.pagination.limit + 1}–
                {Math.min(
                  data.pagination.page * data.pagination.limit,
                  data.pagination.total,
                )}{" "}
                of{" "}
                <span className="text-foreground">{data.pagination.total}</span>{" "}
                trips
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
