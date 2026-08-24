import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, FolderOpen, AlertCircle } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import {
  useAdminActivities,
  useAdminCreateActivity,
  useAdminUpdateActivity,
  useAdminDeleteActivity,
} from "../useAdmin";

interface ActFormState {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  durationHours: number;
  costInr: number;
  description: string;
  image: string;
  imageAlt: string;
}

const EMPTY_FORM: ActFormState = {
  id: "",
  name: "",
  city: "",
  country: "",
  category: "",
  durationHours: 1,
  costInr: 0,
  description: "",
  image: "",
  imageAlt: "",
};

const CATEGORIES = ["adventure", "culture", "food", "nature", "relaxation", "nightlife"];

export function AdminActivitiesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActFormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const params = { page, limit: 15, search, category: categoryFilter, sort: "name" as const, order: "asc" as const };
  const { data, isLoading, isError } = useAdminActivities(params);
  const createMutation = useAdminCreateActivity();
  const updateMutation = useAdminUpdateActivity();
  const deleteMutation = useAdminDeleteActivity();

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (act: ActFormState) => { setEditingId(act.id); setForm(act); setDialogOpen(true); };

  const handleSave = async () => {
    const payload = { ...form, durationHours: Number(form.durationHours), costInr: Number(form.costInr) };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ activityId: editingId, payload });
        toast.success("Activity updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Activity created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save activity");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Activity deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete activity");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activities"
        description="Manage activity listings"
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => { setCategoryFilter(value === "all" ? "" : value); setPage(1); }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Failed to load activities</p>
                <p className="mt-1 text-sm text-muted-foreground">Something went wrong. Please try again later.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : !data?.activities?.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FolderOpen className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">No activities found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || categoryFilter ? "Try adjusting your filters." : "Get started by adding your first activity."}
                </p>
              </div>
              {!search && !categoryFilter && (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
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
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.activities.map((act) => (
                      <TableRow key={act.id}>
                        <TableCell className="font-medium">{act.name}</TableCell>
                        <TableCell className="text-muted-foreground">{act.city}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{act.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{act.durationHours}h</TableCell>
                        <TableCell>₹{act.costInr.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(act as unknown as ActFormState)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteConfirm(act.id)}
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
              {data.activities.map((act) => (
                <div key={act.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{act.name}</span>
                    <Badge variant="secondary" className="capitalize">{act.category}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>{act.city}</span>
                    <span>{act.durationHours}h</span>
                    <span>₹{act.costInr.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(act as unknown as ActFormState)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm(act.id)}
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
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Activity" : "Create Activity"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update activity details." : "Add a new activity to the catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingId && (
              <div className="space-y-1.5">
                <Label htmlFor="act-id">ID</Label>
                <Input id="act-id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. scooper-ride" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="act-name">Name</Label>
              <Input id="act-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="act-city">City</Label>
                <Input id="act-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-country">Country</Label>
                <Input id="act-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="act-cat">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger id="act-cat">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-dur">Duration (hours)</Label>
                <Input id="act-dur" type="number" min="0" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="act-cost">Cost (INR)</Label>
                <Input id="act-cost" type="number" min="0" value={form.costInr} onChange={(e) => setForm({ ...form, costInr: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-img">Image URL</Label>
                <Input id="act-img" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-alt">Image Alt</Label>
              <Input id="act-alt" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-desc">Description</Label>
              <Textarea id="act-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={createMutation.isPending || updateMutation.isPending} onClick={handleSave}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
