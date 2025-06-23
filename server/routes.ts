import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNotificationSchema, insertKnowledgeArticleSchema } from "@shared/schema";
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

  // Delete ticket
  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = req.params.id;
      const deleted = await storage.deleteTicket(ticketId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting ticket: ${error}`);
      res.status(500).json({ error: "Failed to delete ticket" });
    }
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

  // Knowledge Base Articles
  app.get("/api/knowledge-articles", async (req, res) => {
    const { includeDrafts } = req.query;
    const articles = includeDrafts === 'true' 
      ? Array.from((storage as any).knowledgeArticles.values()).sort((a: any, b: any) => b.updatedAt.getTime() - a.updatedAt.getTime())
      : await storage.getKnowledgeArticles();
    
    // Add author names
    const articlesWithAuthors = await Promise.all(articles.map(async (article: any) => {
      const author = await storage.getUser(article.authorId);
      return {
        ...article,
        author: author?.fullName || null
      };
    }));
    res.json(articlesWithAuthors);
  });

  app.get("/api/knowledge-articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const article = await storage.getKnowledgeArticle(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    // Increment views
    await storage.incrementArticleViews(id);
    
    // Add author name
    const author = await storage.getUser(article.authorId);
    res.json({
      ...article,
      author: author?.fullName || null
    });
  });

  app.post("/api/knowledge-articles", async (req, res) => {
    try {
      const validatedData = insertKnowledgeArticleSchema.parse(req.body);
      const article = await storage.createKnowledgeArticle(validatedData);
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Failed to create article" });
    }
  });

  app.put("/api/knowledge-articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const article = await storage.updateKnowledgeArticle(id, updates);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.patch("/api/knowledge-articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const article = await storage.updateKnowledgeArticle(id, updates);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.post("/api/knowledge-articles/:id/view", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.incrementArticleViews(id);
    res.json({ success: true });
  });

  app.delete("/api/knowledge-articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteKnowledgeArticle(id);
    if (!deleted) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json({ success: true });
  });

  // Reports
  app.get("/api/reports/tickets", async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const tickets = await storage.getTicketsByDateRange(start, end);
      res.json(tickets);
    } else {
      const tickets = await storage.getTickets();
      res.json(tickets);
    }
  });

  app.get("/api/reports/export", async (req, res) => {
    const { format, startDate, endDate } = req.query;
    
    try {
      const tickets = startDate && endDate 
        ? await storage.getTicketsByDateRange(new Date(startDate as string), new Date(endDate as string))
        : await storage.getTickets();

      if (format === 'csv') {
        const csvHeaders = 'ID,Subject,Status,Priority,Created Date,Updated Date';
        const csvRows = tickets.map(ticket => 
          `"${ticket.ticketId}","${ticket.subject}","${ticket.status}","${ticket.priority}","${ticket.createdAt}","${ticket.updatedAt}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="tickets-export.csv"');
        res.send(`${csvHeaders}\n${csvRows}`);
      } else {
        res.json(tickets);
      }
    } catch (error) {
      res.status(500).json({ message: "Export failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
