import type { 
  User, 
  InsertUser, 
  Ticket, 
  InsertTicket, 
  Notification, 
  InsertNotification, 
  KnowledgeArticle, 
  InsertKnowledgeArticle,
  ArticleRating,
  InsertArticleRating,
  TicketComment,
  InsertTicketComment,
  TicketCommentWithAuthor,
  TicketRating,
  InsertTicketRating,
  TicketWithDetails,
  TicketWithAssignee,
  KnowledgeArticleWithAuthor
} from "@shared/schema";
import { users, tickets, notifications, knowledgeArticles, articleRatings, ticketComments, ticketRatings } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, or, ilike } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tickets
  async getTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, id));
    return ticket || undefined;
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [newTicket] = await db.insert(tickets).values({
      ...ticket,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.ticketId, id))
      .returning();
    return updatedTicket || undefined;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await db.delete(tickets).where(eq(tickets.ticketId, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        createdAt: new Date()
      })
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updatedNotification || undefined;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  // Knowledge Articles
  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return await db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.createdAt));
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    const [article] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    return article || undefined;
  }

  async createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const [newArticle] = await db
      .insert(knowledgeArticles)
      .values({
        ...article,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newArticle;
  }

  async updateKnowledgeArticle(id: number, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const [updatedArticle] = await db
      .update(knowledgeArticles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(knowledgeArticles.id, id))
      .returning();
    return updatedArticle || undefined;
  }

  async deleteKnowledgeArticle(id: number): Promise<boolean> {
    const result = await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async incrementArticleViews(id: number): Promise<void> {
    await db
      .update(knowledgeArticles)
      .set({ views: knowledgeArticles.views + 1 })
      .where(eq(knowledgeArticles.id, id));
  }

  // Reports
  async getTicketsByDateRange(startDate: Date, endDate: Date): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(and(
        gte(tickets.createdAt, startDate),
        lte(tickets.createdAt, endDate)
      ))
      .orderBy(desc(tickets.createdAt));
  }

  // Ticket Comments
  async getTicketComments(ticketId: string): Promise<TicketCommentWithAuthor[]> {
    const comments = await db
      .select({
        id: ticketComments.id,
        content: ticketComments.content,
        ticketId: ticketComments.ticketId,
        userId: ticketComments.userId,
        isInternal: ticketComments.isInternal,
        createdAt: ticketComments.createdAt,
        author: users.fullName
      })
      .from(ticketComments)
      .leftJoin(users, eq(ticketComments.userId, users.id))
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(ticketComments.createdAt);

    return comments.map(comment => ({
      ...comment,
      author: comment.author || null
    }));
  }

  async createTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const [newComment] = await db
      .insert(ticketComments)
      .values({
        ...comment,
        createdAt: new Date()
      })
      .returning();
    return newComment;
  }

  async deleteTicketComment(id: number): Promise<boolean> {
    const result = await db.delete(ticketComments).where(eq(ticketComments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Ticket Ratings
  async getTicketRating(ticketId: string): Promise<TicketRating | undefined> {
    const [rating] = await db.select().from(ticketRatings).where(eq(ticketRatings.ticketId, ticketId));
    return rating || undefined;
  }

  async createTicketRating(rating: InsertTicketRating): Promise<TicketRating> {
    const [newRating] = await db
      .insert(ticketRatings)
      .values({
        ...rating,
        createdAt: new Date()
      })
      .returning();
    return newRating;
  }

  async updateTicketRating(ticketId: string, rating: number, feedback?: string): Promise<TicketRating | undefined> {
    const [updatedRating] = await db
      .update(ticketRatings)
      .set({ rating, feedback })
      .where(eq(ticketRatings.ticketId, ticketId))
      .returning();
    return updatedRating || undefined;
  }

  // Enhanced ticket details
  async getTicketWithDetails(ticketId: string): Promise<TicketWithDetails | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.ticketId, ticketId));
    if (!ticket) return undefined;

    const assigneeData = ticket.assigneeId 
      ? await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, ticket.assigneeId))
      : [];

    const comments = await this.getTicketComments(ticketId);
    const rating = await this.getTicketRating(ticketId);

    return {
      ...ticket,
      assignee: assigneeData[0]?.fullName || null,
      comments,
      rating
    };
  }
}