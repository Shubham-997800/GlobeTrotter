import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Star } from "lucide-react";

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
  const { data, isLoading, isError } = useAdminDestinations(params);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Destination Management</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add Destination
        </Button>
      </div>

      {/* Filters */}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-destructive">Failed to load destinations.</div>
          ) : !data?.destinations?.length ? (
            <div className="p-6 text-center text-muted-foreground">No destinations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Daily Cost</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.destinations.map((dest) => (
                    <TableRow key={dest.id}>
                      <TableCell className="font-medium">{dest.city}</TableCell>
                      <TableCell className="text-muted-foreground">{dest.country}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning-text text-warning-text" />
                          {dest.rating.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{dest.reviews}</TableCell>
                      <TableCell>₹{dest.estimatedDailyCostInr.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {dest.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {dest.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{dest.tags.length - 3}
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
                            onClick={() => openEdit(dest as unknown as DestFormState)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
            {data.pagination.total} destinations
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {data.pagination.page} of {data.pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
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
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dest-image">Image URL</Label>
                <Input id="dest-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dest-alt">Image Alt</Label>
                <Input id="dest-alt" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
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

      {/* Delete confirmation */}
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
