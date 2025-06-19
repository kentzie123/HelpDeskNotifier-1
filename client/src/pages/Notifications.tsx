import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, getNotificationColor } from "@/lib/utils";
import {
  Trash2,
  Info,
  ArrowRight,
  Ticket,
  AlertTriangle,
  Settings,
  Bell,
  UserCheck,
  Star,
  MessageCircle,
} from "lucide-react";
import type { Notification } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "ticket":
      return Ticket;
    case "warning":
      return AlertTriangle;
    case "system":
      return Settings;
    case "escalation":
      return Bell;
    case "assignment":
      return UserCheck;
    case "feedback":
      return Star;
    default:
      return Info;
  }
};

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "Success",
        description: "Notification deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(id);
    }
  };

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.isRead;
      case "tickets":
        return notification.type === "ticket";
      case "system":
        return notification.type === "system";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const ticketCount = notifications.filter((n) => n.type === "ticket").length;
  const systemCount = notifications.filter((n) => n.type === "system").length;

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark All Read
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (confirm("Are you sure you want to clear all notifications?")) {
                // Delete all notifications
                notifications.forEach(notification => {
                  deleteNotificationMutation.mutate(notification.id);
                });
              }
            }}
            disabled={deleteNotificationMutation.isPending}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Notification Filters */}
      <div className="flex space-x-4">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "ghost"}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "tickets" ? "default" : "ghost"}
          onClick={() => setFilter("tickets")}
        >
          Tickets ({ticketCount})
        </Button>
        <Button
          variant={filter === "system" ? "default" : "ghost"}
          onClick={() => setFilter("system")}
        >
          System ({systemCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No notifications found</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);

            return (
              <Card
                key={notification.id}
                className={`hover:shadow-md transition-shadow ${
                  !notification.isRead ? "notification-unread" : "opacity-75"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsRead(notification)}
                        className="h-8 w-8"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {notification.ticketId && (
                        <Link href={`/tickets/${notification.ticketId}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary"
                            onClick={() => handleMarkAsRead(notification)}
                          >
                            Info <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <div className="text-center">
          <Button variant="outline">Load More Notifications</Button>
        </div>
      )}
    </div>
  );
}
