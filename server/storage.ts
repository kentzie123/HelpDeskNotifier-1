import { users, tickets, notifications, type User, type InsertUser, type Ticket, type InsertTicket, type Notification, type InsertNotification } from "@shared/schema";

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
  
  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tickets: Map<string, Ticket>;
  private notifications: Map<number, Notification>;
  private currentUserId: number;
  private currentTicketId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.tickets = new Map();
    this.notifications = new Map();
    this.currentUserId = 1;
    this.currentTicketId = 1;
    this.currentNotificationId = 1;
    
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

    // Create sample tickets
    const sampleTickets: Ticket[] = [
      {
        id: 1,
        ticketId: "TICK-2025-9938",
        subject: "Login issues with new account",
        description: "User unable to login with newly created account",
        status: "in_progress",
        priority: "high",
        assigneeId: 1,
        customerId: 1,
        createdAt: new Date("2025-01-20T10:00:00Z"),
        updatedAt: new Date("2025-01-20T10:00:00Z"),
      },
      {
        id: 2,
        ticketId: "TICK-2025-9937",
        subject: "Email notifications not working",
        description: "Email notifications are not being sent to users",
        status: "open",
        priority: "medium",
        assigneeId: 1,
        customerId: 1,
        createdAt: new Date("2025-01-19T14:30:00Z"),
        updatedAt: new Date("2025-01-19T14:30:00Z"),
      },
      {
        id: 3,
        ticketId: "TICK-2025-9936",
        subject: "Feature request for dark mode",
        description: "Request to add dark mode theme to the application",
        status: "open",
        priority: "low",
        assigneeId: 1,
        customerId: 1,
        createdAt: new Date("2025-01-18T09:15:00Z"),
        updatedAt: new Date("2025-01-18T09:15:00Z"),
      },
      {
        id: 4,
        ticketId: "TICK-2025-9935",
        subject: "Database connection timeout",
        description: "Application experiencing database connection timeouts",
        status: "resolved",
        priority: "high",
        assigneeId: 1,
        customerId: 1,
        createdAt: new Date("2025-01-17T11:45:00Z"),
        updatedAt: new Date("2025-01-17T16:30:00Z"),
      },
      {
        id: 5,
        ticketId: "TICK-2025-9934",
        subject: "Password reset not working",
        description: "Users unable to reset their passwords",
        status: "open",
        priority: "medium",
        assigneeId: 1,
        customerId: 1,
        createdAt: new Date("2025-01-16T13:20:00Z"),
        updatedAt: new Date("2025-01-16T13:20:00Z"),
      }
    ];

    sampleTickets.forEach(ticket => {
      this.tickets.set(ticket.ticketId, ticket);
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
}

export const storage = new MemStorage();
