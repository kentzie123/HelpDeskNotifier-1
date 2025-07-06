import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Edit, Search, Trash2, PlayCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import type { TicketWithAssignee } from "@shared/schema";
import { Link } from "wouter";
import NewTicketForm from "@/components/forms/NewTicketForm";
import EditTicketForm from "@/components/forms/EditTicketForm";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export default function Tickets() {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [showEditTicketForm, setShowEditTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketWithAssignee | null>(null);
  const [deleteTicket, setDeleteTicket] = useState<TicketWithAssignee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [location] = useLocation();
  
  const { data: tickets = [], isLoading } = useQuery<TicketWithAssignee[]>({
    queryKey: ["/api/tickets"],
  });

  // Handle search from URL parameters (from top navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = searchQuery === "" || 
        ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  const handleEditTicket = (ticket: TicketWithAssignee) => {
    setEditingTicket(ticket);
    setShowEditTicketForm(true);
  };

  const { toast } = useToast();

  const deleteTicketMutation = useMutation({
    mutationFn: (ticketId: string) => apiRequest("DELETE", `/api/tickets/${ticketId}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: string }) =>
      apiRequest("PATCH", `/api/tickets/${ticketId}/status`, { status }),
    onSuccess: (_, { status }) => {
      const statusText = status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${statusText}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTicket = (ticket: TicketWithAssignee) => {
    setDeleteTicket(ticket);
  };

  const confirmDeleteTicket = () => {
    if (deleteTicket) {
      deleteTicketMutation.mutate(deleteTicket.ticketId);
      setDeleteTicket(null);
    }
  };

  const handleStatusChange = (ticketId: string, status: string) => {
    changeStatusMutation.mutate({ ticketId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Open</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">All Tickets</h2>
        <Button onClick={() => setShowNewTicketForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search tickets by ID, subject, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1 h-8 px-2"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </Button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Tickets ({filteredTickets.length})
              {searchQuery && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - Showing results for "{searchQuery}"
                </span>
              )}
            </CardTitle>
            {(searchQuery || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading tickets...</div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "No tickets found matching your search criteria." 
                  : "No tickets available."}
              </div>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      <Link href={`/tickets/${ticket.ticketId}`} className="text-blue-600 hover:underline">
                        {ticket.ticketId}
                      </Link>
                    </TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{ticket.assignee || "Unassigned"}</TableCell>
                    <TableCell>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {/* Status Change Actions */}
                        {ticket.status === "open" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(ticket.ticketId, "in-progress")}
                            disabled={changeStatusMutation.isPending}
                            title="Start Progress"
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.status === "in-progress" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(ticket.ticketId, "resolved")}
                            disabled={changeStatusMutation.isPending}
                            title="Mark Resolved"
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.status === "resolved" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(ticket.ticketId, "closed")}
                            disabled={changeStatusMutation.isPending}
                            title="Close Ticket"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {ticket.status === "closed" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStatusChange(ticket.ticketId, "open")}
                            disabled={changeStatusMutation.isPending}
                            title="Reopen Ticket"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Regular Actions */}
                        <Link href={`/tickets/${ticket.ticketId}`}>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTicket(ticket)}
                          title="Edit Ticket"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTicket(ticket)}
                          disabled={deleteTicketMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Ticket"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewTicketForm 
        open={showNewTicketForm} 
        onOpenChange={setShowNewTicketForm} 
      />

      <EditTicketForm
        ticket={editingTicket}
        open={showEditTicketForm}
        onOpenChange={(open) => {
          setShowEditTicketForm(open);
          if (!open) setEditingTicket(null);
        }}
      />

      <DeleteConfirmationModal
        open={!!deleteTicket}
        onOpenChange={() => setDeleteTicket(null)}
        onConfirm={confirmDeleteTicket}
        title="Delete Ticket"
        description="Are you sure you want to delete this support ticket? This will permanently remove the ticket and all associated data."
        itemName={deleteTicket?.ticketId}
        isLoading={deleteTicketMutation.isPending}
      />
    </div>
  );
}
