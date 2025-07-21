import { db } from "@/lib/db";
import { users, posts } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/utils";

interface NotificationResult {
  sent: boolean;
  messageId: string;
}

export async function registerUser(username: string, password: string) {
  // hash password
  try {
    var hashedPassword = await hashPassword(password);
  } catch (error) {
    console.error("Failed to hash password:", error);
    throw new Error("Failed to process password");
  }

  // create user
  try {
    var [newUser] = await db
      .insert(users)
      .values({
        username,
        hashedPassword,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user account");
  }

  // create welcome post
  try {
    var welcomePost = await db
      .insert(posts)
      .values({
        title: `Welcome ${username}!`,
        content: `Welcome to our platform, ${username}! We're excited to have you here.`,
        authorId: newUser.id,
        likeCount: 0,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error("Failed to create welcome post:", error);
    throw new Error("Failed to create welcome post");
  }

  // send welcome notification
  try {
    var notificationResult = await sendWelcomeNotification(
      username,
      newUser.id
    );
  } catch (error) {
    console.error("Failed to send welcome notification:", error);
    throw new Error("Failed to send welcome notification");
  }

  return {
    success: true,
    user: newUser,
    welcomePost: welcomePost[0],
    notification: notificationResult,
  };
}

async function sendWelcomeNotification(
  username: string,
  userId: number
): Promise<NotificationResult> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) {
        resolve({
          sent: true,
          messageId: `msg_${userId}_${Date.now()}`,
        });
      } else {
        reject(new Error("Notification service unavailable"));
      }
    }, 500);
  });
}
