import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Shield, ShieldOff, Users, AlertTriangle } from "lucide-react";

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
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { useAdminUsers, useAdminUpdateUserRole } from "../useAdmin";

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [confirmRoleUser, setConfirmRoleUser] = useState<{ id: string; name: string; currentRole: string } | null>(null);

  const params = {
    page,
    limit: 15,
    search,
    role: roleFilter,
    sort: sortBy,
    order: sortOrder,
  };

  const { data, isLoading, isError } = useAdminUsers(params);
  const updateRole = useAdminUpdateUserRole();

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setConfirmRoleUser(null);
    } catch {
      toast.error("Failed to update user role");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts and roles" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date joined</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="role">Role</SelectItem>
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
        </CardContent>
      </Card>

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
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Failed to load users</p>
                <p className="mt-1 text-sm text-muted-foreground">Something went wrong while fetching user data. Please try again.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : !data?.users?.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-muted p-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">No users found</p>
                <p className="mt-1 text-sm text-muted-foreground">No users match your current filters. Try adjusting your search or filters.</p>
              </div>
            </div>
          ) : (
            <>
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[28%]">User</TableHead>
                      <TableHead className="w-[22%]">Email</TableHead>
                      <TableHead className="w-[12%]">Role</TableHead>
                      <TableHead className="w-[16%]">Location</TableHead>
                      <TableHead className="w-[12%]">Joined</TableHead>
                      <TableHead className="w-[10%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.users.map((user) => (
                      <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span className="truncate max-w-[150px]">{user.name || "Unnamed"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground truncate max-w-[200px]">
                          {user.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {[user.city, user.country].filter(Boolean).join(", ") || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmRoleUser({
                                id: user.id,
                                name: user.name || "Unnamed",
                                currentRole: user.role,
                              })
                            }
                          >
                            {user.role === "admin" ? (
                              <ShieldOff className="h-4 w-4 mr-1" />
                            ) : (
                              <Shield className="h-4 w-4 mr-1" />
                            )}
                            {user.role === "admin" ? "Demote" : "Promote"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="block md:hidden space-y-3">
              {data.users.map((user) => (
                <div key={user.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <span className="font-medium">{user.name || "Unnamed"}</span>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>{user.email || "—"}</span>
                    <span>{[user.city, user.country].filter(Boolean).join(", ") || "—"}</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setConfirmRoleUser({
                          id: user.id,
                          name: user.name || "Unnamed",
                          currentRole: user.role,
                        })
                      }
                    >
                      {user.role === "admin" ? (
                        <ShieldOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Shield className="h-4 w-4 mr-1" />
                      )}
                      {user.role === "admin" ? "Demote" : "Promote"}
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
            Showing <span className="font-medium text-foreground">
              {(data.pagination.page - 1) * data.pagination.limit + 1}–{Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)}
            </span> of <span className="font-medium text-foreground">{data.pagination.total}</span> users
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
            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{data.pagination.page}</span> of <span className="font-medium text-foreground">{data.pagination.totalPages}</span>
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

      <Dialog open={!!confirmRoleUser} onOpenChange={() => setConfirmRoleUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmRoleUser?.currentRole === "admin" ? "demote" : "promote"}{" "}
              <strong>{confirmRoleUser?.name}</strong>?
              {confirmRoleUser?.currentRole === "admin" && (
                <span className="block mt-1 text-destructive font-medium">
                  This will remove their admin privileges.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRoleUser(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmRoleUser?.currentRole === "admin" ? "destructive" : "default"}
              disabled={updateRole.isPending}
              onClick={() => {
                if (confirmRoleUser) {
                  handleRoleChange(
                    confirmRoleUser.id,
                    confirmRoleUser.currentRole === "admin" ? "user" : "admin",
                  );
                }
              }}
            >
              {updateRole.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
