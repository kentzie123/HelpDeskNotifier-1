import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, User, Tag, AlertCircle, MessageSquare, Star, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TicketWithDetails, TicketCommentWithAuthor } from "@shared/schema";
import AddCommentForm from "@/components/forms/AddCommentForm";
import RateTicketForm from "@/components/forms/RateTicketForm";
import StarRating from "@/components/ui/star-rating";

export default function TicketDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [showRatingForm, setShowRatingForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading } = useQuery<TicketWithDetails>({
    queryKey: ["/api/tickets", id],
    enabled: !!id,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => 
      apiRequest("DELETE", `/api/tickets/${id}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tickets", id] });
      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Ticket not found</h3>
        <p className="text-gray-500">The ticket you're looking for doesn't exist.</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in_progress": return "default";
      case "resolved": return "secondary";
      default: return "secondary";
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
      </div>

      {/* Ticket Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">#{ticket.ticketId}</p>
            </div>
            <div className="flex space-x-2">
              <Badge variant={getStatusColor(ticket.status)}>
                {ticket.status.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-muted-foreground">{ticket.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-muted-foreground">{formatDate(ticket.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assignee:</span>
                <span className="text-sm text-muted-foreground">
                  {ticket.assignee || "Unassigned"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Category:</span>
                <span className="text-sm text-muted-foreground">{ticket.category}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm text-muted-foreground">{formatDate(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Rating Display for Resolved Tickets */}
          {ticket.status === "resolved" && ticket.rating && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Customer Rating</span>
              </div>
              <div className="flex items-center space-x-4 mb-2">
                <StarRating rating={ticket.rating.rating} readOnly size="sm" />
                <span className="text-sm text-muted-foreground">
                  {ticket.rating.rating}/5 stars
                </span>
              </div>
              {ticket.rating.feedback && (
                <p className="text-sm text-muted-foreground italic">
                  "{ticket.rating.feedback}"
                </p>
              )}
            </div>
          )}

          {/* Rate Ticket Button for Resolved Tickets without Rating */}
          {ticket.status === "resolved" && !ticket.rating && (
            <div className="flex justify-center">
              <Button onClick={() => setShowRatingForm(true)}>
                <Star className="h-4 w-4 mr-2" />
                Rate This Resolution
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comments ({ticket.comments?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comments List */}
          {ticket.comments && ticket.comments.length > 0 ? (
            <div className="space-y-4">
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={comment.author || "User"} />
                        <AvatarFallback>
                          {(comment.author || "U").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{comment.author || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                      </div>
                      {comment.isInternal && (
                        <Badge variant="secondary" className="text-xs">Internal</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No comments yet.</p>
          )}

          <Separator />

          {/* Add Comment Form */}
          <AddCommentForm ticketId={ticket.ticketId} />
        </CardContent>
      </Card>

      {/* Rate Ticket Dialog */}
      <RateTicketForm
        ticketId={ticket.ticketId}
        open={showRatingForm}
        onOpenChange={setShowRatingForm}
      />
    </div>
  );
}