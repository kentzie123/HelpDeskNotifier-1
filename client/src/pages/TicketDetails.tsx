import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Edit, MessageCircle, Clock, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TicketWithAssignee } from "@shared/schema";
import { Link, useLocation } from "wouter";
import EditTicketForm from "@/components/forms/EditTicketForm";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

export default function TicketDetails() {
  const [match, params] = useRoute("/tickets/:id");
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [, setLocation] = useLocation();
  const ticketId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery<TicketWithAssignee>({
    queryKey: [`/api/tickets/${ticketId}`],
    enabled: !!ticketId,
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ ticketId, updates }: { ticketId: string; updates: Partial<TicketWithAssignee> }) => 
      apiRequest("PUT", `/api/tickets/${ticketId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (ticketId) {
      updateTicketMutation.mutate({
        ticketId,
        updates: { status: newStatus }
      });
    }
  };

  const handlePriorityChange = (newPriority: string) => {
    if (ticketId) {
      updateTicketMutation.mutate({
        ticketId,
        updates: { priority: newPriority }
      });
    }
  };

  const deleteTicketMutation = useMutation({
    mutationFn: (ticketId: string) => apiRequest("DELETE", `/api/tickets/${ticketId}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
      setLocation("/tickets");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTicket = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteTicket = () => {
    if (ticket) {
      deleteTicketMutation.mutate(ticket.ticketId);
      setShowDeleteModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
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
    return <div>Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{ticket.ticketId}</h1>
            <p className="text-muted-foreground">{ticket.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(ticket.status)}
          {getPriorityBadge(ticket.priority)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">John Doe</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm text-foreground">
                    I've started investigating this issue. It appears to be related to the recent authentication updates.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">System</span>
                    <span className="text-sm text-muted-foreground">1 hour ago</span>
                  </div>
                  <p className="text-sm text-foreground">
                    Status changed from Open to In Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select
                  value={ticket.status}
                  onValueChange={handleStatusChange}
                  disabled={updateTicketMutation.isPending}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Select
                  value={ticket.priority}
                  onValueChange={handlePriorityChange}
                  disabled={updateTicketMutation.isPending}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                <p className="mt-1 text-foreground">John Doe</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="mt-1 text-foreground">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="mt-1 text-foreground">
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full"
                onClick={() => setShowEditForm(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Ticket
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleDeleteTicket}
                disabled={deleteTicketMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteTicketMutation.isPending ? "Deleting..." : "Delete Ticket"}
              </Button>
              <Button variant="outline" className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Log Time
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <EditTicketForm
        ticket={ticket}
        open={showEditForm}
        onOpenChange={setShowEditForm}
      />

      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDeleteTicket}
        title="Delete Ticket"
        description="Are you sure you want to delete this support ticket? This will permanently remove the ticket and all associated data."
        itemName={ticket?.ticketId}
        isLoading={deleteTicketMutation.isPending}
      />
    </div>
  );
}
