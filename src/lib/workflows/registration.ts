import { db } from "@/lib/db";
import { users, posts } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/utils";
import { Effect } from "effect"; // or "@effect/io" if that's your version

interface NotificationResult {
  sent: boolean;
  messageId: string;
}

export const registerUser = (username: string, password: string) =>
  Effect.gen(function* (_) {
    // Step 1: Hash password (side effect)
    const hashedPassword = yield* Effect.tryPromise({
      try: () => hashPassword(password),
      catch: (error) => new Error("Failed to hash password: " + error)
    });

    // Step 2: Insert user (side effect)
    const [newUser] = yield* Effect.tryPromise({
      try: () => db.insert(users).values({
        username,
        hashedPassword,
        createdAt: new Date(),
      }).returning(),
      catch: (error) => new Error("Failed to create user: " + error)
    });

    // Step 3: Create welcome post (side effect)
    yield* Effect.tryPromise({
      try: () => db.insert(posts).values({
        title: `Welcome ${username}!`,
        content: `Welcome to our platform, ${username}! We're excited to have you here.`,
        authorId: newUser.id,
        likeCount: 0,
        createdAt: new Date(),
      }).returning(),
      catch: (error) => new Error("Failed to create welcome post: " + error)
    });

    // Step 4: Send notification (side effect)
    yield* Effect.tryPromise({
      try: () => sendWelcomeNotification(username, newUser.id),
      catch: (error) => new Error("Failed to send welcome notification: " + error)
    });

    // Step 5: Return result
    return { success: true, user: newUser };
  });

// To run it:
Effect.runPromise(registerUserEffect("user", "pass"))
  .then(console.log)
  .catch(console.error);

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
