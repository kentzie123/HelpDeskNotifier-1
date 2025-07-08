import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNotificationSchema, insertKnowledgeArticleSchema, insertTicketCommentSchema, insertTicketRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    // Static authentication - admin@email.com / admin
    if (email === "admin@email.com" && password === "admin") {
      // In a real app, you'd create a JWT token or session here
      res.json({ 
        success: true, 
        user: { 
          id: 1, 
          email: "admin@email.com", 
          fullName: "Admin User",
          role: "admin" 
        },
        token: "mock-jwt-token" 
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { fullName, email, password } = req.body;
    
    // In a real app, you'd save to database and send actual email
    // For demo purposes, we'll just accept the signup
    res.json({ 
      success: true, 
      message: "Account created successfully. Please verify your email." 
    });
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    const { email, code } = req.body;
    
    console.log("Verify email request:", { email, code, codeType: typeof code });
    
    // Static verification code: 123456
    if (code === "123456" || code === 123456) {
      res.json({ success: true, message: "Email verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid verification code" });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    console.log("Forgot password request for email:", email);
    
    // Only accept admin@email.com for demo
    if (email !== "admin@email.com") {
      res.status(404).json({ 
        message: "No account found with this email address" 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      message: "Password reset code sent to your email" 
    });
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    const { email, code } = req.body;
    
    console.log("Verify reset code request:", { email, code, codeType: typeof code });
    
    // Static verification code: 123456
    if (code === "123456" || code === 123456) {
      res.json({ success: true, message: "Reset code verified" });
    } else {
      res.status(400).json({ message: "Invalid reset code" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { email, code, newPassword } = req.body;
    
    console.log("Reset password request:", { email, code, codeType: typeof code });
    
    // Static verification code: 123456
    if (code === "123456" || code === 123456) {
      // In a real app, you'd update the password in the database
      res.json({ success: true, message: "Password reset successfully" });
    } else {
      res.status(400).json({ message: "Invalid reset code" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    // In a real app, you'd invalidate the token/session
    res.json({ success: true, message: "Logged out successfully" });
  });

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

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get all tickets
  app.get("/api/tickets", async (req, res) => {
    const tickets = await storage.getTickets();
    res.json(tickets);
  });

  // Get single ticket with details
  app.get("/api/tickets/:id", async (req, res) => {
    const ticket = await storage.getTicketWithDetails(req.params.id);
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
    
    // Handle status changes with proper timestamps
    if (updates.status) {
      const now = new Date();
      if (updates.status === "resolved" && !updates.resolvedAt) {
        updates.resolvedAt = now;
      }
      if (updates.status === "in-progress" && !updates.firstResponseAt) {
        updates.firstResponseAt = now;
      }
    }
    
    const ticket = await storage.updateTicket(ticketId, updates);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.json(ticket);
  });

  // Update ticket status
  app.patch("/api/tickets/:id/status", async (req, res) => {
    const ticketId = req.params.id;
    const { status } = req.body;
    
    if (!["open", "in-progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updates: any = { status };
    const now = new Date();
    
    // Set appropriate timestamps based on status
    switch (status) {
      case "in-progress":
        updates.firstResponseAt = now;
        break;
      case "resolved":
        updates.resolvedAt = now;
        break;
    }
    
    const ticket = await storage.updateTicket(ticketId, updates);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    res.json(ticket);
  });

  // Assign ticket to user
  app.patch("/api/tickets/:id/assign", async (req, res) => {
    const ticketId = req.params.id;
    const { assigneeId } = req.body;
    
    const ticket = await storage.updateTicket(ticketId, { assigneeId });
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

  // Get ticket comments
  app.get("/api/tickets/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getTicketComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Add ticket comment
  app.post("/api/tickets/:id/comments", async (req, res) => {
    try {
      const validatedData = insertTicketCommentSchema.parse({
        ...req.body,
        ticketId: req.params.id,
        userId: 1 // Mock current user
      });
      const comment = await storage.createTicketComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Delete ticket comment
  app.delete("/api/tickets/:ticketId/comments/:commentId", async (req, res) => {
    try {
      const success = await storage.deleteTicketComment(parseInt(req.params.commentId));
      if (!success) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Get ticket rating
  app.get("/api/tickets/:id/rating", async (req, res) => {
    try {
      const rating = await storage.getTicketRating(req.params.id);
      res.json(rating || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rating" });
    }
  });

  // Rate ticket
  app.post("/api/tickets/:id/rating", async (req, res) => {
    try {
      const validatedData = insertTicketRatingSchema.parse({
        ...req.body,
        ticketId: req.params.id,
        userId: 1 // Mock current user
      });
      const rating = await storage.createTicketRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      res.status(400).json({ error: "Invalid rating data" });
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
    
    // For now, use a mock user ID (1) since authentication isn't fully implemented
    const userId = 1;
    
    // Add author names and user ratings
    const articlesWithAuthors = await Promise.all(articles.map(async (article: any) => {
      const author = await storage.getUser(article.authorId);
      const userRating = await storage.getUserRatingForArticle(article.id, userId);
      return {
        ...article,
        author: author?.fullName || null,
        userRating
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

  app.post("/api/knowledge-articles/:id/views", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.incrementArticleViews(id);
    res.json({ success: true });
  });

  app.post("/api/knowledge-articles/:id/rate", async (req, res) => {
    const id = parseInt(req.params.id);
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    
    // For now, use a mock user ID (1) since authentication isn't fully implemented
    // In a real app, you would get the user ID from the session/JWT token
    const userId = 1;
    
    try {
      await storage.rateKnowledgeArticle(id, userId, rating);
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ message: "Article not found" });
    }
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
