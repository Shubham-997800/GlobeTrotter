import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Shield, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <h1 className="text-2xl font-bold tracking-tight">User Management</h1>

      {/* Filters */}
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
          <SelectTrigger className="w-[140px]">
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-destructive">Failed to load users.</div>
          ) : !data?.users?.length ? (
            <div className="p-6 text-center text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
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
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{" "}
            {data.pagination.total} users
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

      {/* Role change confirmation dialog */}
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
