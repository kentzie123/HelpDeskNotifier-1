import { 
  users, 
  tickets, 
  notifications, 
  knowledgeArticles, 
  type User, 
  type InsertUser, 
  type Ticket, 
  type InsertTicket, 
  type Notification, 
  type InsertNotification, 
  type KnowledgeArticle, 
  type InsertKnowledgeArticle,
  type ArticleRating,
  type InsertArticleRating,
  type TicketComment,
  type InsertTicketComment,
  type TicketRating,
  type InsertTicketRating,
  type TicketCommentWithAuthor,
  type TicketWithDetails
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Tickets
  getTickets(): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: string): Promise<boolean>;
  
  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Knowledge Articles
  getKnowledgeArticles(): Promise<KnowledgeArticle[]>;
  getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined>;
  createKnowledgeArticle(article: InsertKnowledgeArticle): Promise<KnowledgeArticle>;
  updateKnowledgeArticle(id: number, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined>;
  deleteKnowledgeArticle(id: number): Promise<boolean>;
  incrementArticleViews(id: number): Promise<void>;
  
  // Reports
  getTicketsByDateRange(startDate: Date, endDate: Date): Promise<Ticket[]>;
  
  // Ticket Comments
  getTicketComments(ticketId: string): Promise<TicketCommentWithAuthor[]>;
  createTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
  deleteTicketComment(id: number): Promise<boolean>;
  
  // Ticket Ratings
  getTicketRating(ticketId: string): Promise<TicketRating | undefined>;
  createTicketRating(rating: InsertTicketRating): Promise<TicketRating>;
  updateTicketRating(ticketId: string, rating: number, feedback?: string): Promise<TicketRating | undefined>;
  
  // Enhanced ticket details
  getTicketWithDetails(ticketId: string): Promise<TicketWithDetails | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<string, Ticket>;
  private notifications: Map<number, Notification>;
  private knowledgeArticles: Map<number, KnowledgeArticle>;
  private articleRatings: Map<number, ArticleRating>;
  private ticketComments: Map<number, TicketComment>;
  private ticketRatings: Map<number, TicketRating>;
  private currentUserId: number;
  private currentTicketId: number;
  private currentNotificationId: number;
  private currentArticleId: number;
  private currentRatingId: number;
  private currentCommentId: number;
  private currentTicketRatingId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.notifications = new Map();
    this.knowledgeArticles = new Map();
    this.articleRatings = new Map();
    this.ticketComments = new Map();
    this.ticketRatings = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentNotificationId = 1;
    this.currentArticleId = 1;
    this.currentRatingId = 1;
    this.currentCommentId = 1;
    this.currentTicketRatingId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: 1,
        username: "johndoe",
        password: "password",
        email: "john.doe@company.com",
        role: "administrator",
        fullName: "John Doe"
      },
      {
        id: 2,
        username: "sarahjones",
        password: "password",
        email: "sarah.jones@company.com",
        role: "agent",
        fullName: "Sarah Jones"
      },
      {
        id: 3,
        username: "mikebrown",
        password: "password",
        email: "mike.brown@company.com",
        role: "manager",
        fullName: "Mike Brown"
      },
      {
        id: 4,
        username: "emilydavis",
        password: "password",
        email: "emily.davis@company.com",
        role: "agent",
        fullName: "Emily Davis"
      },
      {
        id: 5,
        username: "alexwilson",
        password: "password",
        email: "alex.wilson@company.com",
        role: "customer",
        fullName: "Alex Wilson"
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    this.currentUserId = 6;

    // Create sample tickets with more variety including resolved ones
    const sampleTickets = [
      {
        ticketId: "TICK-2025-9938",
        subject: "Unable to access dashboard",
        description: "I'm getting a 404 error when trying to access my dashboard. This started happening after the recent update.",
        status: "open" as const,
        priority: "high" as const,
        customerId: 4,
        assigneeId: 2,
        category: "Technical Issue",
        firstResponseAt: null,
        resolvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ticketId: "TICK-2025-9939",
        subject: "Password reset not working",
        description: "I've tried to reset my password multiple times but I'm not receiving the reset email.",
        status: "in-progress" as const,
        priority: "medium" as const,
        customerId: 5,
        assigneeId: 1,
        category: "Account Issue",
        firstResponseAt: null,
        resolvedAt: null,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
      },
      {
        ticketId: "TICK-2025-9941",
        subject: "Feature request: Dark mode",
        description: "Would love to see a dark mode option in the application interface.",
        status: "resolved" as const,
        priority: "low" as const,
        customerId: 4,
        assigneeId: 2,
        category: "Feature Request",
        firstResponseAt: null,
        resolvedAt: null,
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 172800000)
      },
      {
        ticketId: "TICK-2025-9943",
        subject: "Mobile app crashes on startup",
        description: "The mobile app crashes immediately after opening on iOS 17. This started after the latest app update.",
        status: "resolved" as const,
        priority: "high" as const,
        customerId: 6,
        assigneeId: 2,
        category: "Mobile",
        createdAt: new Date(Date.now() - 345600000),
        updatedAt: new Date(Date.now() - 259200000),
        resolvedAt: new Date(Date.now() - 259200000)
      },
      {
        ticketId: "TICK-2025-9944",
        subject: "Feature request: Dark mode",
        description: "It would be great to have a dark mode option for the application interface.",
        status: "closed" as const,
        priority: "low" as const,
        customerId: 5,
        assigneeId: 3,
        category: "Feature Request",
        firstResponseAt: null,
        resolvedAt: null,
        createdAt: new Date(Date.now() - 604800000),
        updatedAt: new Date(Date.now() - 86400000)
      }
    ];

    sampleTickets.forEach(ticketData => {
      const ticket: Ticket = {
        id: this.currentTicketId++,
        ...ticketData
      };
      this.tickets.set(ticket.ticketId, ticket);
    });

    // Create sample comments for tickets
    const sampleComments = [
      {
        ticketId: "TICK-2025-9938",
        userId: 2,
        content: "I've identified the issue - it seems to be related to a recent server configuration change. Working on a fix now.",
        isInternal: false,
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        ticketId: "TICK-2025-9940",
        userId: 1,
        content: "I've processed the refund for the unauthorized charge. You should see it reflected in your account within 3-5 business days.",
        isInternal: false,
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        ticketId: "TICK-2025-9940",
        userId: 6,
        content: "Thank you so much for the quick resolution! The refund has already appeared in my account.",
        isInternal: false,
        createdAt: new Date(Date.now() - 82800000) // 23 hours ago
      }
    ];

    sampleComments.forEach(commentData => {
      const comment: TicketComment = {
        id: this.currentCommentId++,
        ...commentData
      };
      this.ticketComments.set(comment.id, comment);
    });

    // Create sample ratings for resolved tickets
    const sampleRatings = [
      {
        ticketId: "TICK-2025-9940",
        userId: 6,
        rating: 5,
        feedback: "Excellent service! The issue was resolved quickly and the agent was very helpful.",
        createdAt: new Date(Date.now() - 82800000) // 23 hours ago
      },
      {
        ticketId: "TICK-2025-9941",
        userId: 4,
        rating: 4,
        feedback: "Good response to the feature request. Looking forward to using dark mode!",
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        ticketId: "TICK-2025-9943",
        userId: 6,
        rating: 5,
        feedback: "Amazing turnaround time! The app is working perfectly now.",
        createdAt: new Date(Date.now() - 259200000) // 3 days ago
      }
    ];

    sampleRatings.forEach(ratingData => {
      const rating: TicketRating = {
        id: this.currentTicketRatingId++,
        ...ratingData
      };
      this.ticketRatings.set(rating.id, rating);
    });

    // Create sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: 1,
        userId: 1,
        title: "New Ticket Assignment",
        message: "A new ticket (TICK-2025-9938) has been assigned to you.",
        type: "ticket",
        isRead: false,
        ticketId: "TICK-2025-9938",
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: 2,
        userId: 1,
        title: "Ticket Resolved",
        message: "Ticket (TICK-2025-9935) has been resolved and closed.",
        type: "ticket",
        isRead: false,
        ticketId: "TICK-2025-9935",
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        id: 3,
        userId: 1,
        title: "Priority Update",
        message: "Ticket (TICK-2025-9937) priority has been updated to High.",
        type: "ticket",
        isRead: false,
        ticketId: "TICK-2025-9937",
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: 4,
        userId: 1,
        title: "New User Assignment",
        message: "A new ticket (TICK-2025-9934) has been assigned to you from user Sarah Johnson.",
        type: "ticket",
        isRead: false,
        ticketId: "TICK-2025-9934",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 5,
        userId: 1,
        title: "SLA Breach Warning",
        message: "Ticket (TICK-2025-9932) is approaching SLA breach deadline.",
        type: "warning",
        isRead: false,
        ticketId: "TICK-2025-9932",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: 6,
        userId: 1,
        title: "New Comment",
        message: "New comment added to ticket (TICK-2025-9931) by customer.",
        type: "ticket",
        isRead: true,
        ticketId: "TICK-2025-9931",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 7,
        userId: 1,
        title: "System Maintenance",
        message: "Scheduled system maintenance will begin at 2:00 AM UTC tomorrow.",
        type: "system",
        isRead: false,
        ticketId: null,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: 8,
        userId: 1,
        title: "Escalation Notice",
        message: "Ticket (TICK-2025-9930) has been escalated to your manager.",
        type: "escalation",
        isRead: false,
        ticketId: "TICK-2025-9930",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: 9,
        userId: 1,
        title: "Agent Assignment",
        message: "You have been assigned as primary agent for ticket (TICK-2025-9929).",
        type: "assignment",
        isRead: true,
        ticketId: "TICK-2025-9929",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        id: 10,
        userId: 1,
        title: "Customer Feedback",
        message: "Customer rated your resolution of ticket (TICK-2025-9928) with 5 stars.",
        type: "feedback",
        isRead: true,
        ticketId: "TICK-2025-9928",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ];

    sampleNotifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
    });
    
    this.currentNotificationId = 11;
    
    // Add additional sample notifications
    const additionalNotifications = [
      {
        id: 11,
        userId: 1,
        title: "New Ticket Assignment",
        message: "A new ticket (TICK-2025-9940) has been assigned to you from customer Mike Davis.",
        type: "assignment",
        isRead: false,
        ticketId: "TICK-2025-9940",
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
      {
        id: 12,
        userId: 1,
        title: "High Priority Alert",
        message: "Ticket (TICK-2025-9939) has been escalated to high priority due to customer impact.",
        type: "priority",
        isRead: false,
        ticketId: "TICK-2025-9939",
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      },
      {
        id: 13,
        userId: 1,
        title: "Status Update",
        message: "Ticket (TICK-2025-9938) status has been changed from Open to In Progress.",
        type: "status",
        isRead: false,
        ticketId: "TICK-2025-9938",
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      },
      {
        id: 14,
        userId: 1,
        title: "Customer Response",
        message: "New response received for ticket (TICK-2025-9937) from customer Jane Smith.",
        type: "response",
        isRead: false,
        ticketId: "TICK-2025-9937",
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      },
      {
        id: 15,
        userId: 1,
        title: "SLA Warning",
        message: "Ticket (TICK-2025-9936) is approaching SLA deadline in 2 hours.",
        type: "warning",
        isRead: false,
        ticketId: "TICK-2025-9936",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 16,
        userId: 1,
        title: "Team Assignment",
        message: "You have been added to the support team for ticket (TICK-2025-9935).",
        type: "team",
        isRead: false,
        ticketId: "TICK-2025-9935",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: 17,
        userId: 1,
        title: "Resolution Confirmed",
        message: "Customer has confirmed resolution for ticket (TICK-2025-9934). Ticket closed.",
        type: "resolution",
        isRead: false,
        ticketId: "TICK-2025-9934",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 18,
        userId: 1,
        title: "System Alert",
        message: "Automated alert: Multiple tickets reported similar issue. Consider creating knowledge base article.",
        type: "system",
        isRead: false,
        ticketId: null,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        id: 19,
        userId: 1,
        title: "Performance Review",
        message: "Your ticket resolution time has improved by 15% this week. Great work!",
        type: "feedback",
        isRead: true,
        ticketId: null,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 20,
        userId: 1,
        title: "Training Reminder",
        message: "Reminder: Advanced troubleshooting training session scheduled for tomorrow at 2 PM.",
        type: "reminder",
        isRead: true,
        ticketId: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      }
    ];

    additionalNotifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
    });
    
    this.currentNotificationId = 21;
    
    // Seed knowledge base articles
    const sampleArticles: KnowledgeArticle[] = [
      {
        id: 1,
        title: "How to Reset Your Password",
        content: "# Password Reset Guide\n\n## Steps to Reset Your Password\n\n1. Navigate to the login page\n2. Click 'Forgot Password' link\n3. Enter your email address\n4. Check your email for reset instructions\n5. Click the reset link in the email\n6. Enter your new password\n7. Confirm your new password\n\n## Security Tips\n\n- Use a strong password with at least 8 characters\n- Include uppercase, lowercase, numbers, and symbols\n- Don't reuse passwords from other accounts\n- Consider using a password manager",
        excerpt: "Step-by-step guide to reset your password safely and securely.",
        category: "Account Management",
        authorId: 2,
        views: 1234,
        rating: 48,
        ratingCount: 10,
        isPublished: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        title: "Troubleshooting Login Issues",
        content: "# Login Troubleshooting\n\n## Common Issues and Solutions\n\n### Problem: Invalid credentials\n- Double-check your username and password\n- Ensure caps lock is off\n- Try copying and pasting if typing manually\n\n### Problem: Account locked\n- Wait 15 minutes and try again\n- Contact support if issue persists\n\n### Problem: Browser issues\n- Clear your browser cache and cookies\n- Try a different browser\n- Disable browser extensions temporarily\n\n### Problem: Network connectivity\n- Check your internet connection\n- Try accessing from a different network\n- Contact IT support if on corporate network",
        excerpt: "Common solutions for login problems and authentication errors.",
        category: "Technical Support",
        authorId: 3,
        views: 892,
        rating: 46,
        ratingCount: 10,
        isPublished: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        title: "Setting Up Two-Factor Authentication",
        content: "# Two-Factor Authentication Setup\n\n## What is 2FA?\n\nTwo-factor authentication adds an extra layer of security to your account by requiring two forms of verification.\n\n## Setup Steps\n\n1. Log into your account\n2. Go to Security Settings\n3. Click 'Enable 2FA'\n4. Choose your preferred method:\n   - SMS verification\n   - Authenticator app (recommended)\n   - Email verification\n\n## Using Authenticator Apps\n\n1. Download an authenticator app (Google Authenticator, Authy, etc.)\n2. Scan the QR code displayed\n3. Enter the 6-digit code from your app\n4. Save your backup codes in a secure location\n\n## Important Notes\n\n- Keep backup codes safe and accessible\n- Update your phone number if using SMS\n- Test 2FA before fully enabling",
        excerpt: "Complete guide to enable and configure two-factor authentication.",
        category: "Security",
        authorId: 4,
        views: 567,
        rating: 49,
        ratingCount: 10,
        isPublished: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleArticles.forEach(article => {
      this.knowledgeArticles.set(article.id, article);
    });
    
    this.currentArticleId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "agent"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getTickets(): Promise<Ticket[]> {
    const tickets = Array.from(this.tickets.values());
    // Add assignee name for frontend compatibility
    return tickets.map(ticket => ({
      ...ticket,
      assignee: ticket.assigneeId ? this.users.get(ticket.assigneeId)?.fullName || null : null
    })) as any;
  }

  async getTicket(ticketId: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;
    
    // Add assignee name for frontend compatibility
    return {
      ...ticket,
      assignee: ticket.assigneeId ? this.users.get(ticket.assigneeId)?.fullName || null : null
    } as any;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.currentTicketId++;
    const ticketId = `TICK-2025-${String(9939 + id).padStart(4, '0')}`;
    const ticket: Ticket = {
      ...insertTicket,
      id,
      ticketId,
      status: insertTicket.status || "open",
      priority: insertTicket.priority || "medium",
      assigneeId: insertTicket.assigneeId || null,
      customerId: insertTicket.customerId || null,
      firstResponseAt: insertTicket.firstResponseAt || null,
      resolvedAt: insertTicket.resolvedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tickets.set(ticketId, ticket);
    return ticket;
  }

  async updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates, updatedAt: new Date() };
    this.tickets.set(ticketId, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(ticketId: string): Promise<boolean> {
    return this.tickets.delete(ticketId);
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      type: insertNotification.type || "info",
      isRead: insertNotification.isRead || false,
      ticketId: insertNotification.ticketId || null,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const entries = Array.from(this.notifications.entries());
    for (const [id, notification] of entries) {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
      }
    }
  }

  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    return Array.from(this.knowledgeArticles.values())
      .filter(article => article.isPublished)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getKnowledgeArticle(id: number): Promise<KnowledgeArticle | undefined> {
    return this.knowledgeArticles.get(id);
  }

  async createKnowledgeArticle(insertArticle: InsertKnowledgeArticle): Promise<KnowledgeArticle> {
    const id = this.currentArticleId++;
    const article: KnowledgeArticle = {
      ...insertArticle,
      id,
      excerpt: insertArticle.excerpt || null,
      views: 0,
      rating: 0,
      ratingCount: 0,
      isPublished: insertArticle.isPublished || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.knowledgeArticles.set(id, article);
    return article;
  }

  async updateKnowledgeArticle(id: number, updates: Partial<KnowledgeArticle>): Promise<KnowledgeArticle | undefined> {
    const article = this.knowledgeArticles.get(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...updates, updatedAt: new Date() };
    this.knowledgeArticles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteKnowledgeArticle(id: number): Promise<boolean> {
    return this.knowledgeArticles.delete(id);
  }

  async incrementArticleViews(id: number): Promise<void> {
    const article = this.knowledgeArticles.get(id);
    if (article) {
      article.views += 1;
      this.knowledgeArticles.set(id, article);
    }
  }

  async rateKnowledgeArticle(articleId: number, userId: number, rating: number): Promise<void> {
    const article = this.knowledgeArticles.get(articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    
    // Check if user has already rated this article
    const existingRating = Array.from(this.articleRatings.values())
      .find(r => r.articleId === articleId && r.userId === userId);
    
    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      this.articleRatings.set(existingRating.id, existingRating);
      
      // Update article totals
      article.rating = article.rating - oldRating + rating;
    } else {
      // Create new rating
      const newRating: ArticleRating = {
        id: this.currentRatingId++,
        articleId,
        userId,
        rating,
        createdAt: new Date(),
      };
      this.articleRatings.set(newRating.id, newRating);
      
      // Update article totals
      article.rating += rating;
      article.ratingCount += 1;
    }
    
    this.knowledgeArticles.set(articleId, article);
  }

  async getUserRatingForArticle(articleId: number, userId: number): Promise<number | null> {
    const rating = Array.from(this.articleRatings.values())
      .find(r => r.articleId === articleId && r.userId === userId);
    return rating ? rating.rating : null;
  }

  async rateKnowledgeArticle(id: number, rating: number): Promise<void> {
    const article = this.knowledgeArticles.get(id);
    if (!article) {
      throw new Error("Article not found");
    }
    
    // Add the new rating to the total and increment count
    article.rating += rating;
    article.ratingCount += 1;
    this.knowledgeArticles.set(id, article);
  }

  async getTicketsByDateRange(startDate: Date, endDate: Date): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => {
      const ticketDate = new Date(ticket.createdAt);
      return ticketDate >= startDate && ticketDate <= endDate;
    });
  }

  async getTicketComments(ticketId: string): Promise<TicketCommentWithAuthor[]> {
    const comments = Array.from(this.ticketComments.values())
      .filter(comment => comment.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return comments.map(comment => {
      const author = this.users.get(comment.userId);
      return {
        ...comment,
        author: author?.username || null
      };
    });
  }

  async createTicketComment(insertComment: InsertTicketComment): Promise<TicketComment> {
    const comment: TicketComment = {
      id: this.currentCommentId++,
      ...insertComment,
      createdAt: new Date()
    };
    this.ticketComments.set(comment.id, comment);
    return comment;
  }

  async deleteTicketComment(id: number): Promise<boolean> {
    return this.ticketComments.delete(id);
  }

  async getTicketRating(ticketId: string): Promise<TicketRating | undefined> {
    return Array.from(this.ticketRatings.values())
      .find(rating => rating.ticketId === ticketId);
  }

  async createTicketRating(insertRating: InsertTicketRating): Promise<TicketRating> {
    const rating: TicketRating = {
      id: this.currentTicketRatingId++,
      ...insertRating,
      createdAt: new Date()
    };
    this.ticketRatings.set(rating.id, rating);
    return rating;
  }

  async updateTicketRating(ticketId: string, newRating: number, feedback?: string): Promise<TicketRating | undefined> {
    const existingRating = Array.from(this.ticketRatings.values())
      .find(rating => rating.ticketId === ticketId);
    
    if (existingRating) {
      existingRating.rating = newRating;
      if (feedback !== undefined) {
        existingRating.feedback = feedback;
      }
      this.ticketRatings.set(existingRating.id, existingRating);
      return existingRating;
    }
    return undefined;
  }

  async getTicketWithDetails(ticketId: string): Promise<TicketWithDetails | undefined> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    const assignee = ticket.assigneeId ? this.users.get(ticket.assigneeId) : undefined;
    const comments = await this.getTicketComments(ticketId);
    const rating = await this.getTicketRating(ticketId);

    return {
      ...ticket,
      assignee: assignee?.username || null,
      comments,
      rating
    };
  }
}

export const storage = new MemStorage();
