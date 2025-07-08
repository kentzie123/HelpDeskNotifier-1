import { db } from "./db";
import { users, tickets, notifications, knowledgeArticles, ticketComments, ticketRatings } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Clear existing data (optional, remove for production)
    console.log("Clearing existing data...");
    await db.delete(ticketRatings);
    await db.delete(ticketComments);
    await db.delete(notifications);
    await db.delete(knowledgeArticles);
    await db.delete(tickets);
    await db.delete(users);

    // Insert users
    console.log("Creating users...");
    const insertedUsers = await db.insert(users).values([
      {
        username: "admin",
        password: "admin123",
        email: "admin@helpdesk.com",
        fullName: "Administrator",
        role: "administrator",
      },
      {
        username: "manager1",
        password: "manager123",
        email: "manager@helpdesk.com",
        fullName: "Support Manager",
        role: "manager",
      },
      {
        username: "agent1",
        password: "agent123",
        email: "agent1@helpdesk.com",
        fullName: "John Smith",
        role: "agent",
      },
      {
        username: "agent2",
        password: "agent123",
        email: "agent2@helpdesk.com",
        fullName: "Sarah Johnson",
        role: "agent",
      },
      {
        username: "customer1",
        password: "customer123",
        email: "customer1@example.com",
        fullName: "Mike Davis",
        role: "customer",
      },
      {
        username: "customer2",
        password: "customer123",
        email: "customer2@example.com",
        fullName: "Emily Wilson",
        role: "customer",
      },
    ]).returning();

    console.log(`✅ Created ${insertedUsers.length} users`);

    // Insert sample tickets
    console.log("Creating tickets...");
    const insertedTickets = await db.insert(tickets).values([
      {
        ticketId: "TICK-2025-001",
        subject: "Login Issues",
        description: "Unable to login to the system using my credentials.",
        status: "open",
        priority: "high",
        customerId: insertedUsers[4].id, // customer1
        assigneeId: insertedUsers[2].id, // agent1
        category: "Technical",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ticketId: "TICK-2025-002",
        subject: "Password Reset Request",
        description: "I need to reset my password as I forgot it.",
        status: "in_progress",
        priority: "medium",
        customerId: insertedUsers[5].id, // customer2
        assigneeId: insertedUsers[3].id, // agent2
        category: "Account",
        firstResponseAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(),
      },
      {
        ticketId: "TICK-2025-003",
        subject: "Feature Request",
        description: "Could you add a dark mode option to the dashboard?",
        status: "resolved",
        priority: "low",
        customerId: insertedUsers[4].id, // customer1
        assigneeId: insertedUsers[2].id, // agent1
        category: "Enhancement",
        firstResponseAt: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
        resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000), // 4 days ago
        updatedAt: new Date(),
      },
    ]).returning();

    console.log(`✅ Created ${insertedTickets.length} tickets`);

    // Insert knowledge articles
    console.log("Creating knowledge articles...");
    const insertedArticles = await db.insert(knowledgeArticles).values([
      {
        title: "How to Reset Your Password",
        content: "To reset your password, click on the 'Forgot Password' link on the login page...",
        category: "Account",
        authorId: insertedUsers[1].id, // manager
        isPublished: true,
        views: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Troubleshooting Login Issues",
        content: "If you're having trouble logging in, please try the following steps...",
        category: "Technical",
        authorId: insertedUsers[2].id, // agent1
        isPublished: true,
        views: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]).returning();

    console.log(`✅ Created ${insertedArticles.length} knowledge articles`);

    // Insert notifications
    console.log("Creating notifications...");
    const insertedNotifications = await db.insert(notifications).values([
      {
        userId: insertedUsers[2].id, // agent1
        title: "New Ticket Assigned",
        message: `Ticket ${insertedTickets[0].ticketId} has been assigned to you.`,
        type: "ticket",
        isRead: false,
        createdAt: new Date(),
      },
      {
        userId: insertedUsers[3].id, // agent2
        title: "New Ticket Assigned",
        message: `Ticket ${insertedTickets[1].ticketId} has been assigned to you.`,
        type: "ticket",
        isRead: false,
        createdAt: new Date(),
      },
    ]).returning();

    console.log(`✅ Created ${insertedNotifications.length} notifications`);

    console.log("🎉 Database seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeder
seedDatabase()
  .then(() => {
    console.log("Database seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });