import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, UserCheck, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import NewUserForm from "@/components/forms/NewUserForm";
import EditUserForm from "@/components/forms/EditUserForm";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export default function Users() {
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setEditUser(user);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUser(user);
  };

  const confirmDeleteUser = () => {
    if (deleteUser) {
      deleteUserMutation.mutate(deleteUser.id);
      setDeleteUser(null);
    }
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    return filtered;
  }, [users, searchTerm, roleFilter]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrator":
        return <Badge variant="destructive" className="dark:bg-red-600 dark:text-white">Administrator</Badge>;
      case "manager":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-600 dark:text-white">Manager</Badge>;
      case "agent":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white">Agent</Badge>;
      case "customer":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-600 dark:text-white">Customer</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setShowNewUserForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === "agent").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold text-foreground">
                  {users.filter(u => u.role === "customer").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-mono">{user.username}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user)}
                          disabled={deleteUserMutation.isPending}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm || roleFilter !== "all" 
                      ? "No users found matching your criteria" 
                      : "No users found"
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NewUserForm 
        open={showNewUserForm} 
        onOpenChange={setShowNewUserForm} 
      />

      <EditUserForm 
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      />

      <DeleteConfirmationModal
        open={!!deleteUser}
        onOpenChange={() => setDeleteUser(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This will permanently remove the user account and all associated data."
        itemName={deleteUser?.fullName}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
