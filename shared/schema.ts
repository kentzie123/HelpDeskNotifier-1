import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("agent"),
  fullName: text("full_name").notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  assigneeId: integer("assignee_id").references(() => users.id),
  customerId: integer("customer_id").references(() => users.id),
  category: text("category").notNull().default("General"),
  firstResponseAt: timestamp("first_response_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  isRead: boolean("is_read").default(false).notNull(),
  ticketId: text("ticket_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: text("category").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  views: integer("views").default(0).notNull(),
  rating: integer("rating").default(0).notNull(),
  ratingCount: integer("rating_count").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleRatings = pgTable("article_ratings", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").references(() => knowledgeArticles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketComments = pgTable("ticket_comments", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").references(() => tickets.ticketId),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ticketRatings = pgTable("ticket_ratings", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").references(() => tickets.ticketId),
  userId: integer("user_id").references(() => users.id),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArticleRatingSchema = createInsertSchema(articleRatings).omit({
  id: true,
  createdAt: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
});

export const insertTicketRatingSchema = createInsertSchema(ticketRatings).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// Extended ticket type with assignee name for frontend
export type TicketWithAssignee = Ticket & {
  assignee?: string | null;
};

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;
export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;

export type InsertArticleRating = z.infer<typeof insertArticleRatingSchema>;
export type ArticleRating = typeof articleRatings.$inferSelect;

// Extended knowledge article type with author name and user rating for frontend
export type KnowledgeArticleWithAuthor = KnowledgeArticle & {
  author?: string | null;
  userRating?: number | null;
};

export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;

export type InsertTicketRating = z.infer<typeof insertTicketRatingSchema>;
export type TicketRating = typeof ticketRatings.$inferSelect;

export type TicketCommentWithAuthor = TicketComment & {
  author?: string | null;
};

export type TicketWithDetails = Ticket & {
  assignee?: string | null;
  comments?: TicketCommentWithAuthor[];
  rating?: TicketRating | null;
};
