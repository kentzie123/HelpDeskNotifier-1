import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (mock authentication)
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(1); // Mock user ID 1
    res.json(user);
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  // Get single user
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Get all tickets
  app.get("/api/tickets", async (req, res) => {
    const tickets = await storage.getTickets();
    res.json(tickets);
  });

  // Get single ticket
  app.get("/api/tickets/:id", async (req, res) => {
    const ticket = await storage.getTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  });

  // Get notifications for current user
  app.get("/api/notifications", async (req, res) => {
    const userId = 1; // Mock user ID
    const notifications = await storage.getNotifications(userId);
    res.json(notifications);
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", async (req, res) => {
    const userId = 1; // Mock user ID
    const count = await storage.getUnreadNotificationCount(userId);
    res.json({ count });
  });

  // Mark notification as read
  app.put("/api/notifications/:id/read", async (req, res) => {
    const id = parseInt(req.params.id);
    const notification = await storage.markNotificationAsRead(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  });

  // Delete notification
  app.delete("/api/notifications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteNotification(id);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ success: true });
  });

  // Mark all notifications as read
  app.put("/api/notifications/mark-all-read", async (req, res) => {
    const userId = 1; // Mock user ID
    await storage.markAllNotificationsAsRead(userId);
    res.json({ success: true });
  });

  // Create new ticket
  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Failed to create ticket" });
    }
  });

  // Update ticket
  app.put("/api/tickets/:id", async (req, res) => {
    const ticketId = req.params.id;
    const updates = req.body;
    const ticket = await storage.updateTicket(ticketId, updates);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const user = await storage.updateUser(id, updates);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
