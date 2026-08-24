import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Star, MapPin, AlertTriangle, Globe } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useAdminDestinations,
  useAdminCreateDestination,
  useAdminUpdateDestination,
  useAdminDeleteDestination,
} from "../useAdmin";

interface DestFormState {
  id: string;
  city: string;
  country: string;
  description: string;
  image: string;
  imageAlt: string;
  rating: number;
  reviews: number;
  estimatedDailyCostInr: number;
  tags: string;
}

const EMPTY_FORM: DestFormState = {
  id: "",
  city: "",
  country: "",
  description: "",
  image: "",
  imageAlt: "",
  rating: 0,
  reviews: 0,
  estimatedDailyCostInr: 0,
  tags: "",
};

export function AdminDestinationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("city");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DestFormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const params = { page, limit: 15, search, sort: sortBy, order: sortOrder };
  const { data, isLoading, isError, refetch } = useAdminDestinations(params);
  const createMutation = useAdminCreateDestination();
  const updateMutation = useAdminUpdateDestination();
  const deleteMutation = useAdminDeleteDestination();

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (dest: DestFormState) => {
    setEditingId(dest.id);
    setForm({ ...dest, tags: dest.tags?.join(", ") || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      rating: Number(form.rating),
      reviews: Number(form.reviews),
      estimatedDailyCostInr: Number(form.estimatedDailyCostInr),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ destId: editingId, payload });
        toast.success("Destination updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Destination created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save destination");
    }
  };

  const handleDelete = async (destId: string) => {
    try {
      await deleteMutation.mutateAsync(destId);
      toast.success("Destination deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete destination");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        description="Manage the destination catalog"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add Destination
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="city">City</SelectItem>
            <SelectItem value="country">Country</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="estimatedDailyCostInr">Cost</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Failed to load destinations</p>
                <p className="text-sm text-muted-foreground">
                  Something went wrong while fetching the destination catalog.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : !data?.destinations?.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Globe className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No destinations found</p>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "Try adjusting your search terms."
                    : "Get started by adding your first destination."}
                </p>
              </div>
              {!search && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Destination
                </Button>
              )}
            </div>
          ) : (
            <>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">City</TableHead>
                      <TableHead className="w-[160px]">Country</TableHead>
                      <TableHead className="w-[100px]">Rating</TableHead>
                      <TableHead className="w-[100px]">Reviews</TableHead>
                      <TableHead className="w-[120px]">Daily Cost</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.destinations.map((dest) => (
                      <TableRow
                        key={dest.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                            {dest.city}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {dest.country}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {dest.rating.toFixed(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {dest.reviews.toLocaleString()}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          ₹{dest.estimatedDailyCostInr.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {dest.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {dest.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{dest.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Edit"
                              onClick={() => openEdit(dest as unknown as DestFormState)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              aria-label="Delete"
                              onClick={() => setDeleteConfirm(dest.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="block md:hidden space-y-3">
              {data.destinations.map((dest) => (
                <div key={dest.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dest.city}</span>
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {dest.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>{dest.country}</span>
                    <span>₹{dest.estimatedDailyCostInr.toLocaleString()}/day</span>
                    <span>{dest.reviews.toLocaleString()} reviews</span>
                    <div className="flex flex-wrap gap-1">
                      {dest.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {dest.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{dest.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(dest as unknown as DestFormState)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(dest.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
            {data.pagination.total} destinations
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
            <span className="text-sm">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Destination" : "Create Destination"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update destination details." : "Add a new destination to the catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingId && (
              <div className="space-y-1.5">
                <Label htmlFor="dest-id">ID</Label>
                <Input id="dest-id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. rome" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dest-city">City</Label>
                <Input id="dest-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dest-country">Country</Label>
                <Input id="dest-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dest-desc">Description</Label>
              <Textarea id="dest-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dest-image">Image URL</Label>
                <Input id="dest-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dest-alt">Image Alt</Label>
                <Input id="dest-alt" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dest-rating">Rating</Label>
                <Input id="dest-rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dest-reviews">Reviews</Label>
                <Input id="dest-reviews" type="number" min="0" value={form.reviews} onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dest-cost">Daily Cost (INR)</Label>
                <Input id="dest-cost" type="number" min="0" value={form.estimatedDailyCostInr} onChange={(e) => setForm({ ...form, estimatedDailyCostInr: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dest-tags">Tags (comma-separated)</Label>
              <Input id="dest-tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. adventure, nature, mountains" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={handleSave}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Destination</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this destination? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
